"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type MarketData = {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
    source?: string;
    [key: string]: any;
};

interface MarketStreamContextType {
    markets: Map<string, MarketData>;
    isConnected: boolean;
    lastUpdate: Date;
    latency: number;
    mode: 'live' | 'synthetic' | 'fallback';
}

const MarketStreamContext = createContext<MarketStreamContextType>({
    markets: buildSyntheticMap(),
    isConnected: false,
    lastUpdate: new Date(),
    latency: 0,
    mode: 'live',
});

export const useMarketStream = () => useContext(MarketStreamContext);

//  Client-side synthetic bootstrap so the UI is never empty on first paint 
function buildSyntheticMap(): Map<string, MarketData> {
    return new Map<string, MarketData>();
}

export const MarketStreamProvider = ({ children }: { children: ReactNode }) => {
    // Pre-seed with synthetic data so the UI is never empty on first render
    const [markets, setMarkets] = useState<Map<string, MarketData>>(buildSyntheticMap);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [latency, setLatency] = useState(0);
    const [mode, setMode] = useState<'live' | 'synthetic' | 'fallback'>('live');

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchStream = async () => {
            const start = performance.now();
            try {
                const res = await fetch('/api/markets/stream');
                const end = performance.now();
                if (!res.ok) throw new Error("Stream fetch failed");
                const parsed = await res.json();

                if (parsed && parsed.success && Array.isArray(parsed.data)) {
                    if (isMounted) {
                        if (parsed.data.length > 0) {
                            const newMap = new Map<string, MarketData>();
                            parsed.data.forEach((d: MarketData) => {
                                if (d?.symbol) newMap.set(d.symbol, d);
                            });
                            setMarkets(newMap);
                            setLastUpdate(new Date(parsed.timestamp || Date.now()));
                            setIsConnected(true);
                            setLatency(Math.round(end - start));
                            setMode('live');
                        } else {
                            // Empty response  keep existing data, remain live
                            setIsConnected(false);
                            setLatency(0);
                        }
                    }
                }
            } catch {
                // Network error  keep existing data, protocol stays live
                if (isMounted) {
                    setIsConnected(false);
                    setLatency(0);
                }
            } finally {
                if (isMounted) {
                    // Fixed 3s interval  deterministic, no synthetic fluctuation
                    timeoutId = setTimeout(fetchStream, 3000);
                }
            }
        };

        fetchStream();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <MarketStreamContext.Provider value={{ markets, isConnected, lastUpdate, latency, mode }}>
            {children}
        </MarketStreamContext.Provider>
    );
};
