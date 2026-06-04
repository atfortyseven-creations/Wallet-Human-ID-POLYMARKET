/**
 * GET /api/market/prices
 * Powers market price cards via GetBlock EP4 (JSON-RPC)
 * Real on-chain slot0() prices from UniswapV3 top pools.
 */

import { NextResponse } from 'next/server';
import { getPoolPrices } from '@/lib/blockchain/getblock-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const pools = await getPoolPrices();

        // Derive canonical prices from the on-chain pool data
        const prices: Record<string, number> = {};
        for (const p of pools) {
            if (p.price <= 0) continue;
            if (p.symbol === 'ETH/USDC') prices['ETH'] = 1 / p.price;
            if (p.symbol === 'WBTC/ETH') prices['WBTC'] = p.price * (prices['ETH'] || 2200);
        }

        return NextResponse.json({
            pools,
            prices,
            source: 'getblock_ep4_onchain',
            fetchedAt: new Date().toISOString(),
        });

    } catch (err: any) {
        console.error('[Market Prices EP4]', err?.message);
        return NextResponse.json({ pools: [], prices: {}, source: 'error' }, { status: 200 });
    }
}
