import { useAccount, useBalance } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { matchNewsToMarket } from '@/utils/news-matcher';
import { NewsItem, Position, Transaction } from '@/types/wallet';
import { useAuth } from '@/hooks/useAuth';

// Dirección de Bridged USDC en Polygon
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

export const useRealWalletData = (recentNews: NewsItem[] = [], overrideAddress?: string) => {
    const { address: web3Address, isConnected: isWeb3Connected } = useAccount();
    const { isAuthenticated } = useAuth();
    
    // Unified connection state
    const isConnected = isWeb3Connected || isAuthenticated;
    
    // Fetch managed wallet if not connected via Web3
    const { data: managedWallet } = useQuery({
        queryKey: ['managed-wallet'],
        queryFn: async () => {
            if (!isAuthenticated || isWeb3Connected) return null;
            try {
                const { data } = await axios.get('/api/user/wallet');
                return data;
            } catch (error) {
                console.error('Error fetching managed wallet:', error);
                return null;
            }
        },
        enabled: isAuthenticated && !isWeb3Connected
    });

    // Priority: 1. Manual override (Account Switcher), 2. Web3 Connected, 3. Managed/Auth
    const effectiveAddress = overrideAddress || web3Address || managedWallet?.address;

    // 1. On-Chain Balance (Wagmi ya maneja su propio caché/reactividad)
    const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
        address: effectiveAddress,
        token: USDC_ADDRESS,
        chainId: 137, // Polygon
        query: {
            enabled: !!effectiveAddress, // Solo ejecutar si hay address
        }
    });

    // 2. Posiciones Off-Chain (Vía nuestro Proxy)
    const isValidAddress = effectiveAddress && effectiveAddress.startsWith('0x') && effectiveAddress.length === 42 && !effectiveAddress.includes('Virtual');
    
    const { data: positionsRaw, isLoading: isPositionsLoading } = useQuery({
        queryKey: ['positions', effectiveAddress],
        queryFn: async () => {
             // Si llegamos aquí sin check de 'enabled', evitamos la llamada igual
            if (!isValidAddress) return []; 
            const { data } = await axios.get(`/api/wallet/positions?userAddress=${effectiveAddress}`);
            return data;
        },
        enabled: !!isValidAddress,
    });

    // 3. Historial (History) - Off-Chain
    const { data: historyRaw, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['history', effectiveAddress],
        queryFn: async () => {
             if (!isValidAddress) return [];
            const { data } = await axios.get(`/api/wallet/history?userAddress=${effectiveAddress}`);
            return data;
        },
        enabled: !!isValidAddress,
    });


    // 4. Procesamiento y Enriquecimiento de Datos
    const positions: Position[] = positionsRaw?.map((pos: any) => {
        const currentPrice = parseFloat(pos.market.outcomePrices[pos.outcomeIndex]);
        const avgPrice = parseFloat(pos.avgPrice) || currentPrice;
        const size = parseFloat(pos.size);

        // Cálculo PnL
        const value = size * currentPrice;
        const cost = size * avgPrice;
        const pnl = value - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

        // News Matching
        const newsContext = matchNewsToMarket(pos.market.question, recentNews);

        return {
            id: pos.assetId,
            marketTitle: pos.market.question,
            outcome: pos.outcome,
            shares: size,
            value,
            pnl,
            pnlPercent,
            newsContext // String title or undefined
        };
    }) || [];

    const transactions: Transaction[] = historyRaw?.map((trade: any) => ({
        id: trade.id,
        type: trade.side === 'BUY' ? 'BUY' : 'SELL',
        amount: (trade.size * trade.price).toFixed(2),
        asset: 'USDC',
        date: 'Recently', // Simplificación, podrías usar date-fns aquí si quieres fecha exacta
        status: 'COMPLETED',
    })) || [];


    // Totales
    const portfolioValue = positions.reduce((acc: number, curr: any) => acc + curr.value, 0);
    const usdcBalance = parseFloat(balanceData?.formatted || '0');
    const totalNetWorth = usdcBalance + portfolioValue;

    return {
        address: effectiveAddress,
        isConnected,
        usdcBalance: usdcBalance.toFixed(2),
        portfolioValue: portfolioValue.toFixed(2),
        totalBalance: totalNetWorth.toFixed(2),
        positions,
        transactions,
        isLoading: isBalanceLoading || isPositionsLoading || isHistoryLoading,
    };
};
