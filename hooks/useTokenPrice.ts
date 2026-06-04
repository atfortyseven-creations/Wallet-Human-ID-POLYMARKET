import { useMarketWebsocket } from '@/src/context/MarketWebsocketProvider';

export function useTokenPrice() {
    const { marketData, isConnected } = useMarketWebsocket();

    const prices: Record<string, number> = {};
    const changes: Record<string, number> = {};

    // Map WebSocket stream data directly into the shape expected by the UI
    Object.entries(marketData).forEach(([symbol, data]) => {
        prices[symbol] = data.price;
        changes[symbol] = data.change24h;
    });

    return {
        prices,
        changes,
        // If we have some prices loaded, consider it not loading even if websocket drops
        isLoading: !isConnected && Object.keys(prices).length === 0,
        error: null,
    };
}

