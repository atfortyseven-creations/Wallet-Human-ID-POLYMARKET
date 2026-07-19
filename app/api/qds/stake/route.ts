// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { deriveAztecAddress, deriveIdentityHash, isOwner } from '@/lib/aztec/zk-identity';

export const dynamic = 'force-dynamic';

// Sovereign Node Tier Configuration
const TIERS = {
  BRONZE: { minStake: 500,  lockDays: 7,  dailyYieldRate: 0.001, label: 'Sovereign Node — Bronce' },
  SILVER: { minStake: 2000, lockDays: 14, dailyYieldRate: 0.003, label: 'Sovereign Node — Plata' },
  GOLD:   { minStake: 5000, lockDays: 30, dailyYieldRate: 0.007, label: 'Sovereign Node — Oro' },
} as const;

type Tier = keyof typeof TIERS;

function resolveTier(amount: number): Tier | null {
  if (amount >= TIERS.GOLD.minStake)   return 'GOLD';
  if (amount >= TIERS.SILVER.minStake) return 'SILVER';
  if (amount >= TIERS.BRONZE.minStake) return 'BRONZE';
  return null;
}

/**
 * POST /api/qds/stake
 *
 * Locks QDs to activate a Sovereign Node.
 * The node earns daily QD yield proportional to its tier.
 * QDs are locked for tier.lockDays days.
 *
 * Body: { address: string, amount: number }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rawAmount = typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount;
    const rawAddress = typeof body.address === 'string' ? body.address.trim().toLowerCase() : '';

    if (!rawAddress || rawAddress.length < 10) {
      return NextResponse.json({ error: 'Invalid address.' }, { status: 400 });
    }
    if (!rawAmount || isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid stake amount.' }, { status: 400 });
    }

    const tier = resolveTier(rawAmount);
    if (!tier) {
      return NextResponse.json({
        error: `Minimum stake for Bronze Node is ${TIERS.BRONZE.minStake} QDs.`,
        tiers: TIERS,
      }, { status: 400 });
    }

    const tierConfig = TIERS[tier];
    const identityHash = deriveIdentityHash(rawAddress);

    // Check if node already active
    const existing = await (prisma as any).sovereignNode.findUnique({
      where: { aztecAddress: rawAddress },
    });
    if (existing?.active) {
      return NextResponse.json({
        error: `You already have an active ${existing.tier} Sovereign Node. Unstake first to re-stake.`,
      }, { status: 409 });
    }

    // Atomic: verify balance, deduct, create node
    await prisma.$transaction(async (tx) => {
      // Compute available balance
      const [receivedAgg, sentAgg, earnedAgg, spentAgg] = await Promise.all([
        tx.transaction.aggregate({ where: { toAddress: rawAddress, token: 'QDs', status: 'COMPLETED' }, _sum: { amount: true } }),
        tx.transaction.aggregate({ where: { fromAddress: rawAddress, token: 'QDs', status: 'COMPLETED' }, _sum: { amount: true } }),
        (tx as any).qdTransaction.aggregate({ where: { aztecAddress: rawAddress, type: { in: ['EARN', 'REWARD', 'UNSTAKE'] } }, _sum: { amount: true } }),
        (tx as any).qdTransaction.aggregate({ where: { aztecAddress: rawAddress, type: { in: ['SPEND', 'SLASH', 'STAKE', 'FEE'] } }, _sum: { amount: true } }),
      ]);
      const balance = Math.max(0, (Number(receivedAgg._sum.amount ?? 0) + Number(earnedAgg._sum.amount ?? 0)) - (Number(sentAgg._sum.amount ?? 0) + Number(spentAgg._sum.amount ?? 0)));

      if (balance < rawAmount) {
        throw new Error(`Insufficient QDs. Balance: ${balance.toFixed(2)} QDs, Required: ${rawAmount} QDs.`);
      }

      const now = new Date();
      const unlockAt = new Date(now.getTime() + tierConfig.lockDays * 24 * 60 * 60 * 1000);

      // Deduct QDs as STAKE
      await (tx as any).qdTransaction.create({
        data: {
          aztecAddress: rawAddress,
          type: 'STAKE',
          amount: rawAmount,
          description: `Sovereign Node Stake — ${tier} Tier (${tierConfig.lockDays}d lock)`,
        },
      });

      // Create or update node
      await (tx as any).sovereignNode.upsert({
        where: { aztecAddress: rawAddress },
        create: {
          aztecAddress: rawAddress,
          identityHash,
          tier,
          stakedAmount: rawAmount,
          unlockAt,
          active: true,
          totalYieldPaid: 0,
        },
        update: {
          tier,
          stakedAmount: rawAmount,
          lockedAt: now,
          unlockAt,
          lastYieldAt: now,
          active: true,
          totalYieldPaid: 0,
        },
      });
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json({
      success: true,
      tier,
      stakedAmount: rawAmount,
      lockDays: tierConfig.lockDays,
      dailyYieldRate: tierConfig.dailyYieldRate,
      estimatedDailyYield: Math.round(rawAmount * tierConfig.dailyYieldRate * 100) / 100,
      message: `${tier} Sovereign Node activated. ${rawAmount} QDs locked for ${tierConfig.lockDays} days.`,
    });

  } catch (err: any) {
    const status = err.message?.includes('Insufficient') ? 400 : 500;
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status });
  }
}
