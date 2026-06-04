import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
// TODO: Replace with real contract addresses on Polygon
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const CTF_EXCHANGE = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";

export interface OrderBookItem {
    price: number;
    size: number;
    total: number;
}

export function useMarketData() {
    const { address } = useAccount();
    const [orderBook, setOrderBook] = useState<{ bids: OrderBookItem[]; asks: OrderBookItem[] }>({ bids: [], asks: [] });
    const [portfolioValue, setPortfolioValue] = useState("0.00");
    const [usdcBalance, setUsdcBalance] = useState("0.00");

    // TODO: Implement Real Contract Reads
    // const { data: balance } = useReadContract({ ... })

    useEffect(() => {
        if (!address) return;

        // Fetch real portfolio and balance data
        const fetchBalances = async () => {
            try {
                const res = await fetch(`/api/wallet/portfolio?address=${address}`);
                const data = await res.json();
                if (data.portfolio) {
                    const totalValueUSD = data.portfolio.totalValueUSD || 0;
                    setPortfolioValue(totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 }));
                    
                    // Find USDC balance across chains
                    const usdcAsset = data.portfolio.assets.find((a: any) => a.symbol === 'USDC');
                    setUsdcBalance(usdcAsset ? parseFloat(usdcAsset.balanceFormatted).toLocaleString() : "0.00");
                }
            } catch (error) {
                console.error("Error fetching market data balances:", error);
            }
        };

        fetchBalances();

        // ---------------------------------------------------------
        // Real-Time Market Feed
        // ---------------------------------------------------------
        // [PRODUCTION] Connected to real portfolio feed. 
        // Orderbook data should be fetched from a specific market CLOB API.
        
        // Initializing with empty state until a market is selected
        setOrderBook({ bids: [], asks: [] });
    }, [address]);

    return {
        orderBook,
        portfolioValue,
        usdcBalance,
        isLoading: !orderBook.bids.length,
    };
}

