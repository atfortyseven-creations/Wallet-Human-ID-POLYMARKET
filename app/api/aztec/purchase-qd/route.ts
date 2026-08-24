// @ts-nocheck
/**
 * POST /api/aztec/purchase-qd
 *
 * Called AFTER the Azguard / AppKit wallet has confirmed an AZT on-chain payment.
 * The front-end sends:
 *   - aztecAddress   : the buyer's Aztec address (from AztecNativeContext)
 *   - evmAddress     : EVM address (for session correlation)
 *   - txHash         : the Aztec transaction hash of the AZT payment (provided by wallet)
 *   - packageIndex   : 0-5 (which QD package was purchased)
 *
 * The server:
 *   1. Validates inputs
 *   2. Verifies the txHash has not already been used (idempotency / anti-replay)
 *   3. Looks up the package price and QD amount
 *   4. Credits QDs to the buyer's aztecAddress in the DB
 *   5. Returns the credited QD amount + a new balance
 *
 * NOTE: In production, step 2 should also verify the tx on-chain via Aztec node RPC.
 *       Until Azguard's SDK provides a reliable receipt API, we guard with DB uniqueness.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import rateLimit from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 200 });

// QD packages — must mirror WhaleChatSettings.tsx
const QD_PACKAGES = [
  { qd: 100,   azt: 0.43  },
  { qd: 250,   azt: 1.08  },
  { qd: 500,   azt: 2.17  },
  { qd: 1000,  azt: 4.28  },
  { qd: 2500,  azt: 10.80 },
  { qd: 35000, azt: 140.0 },
];

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
    try { await limiter.check(10, ip); } catch {
      return NextResponse.json({ error: 'Too many purchase requests. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { aztecAddress, evmAddress, txHash, packageIndex } = body;

    if (!aztecAddress || typeof aztecAddress !== 'string' || !/^0x[0-9a-fA-F]{40,66}$/.test(aztecAddress)) {
      return NextResponse.json({ error: 'Valid aztecAddress is required (0x hex format)' }, { status: 400 });
    }
    
    const formattedTxHash = txHash?.toLowerCase().startsWith('0x') ? txHash.toLowerCase() : `0x${txHash?.toLowerCase() || ''}`;
    if (!txHash || typeof txHash !== 'string' || !/^0x[0-9a-fA-F]{64,66}$/.test(formattedTxHash)) {
      return NextResponse.json({ error: 'Valid txHash is required (0x hex format, 32 bytes)' }, { status: 400 });
    }
    
    if (typeof packageIndex !== 'number' || packageIndex < 0 || packageIndex >= QD_PACKAGES.length) {
      return NextResponse.json({ error: 'Invalid packageIndex' }, { status: 400 });
    }

    const pkg = QD_PACKAGES[packageIndex];
    const normalizedAddress = aztecAddress.toLowerCase();
    const normalizedTxHash  = formattedTxHash;

    // ── Idempotency: one txHash = one credit ─────────────────────────────────
    const existing = await prisma.transaction.findFirst({
      where: { txHash: normalizedTxHash, type: 'PURCHASE' },
      select: { id: true, amount: true }
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: `Already processed: ${existing.amount} QDs credited.`,
        amount: existing.amount,
      });
    }

    // ── Credit QDs in DB ──────────────────────────────────────────────────────
    const creditTxHash = normalizedTxHash || `0x${crypto.createHash('sha256').update(`purchase:${normalizedAddress}:${Date.now()}`).digest('hex')}`;

    await prisma.$transaction(async (txCtx) => {
      // Double-check inside serializable tx
      const alreadyProcessed = await txCtx.transaction.findFirst({
        where: { txHash: normalizedTxHash, type: 'PURCHASE' },
      });
      if (alreadyProcessed) throw new Error('DUPLICATE');

      await txCtx.transaction.create({
        data: {
          txHash:      creditTxHash,
          fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
          toAddress:   normalizedAddress,
          amount:      pkg.qd,
          token:       'QDs',
          tokenSymbol: 'QDs',
          type:        'PURCHASE',
          status:      'COMPLETED',
          chainId:     89021716,
          blockNumber: BigInt(Math.floor(Date.now() / 12_000)),
          metadata: {
            network:        'aztec-network',
            paymentMethod:  'AZT',
            aztAmount:      pkg.azt,
            packageIndex,
            sourceEvmAddr:  evmAddress || null,
            ip,
          },
        },
      });
    }, { isolationLevel: 'Serializable' });

    // ── Fetch new balance ─────────────────────────────────────────────────────
    const balanceRes = await prisma.transaction.aggregate({
      where: { toAddress: normalizedAddress, token: 'QDs', status: 'COMPLETED' },
      _sum: { amount: true },
    });
    const spent = await prisma.transaction.aggregate({
      where: { fromAddress: normalizedAddress, token: 'QDs', status: 'COMPLETED' },
      _sum: { amount: true },
    });
    const newBalance = (balanceRes._sum.amount ?? 0) - (spent._sum.amount ?? 0);

    return NextResponse.json({
      success: true,
      amount:  pkg.qd,
      balance: Math.max(0, newBalance),
      message: `${pkg.qd} Quantum Dots credited to your wallet!`,
      txHash:  creditTxHash,
    });

  } catch (err: any) {
    if (err.message === 'DUPLICATE') {
      return NextResponse.json({ success: true, duplicate: true, message: 'Transaction already processed.' });
    }
    console.error('[QD Purchase] Failed:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
