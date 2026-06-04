import { useMemo, useState, useEffect } from 'react';
import { analyticsService } from '@/lib/blockchain/AnalyticsService';

export interface YieldOpportunity {
    id: string;
    name: string;
    protocol: string;
    baseApy: number;
    tvl: number;
    risk: string;
    safetyScore: number;
    riskAdjustedApy: number;
    badge: 'SAFE' | 'DEGEN' | 'BALANCED';
}

export function useYieldHunter() {
    const [pools, setPools] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOpps = async () => {
            try {
                const liveOpps = await analyticsService.getActiveYieldOpportunities();
                setPools(liveOpps);
            } catch (e) {
                console.error('[useYieldHunter] Failed to sync with on-chain oracles');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOpps();
    }, []);

    const opportunities = useMemo(() => {
        return pools.map(pool => {
            // Calculate Safety Score (0-10) based on REAL on-chain TVL and Risk
            let score = 5;

            // TVL Factor (Real Scale)
            if (pool.tvl > 100_000_000) score += 3;
            else if (pool.tvl > 10_000_000) score += 1;
            else if (pool.tvl < 1_000_000) score -= 2;

            // Risk Penalties
            if (pool.risk === 'LOW') score += 2;
            if (pool.risk === 'HIGH') score -= 2;
            if (pool.risk === 'EXTREME') score -= 4;

            score = Math.max(0, Math.min(10, score));

            // Risk Adjusted APY
            const riskFactor = score / 10;
            const adjustedApy = pool.baseApy * riskFactor;

            let badge: 'SAFE' | 'DEGEN' | 'BALANCED' = 'BALANCED';
            if (score >= 8) badge = 'SAFE';
            if (score <= 3) badge = 'DEGEN';

            return {
                ...pool,
                safetyScore: score,
                riskAdjustedApy: parseFloat(adjustedApy.toFixed(2)),
                badge
            };
        }).sort((a, b) => b.riskAdjustedApy - a.riskAdjustedApy)
          .slice(0, 5);

    }, [pools]);

    return {
        opportunities,
        isLoading
    };
}
