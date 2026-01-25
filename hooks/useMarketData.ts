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
        // ---------------------------------------------------------
        // MOCK DATA SIMULATION (Replace with API/Contract Calls)
        // ---------------------------------------------------------

        // Simulate Orderbook Data Stream
        const interval = setInterval(() => {
            const mockBids = Array.from({ length: 5 }).map((_, i) => ({
                price: 0.65 - (i * 0.01),
                size: Math.floor(Math.random() * 5000) + 1000,
                total: 0
            }));

            const mockAsks = Array.from({ length: 5 }).map((_, i) => ({
                price: 0.66 + (i * 0.01),
                size: Math.floor(Math.random() * 5000) + 1000,
                total: 0
            }));

            setOrderBook({ bids: mockBids, asks: mockAsks });
        }, 3000);

        // Simulate Balances if connected
        if (address) {
            setPortfolioValue("12,450.00"); // Mock Portfolio
            setUsdcBalance("4,230.50"); // Mock USDC
        }

        return () => clearInterval(interval);
    }, [address]);

    return {
        orderBook,
        portfolioValue,
        usdcBalance,
        isLoading: !orderBook.bids.length,
    };
}
