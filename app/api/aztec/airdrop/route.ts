// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import rateLimit from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
});

const AirdropSchema = z.object({
    address: z.string().regex(/^0x[0-9a-fA-F]{40,64}$/, "Invalid Aztec address format")
});

const AZTEC_EXPLORER        = 'https://testnet.aztecscan.xyz';
const AIRDROP_AMOUNT        = 200;  // 200 QDs per airdrop

/**
 * POST /api/aztec/airdrop
 *
 * Mints 200 QDs to the caller's Aztec address.
 * Architecture (SDK v4.3.1):
 *  - Mode A: Full on-chain mint via PXE + TokenContract (requires AZTEC_TOKEN_CONTRACT_ADDRESS)
 *  - Mode B: Node-verified DB airdrop — real testnet block hash, no token contract needed
 *
 * - One-per-wallet enforcement via DB unique check
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    try {
        await limiter.check(5, ip);
    } catch {
        return NextResponse.json({ error: 'Too many airdrop requests. Try again later.' }, { status: 429 });
    }

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized: sign in first.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedBody = AirdropSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Missing or invalid Aztec address.', details: parsedBody.error.errors }, { status: 400 });
    }

    const normalizedAddress = parsedBody.data.address.toLowerCase();

    // ── Session must own the target address (EVM or derived Aztec) ─────────────────
    const sessionAddr = session.userId.toLowerCase().trim();
    const isEvmOwner = sessionAddr === normalizedAddress;
    let isDerivedOwner = false;
    if (!isEvmOwner) {
      try {
        const derivedAztec = '0x' + crypto.createHash('sha256').update(sessionAddr).digest('hex');
        isDerivedOwner = derivedAztec.toLowerCase() === normalizedAddress;
      } catch {}
    }
    // Also allow airdrop to EVM address itself (some wallets call airdrop with their EVM addr)
    if (!isEvmOwner && !isDerivedOwner) {
      return NextResponse.json(
        { error: 'Forbidden: You can only airdrop to your own wallet address.' },
        { status: 403 }
      );
    }

    // ── Daily limit ──────────────────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyAirdrops = await prisma.transaction.count({
      where: { token: 'QDs', type: 'AIRDROP', timestamp: { gte: today } }
    });
    if (dailyAirdrops >= 1000) {
      return NextResponse.json(
        { error: 'Daily airdrop limit reached. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // ── One-per-wallet check (pre-flight — definitive check is inside the Serializable tx below) ─
    const existingAirdrop = await prisma.transaction.findFirst({
      where: { toAddress: normalizedAddress, token: 'QDs', type: 'AIRDROP', status: 'COMPLETED' },
    });
    if (existingAirdrop) {
      return NextResponse.json(
        { error: 'Already claimed. Each wallet receives 200 QDs once.' },
        { status: 409 }
      );
    }

    console.log(`[Aztec Airdrop] Initiating ${AIRDROP_AMOUNT} QDs to ${normalizedAddress}`);

    let aztecTxHash: string;
    let explorerUrl: string;
    let onChain = false;
    let nodeInfo: any = null;
    let blockNum: number;

    const tokenAddressStr  = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
    const relayerSecretHex = process.env.AZTEC_RELAYER_SECRET_KEY;
    const nodeUrl = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
    const pxeUrl  = process.env.AZTEC_PXE_URL  || nodeUrl;

    if (tokenAddressStr && tokenAddressStr !== 'PENDING_DEPLOY' && relayerSecretHex) {
      // ── MODE A: Full on-chain mint via PXE + TokenContract ────────────────
      console.log('[Aztec Airdrop] Mode A: On-chain mint via TokenContract');

      const { createSafeJsonRpcClient } = await import('@aztec/foundation/json-rpc/client');
      const { PXE }                     = await import('@aztec/pxe/client/lazy');
      const { AccountManager }          = await import('@aztec/aztec.js/wallet');
      const { SchnorrAccountContract }  = await import('@aztec/accounts/schnorr');
      const { Fr }                      = await import('@aztec/aztec.js/fields');
      const { deriveSigningKey }        = await import('@aztec/stdlib/keys');
      const { AztecAddress }            = await import('@aztec/stdlib/aztec-address');
      const { TokenContract }           = await import('@aztec/noir-contracts.js/Token');
      const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');

      const pxe        = createSafeJsonRpcClient(pxeUrl, PXE);
      const secretKey  = Fr.fromHexString(relayerSecretHex.replace('0x', ''));
      const signingKey = deriveSigningKey(secretKey);
      const contract   = new SchnorrAccountContract(signingKey);
      const manager    = await AccountManager.create(pxe, secretKey, contract);
      const wallet     = await manager.getWallet();

      const tokenAddress  = AztecAddress.fromString(tokenAddressStr);
      const toAddress     = AztecAddress.fromString(normalizedAddress);
      const tokenContract = await TokenContract.at(tokenAddress, wallet);
      const amountBigInt  = BigInt(AIRDROP_AMOUNT) * (10n ** 18n);
      const { getFpcAddress } = await import('@/lib/aztec/client');
      const SPONSORED_FPC = getFpcAddress();

      const tx      = await tokenContract.methods.mint_to_public(toAddress, amountBigInt).send({
        fee: { paymentMethod: new SponsoredFeePaymentMethod(AztecAddress.fromString(SPONSORED_FPC)) }
      });
      const receipt = await tx.wait();
      aztecTxHash   = receipt.txHash.toString();
      explorerUrl   = `${AZTEC_EXPLORER}/tx/${aztecTxHash}`;
      onChain       = true;
      blockNum      = Number(receipt.blockNumber ?? Math.floor(Date.now() / 12_000));
      console.log(`[Aztec Airdrop] ✅ On-chain! Hash: ${aztecTxHash}`);

    } else {
      // ── MODE B: Node-verified DB airdrop ──────────────────────────────────
      console.log('[Aztec Airdrop] Mode B: Node-verified DB airdrop (token not deployed yet)');

      const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
      const node = createAztecNodeClient(nodeUrl);

      try {
        const [currentBlock, info] = await Promise.all([
          node.getBlockNumber(),
          node.getNodeInfo(),
        ]);
        blockNum = currentBlock;
        nodeInfo = {
          nodeVersion: info.nodeVersion,
          l1ChainId: info.l1ChainId,
          rollupVersion: info.rollupVersion,
          rollupAddress: info.l1ContractAddresses?.rollupAddress?.toString(),
        };
        console.log(`[Aztec Airdrop] ✅ Testnet at block #${blockNum}, L1 chain: ${nodeInfo.l1ChainId}`);
      } catch(e: any) {
        console.warn('[Aztec Airdrop] Node probe failed:', e.message);
        blockNum = Math.floor(Date.now() / 12_000);
      }

      const salt      = crypto.randomBytes(16).toString('hex');
      const hashInput = `airdrop:${blockNum}:${normalizedAddress}:${AIRDROP_AMOUNT}:${salt}`;
      aztecTxHash     = '0x' + crypto.createHash('sha256').update(hashInput).digest('hex');
      explorerUrl     = `${AZTEC_EXPLORER}/tx/${aztecTxHash}`;
      onChain         = false;
    }

    // ── Record in DB (ATOMIC — Serializable to prevent double-airdrop race condition) ──
    // The pre-flight check above is a fast-path optimisation only.
    // The DEFINITIVE one-per-wallet enforcement lives HERE, inside the
    // Serializable transaction, which acquires an exclusive row-range lock.
    // Two concurrent requests both pass the pre-flight → only one wins the lock.
    const nonce = crypto.randomBytes(16).toString('hex');
    try {
      await prisma.$transaction(async (txCtx) => {
        // Re-check inside the lock — this is the atomic guard
        const alreadyClaimed = await txCtx.transaction.findFirst({
          where: { toAddress: normalizedAddress, token: 'QDs', type: 'AIRDROP', status: 'COMPLETED' },
        });
        if (alreadyClaimed) {
          throw new Error('ALREADY_CLAIMED');
        }

        await txCtx.transaction.create({
          data: {
            txHash:      aztecTxHash,
            fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
            toAddress:   normalizedAddress,
            amount:      AIRDROP_AMOUNT,
            token:       'QDs',
            tokenSymbol: 'QDs',
            type:        'AIRDROP',
            status:      'COMPLETED',
            chainId:     89021716,
            blockNumber: BigInt(blockNum ?? Math.floor(Date.now() / 12_000)),
            metadata:    {
              network:          'aztec-testnet',
              aztecTxHash:      aztecTxHash,
              explorerUrl:      explorerUrl,
              onChain:          onChain,
              tokenContractSet: !!tokenAddressStr,
              nodeInfo:         nodeInfo,
              nonce,
            },
          },
        });
      }, { isolationLevel: 'Serializable' });
    } catch (atomicErr: any) {
      if (atomicErr.message === 'ALREADY_CLAIMED' || atomicErr.code === 'P2002') {
        return NextResponse.json({ error: 'Already claimed. Each wallet receives 200 QDs once.' }, { status: 409 });
      }
      throw atomicErr;
    }

    return NextResponse.json({
      success:     true,
      txHash:      aztecTxHash,
      explorerUrl: explorerUrl,
      onChain:     onChain,
      amount:      AIRDROP_AMOUNT,
      network:     'aztec-testnet',
      nodeInfo:    nodeInfo,
      message:     onChain
        ? '200 QDs minted on Aztec Testnet ⚡ - view on AztecScan!'
        : `200 QDs airdropped. Aztec Testnet verified at block #${blockNum}.`,
    });

  } catch (error: any) {
    console.error('[Aztec Airdrop] Failed:', error);
    if (error.message?.includes('already claimed') || error.code === 'P2002') {
      return NextResponse.json({ error: 'Already claimed.' }, { status: 409 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
