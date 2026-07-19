// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/qds/unstake
 *
 * Unlocks a Sovereign Node and returns staked QDs + accrued yield.
 * Can only be called after the lockup period has expired.
 *
 * Body: { address: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rawAddress = typeof body.address === 'string' ? body.address.trim().toLowerCase() : '';

    if (!rawAddress || rawAddress.length < 10) {
      return NextResponse.json({ error: 'Invalid address.' }, { status: 400 });
    }

    const node = await (prisma as any).sovereignNode.findUnique({
      where: { aztecAddress: rawAddress },
    });

    if (!node || !node.active) {
      return NextResponse.json({ error: 'No active Sovereign Node found for this address.' }, { status: 404 });
    }

    const now = new Date();
    if (now < new Date(node.unlockAt)) {
      const remainingMs = new Date(node.unlockAt).getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      return NextResponse.json({
        error: `Node is still locked. ${remainingDays} day(s) remaining until unlock.`,
        unlockAt: node.unlockAt,
      }, { status: 400 });
    }

    // Calculate yield accrued since lastYieldAt
    const YIELD_RATES: Record<string, number> = {
      BRONZE: 0.001, SILVER: 0.003, GOLD: 0.007,
    };
    const rate = YIELD_RATES[node.tier] ?? 0.001;
    const daysElapsed = Math.floor((now.getTime() - new Date(node.lastYieldAt).getTime()) / (1000 * 60 * 60 * 24));
    const yieldEarned = Math.round(node.stakedAmount * rate * daysElapsed * 100) / 100;
    const totalReturn = node.stakedAmount + yieldEarned;

    await prisma.$transaction(async (tx) => {
      // Return staked QDs + yield
      await (tx as any).qdTransaction.create({
        data: {
          aztecAddress: rawAddress,
          type: 'UNSTAKE',
          amount: totalReturn,
          description: `Sovereign Node Unstake — ${node.tier} Tier. Staked: ${node.stakedAmount} QDs + Yield: ${yieldEarned} QDs`,
        },
      });

      // Deactivate node
      await (tx as any).sovereignNode.update({
        where: { aztecAddress: rawAddress },
        data: {
          active: false,
          totalYieldPaid: node.totalYieldPaid + yieldEarned,
        },
      });
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json({
      success: true,
      returnedAmount: totalReturn,
      staked: node.stakedAmount,
      yieldEarned,
      message: `Sovereign Node deactivated. ${totalReturn} QDs returned to your balance.`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/qds/unstake/yield — Claim daily yield without unstaking
 *
 * Distributes accrued daily yield to active Sovereign Nodes.
 * Called server-side or by the user manually.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rawAddress = typeof body.address === 'string' ? body.address.trim().toLowerCase() : '';

    const node = await (prisma as any).sovereignNode.findUnique({
      where: { aztecAddress: rawAddress },
    });

    if (!node || !node.active) {
      return NextResponse.json({ error: 'No active Sovereign Node.' }, { status: 404 });
    }

    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - new Date(node.lastYieldAt).getTime()) / (1000 * 60 * 60 * 24));

    if (daysElapsed < 1) {
      return NextResponse.json({ message: 'Yield already claimed today. Come back tomorrow.', yieldAvailable: 0 });
    }

    const YIELD_RATES: Record<string, number> = {
      BRONZE: 0.001, SILVER: 0.003, GOLD: 0.007,
    };
    const rate = YIELD_RATES[node.tier] ?? 0.001;
    const yieldEarned = Math.round(node.stakedAmount * rate * daysElapsed * 100) / 100;

    await prisma.$transaction(async (tx) => {
      await (tx as any).qdTransaction.create({
        data: {
          aztecAddress: rawAddress,
          type: 'REWARD',
          amount: yieldEarned,
          description: `Sovereign Node Daily Yield — ${node.tier} Tier (${daysElapsed}d)`,
        },
      });

      await (tx as any).sovereignNode.update({
        where: { aztecAddress: rawAddress },
        data: { lastYieldAt: now, totalYieldPaid: node.totalYieldPaid + yieldEarned },
      });
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json({
      success: true,
      yieldEarned,
      daysElapsed,
      message: `${yieldEarned} QDs yield claimed for ${daysElapsed} day(s).`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
