import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

export function useBinanceWebSocket(symbol: string = 'btcusdt') {
  const wsRef = useRef<WebSocket | null>(null);
  const depthWsRef = useRef<WebSocket | null>(null);
  const { setMarketPrice, setOrderBook } = useMarketStore();

  useEffect(() => {
    // 1. Ticker stream for live price updates (1s intervals)
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
    
    // 2. Depth stream for orderbook (liquidation heatmap base, 100ms superfast updates)
    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth20@100ms`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.c) {
          setMarketPrice(parseFloat(data.c));
        }
      } catch (err) {
        console.error('Binance WS Ticker Error:', err);
      }
    };

    depthWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.b && data.a) {
          setOrderBook(data.b, data.a); // Update the store with top bids and asks
        }
      } catch (err) {
        console.error('Binance Depth WS Error:', err);
      }
    };

    ws.onerror = (error) => console.error("Binance WS failed:", error);
    depthWs.onerror = (error) => console.error("Binance Depth WS failed:", error);

    wsRef.current = ws;
    depthWsRef.current = depthWs;

    return () => {
      // Cleanup connections when component unmounts
      if (ws.readyState === WebSocket.OPEN) ws.close();
      if (depthWs.readyState === WebSocket.OPEN) depthWs.close();
    };
  }, [symbol, setMarketPrice, setOrderBook]);
}
