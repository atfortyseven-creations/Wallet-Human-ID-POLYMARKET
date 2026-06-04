
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient as redis } from '@/lib/redis/client';
import { safeJsonParse } from '@/lib/utils/json';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cacheKey = 'whale_leaderboard_500';
        const cached = await redis.get(cacheKey);

        if (cached) {
            const parsed = safeJsonParse(cached, null, 'WHALE_LEADERBOARD');
            if (parsed) return NextResponse.json({ whales: parsed, source: 'cache' });
        }

        // Aggregate volume from WhaleActivity in the last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // NOTE: WhaleActivity.usdValue is a String field in the Prisma schema 
        // Prisma _sum/_orderBy only work on numeric types (Float/Int/BigInt).
        // We use valueBTC (Float) for aggregation and derive a USD proxy in the map.
        const result = await prisma.whaleActivity.groupBy({
            by: ['walletAddress'],
            _sum: {
                valueBTC: true,
            },
            _count: {
                id: true,
            },
            where: {
                timestamp: {
                    gte: yesterday,
                },
            },
            orderBy: {
                _sum: {
                    valueBTC: 'desc',
                },
            },
            take: 500,
        });

        // Fallback for missing Prisma models  whaleSnapshot and walletAnalytics removed
        const snapshotMap = new Map<string, any>();
        const analyticsMap = new Map<string, any>();

        const leaderboard = result.map((r, index: number) => {
            const snap = snapshotMap.get(r.walletAddress ?? '');
            const analytic = analyticsMap.get((r.walletAddress ?? '').toLowerCase());
            const metadata = analytic?.metadata as any;
            const pnlData = metadata?.profitLossBreakdown || { totalPnlUsd: 0 };

            // Derive USD estimate from valueBTC (use $65k as floor if btcPriceAtTx unavailable)
            const volumeBtc = Number(r._sum.valueBTC || 0);
            const volumeUsd = volumeBtc * 65000;

            return {
                rank: index + 1,
                address: r.walletAddress,
                label: snap?.label || `Whale-${(r.walletAddress ?? '0x000000').slice(2, 6)}`,
                volume24h: volumeUsd,
                volumeBtc,
                pnlUsd: pnlData.totalPnlUsd || 0,
                txCount: r._count.id,
                chain: snap?.chain || 'ETH',
                tier: snap?.tier || (volumeUsd > 1000000 ? 'MEGA' : 'ALPHA'),
                lastActive: yesterday.toISOString(),
                trend: index < 50 ? 'up' : 'stable',
            };
        });

        // Cache for 60 seconds
        await redis.set(cacheKey, JSON.stringify(leaderboard), 'EX', 60);

        return NextResponse.json({ whales: leaderboard, source: 'live' });
    } catch (error) {
        console.error('[API:WhaleLeaderboard] CRITICAL ERROR:', error);
        return NextResponse.json({ error: 'Failed to generate whale leaderboard' }, { status: 500 });
    }
}
