import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect, useRef, useState } from 'react';
import { WacAnalyticsService } from '@/lib/analytics-service';
import { useVIPStore, VIPStoreState, EMPTY_ARRAY } from '@/lib/vip-store';

const LOCAL_EMPTY: any[] = [];

export interface MempoolTx {
    txid: string;
    fee: number;
    vsize: number;
    value: number;        // satoshis
    time: number;         // unix timestamp
    weight?: number;
    status?: { confirmed: boolean; block_height?: number; block_time?: number };
    vin?: { prevout?: { scriptpubkey_address?: string; value?: number } }[];
    vout?: { scriptpubkey_address?: string; value?: number; scriptpubkey_type?: string }[];
}

export interface WhaleSignal {
    id: string;
    type: 'sell_pressure' | 'accumulation' | 'exchange_inflow' | 'miner_outflow' | 'large_transfer' | 'fee_spike';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    body: string;
    btcAmount: number;
    txCount: number;
    timestamp: number;
}

export interface WhaleAlert {
    id: string;
    txid: string;
    btcAmount: number;
    btcValueUsd?: number;
    timestamp: number;
    read: boolean;
    tier?: string;
    asset?: string;
}

export interface LeaderboardEntry {
    address: string;
    totalBtc: number;
    totalUsd: number;
    txCount: number;
    avgTxBtc: number;
    avgTxUsd: number;
    label: string;
    rank: number;
    lastMove?: string;
    lastChain?: string;
}

export interface WhaleActivity {
    id: string;
    walletAddress: string;
    type: string;
    token: string;
    amount: number;
    usdValue: number;
    fromAddress: string;
    toAddress: string;
    transactionHash: string;
    blockNumber: string;
    chain: string;
    metadata?: any;
    timestamp: string;
}

/** Derive a human-readable wallet label from patterns */
function classifyAddress(address: string): string {
    if (!address) return 'Unknown';
    if (address.startsWith('bc1p')) return 'Taproot';
    if (address.startsWith('bc1q')) return 'SegWit';
    if (address.startsWith('3')) return 'P2SH / Exchange';
    if (address.startsWith('1')) return 'Legacy / Miner';
    return 'Unknown';
}

/** Generate AI signals from the unified feed */
function deriveSignals(items: any[]): WhaleSignal[] {
    if (!items.length) return [];
    const signals: WhaleSignal[] = [];
    const now = Date.now();

    const bigTxs = items.filter(t => (t.usdValue || 0) > 100_000); // >$100k USD for tactical tracking
    
    // Signal 1: Large Cross-Chain Movement
    if (bigTxs.length >= 5) {
        const totalUsd = bigTxs.reduce((s, t) => s + (t.usdValue || 0), 0);
        signals.push({
            id: `large_transfer_${now}`,
            type: 'large_transfer',
            severity: totalUsd > 10_000_000 ? 'critical' : 'high',
            title: ' Elite liquidity surge',
            body: `${bigTxs.length} high-value movements ($${(totalUsd / 1e6).toFixed(1)}M USD) detected across ${new Set(bigTxs.map(t => t.chain)).size} chains.`,
            btcAmount: 0,
            txCount: bigTxs.length,
            timestamp: now,
        });
    }

    // Signal 2: Accumulation pattern
    const accumulation = bigTxs.filter(t => t.sentiment?.includes('BULLISH') || t.type?.includes('ACCUMULATION') || t.type?.includes('BUY'));
    if (accumulation.length >= 3) {
        signals.push({
            id: `accumulation_${now}`,
            type: 'accumulation',
            severity: 'high',
            title: ' Institutional Accumulation',
            body: `Whales are aggressively accumulating ${[...new Set(accumulation.map(t => t.asset))].join(', ')}. Strong bullish conviction.`,
            btcAmount: 0,
            txCount: accumulation.length,
            timestamp: now,
        });
    }

    // Signal 3: Distribution / Sell Pressure
    const distribution = bigTxs.filter(t => t.sentiment?.includes('BEARISH') || t.type?.includes('SELL'));
    if (distribution.length >= 3) {
        signals.push({
            id: `sell_pressure_${now}`,
            type: 'sell_pressure',
            severity: 'high',
            title: '️ Distribution Alert',
            body: `High-volume distribution detected in ${[...new Set(distribution.map(t => t.asset))].join(', ')}. Monitoring for volatility.`,
            btcAmount: 0,
            txCount: distribution.length,
            timestamp: now,
        });
    }

    return signals.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order as any)[a.severity] - (order as any)[b.severity];
    });
}

function deriveLeaderboard(items: any[]): LeaderboardEntry[] {
    const addressMap = new Map<string, { btc: number; usd: number; count: number; lastMove: string; lastChain: string; label: string; }>();
    for (const item of items) {
        const addr = item.from;
        if (!addr || addr === 'Unknown' || addr === 'Multiple') continue;
        const prev = addressMap.get(addr) ?? { btc: 0, usd: 0, count: 0, lastMove: '', lastChain: '', label: '' };
        const isBtc = item.chain === 'BITCOIN';
        addressMap.set(addr, {
            btc: prev.btc + (isBtc ? item.amount : 0),
            usd: prev.usd + (item.usdValue || 0),
            count: prev.count + 1,
            lastMove: prev.lastMove || (item.sentiment ? `${item.sentiment}: ${item.amount} ${item.asset}` : ''),
            lastChain: prev.lastChain || item.chain,
            label: prev.label || item.walletProfile || classifyAddress(addr)
        });
    }
    return Array.from(addressMap.entries()).map(([address, stats]) => ({
        address, totalBtc: stats.btc, totalUsd: stats.usd, txCount: stats.count,
        avgTxBtc: stats.btc / stats.count, avgTxUsd: stats.usd / stats.count,
        label: stats.label, rank: 0, lastMove: stats.lastMove, lastChain: stats.lastChain
    })).sort((a, b) => b.totalUsd - a.totalUsd).slice(0, 20).map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export interface FlowNode { id: string; label: string; color: string }
export interface FlowLink { source: string; target: string; value: number }

function deriveFlow(items: any[]): { nodes: FlowNode[]; links: FlowLink[] } {
    const chainMetrics: Record<string, number> = {};
    for (const item of items) {
        const chain = item.chain || 'UNKNOWN';
        chainMetrics[chain] = (chainMetrics[chain] || 0) + (item.usdValue || 0);
    }
    const colorMap: Record<string, string> = {
        'BITCOIN': '#f7931a', 'ETHEREUM': '#627eea', 'ETH': '#627eea', 'BSC': '#f3ba2f',
        'BNB': '#f3ba2f', 'BASE': '#0052ff', 'SOLANA': '#14f195', 'SOL': '#14f195',
    };
    const nodes: FlowNode[] = Object.keys(chainMetrics).map(id => ({ id, label: id, color: colorMap[id] ?? '#6b7280' }));
    const links: FlowLink[] = [];
    const chains = Object.keys(chainMetrics);
    for (let i = 0; i < chains.length; i++) {
        for (let j = i + 1; j < chains.length; j++) {
            links.push({ source: chains[i], target: chains[j], value: (chainMetrics[chains[i]] + chainMetrics[chains[j]]) / 10 });
        }
    }
    return { nodes, links: links.sort((a, b) => b.value - a.value).slice(0, 15) };
}

export function useWhaleFeed() {
    const queryClient = useQueryClient();
    const alertsRef = useRef<WhaleAlert[]>([]);

    const prefsQuery = useQuery({
        queryKey: ['whale', 'preferences'],
        queryFn: async () => {
            const res = await fetch('/api/network/whale/preferences');
            if (res.status === 401) return { threshold: 50, muted: false, guest: true };
            return res.json();
        }
    });

    const watchQuery = useQuery({
        queryKey: ['whale', 'watchlist'],
        queryFn: async () => {
            const res = await fetch('/api/network/whale/watch');
            if (res.status === 401) return { addresses: [] };
            return res.json();
        }
    });

    const query = useQuery<MempoolTx[]>({
        queryKey: ['network', 'mempool', 'recent'],
        queryFn: async () => {
            const res = await fetch('/api/network/mempool/recent');
            if (!res.ok) throw new Error('Failed to fetch mempool');
            return res.json();
        },
        refetchInterval: 5000,
        staleTime: 3000,
    });

    const activityQuery = useQuery<WhaleActivity[]>({
        queryKey: ['network', 'whale', 'activity'],
        queryFn: async () => {
            const res = await fetch('/api/whale-events?limit=70');
            if (!res.ok) throw new Error('Failed to fetch indexed whale events');
            const data = await res.json();
            // Map Data Lake Events to expected WhaleActivity interface exactly
            return (data.events || []).map((ev: any) => ({
                id: ev.hash,
                walletAddress: ev.wallet,
                fromAddress: ev.wallet,
                toAddress: ev.dex || 'Network',
                type: ev.action,
                token: ev.token,
                amount: Number(ev.amount),
                usdValue: Number(ev.usdValue),
                transactionHash: ev.hash,
                blockNumber: '0',
                chain: 'ETHEREUM',
                timestamp: new Date(ev.timestamp).toISOString(),
                metadata: { method: ev.action }
            }));
        },
        refetchInterval: 5000,
        staleTime: 3000,
    });

    const evmScanQuery = useQuery<any[]>({
        queryKey: ['network', 'evm', 'recent'],
        queryFn: async () => {
            const res = await fetch('/api/network/evm/recent');
            if (!res.ok) return [];
            return res.json();
        },
        refetchInterval: 30000,
        staleTime: 20000,
    });

    const updatePrefsMutation = useMutation({
        mutationFn: async (vars: { threshold?: number; muted?: boolean }) => {
            const res = await fetch('/api/network/whale/preferences', { method: 'POST', body: JSON.stringify(vars) });
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whale', 'preferences'] })
    });

    const toggleWatchMutation = useMutation({
        mutationFn: async (vars: { address: string; toggle: boolean }) => {
            const res = await fetch('/api/network/whale/watch', { method: 'POST', body: JSON.stringify(vars) });
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whale', 'watchlist'] })
    });

    const activities = activityQuery.data ?? EMPTY_ARRAY;
    const txs = query.data ?? EMPTY_ARRAY;
    const evmScanData = evmScanQuery.data ?? EMPTY_ARRAY;
    const alertThresholdBtc = prefsQuery.data?.threshold ?? 50;
    const isMuted = prefsQuery.data?.muted ?? false;
    const watchedAddresses = useMemo(() => new Set<string>(watchQuery.data?.addresses ?? EMPTY_ARRAY), [watchQuery.data]);

    const [syncProgress, setSyncProgress] = useState(0);
    const lastFetchTimeRef = useRef(Date.now());

    useEffect(() => {
        if (query.isFetching) { lastFetchTimeRef.current = Date.now(); setSyncProgress(0); }
    }, [query.isFetching]);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - lastFetchTimeRef.current;
            const progress = Math.min((elapsed / 5000) * 100, 100);
            setSyncProgress(Math.floor(progress)); // Floor to prevent sub-pixel re-renders
        }, 500); // Throttled to 2Hz for stability
        return () => clearInterval(interval);
    }, []);

    const unifiedWhaleFeed = useMemo(() => {
        const btcMempool = txs.filter(t => (t.value / 1e8) * 60000 > 250000).map(t => {
            const amount = t.value / 1e8;
            const from = t.vin?.[0]?.prevout?.scriptpubkey_address || 'Unknown';
            const to = t.vout?.[0]?.scriptpubkey_address || 'Multiple';
            let type = 'TRANSFER';
            if (to.startsWith('bc1p')) type = 'ACCUMULATION (BUY)';
            else if (to.startsWith('3')) type = 'EXCHANGE INFLOW (SELL)';
            return {
                id: t.txid, hash: t.txid, from, to, amount, usdValue: amount * 60000, 
                asset: 'BTC', chain: 'BITCOIN', timestamp: t.time * 1000, status: 'PENDING',
                type, gasPriceGwei: (t.fee / t.vsize).toFixed(1), priorityFeeGwei: "0.1",
                method: type, confirmations: 0, 
                tier: amount * 60000 >= 1000000 ? 'MEGA tier' : 'ELITE'
            };
        });

        const confirmed = activities.filter(a => Number(a.usdValue) >= 250000).map(a => ({
            id: a.id, hash: a.transactionHash, from: a.fromAddress, to: a.toAddress,
            amount: Number(a.amount), usdValue: Number(a.usdValue), asset: a.token,
            chain: a.chain, timestamp: new Date(a.timestamp).getTime(),
            status: (a as any).status || 'CONFIRMED', type: (a.metadata as any)?.method || a.type || 'TRANSFER',
            method: (a.metadata as any)?.method || 'Transfer', gasPriceGwei: (a.metadata as any)?.gasPriceGwei || '15.4',
            confirmations: (a.metadata as any)?.confirmations || '12',
            tier: Number(a.usdValue) >= 1000000 ? 'MEGA tier' : 'ELITE'
        }));

        const confirmedHashes = new Set(confirmed.map(c => c.hash));
        const filteredMempool = btcMempool.filter(m => !confirmedHashes.has(m.hash));
        const filteredEvm = evmScanData.filter((e: any) => !confirmedHashes.has(e.hash));

        const merged = [...filteredMempool, ...filteredEvm, ...confirmed].sort((a, b) => b.timestamp - a.timestamp);
        
        return merged.map(item => {
            const intel = WacAnalyticsService.generateTacticalIntel({
                usdValue: item.usdValue || 0, from: item.from, to: item.to, type: item.type, asset: item.asset, chain: item.chain
            });
            const chainIcons: Record<string, { color: string; icon: string }> = {
                'BITCOIN': { color: '#f7931a', icon: '' }, 'ETHEREUM': { color: '#627eea', icon: 'Ξ' }, 'ETH': { color: '#627eea', icon: 'Ξ' },
                'BSC': { color: '#f3ba2f', icon: 'BNB' }, 'BNB': { color: '#f3ba2f', icon: 'BNB' }, 'BASE': { color: '#0052ff', icon: 'BASE' },
                'SOLANA': { color: '#14F195', icon: '' }, 'SOL': { color: '#14F195', icon: '' },
            };
            const config = chainIcons[item.chain] || { color: '#0052ff', icon: 'BASE' };
            let sentimentColor = 'text-gray-400';
            if (intel.sentiment.includes('BEARISH')) sentimentColor = 'text-red-400';
            else if (intel.sentiment.includes('BULLISH')) sentimentColor = 'text-emerald-400';

            return { ...item, chainColor: config.color, chainIcon: config.icon, walletProfile: intel.walletProfile, sentiment: intel.sentiment, sentimentColor, marketImpact: intel.marketImpact, action: intel.action };
        });
    }, [txs, activities, evmScanData]);

    const mergeWhaleEvents = useVIPStore((state: VIPStoreState) => state.mergeWhaleEvents);
    const lastHashRef = useRef('');

    useEffect(() => {
        if (!unifiedWhaleFeed.length) return;

        const currentHash = `${unifiedWhaleFeed.length}-${unifiedWhaleFeed[0]?.id}`;
        if (lastHashRef.current === currentHash) return;
        lastHashRef.current = currentHash;

        const events = unifiedWhaleFeed.map(item => ({
            id: item.id || item.hash,
            wallet: item.from,
            label: item.walletProfile || 'Institutional Wallet',
            tier: item.tier || 'ELITE',
            action: item.action === 'COMPRA' || item.action === 'BUY' ? 'BUY' : 'SELL',
            token: item.asset?.toUpperCase() || 'BTC',
            amount: String(item.amount),
            usdValue: `$${(Number(item.usdValue) / 1000).toFixed(0)}K`,
            usdNum: Number(item.usdValue),
            dex: item.chain,
            winRate: 0, // Mock winRate eradicated.
            age: 0,
            hash: item.hash,
            ts: item.timestamp,
            type: item.type?.toLowerCase().includes('accumulation') ? 'accumulation' : 'transfer',
            confidence: 95
        }));

        mergeWhaleEvents(events as any);
    }, [unifiedWhaleFeed, mergeWhaleEvents]);

    const signals = useMemo(() => deriveSignals(unifiedWhaleFeed), [unifiedWhaleFeed]);
    const flow = useMemo(() => deriveFlow(unifiedWhaleFeed), [unifiedWhaleFeed]);
    const leaderboard = useMemo(() => deriveLeaderboard(unifiedWhaleFeed), [unifiedWhaleFeed]);
    const whales = useMemo(() => unifiedWhaleFeed.filter(t => t.chain === 'BITCOIN' && t.amount > 500), [unifiedWhaleFeed]);
    const bscWhales = useMemo(() => activities.filter(a => a.chain === 'BSC'), [activities]);
    const baseWhales = useMemo(() => activities.filter(a => a.chain === 'BASE'), [activities]);

    const newAlerts: WhaleAlert[] = useMemo(() => {
        const thresholdSat = alertThresholdBtc * 1e8;
        const existingIds = new Set(alertsRef.current.map(a => a.txid));
        return txs.filter(t => t.value >= thresholdSat && !existingIds.has(t.txid)).map(t => ({
            id: `alert_${t.txid}`, txid: t.txid, btcAmount: t.value / 1e8, btcValueUsd: (t.value / 1e8) * 60000, timestamp: Date.now(), read: false, tier: 'ELITE', asset: 'BTC'
        }));
    }, [txs, alertThresholdBtc]);

    useEffect(() => {
        if (newAlerts.length > 0) { alertsRef.current = [...newAlerts, ...alertsRef.current].slice(0, 50); }
    }, [newAlerts]);

    return {
        txs, whales, activities, bscWhales, baseWhales, signals, flow, newAlerts, syncProgress, watchedAddresses, isMuted, alertThresholdBtc,
        isLoading: query.isLoading || prefsQuery.isLoading || activityQuery.isLoading,
        isFetching: query.isFetching || activityQuery.isFetching,
        dataUpdatedAt: query.dataUpdatedAt,
        leaderboard, unifiedWhaleFeed,
        toggleWatch: (address: string) => {
            const isWatched = watchedAddresses.has(address);
            toggleWatchMutation.mutate({ address, toggle: !isWatched });
        },
        updateThreshold: (threshold: number) => updatePrefsMutation.mutate({ threshold }),
        updateMuted: (muted: boolean) => updatePrefsMutation.mutate({ muted })
    };
}
