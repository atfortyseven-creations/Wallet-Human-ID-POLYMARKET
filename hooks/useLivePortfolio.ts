"use client";

import { useRealWalletData } from './useRealWalletData';

/**
 * useActivePortfolio
 * 
 * Strict live connection wrapper for on-chain portfolio execution.
 * Data refresh intervals are managed by TanStack Query inside useRealWalletData
 * (10s for balance, 15s for positions, 30s for assets/history).
 */
export function useActivePortfolio() {
    const { 
        address,
        isConnected,
        usdcBalance,
        portfolioValue,
        totalBalance,
        positions,
        transactions,
        assets,
        isLoading,
        change24hUSD,
        change24hPercent 
    } = useRealWalletData();

    const polymarketPositions = positions || [];

    return {
        address,
        isConnected,
        usdcBalance,
        totalPnl: totalBalance,
        change24hUSD,
        change24hPercent,
        portfolioValue,
        assets,
        polymarketPositions,
        isLoading,
    };
}
