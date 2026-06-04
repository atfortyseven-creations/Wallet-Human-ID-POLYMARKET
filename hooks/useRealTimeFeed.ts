/**
 * FASE 6  WEBSOCKET REAL DE ALTA FRECUENCIA
 * Hook que conecta a Binance WSS para precios en tiempo real (sin polling).
 * Inyecta BTC, ETH, SOL, BNB, MATIC a 100ms de latencia real.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export interface ActiveTicker {
    symbol: string;
    price: number;
    change24h: number;
    changePct24h: number;
    high24h: number;
    low24h: number;
    volume24h: number; // in USDT
    lastUpdate: number;
}

// Binance Mini-Ticker streams (no API key needed, 100% public)
const STREAMS = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'maticusdt', 'arbusdt'];
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${STREAMS.map(s => `${s}@miniTicker`).join('/')}`;

const SYMBOL_MAP: Record<string, string> = {
    BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL',
    BNBUSDT: 'BNB', MATICUSDT: 'MATIC', ARBUSDT: 'ARB',
};

export function useRealTimeFeed() {
    const [tickers, setTickers] = useState<Record<string, ActiveTicker>>({});
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);

    const connect = useCallback(() => {
        if (!mountedRef.current) return;
        if (typeof window === 'undefined') return;

        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!mountedRef.current) return;
                setConnected(true);
                setError('');
            };

            ws.onmessage = (event) => {
                if (!mountedRef.current) return;
                try {
                    const raw = JSON.parse(event.data);
                    const data = raw.data || raw;
                    const symbol = SYMBOL_MAP[data.s];
                    if (!symbol) return;

                    const price   = parseFloat(data.c);
                    const open    = parseFloat(data.o);
                    const change  = price - open;
                    const changePct = open > 0 ? (change / open) * 100 : 0;

                    setTickers(prev => ({
                        ...prev,
                        [symbol]: {
                            symbol,
                            price,
                            change24h:    change,
                            changePct24h: changePct,
                            high24h:      parseFloat(data.h),
                            low24h:       parseFloat(data.l),
                            volume24h:    parseFloat(data.q), // quote volume in USDT
                            lastUpdate:   Date.now(),
                        }
                    }));
                } catch (_) { /* silently ignore malformed frames */ }
            };

            ws.onerror = () => {
                if (!mountedRef.current) return;
                setError('WebSocket connection error');
                setConnected(false);
            };

            ws.onclose = () => {
                if (!mountedRef.current) return;
                setConnected(false);
                // Auto-reconnect after 3 seconds
                reconnectTimer.current = setTimeout(() => {
                    if (mountedRef.current) connect();
                }, 3000);
            };

        } catch (e: any) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        connect();
        return () => {
            mountedRef.current = false;
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (wsRef.current) {
                wsRef.current.onclose = null; // prevent reconnect on intentional close
                wsRef.current.close();
            }
        };
    }, [connect]);

    const tickerList = Object.values(tickers).sort((a, b) => {
        const order = ['BTC', 'ETH', 'SOL', 'BNB', 'ARB', 'MATIC'];
        return order.indexOf(a.symbol) - order.indexOf(b.symbol);
    });

    return { tickers, tickerList, connected, error };
}
