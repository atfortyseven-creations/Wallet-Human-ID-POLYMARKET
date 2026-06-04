/**
 * useAUTHBalance Hook
 * 
 * Detects AUTH balance on Optimism and calculates "risk capital" available
 * Implements the "House Money Effect" psychology
 */

import { useAccount, useBalance, useReadContract } from 'wagmi';
import { optimism } from 'wagmi/chains';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

// AUTH Token on Optimism
const AUTH_TOKEN_ADDRESS = '0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1' as const;

// AUTH Token ABI (minimal for balance check)
const AUTH_ABI = [
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

interface AUTHBalanceData {
    balance: bigint;
    balanceFormatted: string;
    balanceUSD: number;
    hasRiskCapital: boolean;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Fetch AUTH price from CoinGecko
 */
async function fetchAUTHPrice(): Promise<number> {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=identity-wld&vs_currencies=usd'
        );
        const data = await response.json();
        return data['identity-wld']?.usd || 2.5; // Fallback to $2.50
    } catch (error) {
        console.error('Error fetching AUTH price:', error);
        return 2.5; // Fallback price
    }
}

/**
 * Hook to get AUTH balance and calculate risk capital
 * 
 * @param minThreshold - Minimum USD value to show "risk capital" banner (default: $10)
 * @returns AUTH balance data and risk capital status
 */
export function useAUTHBalance(minThreshold: number = 10): AUTHBalanceData {
    const { address, isConnected } = useAccount();

    // Get AUTH balance
    const { data: balance, isLoading: isBalanceLoading, error: balanceError } = useReadContract({
        address: AUTH_TOKEN_ADDRESS,
        abi: AUTH_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        chainId: optimism.id,
        query: {
            enabled: !!address && isConnected,
            refetchInterval: 30000, // Refresh every 30 seconds
        },
    });

    // Get AUTH price in USD
    const { data: wldPrice, isLoading: isPriceLoading } = useQuery({
        queryKey: ['wld-price'],
        queryFn: fetchAUTHPrice,
        staleTime: 60000, // Cache for 1 minute
        refetchInterval: 60000, // Refresh every minute
    });

    // Calculate values
    const balanceFormatted = balance ? formatUnits(balance, 18) : '0';
    const balanceUSD = balance && wldPrice
        ? parseFloat(formatUnits(balance, 18)) * wldPrice
        : 0;
    const hasRiskCapital = balanceUSD >= minThreshold;

    return {
        balance: balance || 0n,
        balanceFormatted,
        balanceUSD,
        hasRiskCapital,
        isLoading: isBalanceLoading || isPriceLoading,
        error: balanceError as Error | null,
    };
}

/**
 * Hook to check if user has received AUTH grants recently
 * This helps identify "house money" vs earned income
 */
export function useAUTHGrantStatus() {
    const { address } = useAccount();

    return useQuery({
        queryKey: ['wld-grants', address],
        queryFn: async () => {
            if (!address) return null;
            try {
                const res = await fetch('/api/rewards/history');
                const data = await res.json();
                
                if (!data.success || !data.grants.length) {
                     return {
                        hasReceivedGrants: false,
                        lastGrantDate: null,
                        totalGrantsReceived: 0,
                        isRecentGrant: false
                     };
                }

                const lastGrant = new Date(data.grants[0].date);
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                return {
                    hasReceivedGrants: true,
                    lastGrantDate: lastGrant,
                    totalGrantsReceived: data.grants.length,
                    isRecentGrant: lastGrant > thirtyDaysAgo,
                };
            } catch (e) {
                console.error("Failed to fetch grants", e);
                return null;
            }
        },
        enabled: !!address,
        staleTime: 300000, // Cache for 5 minutes
    });
}

/**
 * Hook to estimate zap output
 * Shows user how many shares they can get with their AUTH
 */
export function useZapEstimate(wldAmount: bigint, marketId?: string) {
    const { data: wldPrice } = useQuery({
        queryKey: ['wld-price'],
        queryFn: fetchAUTHPrice,
        staleTime: 60000,
    });

    return useQuery({
        queryKey: ['zap-estimate', wldAmount.toString(), marketId],
        queryFn: async () => {
            if (!wldPrice || wldAmount === 0n) {
                return {
                    estimatedUSDC: 0,
                    estimatedShares: 0,
                    estimatedSlippage: 0,
                    protocolFee: 0,
                };
            }

            const wldAmountFloat = parseFloat(formatUnits(wldAmount, 18));
            const estimatedUSDC = wldAmountFloat * wldPrice;

            // Estimate slippage (1% for typical swap)
            const slippage = 0.01;
            const usdcAfterSlippage = estimatedUSDC * (1 - slippage);

            // Protocol fee (0.5%)
            const protocolFee = usdcAfterSlippage * 0.005;
            const usdcForBet = usdcAfterSlippage - protocolFee;

            // Simplified: 1 USDC  1 share (actual depends on market odds)
            // In production, query Polymarket API for actual odds
            const estimatedShares = usdcForBet;

            return {
                estimatedUSDC: usdcAfterSlippage,
                estimatedShares,
                estimatedSlippage: slippage * 100, // Convert to percentage
                protocolFee,
            };
        },
        enabled: wldAmount > 0n,
        staleTime: 30000,
    });
}

