import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { deriveAztecAddress, deriveIdentityHash } from '@/lib/aztec/zk-identity';

export const dynamic = 'force-dynamic';

/**
 * GET /api/qds/balance?address=0x...
 *
 * Returns the real-time QD balance for a given Aztec address, plus their
 * Sovereign Node status (tier, staked amount, unlock date, yield earned).
 *
 * Balance = (Transactions RECEIVED as QDs) + (QdTransactions EARN/UNSTAKE/REWARD)
 *         - (Transactions SENT as QDs) - (QdTransactions SPEND/SLASH/STAKE/FEE)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawAddress = searchParams.get('address') || '';
    if (!rawAddress || rawAddress.length < 10) {
      return NextResponse.json({ error: 'Missing address parameter.' }, { status: 400 });
    }

    const aztecAddress = rawAddress.toLowerCase().trim();

    const [receivedAgg, sentAgg, earnedAgg, spentAgg, node, history] = await Promise.all([
      // Received as QD transfers
      prisma.transaction.aggregate({
        where: { toAddress: aztecAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Sent as QD transfers
      prisma.transaction.aggregate({
        where: { fromAddress: aztecAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Earned/rewarded QDs
      prisma.qdTransaction.aggregate({
        where: { aztecAddress, type: { in: ['EARN', 'REWARD', 'UNSTAKE'] } },
        _sum: { amount: true },
      }),
      // Spent/slashed/staked/fee QDs
      prisma.qdTransaction.aggregate({
        where: { aztecAddress, type: { in: ['SPEND', 'SLASH', 'STAKE', 'FEE'] } },
        _sum: { amount: true },
      }),
      // Sovereign Node status
      (prisma as any).sovereignNode.findUnique({
        where: { aztecAddress },
      }),
      // Last 20 QD transactions
      (prisma as any).qdTransaction.findMany({
        where: { aztecAddress },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { type: true, amount: true, description: true, createdAt: true },
      }),
    ]);

    const received = Number(receivedAgg._sum.amount ?? 0);
    const sent     = Number(sentAgg._sum.amount     ?? 0);
    const earned   = Number(earnedAgg._sum.amount   ?? 0);
    const spent    = Number(spentAgg._sum.amount    ?? 0);

    const balance = Math.max(
      0,
      Math.round((received + earned - sent - spent) * 1_000_000) / 1_000_000
    );

    const nodeStatus = node ? {
      active       : node.active,
      tier         : node.tier,
      stakedAmount : node.stakedAmount,
      lockedAt     : node.lockedAt,
      unlockAt     : node.unlockAt,
      totalYield   : node.totalYieldPaid,
      canUnstake   : new Date() >= new Date(node.unlockAt),
    } : null;

    return NextResponse.json({
      aztecAddress,
      balance,
      breakdown: {
        received,
        sent,
        earned,
        spent,
      },
      sovereignNode: nodeStatus,
      history,
    });

  } catch (err: any) {
    console.error('[QDs Balance] Error:', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
