"use client";
// ================================================================
// VIPDataProvider.tsx
// A single React component that lives in the VIP layout.
// It boots ONE polling engine that feeds the global Zustand store.
// Every VIP sub-page reads from the store  ZERO individual fetches.
// No SSE. No manual refresh. Auto-updates every N seconds.
// ================================================================
import { useEffect, useRef } from 'react';
import { useVIPStore, parseAlphaEvents, FundingRate } from '@/lib/vip-store';

const SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
    'ADAUSDT', 'DOGEUSDT', 'SHIBUSDT', 'DOTUSDT', 'LINKUSDT', 
    'MATICUSDT', 'AVAXUSDT', 'TRXUSDT', 'UNIUSDT', 'PEPEUSDT', 
    'FETUSDT', 'DAIUSDT', 'APEUSDT', 'LDOUSDT', 'ARBUSDT', 
    'OPUSDT', 'STRKUSDT', 'AUTHUSDT', 'NEARUSDT'
];

// Staggered intervals  we avoid thundering-herd API abuse
const INTERVALS = {
    whaleEvents:  8_000,   // 8s   Etherscan
    mempool:      10_000,  // 10s  mempool.space
    funding:      6_000,   // 6s   Binance+Bybit
    liquidations: 5_000,   // 5s   Binance Futures
    liveNetwork:  8_000,   // 8s   Network Oracle (ETH Block, Gas, Chainlink)
    topWhales:    60_000,  // 60s  blockchain.info (heavy)
    satoshi:      120_000, // 120s  Batch mode
    volume:       20_000,  // 20s  Inflow/Outflow
    activities:   12_000,  // 12s  Telegram Bot Feed
    leaderboard:  60_000,  // 60s  500 Whale Leaderboard
};

export function VIPDataProvider({ children }: { children: React.ReactNode }) {
    const store = useVIPStore();
    const timers = useRef<ReturnType<typeof setInterval>[]>([]);

    //  1. WHALE EVENTS (Etherscan/Alpha) 
    const pollWhaleEvents = async () => {
        try {
            const res = await fetch('/api/network/whale/alpha-events');
            const data = await res.json();
            console.log(`[VIPData] Whale events fetched for symbols:`, data.events?.length);
            if (data.events?.length > 0) {
                store.mergeWhaleEvents(parseAlphaEvents(data.events));
            }
        } catch (err) {
            console.error('[VIPData] Whale events poll failed:', err);
        }
    };

    //  2. WHALE ACTIVITIES (Telegram Bot Feed) 
    const pollWhaleActivities = async () => {
        try {
            const res = await fetch('/api/whale/activities');
            const data = await res.json();
            if (data.activities?.length > 0) {
                store.setWhaleActivities(data.activities);
            }
        } catch {}
    };

    //  3. MEMPOOL (mempool.space via proxy) 
    const pollMempool = async () => {
        try {
            const res = await fetch('/api/network/mempool');
            if (res.ok) {
                const data = await res.json();
                store.setMempool(data);
            }
        } catch (e) {
            console.warn('[VIPData] Mempool fetch failed', e);
        }
    };

    //  4. FUNDING RATES (Binance + Bybit) 
    const pollFunding = async () => {
        try {
            const [binRes, bybRes] = await Promise.all([
                fetch('https://fapi.binance.com/fapi/v1/premiumIndex').catch(() => null),
                fetch('https://api.bybit.com/v5/market/tickers?category=linear').catch(() => null),
            ]);
            const binData = binRes?.ok ? await binRes.json() : [];
            const bybData = bybRes?.ok ? await bybRes.json() : null;
            const bybMap: Record<string, number> = {};
            for (const item of bybData?.result?.list || []) {
                bybMap[item.symbol] = parseFloat(item.fundingRate || '0');
            }
            const rates: FundingRate[] = SYMBOLS.map(symbol => {
                const bin = (binData as any[]).find((x: any) => x.symbol === symbol);
                const b = parseFloat(bin?.lastFundingRate || '0');
                const y = bybMap[symbol] || 0;
                const spread = Math.abs(b - y);
                return {
                    symbol,
                    binance: b,
                    bybit: y,
                    spread,
                    annualizedPct: spread * 3 * 365 * 100,
                    signal: spread > 0.0005 ? 'CONTRACTION' : spread < 0.00005 ? 'EXPANSION' : 'NEUTRAL',
                    updatedAt: Date.now(),
                };
            });
            store.setFundingRates(rates);
        } catch {}
    };

    //  5. LIQUIDATION MAP (Binance Futures) 
    const pollLiquidations = async () => {
        try {
            const res = await fetch('/api/network/whale/liquidations');
            const d = await res.json();
            if (d.currentPrice && d.buckets) {
                const buckets = d.buckets as any[];
                store.setLiquidations({
                    currentPrice: d.currentPrice,
                    buckets,
                    longTotalUsd: buckets.reduce((s: number, b: any) => s + b.longs, 0),
                    shortTotalUsd: buckets.reduce((s: number, b: any) => s + b.shorts, 0),
                    updatedAt: Date.now(),
                });
            }
        } catch {}
    };

    //  6. NETWORK ORACLE METRICS (ETH Block, Gas, Chainlink) 
    const pollActiveNetwork = async () => {
        try {
            const res = await fetch('/api/network/live');
            const data = await res.json();
            if (data.success) {
                store.setActiveNetworkMetrics(
                    data.gasGwei,
                    data.blockNumber,
                    data.ethPrice,
                    data.btcPrice
                );
            }
        } catch {}
    };

    //  7. TOP WHALES PERSISTENCE (blockchain.info + our DB) 
    const pollTopWhales = async () => {
        try {
            const res = await fetch('/api/network/whale/top-whales');
            const d = await res.json();
            if (d.whales?.length > 0) {
                store.setTopWhales(d.whales);
            }
        } catch {}
    };

    //  7.5 500-WHALE LEADERBOARD (Volume Based) 
    const pollLeaderboard = async () => {
        try {
            const res = await fetch('/api/network/whale/leaderboard');
            const d = await res.json();
            if (d.whales?.length > 0) {
                store.setLeaderboard500(d.whales);
            }
        } catch {}
    };

    //  8. SATOSHI DETECTOR (Batch) 
    const pollSatoshi = async () => {
        try {
            const res = await fetch('/api/network/whale/satoshi-detector?mode=batch');
            const data = await res.json();
            if (data.results) store.setSatoshiWallets(data.results);
        } catch {}
    };

    //  9. VOLUME ON-CHAIN (Inflow/Outflow) 
    const pollVolume = async () => {
        try {
            const res = await fetch('/api/network/whale/inflow-outflow');
            const data = await res.json();
            if (!data.error) store.setVolumeData(data);
        } catch {}
    };

    //  BOOT ENGINE 
    useEffect(() => {
        let isMounted = true;
        
        // Use a recursive setTimeout instead of setInterval.
        // This guarantees that if the server takes 12s to respond to an 8s interval request,
        // we don't stack up pending requests and DDoS the backend (Connection Pool Exhaustion).
        const runPoll = async (pollFn: () => Promise<void>, intervalMs: number) => {
            if (!isMounted) return;
            await pollFn();
            if (isMounted) {
                const timerId = setTimeout(() => runPoll(pollFn, intervalMs), intervalMs);
                timers.current.push(timerId);
            }
        };

        // Boot independent async loops
        runPoll(pollWhaleEvents, INTERVALS.whaleEvents);
        runPoll(pollWhaleActivities, INTERVALS.activities);
        runPoll(pollMempool, INTERVALS.mempool);
        runPoll(pollFunding, INTERVALS.funding);
        runPoll(pollLiquidations, INTERVALS.liquidations);
        runPoll(pollActiveNetwork, INTERVALS.liveNetwork);
        runPoll(pollTopWhales, INTERVALS.topWhales);
        runPoll(pollLeaderboard, INTERVALS.leaderboard);
        runPoll(pollSatoshi, INTERVALS.satoshi);
        runPoll(pollVolume, INTERVALS.volume);

        return () => {
            isMounted = false;
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
    }, []);

    return <>{children}</>;
}

