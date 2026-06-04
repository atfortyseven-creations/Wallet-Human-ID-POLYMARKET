
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Across Protocol V2 Subgraph (Mainnet)
const ACROSS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/across-protocol/across-v2';

export async function GET(request: NextRequest) {
    try {
        // Query recent massive deposits to Across Protocol to visualize cross-chain capital migration
        const query = `
        {
          deposits(first: 10, orderBy: timestamp, orderDirection: desc) {
            id
            depositor
            amount
            destinationChainId
            originChainId
            timestamp
          }
        }
        `;

        const graphRes = await fetch(ACROSS_SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!graphRes.ok) throw new Error(`Across Graph API returned ${graphRes.status}`);

        const { data } = await graphRes.json();

        if (!data || !data.deposits) {
            return NextResponse.json({ status: "empty", migrations: [] });
        }

        const chainMap: Record<number, string> = {
            1: "Ethereum",
            10: "Optimism",
            42161: "Arbitrum",
            137: "Polygon",
            8453: "Base",
            324: "zkSync",
            59144: "Linea"
        };

        const migrations = data.deposits.map((dep: any) => {
            const amountNormalized = parseFloat(dep.amount) / 1e18; // Assuming standard 18 dec ERC20 for simplicity in macro visualization
            
            return {
                id: dep.id,
                whale: dep.depositor,
                volume_eth_est: amountNormalized,
                origin: chainMap[parseInt(dep.originChainId)] || `Chain ${dep.originChainId}`,
                destination: chainMap[parseInt(dep.destinationChainId)] || `Chain ${dep.destinationChainId}`,
                timestamp: new Date(parseInt(dep.timestamp) * 1000).toISOString()
            };
        });

        // Filter out microscopic transfers to keep the "Whale" aesthetic
        const massiveMigrations = migrations.filter((m: any) => m.volume_eth_est > 0.5);

        return NextResponse.json({
            status: "success",
            source: "Across V2 Native",
            migrations: massiveMigrations.length > 0 ? massiveMigrations : migrations // Fallback to all if no whales present perfectly
        });

    } catch (error: any) {
        console.error("Capital Migration API Error:", error);
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}

