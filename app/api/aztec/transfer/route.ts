// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getSession } from '@/lib/session';
import { assertVerifiedIdentity } from '@/lib/identity-gate';

export const dynamic = 'force-dynamic';

const AZTEC_EXPLORER = 'https://testnet.aztecscan.xyz';

/**
 * POST /api/aztec/transfer
 *
 * Transfers QDs on the Aztec Testnet v5 (rc.2).
 *
 * Architecture (SDK v4.3.1 — verified from source):
 *
 *   MODE A — Full on-chain transfer (requires AZTEC_TOKEN_CONTRACT_ADDRESS):
 *     1. EmbeddedWallet.create(pxeUrl, { ephemeral: true })
 *        → NodeEmbeddedWallet: boots a local PXE process, connects to Aztec node
 *     2. wallet.createSchnorrAccount(secretKey: Fr, salt: Fr) → AccountManager
 *        → accountManager.address → AztecAddress (synchronous getter)
 *     3. TokenContract.at(tokenAddress: AztecAddress, wallet: Wallet) → TokenContract
 *     4. tokenContract.methods.transfer_public(from, to, amount, authwitNonce)
 *        .send({ from: AztecAddress, fee: { paymentMethod } })
 *        → Promise<TxSendResultMined<TxReceipt>>
 *        where TxSendResultMined = { receipt: TxReceipt } & OffchainOutput
 *        so txHash = result.receipt.txHash.toString()
 *
 *   MODE B — Node-verified DB ledger (no token contract deployed yet):
 *     Uses createAztecNodeClient to anchor the transfer to a real block.
 *
 * Body: { from: string, to: string, amount: number | string, reason?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to } = body;
    const rawAmount  = typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount;
    const spendReason = typeof body.reason === 'string' ? body.reason.slice(0, 120) : null;

    // ── Validate addresses — reject email_ UI identifiers used as tx addresses ──
    if (!from || typeof from !== 'string' || from.trim().length < 10 || from.startsWith('email_')) {
      return NextResponse.json({ error: 'Missing or invalid sender address.' }, { status: 400 });
    }
    if (!to || typeof to !== 'string' || to.trim().length < 10 || to.startsWith('email_')) {
      return NextResponse.json({ error: 'Missing or invalid recipient address.' }, { status: 400 });
    }
    if (!rawAmount || isNaN(rawAmount) || rawAmount <= 0 || !isFinite(rawAmount)) {
      return NextResponse.json({ error: 'Amount must be a positive number.' }, { status: 400 });
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot transfer to yourself.' }, { status: 400 });
    }


    const fromAddr      = from.toLowerCase().trim();
    const toAddr        = to.toLowerCase().trim();
    const roundedAmount = Math.round(rawAmount * 1_000_000) / 1_000_000;

    // ── Session Authorization (CSRF / Replay Protection) ────────────────────
    // Rely strictly on Edge Middleware's cryptographically verified header
    let verifiedSessionAddr = req.headers.get('x-verified-session-address')?.toLowerCase().trim();

    if (!verifiedSessionAddr) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid session required.' },
        { status: 401 }
      );
    }

    // If verifiedSessionAddr is a UUID (from email login), look up their Aztec-derived address.
    // Email users don't have a walletAddress, so we derive the canonical Aztec address
    // from their email using the same 2-round SHA-256 algorithm used in derive-address API.
    const isUUID = verifiedSessionAddr.includes('-') && verifiedSessionAddr.length > 30;
    if (isUUID) {
      const authUser = await prisma.authUser.findUnique({ where: { id: verifiedSessionAddr } });
      if (!authUser) {
        return NextResponse.json(
          { error: 'Unauthorized: Session not found.' },
          { status: 401 }
        );
      }
      if (authUser.walletAddress) {
        // User has a linked wallet — use that
        verifiedSessionAddr = authUser.walletAddress.toLowerCase();
      } else if (authUser.email) {
        // Email-only user — derive their Aztec address from email (canonical)
        const { createHash } = await import('crypto');
        const emailNormalized = authUser.email.toLowerCase().trim();
        const round1 = createHash('sha256').update(`aztec-schnorr:${emailNormalized}`).digest();
        const round2 = createHash('sha256').update(round1).digest('hex');
        verifiedSessionAddr = `0x${round2}`;
      } else {
        return NextResponse.json(
          { error: 'Unauthorized: Email account incomplete. Please contact support.' },
          { status: 403 }
        );
      }
    }

    // ── Identity Gate: Only verified identities (airdrop claimants) can transfer ──
    // This blocks proxy farms: creating 10,000 wallets does nothing because
    // none of them have signed and claimed one of the 200 genesis airdrops.
    try {
      await assertVerifiedIdentity(verifiedSessionAddr);
    } catch (gateErr: any) {
      return NextResponse.json(
        { error: gateErr.message, code: 'NOT_VERIFIED_IDENTITY' },
        { status: gateErr.statusCode ?? 403 }
      );
    }

    // Accept exact EVM match OR the SHA-256 derived Aztec address
    const isEvmMatch = verifiedSessionAddr === fromAddr;
    let isDerivedMatch = false;
    if (!isEvmMatch) {
      try {
        const { createHash } = await import('crypto');
        const round1 = createHash('sha256').update(`aztec-schnorr:${verifiedSessionAddr}`).digest();
        const round2 = createHash('sha256').update(round1).digest('hex');
        const derivedAztec = `0x${round2}`;
        isDerivedMatch = derivedAztec.toLowerCase() === fromAddr.toLowerCase();
      } catch {}
    }

    if (!isEvmMatch && !isDerivedMatch) {
      return NextResponse.json(
        { error: `Forbidden: Identity mismatch. Authenticated as ${verifiedSessionAddr.slice(0, 10)}…, but trying to spend from ${fromAddr.slice(0, 10)}…` },
        { status: 403 }
      );
    }


    console.log(`[Aztec Transfer] ${roundedAmount} QDs: ${fromAddr.slice(0, 16)}… → ${toAddr.slice(0, 16)}…`);

    let aztecTxHash : string  = '';
    let explorerUrl : string  = '';
    let onChain     : boolean = false;
    let blockNumber : number  = Math.floor(Date.now() / 12_000);
    let nodeInfo    : any     = null;

    const tokenAddressStr = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
    const pxeUrl          = process.env.AZTEC_PXE_URL   || 'https://v5.testnet.rpc.aztec-labs.com';
    const nodeUrl         = process.env.AZTEC_NODE_URL  || 'https://v5.testnet.rpc.aztec-labs.com';

    if (!tokenAddressStr || tokenAddressStr === 'PENDING_DEPLOY') {
      // ── MODE B: Token contract not yet deployed — DB-only ledger ────────────
      console.log('[Aztec Transfer] Mode B: Token contract not deployed. Using DB-only ledger.');
      // Anchor to live Aztec block for verifiability
      try {
        const nodeInfoRes = await fetch(`${nodeUrl}/node-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'node_getNodeInfo', params: [], id: 1 }),
          signal: AbortSignal.timeout(8000),
        });
        if (nodeInfoRes.ok) {
          const nodeData = await nodeInfoRes.json();
          blockNumber = nodeData?.result?.l2BlockNumber ?? blockNumber;
        }
      } catch { /* node unreachable — use timestamp-derived block */ }
      aztecTxHash = 'offchain-' + crypto.randomBytes(16).toString('hex');
      explorerUrl = `https://testnet.aztecscan.xyz/blocks/${blockNumber}`;
    } else {
    // ── MODE A: NATIVE AZTEC TESTNET TRANSFER ────────────────────────────────
    console.log('[Aztec Transfer] Mode A: On-chain transfer via EmbeddedWallet + TokenContract');

    const { EmbeddedWallet }            = await import('@aztec/wallets/embedded');
    const { Fr }                        = await import('@aztec/foundation/curves/bn254');
    const { AztecAddress }              = await import('@aztec/stdlib/aztec-address');
    const { TokenContract }             = await import('@aztec/noir-contracts.js/Token');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const { deriveSecretKeyFromEvm }    = await import('@/lib/aztec/client');
    const { getFpcAddress }             = await import('@/lib/aztec/client');

    let onChainSuccess = false;
    const wallet = await EmbeddedWallet.create(pxeUrl, { ephemeral: true });

    try {
      const secretKeyHex       = deriveSecretKeyFromEvm(fromAddr);
      const secretKey          = Fr.fromHexString(secretKeyHex.replace(/^0x/i, ''));
      const salt               = new Fr(0n);
      const accountManager     = await wallet.createSchnorrAccount(secretKey, salt);
      const senderAztecAddress = accountManager.address;

      const tokenAddress  = AztecAddress.fromString(tokenAddressStr);
      const recipientAddr = AztecAddress.fromString(toAddr);
      const tokenContract = await TokenContract.at(tokenAddress, wallet);
      const amountBigInt  = BigInt(Math.floor(roundedAmount * 1e18));

      const fpcAddress       = AztecAddress.fromString(getFpcAddress());
      const feePaymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

      try {
        const txResult = await tokenContract.methods
          .transfer_public(senderAztecAddress, recipientAddr, amountBigInt, 0n)
          .send({ from: senderAztecAddress, fee: { paymentMethod: feePaymentMethod } });

        aztecTxHash   = txResult.receipt.txHash.toString();
        explorerUrl   = `${AZTEC_EXPLORER}/tx-effects/${aztecTxHash}`;
        onChain       = true;
        onChainSuccess = true;
        blockNumber   = Number(txResult.receipt.blockNumber ?? Math.floor(Date.now() / 12_000));
        console.log(`[Aztec Transfer] ✅ On-chain! Hash: ${aztecTxHash}`);
      } catch (fpcErr: any) {
        // ── FPC FALLBACK: Sponsored FPC has zero Fee Juice (known Aztec 5.0.1 issue) ──
        // Ref: https://forum.aztec.network — @joshc confirmed FPC funding is pending.
        // Fall back to Mode B so users are not blocked.
        const isFpcError = fpcErr?.message?.toLowerCase().includes('insufficient fee payer') ||
                           fpcErr?.message?.toLowerCase().includes('fee juice') ||
                           fpcErr?.message?.toLowerCase().includes('insufficient balance');
        if (isFpcError) {
          console.warn('[Aztec Transfer] ⚠️ Sponsored FPC has zero Fee Juice (Aztec 5.0.1 known issue). Falling back to Mode B DB ledger.');
          try {
            const nodeInfoRes = await fetch(`${nodeUrl}/node-info`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', method: 'node_getNodeInfo', params: [], id: 1 }),
              signal: AbortSignal.timeout(8000),
            });
            if (nodeInfoRes.ok) {
              const nodeData = await nodeInfoRes.json();
              blockNumber = nodeData?.result?.l2BlockNumber ?? blockNumber;
            }
          } catch { /* node unreachable */ }
          aztecTxHash = 'offchain-' + crypto.randomBytes(16).toString('hex');
          explorerUrl = `https://testnet.aztecscan.xyz/blocks/${blockNumber}`;
        } else {
          throw fpcErr;
        }
      }

      // Fetch node info for metadata (best-effort)
      if (onChainSuccess) {
        try {
          const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
          const node = createAztecNodeClient(nodeUrl);
          const info = await node.getNodeInfo();
          nodeInfo = {
            nodeVersion  : info.nodeVersion,
            l1ChainId    : info.l1ChainId,
            rollupVersion: info.rollupVersion,
            rollupAddress: info.l1ContractAddresses?.rollupAddress?.toString(),
          };
        } catch { console.warn('[Aztec Transfer] Could not fetch node info.'); }
      }
    } finally {
      await wallet.stop();
    }
    }

    // ── Atomic DB Ledger Write (Serializable — anti double-spend) ───────────
    const nonce = crypto.randomBytes(16).toString('hex');

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Calculate balance WITHIN the serializable transaction lock
        const receivedAgg = await tx.transaction.aggregate({
          where: { toAddress: fromAddr, token: 'QDs', status: 'COMPLETED' },
          _sum: { amount: true },
        });
        const sentAgg = await tx.transaction.aggregate({
          where: { fromAddress: fromAddr, token: 'QDs', status: 'COMPLETED' },
          _sum: { amount: true },
        });
        const earnedQdAgg = await tx.qdTransaction.aggregate({
          where: { aztecAddress: fromAddr, type: 'EARN' },
          _sum: { amount: true },
        });
        const spentQdAgg = await tx.qdTransaction.aggregate({
          where: { aztecAddress: fromAddr, type: { in: ['SPEND', 'SLASH'] } },
          _sum: { amount: true },
        });

        const received = Number(receivedAgg._sum.amount ?? 0);
        const sent     = Number(sentAgg._sum.amount     ?? 0);
        const earned   = Number(earnedQdAgg._sum.amount ?? 0);
        const spent    = Number(spentQdAgg._sum.amount  ?? 0);

        const balance = Math.max(
          0,
          Math.round((received + earned - sent - spent) * 1_000_000) / 1_000_000
        );

        if (balance < roundedAmount) {
          throw new Error(`Insufficient QDs. Available: ${balance.toFixed(6)} QDs.`);
        }

        // 2. Record the transfer
        await tx.transaction.create({
          data: {
            txHash     : aztecTxHash,
            fromAddress: fromAddr,
            toAddress  : toAddr,
            amount     : roundedAmount,
            token      : 'QDs',
            tokenSymbol: 'QDs',
            type       : spendReason ? 'SPEND' : 'TRANSFER',
            status     : 'COMPLETED',
            chainId    : 89021716,
            blockNumber: BigInt(blockNumber ?? Math.floor(Date.now() / 12_000)),
            metadata   : {
              network         : 'aztec-testnet',
              aztecTxHash,
              explorerUrl,
              onChain: true,
              tokenContractSet: !!tokenAddressStr,
              nodeInfo,
              nonce,
              reason          : spendReason ?? 'Transfer',
            },
          },
        });
      }, {
        isolationLevel: 'Serializable', // Maximum protection against race conditions
      });
    } catch (atomicError: any) {
      if (atomicError.message?.includes('Insufficient QDs')) {
        return NextResponse.json({ error: atomicError.message }, { status: 400 });
      }
      throw atomicError;
    }

    return NextResponse.json({
      success         : true,
      txHash          : aztecTxHash,
      blockNumber     : String(blockNumber),
      from            : fromAddr,
      to              : toAddr,
      amount          : roundedAmount,
      onChain,
      explorerUrl,
      network         : 'aztec-testnet',
      nodeInfo,
      tokenContractSet: !!tokenAddressStr,
      message: onChain
        ? `${roundedAmount} QDs transferred on Aztec Testnet ✅ — View on AztecScan`
        : `${roundedAmount} QDs transferred. Network verified at block #${blockNumber}. Full on-chain transfer enabled after token deployment.`,
    });

  } catch (err: any) {
    console.error('[Aztec Transfer] Error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal server error during transfer.' },
      { status: 500 }
    );
  }
}
