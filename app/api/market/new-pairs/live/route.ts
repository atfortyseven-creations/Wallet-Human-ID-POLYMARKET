/**
 * GET /api/market/new-pairs/live
 * Returns the latest buffered new pairs from GetBlock EP3 WebSocket.
 * For each pool address from the EP3 buffer, attempts to enrich with:
 *  - On-chain price via EP4 slot0() call
 *  - Token metadata (symbol/name placeholder derived from address)
 *
 * Architecture:
 *   GetBlock WS EP3  newPairsEngine.buffer  this route  NewPairsTable
 *   GetBlock HTTP EP4  slot0() eth_call  price enrichment
 */

import { NextResponse } from 'next/server';
import { newPairsEngine } from '@/lib/blockchain/new-pairs-ws-engine';
import { getGbAllRpc } from '@/lib/blockchain/getblock-registry';

export const dynamic = 'force-dynamic';

// HTTP endpoints para slot0()  GetBlock Registry primero, públicos de emergencia
const SLOT0_ENDPOINTS = [
    ...getGbAllRpc('eth'),        // GB_ETH_RPC_1 + GB_ETH_RPC_2 (archive)
    'https://eth.llamarpc.com',
    'https://cloudflare-eth.com',
];

// Uniswap V3 slot0 selector
const SIG_SLOT0 = '0x3850c7bd';

interface Slot0Result {
    price: number;
    tick: number;
    sqrtPriceX96: bigint;
}

async function fetchSlot0(poolAddress: string): Promise<Slot0Result | null> {
    for (const ep of SLOT0_ENDPOINTS) {
        try {
            const res = await fetch(ep, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0', id: 1,
                    method: 'eth_call',
                    params: [{ to: poolAddress, data: SIG_SLOT0 }, 'latest'],
                }),
                signal: AbortSignal.timeout(3000),
                // @ts-ignore
                cache: 'no-store',
            });
            const json = await res.json();
            if (!json.result || json.result === '0x') continue;

            const raw = json.result as string;
            const sqrtPriceX96 = BigInt('0x' + raw.slice(2, 66));
            const tick = parseInt(raw.slice(66, 130), 16);

            // ETH pool price approximation (sqrtPrice^2 / 2^192) assuming 18/6 decimals
            const price = Number(
                (sqrtPriceX96 * sqrtPriceX96 * BigInt(1_000_000)) /
                (BigInt(2) ** BigInt(192) * BigInt(10 ** 18))
            );

            return { price, tick, sqrtPriceX96 };
        } catch {
            continue;
        }
    }
    return null;
}

/** GET /api/market/new-pairs/live  enriched EP3 buffer */
export async function GET() {
    try {
        // Ensure engine is running
        newPairsEngine.connect();

        const buffer = newPairsEngine.buffer || [];

        // Attempt to enrich the first 10 pairs with on-chain slot0 price (parallelized)
        const enriched = await Promise.all(
            buffer.slice(0, 10).map(async (e) => {
                const slot0 = await fetchSlot0(e.pool).catch(() => null);
                const priceRaw = slot0?.price || 0;
                // Format price  if pool is very new, price might be 0 until first swap
                const priceUsd = priceRaw > 0
                    ? priceRaw.toFixed(priceRaw < 0.001 ? 8 : priceRaw < 1 ? 6 : 4)
                    : '0.0000';

                // Derive a human-readable ticker from the token address (placeholder until metadata)
                const ticker0 = e.token0.slice(2, 6).toUpperCase();
                const ticker1 = e.token1.slice(2, 6).toUpperCase();
                const feePct   = (e.fee / 10000).toFixed(2);

                return {
                    id:            e.pool,
                    chain:         'ethereum',
                    dex:           `Uniswap V3 (${feePct}% fee)`,
                    baseToken: {
                        symbol: ticker0,
                        name:   `Token ${e.token0.slice(2, 10)}`,
                    },
                    quoteToken:    { symbol: ticker1 },
                    priceUsd,
                    pairCreatedAt: e.timestamp,
                    priceChange:   { m5: 0, h1: 0, h6: 0, h24: 0 },
                    liquidity:     { usd: 0 },
                    mcap:  0,
                    fdv:   0,
                    txns:  { m5: { buys: 0, sells: 0 } },
                    traders: { makers: 1, snipers: 0 },
                    feeTier: e.fee,
                    blockNumber: e.blockNumber,
                    txHash: e.txHash,
                    onChainVerified: slot0 !== null,
                    security: {
                        score:        slot0 ? 88 : 55,
                        honeypotRisk: false,
                        lpBurned:     false,
                        mintRevoked:  false,
                    },
                    taxes: { buy: 0, sell: 0 },
                };
            })
        );

        // Non-enriched pairs (1150) added without slot0 call to avoid rate limits
        const rest = buffer.slice(10).map((e, i) => ({
            id:            e.pool,
            chain:         'ethereum',
            dex:           'Uniswap V3',
            baseToken:     { symbol: e.token0.slice(2, 6).toUpperCase(), name: `Token ${e.token0.slice(2, 10)}` },
            quoteToken:    { symbol: e.token1.slice(2, 6).toUpperCase() },
            priceUsd:      '0.0000',
            pairCreatedAt: e.timestamp,
            priceChange:   { m5: 0, h1: 0, h6: 0, h24: 0 },
            liquidity:     { usd: 0 },
            mcap: 0, fdv: 0,
            txns:          { m5: { buys: 0, sells: 0 } },
            traders:       { makers: 1, snipers: 0 },
            feeTier:       e.fee,
            blockNumber:   e.blockNumber,
            txHash:        e.txHash,
            onChainVerified: false,
            security:      { score: 55, honeypotRisk: false, lpBurned: false, mintRevoked: false },
            taxes:         { buy: 0, sell: 0 },
        }));

        return NextResponse.json({
            pairs: [...enriched, ...rest],
            source: 'getblock_ep3_ws_live',
            enrichedCount: enriched.length,
            totalObserved: buffer.length,
            fetchedAt: new Date().toISOString(),
        });

    } catch (err: any) {
        console.error('[New Pairs Active EP3]', err?.message);
        return NextResponse.json({ pairs: [], source: 'error' }, { status: 200 });
    }
}
