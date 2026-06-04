import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/network/whale/search?address=0x...
 * Returns real on-chain activity for a wallet address from our indexed DB.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address')?.trim().toLowerCase();

  if (!address || address.length < 10) {
    return NextResponse.json({ error: 'Valid address required' }, { status: 400 });
  }

  try {
    // Query last 20 activities from DB
    const activities = await prisma.whaleActivity.findMany({
      where: {
        walletAddress: { contains: address, mode: 'insensitive' },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    if (activities.length === 0) {
      // If not in DB, try on-chain lookup via blockchain.info (for BTC) or etherscan proxy
      const isBtc = !address.startsWith('0x');
      if (isBtc) {
        const res = await fetch(`https://blockchain.info/rawaddr/${address}?limit=10`, {
          headers: { 'User-Agent': 'HumanDeFi/1.0' },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            address,
            source: 'blockchain_info',
            btcBalance: data.final_balance / 1e8,
            txCount: data.n_tx,
            totalReceived: data.total_received / 1e8,
            totalSent: data.total_sent / 1e8,
            recentTxs: (data.txs || []).slice(0, 10).map((tx: any) => ({
              hash: tx.hash,
              time: tx.time * 1000,
              result: tx.result / 1e8,
            })),
            activities: [],
          });
        }
      }
      return NextResponse.json({ address, activities: [], source: 'db', message: 'No activity found for this address' });
    }

    // Aggregate stats
    const totalVolume = activities.reduce((sum, a) => sum + (Number(a.usdValue) || 0), 0);
    const firstSeen = activities[activities.length - 1]?.timestamp;
    const lastActive = activities[0]?.timestamp;

    return NextResponse.json({
      address,
      source: 'db',
      txCount: activities.length,
      totalVolumeUsd: totalVolume,
      firstSeen: firstSeen?.toISOString(),
      lastActive: lastActive?.toISOString(),
      activities: activities.map((a) => ({
        id: a.id,
        hash: a.transactionHash,
        token: a.token,
        action: a.type,
        usdValue: Number(a.usdValue),
        timestamp: a.timestamp.toISOString(),
        status: a.status,
        chain: a.chain,
      })),
    });
  } catch (err) {
    console.error('[whale/search]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
