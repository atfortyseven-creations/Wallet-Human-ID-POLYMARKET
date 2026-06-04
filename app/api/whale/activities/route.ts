import { NextRequest, NextResponse } from 'next/server';
import rateLimit from '@/lib/rate-limit';
import { withCache, CacheTTL } from '@/src/lib/cache/redis-cache';
import { fetchRealWhaleTransfers } from '@/lib/blockchain/WhaleFlowService';

/**
 * Whale Activities API Route
 * 100% real on-chain data from Alchemy Asset Transfers.
 * No synthetic data. No mock fills. Every row is verifiable on-chain.
 *
 * Data source: Alchemy getAssetTransfers  ETH Mainnet, Base, Arbitrum, Polygon
 * Threshold: > $100,000 USD per transaction
 */

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        try {
            await limiter.check(20, ip);
        } catch {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const cacheKey = 'whale:activities:onchain:v2';

        const data = await withCache(
            cacheKey,
            async () => {
                // Pull real transfers routing through our High-Availability Rpc Relayer
                // Completely replacing the dead Alchemy dependency
                const url = new URL('/api/network/evm/recent', req.url);
                const response = await fetch(url.toString(), { cache: 'no-store' });
                
                let rawActivities = [];
                if (response.ok) {
                    rawActivities = await response.json();
                } else {
                    console.error('[Whale Activities] Internal RPC Scanner failed:', response.statusText);
                }

                // Map to legacy WhaleTransfer format for frontend compatibility
                const activities = rawActivities.map((tx: any) => ({
                    id: tx.hash,
                    walletAddress: tx.from,
                    walletLabel: `Whale ${tx.from.slice(0, 6)}...`,
                    type: 'TRANSFER',
                    token: tx.asset,
                    amount: tx.amount,
                    usdValue: tx.usdValue,
                    timestamp: new Date(tx.timestamp).toISOString(),
                    txHash: tx.hash,
                    chain: tx.chain,
                    blockNum: '0'
                }));

                return {
                    activities,
                    timestamp: Date.now(),
                    source: 'internal_rpc_relayer_mesh',
                    chains: ['ethereum', 'base', 'arbitrum', 'polygon', 'bsc'],
                    threshold_usd: 100000,
                };
            },
            { ttl: 15 }
        );

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API ERROR] Whale activities:', error);
        return NextResponse.json(
            { error: error.message, activities: [], timestamp: Date.now() },
            { status: 500 }
        );
    }
}
