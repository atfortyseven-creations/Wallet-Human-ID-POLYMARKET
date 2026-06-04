
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Uniswap V3 Mainnet Subgraph
const UNISWAP_V3_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

// USDC/ETH 0.05% Pool Address
const POOL_ADDRESS = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"; 

export async function GET(request: NextRequest) {
    try {
        // Query the most concentrated active ticks in the USDC/ETH pool
        // We use liquidityGross to identify massive walls of capital (Smart Money support/resistance)
        const query = `
        {
          pool(id: "${POOL_ADDRESS}") {
            tick
            liquidity
            totalValueLockedUSD
            ticks(first: 30, orderBy: liquidityGross, orderDirection: desc) {
              tickIdx
              liquidityGross
              liquidityNet
              price0
              price1
            }
          }
        }
        `;

        const graphRes = await fetch(UNISWAP_V3_SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!graphRes.ok) throw new Error(`Uniswap Graph API returned ${graphRes.status}`);

        const { data } = await graphRes.json();

        if (!data || !data.pool) {
            return NextResponse.json({ status: "empty", ticks: [] });
        }

        // Transform the pure blockchain data into a Heatmap visualization format
        const currentTick = parseInt(data.pool.tick);
        
        const heatmapNodes = data.pool.ticks.map((tick: any) => {
            const tickIdx = parseInt(tick.tickIdx);
            const distance = Math.abs(currentTick - tickIdx);
            
            // Normalize massive liquidity numbers for the frontend visualizer (0-100 scale)
            const rawGross = parseFloat(tick.liquidityGross);
            const normalizedIntensity = Math.min(100, (rawGross / 1e19) * 100); 

            return {
                tickIndex: tickIdx,
                priceAsset0: parseFloat(tick.price0).toFixed(2),
                priceAsset1: parseFloat(tick.price1).toFixed(6),
                concentration: normalizedIntensity,
                type: tickIdx > currentTick ? "RESISTANCE" : "SUPPORT",
                distance_from_active: distance
            };
        });

        // Sort by price so the heatmap renders sequentially from low to high
        heatmapNodes.sort((a, b) => parseFloat(a.priceAsset0) - parseFloat(b.priceAsset0));

        return NextResponse.json({
            status: "success",
            source: "Uniswap V3 On-Chain",
            pool: "USDC/ETH (0.05%)",
            tvl_usd: parseFloat(data.pool.totalValueLockedUSD),
            concentrations: heatmapNodes
        });

    } catch (error: any) {
        console.error("Deep Liquidity API Error:", error);
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}

