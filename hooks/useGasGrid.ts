import { useState, useEffect } from 'react';
import { getGasEstimates } from '@/lib/wallet/gas';
import { useChainId } from 'wagmi';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
/**
 * useGasGrid Hook
 * Fetches real EIP-1559 gas data from the network.
 * Predicts network congestion based on on-chain base fees.
 */
export const useGasGrid = () => {
    const chainId = useChainId();
    const [gasData, setGasData] = useState({
        eco: 0,
        std: 0,
        turbo: 0,
        congestion: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CLOGGED',
        baseFee: 0
    });

    useEffect(() => {
        const fetchGas = async () => {
            try {
                const estimates = await getGasEstimates(chainId);
                const baseFeeGwei = Number(estimates.normal.maxFeePerGas) / 1e9;
                
                let congestion: 'LOW' | 'MEDIUM' | 'HIGH' | 'CLOGGED' = 'LOW';
                if (baseFeeGwei > 100) congestion = 'CLOGGED';
                else if (baseFeeGwei > 50) congestion = 'HIGH';
                else if (baseFeeGwei > 25) congestion = 'MEDIUM';

                setGasData({
                    eco: Number((Number(estimates.slow.maxFeePerGas) / 1e9).toFixed(1)),
                    std: Number(safeToFixed(baseFeeGwei, 1)),
                    turbo: Number((Number(estimates.fast.maxFeePerGas) / 1e9).toFixed(1)),
                    congestion,
                    baseFee: Number(safeToFixed(baseFeeGwei, 1))
                });
            } catch (error) {
                console.error("Error fetching real gas data:", error);
            }
        };

        fetchGas();
        const interval = setInterval(fetchGas, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [chainId]);

    return gasData;
};

