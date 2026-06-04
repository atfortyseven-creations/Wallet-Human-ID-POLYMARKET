import { useState, useEffect, useCallback } from 'react';
import { getGasEstimates } from '@/lib/wallet/gas';

interface GasData {
    gasPrices: {
        eco: number;
        standard: number;
        turbo: number;
    };
    networkLoad: number; // 0-100%
    forecast: 'RISING_FAST' | 'STABLE' | 'DROPPING';
    baseFee: number;
}

export function useGasGrid() {
    const [history, setHistory] = useState<number[]>(Array(20).fill(0.01)); // Base values for history
    const [data, setData] = useState<GasData>({
        gasPrices: { eco: 0.01, standard: 0.02, turbo: 0.05 },
        networkLoad: 10,
        forecast: 'STABLE',
        baseFee: 0.02
    });

    const fetchRealGas = useCallback(async () => {
        try {
            // Using Base (8453) as the default analytics chain
            const estimates = await getGasEstimates(8453);
            
            const standardGwei = Number(estimates.normal.maxFeePerGas) / 1e9;
            const ecoGwei = Number(estimates.slow.maxFeePerGas) / 1e9;
            const turboGwei = Number(estimates.fast.maxFeePerGas) / 1e9;

            setHistory(prev => {
                const newHistory = [...prev.slice(1), standardGwei];
                
                // Analyze Trend
                const start = newHistory[0];
                const end = newHistory[newHistory.length - 1];
                const diff = end - start;

                let forecast: 'RISING_FAST' | 'STABLE' | 'DROPPING' = 'STABLE';
                if (diff > 0.1) forecast = 'RISING_FAST';
                else if (diff < -0.1) forecast = 'DROPPING';

                // Real Load Calculation (Base has target gas limit, we estimate load based on price)
                // Base gas is ultra-cheap, 0.1 Gwei is already "some load"
                const load = Math.min(99, Math.max(1), (standardGwei / 0.5) * 100); 

                setData({
                    gasPrices: {
                        eco: Math.round(ecoGwei * 1000) / 1000,
                        standard: Math.round(standardGwei * 1000) / 1000,
                        turbo: Math.round(turboGwei * 1000) / 1000
                    },
                    networkLoad: Math.round(load),
                    forecast,
                    baseFee: Math.round(standardGwei * 1000) / 1000
                });

                return newHistory;
            });
        } catch (e) {
            console.error("Failed to fetch real gas grid:", e);
        }
    }, []);

    useEffect(() => {
        fetchRealGas();
        const interval = setInterval(fetchRealGas, 10000); 
        return () => clearInterval(interval);
    }, [fetchRealGas]);

    return data;
}
