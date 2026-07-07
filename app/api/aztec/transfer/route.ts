// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const AZTEC_EXPLORER = 'https://testnet.aztecscan.xyz';
const AZTEC_NODE_URL = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
const SPONSORED_FPC_ADDRESS = '0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880';

/**
 * POST /api/aztec/transfer
 *
 * Transfers QDs on the Aztec Testnet (v5).
 * - Attempts real on-chain tx via PXE / Aztec Node (appears on AztecScan)
 * - Always records in DB for reliable balance tracking
 *
 * Body: { from: string, to: string, amount: number | string, seed?: string }
 *   from  — sender's Aztec address (0x + 64 hex chars)
 *   to    — recipient's Aztec address
 *   amount — QD amount to send
 *   seed  — optional: EIP-191 signature entropy (Fr hex) for ZK proof generation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, seed } = body;
    const rawAmount = typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount;

    // ── Validation ───────────────────────────────────────────────────────────
    if (!from || typeof from !== 'string' || from.trim().length < 10) {
      return NextResponse.json({ error: 'Missing or invalid sender address.' }, { status: 400 });
    }
    if (!to || typeof to !== 'string' || to.trim().length < 10) {
      return NextResponse.json({ error: 'Missing or invalid recipient address.' }, { status: 400 });
    }
    if (!rawAmount || isNaN(rawAmount) || rawAmount <= 0 || !isFinite(rawAmount)) {
      return NextResponse.json({ error: 'Amount must be a positive number.' }, { status: 400 });
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot transfer to yourself.' }, { status: 400 });
    }

    const fromAddr     = from.toLowerCase().trim();
    const toAddr       = to.toLowerCase().trim();
    const roundedAmount = Math.round(rawAmount * 1_000_000) / 1_000_000;

    // ── DB Balance check ─────────────────────────────────────────────────────
    const [receivedAgg, sentAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { toAddress: fromAddr, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { fromAddress: fromAddr, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const received = Number(receivedAgg._sum.amount ?? 0);
    const sent     = Number(sentAgg._sum.amount     ?? 0);
    const balance  = Math.max(0, Math.round((received - sent) * 1_000_000) / 1_000_000);

    if (balance < roundedAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ${balance.toFixed(6)} QDs, Requested: ${roundedAmount} QDs.` },
        { status: 422 }
      );
    }

    // ── Attempt Aztec On-Chain Transaction ───────────────────────────────
    let aztecTxHash: string;
    let explorerUrl: string;

    console.log(`[Aztec Transfer] Connecting to Aztec Testnet: ${roundedAmount} QDs → ${toAddr.slice(0, 16)}...`);
    
    const tokenAddressStr = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
    if (!tokenAddressStr) {
      throw new Error("AZTEC_TOKEN_CONTRACT_ADDRESS is not set. Zero-Mock mode requires a real Aztec token contract.");
    }

    const { createPXEClient } = await import('@aztec/aztec.js/wallet');
    const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
    const { Fr } = await import('@aztec/aztec.js/fields');
    const { deriveSigningKey } = await import('@aztec/aztec.js/keys');
    const { AztecAddress } = await import('@aztec/aztec.js/addresses');
    const { TokenContract } = await import('@aztec/noir-contracts.js/Token');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const { deriveSecretKeyFromEvm } = await import('@/lib/aztec/client');

    const pxeUrl = process.env.AZTEC_PXE_URL || 'http://127.0.0.1:18080';
    const pxe = createPXEClient(pxeUrl);

    // Derive sender's secret key deterministically (testnet custodial model)
    const secretKeyHex = deriveSecretKeyFromEvm(fromAddr);
    const secretKey = Fr.fromString(secretKeyHex);
    const signingKey = deriveSigningKey(secretKey);
    const account = getSchnorrAccount(pxe, secretKey, signingKey);
    
    // Register sender account if not already registered on this PXE
    await account.register();
    const senderWallet = await account.getWallet();

    const tokenAddress = AztecAddress.fromString(tokenAddressStr);
    const recipientAztecAddr = AztecAddress.fromString(toAddr);
    const tokenContract = await TokenContract.at(tokenAddress, senderWallet);

    const amountBigInt = BigInt(Math.floor(roundedAmount * 1e18));
    const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

    console.log(`[Aztec Transfer] Sending tx to mempool via SponsoredFPC...`);
    const tx = await tokenContract.methods
      .transfer_public(senderWallet.getAddress(), recipientAztecAddr, amountBigInt, 0)
      .send({
        fee: {
          paymentMethod: new SponsoredFeePaymentMethod(
            AztecAddress.fromString(SPONSORED_FPC)
          )
        }
      });

    const receipt = await tx.wait();
    aztecTxHash = receipt.txHash.toString();
    explorerUrl = `${AZTEC_EXPLORER}/tx/${aztecTxHash}`;
    
    console.log(`[Aztec Transfer] ✅ On-chain success (Testnet v5)! AztecScan: ${explorerUrl}`);

    const blockNum = Math.floor(Date.now() / 12_000);
    const nonce = crypto.randomBytes(16).toString('hex');

    // ── Write to off-chain ledger ───────────────────────────────────
    await prisma.transaction.create({
      data: {
        txHash:      aztecTxHash, 
        fromAddress: fromAddr,
        toAddress:   toAddr,
        amount:      roundedAmount,
        token:       'QDs',
        tokenSymbol: 'QDs',
        type:        'TRANSFER',
        status:      'COMPLETED',
        chainId:     89021716, // Aztec Testnet v5
        blockNumber: BigInt(blockNum),
        metadata:    {
          network:      'aztec-testnet',
          aztecTxHash:  aztecTxHash,
          explorerUrl:  explorerUrl,
          onChain:      true,
          nonce,
        },
      },
    });

    return NextResponse.json({
      success:      true,
      txHash:       aztecTxHash,
      blockNumber:  String(blockNum),
      from:         fromAddr,
      to:           toAddr,
      amount:       roundedAmount,
      onChain:      true,
      explorerUrl:  explorerUrl,
      message:      `${roundedAmount} QDs transferred on Aztec Testnet ✅ — View on AztecScan`
    });

  } catch (err: any) {
    console.error('[Aztec Transfer] Error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal server error during transfer.' },
      { status: 500 }
    );
  }
}
