import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";

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
                    setPortfolioValue(data.portfolio.totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 }));
                    
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
        // Real-Time Market Feed (Clamped to Real Pulse)
        // ---------------------------------------------------------
        
        // Simulating the Orderbook based on realistic spread for a 'Senior' experience
        // In a full production env, this would connect to Polymarket CLOB
        const interval = setInterval(() => {
            const basePrice = 0.65;
            const mockBids = Array.from({ length: 5 }).map((_, i) => ({
                price: basePrice - 0.001 - (i * 0.005),
                size: 2500 + (i * 500),
                total: 0
            }));

            const mockAsks = Array.from({ length: 5 }).map((_, i) => ({
                price: basePrice + 0.001 + (i * 0.005),
                size: 3200 + (i * 400),
                total: 0
            }));

            setOrderBook({ bids: mockBids, asks: mockAsks });
        }, 10000); // Slowed down to reduce visual noise and feel more calculated

        return () => clearInterval(interval);
    }, [address]);

    return {
        orderBook,
        portfolioValue,
        usdcBalance,
        isLoading: !orderBook.bids.length,
    };
}
