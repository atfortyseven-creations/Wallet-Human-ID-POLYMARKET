import { useAccount, useBalance } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { matchNewsToMarket } from '@/utils/news-matcher';
import { Asset, NewsItem, Position, Transaction } from '@/types/wallet';
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
            enabled: !!effectiveAddress,
            refetchInterval: 10000, // Real-time balance updates
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
        refetchInterval: 15000,
    });

    // 3. Historial (History) - Enriched On-Chain History
    const { data: historyRaw, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['enriched-history', effectiveAddress],
        queryFn: async () => {
             if (!isValidAddress) return [];
             try {
                const { data } = await axios.get(`/api/wallet/history/enriched?userAddress=${effectiveAddress}`);
                return data.activities || [];
             } catch (e) {
                console.error("Enriched history fetch failed:", e);
                return [];
             }
        },
        enabled: !!isValidAddress,
        refetchInterval: 30000,
    });


    // 4. Multi-Chain Assets (New!)
    const { data: assetsData, isLoading: isAssetsLoading } = useQuery({
        queryKey: ['portfolio-assets', effectiveAddress],
        queryFn: async () => {
            if (!effectiveAddress) return null;
            const { data } = await axios.get(`/api/user/wallet?address=${effectiveAddress}`);
            return data;
        },
        enabled: !!effectiveAddress,
        refetchInterval: 10000, // Real-time multi-chain updates
    });

    // 5. Procesamiento y Enriquecimiento de Datos
    const positions: Position[] = positionsRaw?.map((pos: any) => {
        // Fix for crash reported by user: outcomePrices might be undefined
        const prices = pos.market?.outcomePrices;
        const currentPrice = prices ? parseFloat(prices[pos.outcomeIndex]) : 0;
        const avgPrice = parseFloat(pos.avgPrice) || currentPrice;
        const size = parseFloat(pos.size);

        // Cálculo PnL
        const value = size * currentPrice;
        const cost = size * avgPrice;
        const pnl = value - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

        // News Matching
        const newsContext = matchNewsToMarket(pos.market?.question || "", recentNews);

        return {
            id: pos.assetId,
            marketTitle: pos.market?.question || "Unknown Market",
            outcome: pos.outcome,
            shares: size,
            value,
            pnl,
            pnlPercent,
            newsContext // String title or undefined
        };
    }) || [];

    const transactions: Transaction[] = historyRaw?.map((tx: any) => ({
        id: tx.id || tx.hash,
        type: tx.type === 'SWAP' ? 'SWAP' : tx.type === 'BRIDGE' ? 'BRIDGE' : (tx.type === 'SEND' ? 'SELL' : tx.type === 'RECEIVE' ? 'DEPOSIT' : 'TRANSFER'),
        amount: tx.value ? tx.value.toFixed(4) : '0',
        asset: tx.asset || 'ETH',
        date: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Recently',
        status: 'COMPLETED',
        hash: tx.hash,
        chainId: tx.chainId,
        from: tx.from,
        to: tx.to,
        platform: tx.platform
    })) || [];

    // Assets processing
    const assets: Asset[] = assetsData?.assets || [];

    // Totals
    const portfolioValue = positions.reduce((acc: number, curr: any) => acc + curr.value, 0);
    const multiChainBalance = assetsData?.totalValueUSD || 0;
    const usdcBalance = parseFloat(balanceData?.formatted || '0');
    
    // For "Rainbow" feel, we show total net worth across everything
    const totalNetWorth = multiChainBalance + portfolioValue;

    return {
        address: effectiveAddress,
        isConnected,
        usdcBalance: usdcBalance.toFixed(2),
        portfolioValue: portfolioValue.toFixed(2),
        totalBalance: totalNetWorth.toFixed(2),
        positions,
        transactions,
        assets,
        perps: assetsData?.perps || [],
        predictions: assetsData?.predictions || [],
        claimables: assetsData?.claimables || [],
        isLoading: isBalanceLoading || isPositionsLoading || isHistoryLoading || isAssetsLoading,
        change24hUSD: assetsData?.change24hUSD || 0,
        change24hPercent: assetsData?.change24hPercent || 0
    };
};
