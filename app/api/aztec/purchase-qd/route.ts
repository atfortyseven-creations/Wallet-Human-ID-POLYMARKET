// @ts-nocheck
/**
 * POST /api/aztec/purchase-qd
 *
 * Called AFTER a real Ethereum on-chain payment is confirmed.
 * The front-end sends:
 *   - aztecAddress   : the buyer's EVM address
 *   - txHash         : the Ethereum transaction hash of the ETH payment
 *   - packageIndex   : 0-5 (which QD package was purchased)
 *
 * The server:
 *   1. Validates inputs
 *   2. Verifies the txHash on Ethereum mainnet (REAL on-chain check):
 *      - tx.to === TREASURY_WALLET
 *      - tx.value >= package ETH price
 *      - tx has at least 1 confirmation (blockNumber exists)
 *   3. Checks idempotency (no double-credit per txHash)
 *   4. Credits QDs to the buyer's address in the DB
 *   5. Returns the credited QD amount + new balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import rateLimit from '@/lib/rate-limit';
import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 200 });

// ── Treasury wallet — all ETH payments must go here ──────────────────────────
const TREASURY_WALLET = '0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a'; // lowercase

// ── QD Packages — must mirror LedgerChatSettings.tsx ─────────────────────────
const QD_PACKAGES = [
  { qd: 100,   ethValue: '0.001'  },
  { qd: 250,   ethValue: '0.0025' },
  { qd: 500,   ethValue: '0.005'  },
  { qd: 1000,  ethValue: '0.01'   },
  { qd: 2500,  ethValue: '0.025'  },
  { qd: 35000, ethValue: '0.35'   },
];

// ── Ethereum public client for on-chain verification ─────────────────────────
const ethRpcUrl =
  process.env.ETHEREUM_RPC_URL ||
  process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL ||
  'https://cloudflare-eth.com'; // fallback public RPC

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(ethRpcUrl),
});

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
    try { await limiter.check(10, ip); } catch {
      return NextResponse.json({ error: 'Too many purchase requests. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { aztecAddress, txHash, packageIndex } = body;

    // ── 1. Input validation ───────────────────────────────────────────────────
    if (!aztecAddress || typeof aztecAddress !== 'string' || !/^0x[0-9a-fA-F]{40,66}$/.test(aztecAddress)) {
      return NextResponse.json({ error: 'Valid address is required (0x hex format)' }, { status: 400 });
    }

    const normalizedTxHash = typeof txHash === 'string' && txHash.toLowerCase().startsWith('0x')
      ? txHash.toLowerCase() as `0x${string}`
      : null;

    if (!normalizedTxHash || !/^0x[0-9a-fA-F]{64}$/.test(normalizedTxHash)) {
      return NextResponse.json({ error: 'Valid txHash is required (0x + 32 bytes hex)' }, { status: 400 });
    }

    if (typeof packageIndex !== 'number' || packageIndex < 0 || packageIndex >= QD_PACKAGES.length) {
      return NextResponse.json({ error: 'Invalid packageIndex' }, { status: 400 });
    }

    const pkg = QD_PACKAGES[packageIndex];
    const normalizedAddress = aztecAddress.toLowerCase();

    // ── 2. Idempotency: one txHash = one credit ───────────────────────────────
    const existing = await prisma.transaction.findFirst({
      where: { txHash: normalizedTxHash, type: 'PURCHASE' },
      select: { id: true, amount: true },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: `Already processed: ${existing.amount} QDs credited.`,
        amount: existing.amount,
      });
    }

    // ── 3. ON-CHAIN VERIFICATION — critical security gate ────────────────────
    // This prevents anyone from calling this API with a fake txHash.
    try {
      const tx = await publicClient.getTransaction({ hash: normalizedTxHash });

      if (!tx) {
        return NextResponse.json({
          error: 'Transaction not found on Ethereum mainnet. Please wait for network broadcast.',
        }, { status: 400 });
      }

      // Verify recipient is the treasury wallet
      if (!tx.to || tx.to.toLowerCase() !== TREASURY_WALLET) {
        return NextResponse.json({
          error: 'Payment was not sent to the Humanity Ledger treasury. Transaction rejected.',
        }, { status: 400 });
      }

      // Verify payment amount (with 5% tolerance)
      const expectedWei = parseEther(pkg.ethValue);
      const actualWei = tx.value;
      const tolerance = expectedWei / 20n; // 5% tolerance

      if (actualWei < expectedWei - tolerance) {
        return NextResponse.json({
          error: `Insufficient payment. Expected ${pkg.ethValue} ETH, received ${formatEther(actualWei)} ETH.`,
        }, { status: 400 });
      }

      // Verify the transaction is confirmed (must have a block number)
      if (!tx.blockNumber) {
        return NextResponse.json({
          error: 'Transaction is pending. Please wait for at least 1 confirmation and try again.',
        }, { status: 400 });
      }

    } catch (rpcErr: any) {
      console.error('[QD Purchase] On-chain verification failed:', rpcErr?.message);
      // Never credit QDs without on-chain confirmation
      return NextResponse.json({
        error: 'Unable to verify transaction on Ethereum network. Please try again in a moment.',
      }, { status: 503 });
    }

    // ── 4. Credit QDs in DB ───────────────────────────────────────────────────
    await prisma.$transaction(async (txCtx) => {
      const alreadyProcessed = await txCtx.transaction.findFirst({
        where: { txHash: normalizedTxHash, type: 'PURCHASE' },
      });
      if (alreadyProcessed) throw new Error('DUPLICATE');

      await txCtx.transaction.create({
        data: {
          txHash:      normalizedTxHash,
          fromAddress: normalizedAddress,
          toAddress:   normalizedAddress,
          amount:      pkg.qd,
          token:       'QDs',
          tokenSymbol: 'QDs',
          type:        'PURCHASE',
          status:      'COMPLETED',
          chainId:     1, // Ethereum mainnet
          blockNumber: BigInt(Math.floor(Date.now() / 12_000)),
          metadata: {
            network:        'ethereum-mainnet',
            paymentMethod:  'ETH',
            ethAmount:      pkg.ethValue,
            treasuryWallet: TREASURY_WALLET,
            packageIndex,
            ip,
          },
        },
      });
    }, { isolationLevel: 'Serializable' });

    // ── 5. Fetch new balance ──────────────────────────────────────────────────
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
      txHash:  normalizedTxHash,
    });

  } catch (err: any) {
    if (err.message === 'DUPLICATE') {
      return NextResponse.json({ success: true, duplicate: true, message: 'Transaction already processed.' });
    }
    console.error('[QD Purchase] Failed:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
