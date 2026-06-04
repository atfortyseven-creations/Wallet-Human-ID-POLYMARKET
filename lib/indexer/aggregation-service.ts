/**
 * 
 * WHALE ALERT NETWORK  Aggregation & Indexing Service
 * 
 *
 * Purpose: Pre-computes expensive analytics across the 1TB Railway volume.
 * Snapshots are stored as JSON in Redis with TTLs calibrated per data type.
 * This eliminates full-table-scans from the hot path completely.
 *
 * Architecture:
 *   PostgreSQL (1TB cold storage + indexes)  THIS SERVICE  Redis (hot cache)
 *    API Routes serve from Redis in microseconds, never touching PG directly.
 */

import { prisma } from '@/lib/prisma';
import { safeRedisSet } from '@/lib/redis/client';

//  Constants 

const AGGREGATION_KEYS = {
    LEADERBOARD_GLOBAL:     'idx:leaderboard:global',       // TTL: 30s
    LEADERBOARD_BY_CHAIN:   'idx:leaderboard:chain:',       // TTL: 30s (suffix = chain)
    SECTOR_RANKINGS:        'idx:sectors:rankings',          // TTL: 60s
    TOKEN_VOLUME_24H:       'idx:tokens:volume:24h',         // TTL: 60s
    CHAIN_SUMMARY:          'idx:chains:summary',            // TTL: 120s
    TOP_WHALE_EVENTS_24H:   'idx:whaleevents:top:24h',       // TTL: 30s
    ZK_VERIFIED_FEED:       'idx:feed:zk-verified',          // TTL: 15s (institutional)
};

//  Aggregators 

/**
 * Computes the global leaderboard by total USD volume across all chains.
 * This replaces a GROUP BY query that was causing full table scans at scale.
 */
async function aggregateGlobalLeaderboard() {
    const rows = await prisma.whaleActivity.groupBy({
        by: ['walletAddress'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 100,
    });

    await safeRedisSet(
        AGGREGATION_KEYS.LEADERBOARD_GLOBAL,
        JSON.stringify({ updatedAt: new Date().toISOString(), data: rows }),
        'EX', 30
    );

    console.log(`[INDEXER]  Global Leaderboard: ${rows.length} wallets indexed.`);
}

/**
 * Computes per-chain leaderboards in parallel (Ethereum, Solana, Arbitrum).
 */
async function aggregateLeaderboardByChain() {
    const chains = await prisma.whaleActivity.findMany({
        distinct: ['chain'],
        select: { chain: true },
    });

    await Promise.all(chains.map(async ({ chain }) => {
        const rows = await prisma.whaleActivity.groupBy({
            by: ['walletAddress'],
            where: { chain },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 50,
        });

        await safeRedisSet(
            `${AGGREGATION_KEYS.LEADERBOARD_BY_CHAIN}${chain.toLowerCase()}`,
            JSON.stringify({ chain, updatedAt: new Date().toISOString(), data: rows }),
            'EX', 30
        );
    }));

    console.log(`[INDEXER]  Per-chain Leaderboards: ${chains.length} chains indexed.`);
}

/**
 * Ranks sectors by Z-Score and TVL simultaneously for the Macro Dashboard.
 */
async function aggregateSectorRankings() {
    const sectors = await prisma.sector.findMany({
        select: { id: true, slug: true, name: true, zScore: true, totalTvl: true, volume24h: true },
        orderBy: [{ zScore: 'desc' }, { totalTvl: 'desc' }],
        take: 103,
    });

    await safeRedisSet(
        AGGREGATION_KEYS.SECTOR_RANKINGS,
        JSON.stringify({ updatedAt: new Date().toISOString(), data: sectors }),
        'EX', 60
    );

    console.log(`[INDEXER]  Sector Rankings: ${sectors.length} sectors indexed.`);
}

/**
 * Computes the largest whale events in the last 24h.
 * Critical for the "Top Alerts" panel in MacroDashboard.
 */
async function aggregateTopWhaleEvents24h() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const events = await prisma.globalWhaleEvent.findMany({
        where: { timestamp: { gte: since } },
        orderBy: { amountUSD: 'desc' },
        take: 50,
    });

    await safeRedisSet(
        AGGREGATION_KEYS.TOP_WHALE_EVENTS_24H,
        JSON.stringify({ updatedAt: new Date().toISOString(), data: events }),
        'EX', 30
    );

    console.log(`[INDEXER]  Top Whale Events (24h): ${events.length} events indexed.`);
}

/**
 * Chain-level activity summary for the global Bubble Map.
 */
async function aggregateChainSummary() {
    const summary = await prisma.whaleActivity.groupBy({
        by: ['chain'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
    });

    await safeRedisSet(
        AGGREGATION_KEYS.CHAIN_SUMMARY,
        JSON.stringify({ updatedAt: new Date().toISOString(), data: summary }),
        'EX', 120
    );

    console.log(`[INDEXER]  Chain Summary: ${summary.length} chains computed.`);
}

/**
 * Extracts the latest ZK-verified whale activity feed for institutional tier.
 */
async function aggregateZkVerifiedFeed() {
    const events = await prisma.whaleActivity.findMany({
        where: { isZkVerified: true },
        orderBy: { timestamp: 'desc' },
        take: 25,
        select: {
            id: true, chain: true, type: true, token: true,
            transactionHash: true, timestamp: true, walletAddress: true,
        },
    });

    await safeRedisSet(
        AGGREGATION_KEYS.ZK_VERIFIED_FEED,
        JSON.stringify({ updatedAt: new Date().toISOString(), data: events }),
        'EX', 15
    );

    console.log(`[INDEXER]  ZK Feed: ${events.length} verified events indexed.`);
}

//  Master Runner 

/**
 * Runs all aggregators in parallel. Designed to be called:
 *   1. By a cron job every 15-30 seconds in production.
 *   2. On-demand by API routes on cache-miss.
 */
export async function runAllAggregations(): Promise<void> {
    console.log(`[INDEXER]  Starting full aggregation cycle...`);
    const start = Date.now();

    await Promise.allSettled([
        aggregateGlobalLeaderboard(),
        aggregateLeaderboardByChain(),
        aggregateSectorRankings(),
        aggregateTopWhaleEvents24h(),
        aggregateChainSummary(),
        aggregateZkVerifiedFeed(),
    ]);

    const elapsed = Date.now() - start;
    console.log(`[INDEXER]  Full cycle complete in ${elapsed}ms. Railway storage utilized.`);
}

// Export individual aggregators for targeted cache warming
export {
    aggregateGlobalLeaderboard,
    aggregateLeaderboardByChain,
    aggregateSectorRankings,
    aggregateTopWhaleEvents24h,
    aggregateChainSummary,
    aggregateZkVerifiedFeed,
    AGGREGATION_KEYS,
};
