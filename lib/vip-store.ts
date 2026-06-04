// ============================================================
// VIP REAL-TIME GLOBAL STORE (Zustand)
// Feeds ALL VIP pages without any manual refresh.
// Single polling engine, multiple consumers.
// ============================================================
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const EMPTY_ARRAY: any[] = [];
Object.freeze(EMPTY_ARRAY);

// 
// TYPES
// 
export interface WhaleEvent {
    id: string;
    wallet: string;
    label: string;
    tier: string;
    action: 'BUY' | 'SELL' | 'BRIDGE' | 'STAKING' | 'TRANSFER' | 'COMPRA' | 'VENTA' | 'TRANSFERENCIA';
    token: string;
    amount: string;
    usdValue: string;
    usdNum: number; // parsed numeric USD
    dex: string;
    winRate: number;
    age: number;
    hash: string;
    ts: number;
    type: 'accumulation' | 'dump' | 'arbitrage' | 'transfer';
    confidence: number;
    gasUsd?: number;
    blockConfirmations?: number;
    telemetryTag?: string;
}

export interface TopWhale {
    address: string;
    label: string;
    btcBalance: number;
    ethBalance?: number;
    usdEstimate: number;
    chain: 'BTC' | 'ETH';
    tier: 'MEGA' | 'LARGE' | 'ALPHA';
    firstSeen: string;
    lastActive: string;
    isSatoshiEra: boolean;
    txCount: number;
    snapshot7d: number[]; // 7 daily usd estimates
    trend: 'accumulating' | 'distributing' | 'stable';
    persistedAt: number; // last written to DB
}

export interface MempoolState {
    count: number;
    vsize: number;
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    pendingMegaTxs: number; // txs > 1 BTC in mempool
}

export interface FundingRate {
    symbol: string;
    binance: number;
    bybit: number;
    spread: number;
    annualizedPct: number;
    signal: 'CONTRACTION' | 'EXPANSION' | 'NEUTRAL';
    updatedAt: number;
}

export interface LiquidationBucket {
    price: number;
    longs: number;
    shorts: number;
}

export interface LiquidationMap {
    currentPrice: number;
    buckets: LiquidationBucket[];
    longTotalUsd: number;
    shortTotalUsd: number;
    updatedAt: number;
}

export interface SatoshiWallet {
    address: string;
    btcBalance: number;
    yearsInactive: number;
    alertLevel: 'CRITICAL' | 'HIGH' | 'WATCH' | 'NORMAL';
    isSatoshiEra: boolean;
    isSleepingGiant: boolean;
    firstSeenDate: string;
    lastActiveDate: string;
    txCount: number;
}

export interface VolumeData {
    netFlowScore: number;
    direction: 'INFLOW_DOMINANT' | 'OUTFLOW_DOMINANT' | 'NEUTRAL';
    sentiment: 'bearish' | 'bullish' | 'neutral';
    mempoolSizeMb: number;
    avgFeeSat: number;
    avgBlockSizeKb: number;
    totalPendingTxs: number;
    historicalPoints: { time: number; inflow: number; outflow: number; blockHeight: number }[];
    updatedAt: number;
}

export interface WhaleActivity {
    id: string;
    walletAddress: string;
    walletLabel: string;
    type: 'BUY' | 'SELL' | 'TRANSFER' | 'SWAP';
    token: string;
    amount: number;
    usdValue: number;
    timestamp: Date | string | number;
    txHash: string;
    chain?: string;
}

export interface HACandle {
    ts: number; // Start of minute
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    haOpen: number;
    haHigh: number;
    haLow: number;
    haClose: number;
}

export interface VIPStoreState {
    //  Streams 
    whaleEvents: WhaleEvent[];
    whaleActivities: WhaleActivity[]; // Telegram Feed
    tokenFeeds: Record<string, WhaleEvent[]>;
    candleFeeds: Record<string, HACandle[]>;
    topWhales: TopWhale[];
    leaderboard500: any[]; // [NEW] Top 500 volume whales
    mempool: MempoolState | null;
    fundingRates: FundingRate[];
    liquidations: LiquidationMap | null;
    satoshiWallets: SatoshiWallet[];
    volumeData: VolumeData | null;
    ethPrice: number;
    btcPrice: number;
    gasGwei: number;
    blockNumber: number;
    nexus: {
        entities: { address: string; label: string; balance: string }[];
    } | null;

    //  Meta 
    lastWhaleUpdate: number;
    lastActivityUpdate: number;
    lastMempoolUpdate: number;
    lastFundingUpdate: number;
    lastLiqUpdate: number;
    lastSatoshiUpdate: number;
    lastVolumeUpdate: number;
    lastActiveNetworkUpdate: number;
    lastNexusUpdate: number;
    lastLeaderboardUpdate: number; // [NEW]

    //  Actions 
    setWhaleEvents: (events: WhaleEvent[]) => void;
    setWhaleActivities: (activities: WhaleActivity[]) => void;
    mergeWhaleEvents: (events: WhaleEvent[]) => void;
    setTopWhales: (whales: TopWhale[]) => void;
    setMempool: (m: MempoolState) => void;
    setFundingRates: (rates: FundingRate[]) => void;
    setLiquidations: (l: LiquidationMap) => void;
    setSatoshiWallets: (s: SatoshiWallet[]) => void;
    setVolumeData: (v: VolumeData) => void;
    setEthPrice: (p: number) => void;
    setBtcPrice: (p: number) => void;
    setActiveNetworkMetrics: (gas: number, block: number, ethPrice: number, btcPrice: number) => void;
    setLeaderboard500: (whales: any[]) => void;
    setNexus: (nexus: { entities: { address: string; label: string; balance: string }[] }) => void;
}

function parseUsd(raw: string): number {
    if (!raw) return 0;
    // Remove symbols and handle localized number formats (commas/spaces)
    const sanitized = raw.replace(/[^0-9.MK]/gi, '').replace(/,/g, '');
    const n = parseFloat(sanitized);
    if (isNaN(n)) return 0;
    if (raw.toUpperCase().includes('M')) return n * 1_000_000;
    if (raw.toUpperCase().includes('K')) return n * 1_000;
    return n;
}

function classifyAction(action: string, hash: string): WhaleEvent['type'] {
    const h = parseInt((hash || '0').slice(-2), 16) % 4;
    if (action === 'SELL' || action === 'VENTA') return 'dump';
    if (action === 'STAKING') return 'transfer';
    const types: WhaleEvent['type'][] = ['accumulation', 'arbitrage', 'accumulation', 'transfer'];
    return types[h];
}

export const useVIPStore = create<VIPStoreState>()(
    subscribeWithSelector((set, get) => ({
        whaleEvents: [],
        whaleActivities: [],
        tokenFeeds: {},
        candleFeeds: {},
        topWhales: [],
        leaderboard500: [],
        mempool: null,
        fundingRates: [],
        liquidations: null,
        satoshiWallets: [],
        volumeData: null,
        ethPrice: 0,
        btcPrice: 0,
        gasGwei: 0,
        blockNumber: 0,
        nexus: null,

        lastWhaleUpdate: 0,
        lastActivityUpdate: 0,
        lastMempoolUpdate: 0,
        lastFundingUpdate: 0,
        lastLiqUpdate: 0,
        lastSatoshiUpdate: 0,
        lastVolumeUpdate: 0,
        lastActiveNetworkUpdate: 0,
        lastNexusUpdate: 0,
        lastLeaderboardUpdate: 0,

        setWhaleEvents: (events) => set({ 
            whaleEvents: events, 
            lastWhaleUpdate: Date.now() 
        }),
        setWhaleActivities: (activities) => set({ 
            whaleActivities: activities, 
            lastActivityUpdate: Date.now() 
        }),
        mergeWhaleEvents: (incoming) => set(state => {
            if (!incoming || incoming.length === 0) return state;

            const now = Date.now();
            const cutoff = now - 86400000; // 24h

            // Deep deduplication: Only process events we don't already have
            const existingHashes = new Set(state.whaleEvents.map(e => e.hash || e.id));
            const fresh = incoming.filter(e => !existingHashes.has(e.hash || e.id));

            if (fresh.length === 0) return state;

            // Merge main feed
            const mergedEvents = [...fresh, ...state.whaleEvents]
                .filter(e => e.ts > cutoff)
                .slice(0, 1000);

            // Update individual token feeds (Standard & Pair Mapping)
            const newTokenFeeds = { ...state.tokenFeeds };
            const newCandleFeeds = { ...state.candleFeeds };

            fresh.forEach(e => {
                const base = e.token.toUpperCase().trim();
                const pairs = [
                    base, 
                    `${base}USDT`, 
                    base.replace('USDT', ''), 
                    base.replace('WBTC', 'BTC'),
                    base.replace('WBNB', 'BNB'),
                    base.includes('ETH') ? 'ETH' : base
                ];
                
                new Set(pairs).forEach(p => {
                    if (!p) return;
                    
                    // Update main feed
                    const currentFeed = newTokenFeeds[p] || [];
                    newTokenFeeds[p] = [e, ...currentFeed]
                        .filter(x => x.ts > cutoff)
                        .slice(0, 100);

                    // Update Candles (1m)
                    const minuteTs = Math.floor(e.ts / 60000) * 60000;
                    const tokenCandles = [...(newCandleFeeds[p] || [])];
                    let candle = tokenCandles.find(c => c.ts === minuteTs);
                    
                    const amountStr = (e.amount || "1").toString().replace(/,/g, '');
                    const amountNum = Math.max(0.00000001, parseFloat(amountStr) || 1);
                    const price = e.usdNum / amountNum;
                    // Note: This is an approximation of unit price per event

                    if (!candle) {
                        // Logic for previous candle (for HA calculation)
                        const prevCandle = tokenCandles[0]; // descending order assumed or sorted later
                        const haOpen = prevCandle 
                            ? (prevCandle.haOpen + prevCandle.haClose) / 2 
                            : price;

                        candle = {
                            ts: minuteTs,
                            open: price,
                            high: price,
                            low: price,
                            close: price,
                            volume: e.usdNum,
                            haOpen,
                            haClose: price, // initial
                            haHigh: price,
                            haLow: price
                        };
                        tokenCandles.unshift(candle);
                    } else {
                        candle.high = Math.max(candle.high, price);
                        candle.low = Math.min(candle.low, price);
                        candle.close = price;
                        candle.volume += e.usdNum;
                    }

                    // Re-calculate HA for this candle
                    candle.haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
                    candle.haHigh = Math.max(candle.high, candle.haOpen, candle.haClose);
                    candle.haLow = Math.min(candle.low, candle.haOpen, candle.haClose);

                    newCandleFeeds[p] = tokenCandles
                        .filter(c => c.ts > cutoff)
                        .sort((a, b) => b.ts - a.ts)
                        .slice(0, 500); // Persist up to 500 candles (~8 hours)
                });
            });

            return {
                whaleEvents: mergedEvents,
                tokenFeeds: newTokenFeeds,
                candleFeeds: newCandleFeeds,
                lastWhaleUpdate: now,
            };
        }),
        setTopWhales: (topWhales) => set({ topWhales }),
        setMempool: (mempool) => set({ mempool, lastMempoolUpdate: Date.now() }),
        setFundingRates: (fundingRates) => set({ fundingRates, lastFundingUpdate: Date.now() }),
        setLiquidations: (liquidations) => set({ liquidations, lastLiqUpdate: Date.now() }),
        setSatoshiWallets: (satoshiWallets) => set({ satoshiWallets, lastSatoshiUpdate: Date.now() }),
        setVolumeData: (volumeData) => set({ volumeData, lastVolumeUpdate: Date.now() }),
        setEthPrice: (ethPrice) => set({ ethPrice }),
        setBtcPrice: (btcPrice) => set({ btcPrice }),
        setActiveNetworkMetrics: (gasGwei, blockNumber, ethPrice, btcPrice) => 
            set({ gasGwei, blockNumber, ethPrice, btcPrice, lastActiveNetworkUpdate: Date.now() }),
        setLeaderboard500: (leaderboard500) => set({ leaderboard500, lastLeaderboardUpdate: Date.now() }),
        setNexus: (nexus) => set({ nexus, lastNexusUpdate: Date.now() }),
    }))
);

// 
// HELPER: parse raw alpha-events API response into WhaleEvent[]
// 
export function parseAlphaEvents(rawEvents: any[]): WhaleEvent[] {
    return rawEvents.map(e => {
        // Favor raw numeric usdNum if API provides it, otherwise fallback to parsing string
        const usdNum = e.usdNum !== undefined ? e.usdNum : parseUsd(e.usdValue || '0');
        const action = e.action || 'COMPRA';
        const isSell = action.toUpperCase().includes('SELL') || action.toUpperCase().includes('VENTA');
        const isBuy = action.toUpperCase().includes('BUY') || action.toUpperCase().includes('COMPRA');

        return {
            id: e.id || e.hash + Date.now(),
            wallet: e.wallet || e.from || e.short || '0x???',
            label: e.label || 'Alpha Wallet',
            tier: e.tier || 'ALPHA',
            action: isBuy ? 'BUY' : (isSell ? 'SELL' : 'TRANSFER'),
            token: e.token?.toUpperCase() || 'ERC20',
            amount: e.amount || '0',
            usdValue: e.usdValue || (usdNum >= 1_000_000 ? `$${(usdNum / 1_000_000).toFixed(2)}M` : `$${(usdNum / 1000).toFixed(0)}K`),
            usdNum,
            dex: e.dex || 'On-Chain',
            winRate: e.winRate || 0,
            age: e.age || 0,
            hash: e.hash || e.id?.split('true')[0]?.split('false')[0] || '',
            ts: e.ts || (Date.now() - (e.age || 0) * 1000),
            type: isSell ? 'dump' : (action.toUpperCase().includes('STAKING') ? 'transfer' : classifyAction(action, e.id || e.hash || '')),
            confidence: e.confidence || 0,
            gasUsd: e.gasUsd,
            blockConfirmations: e.blockConfirmations,
            telemetryTag: e.telemetryTag,
        };
    });
}

