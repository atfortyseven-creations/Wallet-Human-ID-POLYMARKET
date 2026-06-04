import { NextResponse } from 'next/server';

/**
 * GET /api/staking/providers
 * Returns a list of liquid staking providers and their current status.
 */
export async function GET() {
    try {
        // [PRODUCTION] In a full implementation, these would be fetched from 
        // LlamaRPC, protocol subgraphs, or a specialized DeFi adapter.
        // Fetch real-time yields from DefiLlama
        const yieldsRes = await fetch('https://yields.llama.fi/pools', { cache: 'no-store' });
        if (!yieldsRes.ok) throw new Error('Failed to fetch DefiLlama yields');
        
        const { data } = await yieldsRes.json();
        
        // Target protocols and symbols
        const targetPools = [
            { project: 'lido', symbol: 'STETH' },
            { project: 'rocket-pool', symbol: 'RETH' },
            { project: 'frax-ether', symbol: 'SFRXETH' },
            { project: 'ether.fi', symbol: 'EETH' }
        ];

        const providers = targetPools.map(target => {
            const pool = data.find((p: any) => 
                p.project.toLowerCase() === target.project.toLowerCase() && 
                p.symbol.toUpperCase() === target.symbol.toUpperCase() &&
                p.chain === 'Ethereum'
            );

            if (!pool) return null;

            return {
                id: pool.project,
                name: pool.project === 'frax-ether' ? 'Frax Ether' : pool.project.charAt(0).toUpperCase() + pool.project.slice(1),
                apy: parseFloat(pool.apy.toFixed(2)),
                tvl: pool.tvlUsd >= 1e9 ? `$${(pool.tvlUsd / 1e9).toFixed(1)}B` : `$${(pool.tvlUsd / 1e6).toFixed(1)}M`,
                min: '0.01 ETH',
                token: pool.symbol,
                status: 'ACTIVE'
            };
        }).filter(Boolean);

        return NextResponse.json({ 
            providers,
            updatedAt: new Date().toISOString()
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });

    } catch (error) {
        console.error('[API-STAKING-ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch staking providers' }, { status: 500 });
    }
}

