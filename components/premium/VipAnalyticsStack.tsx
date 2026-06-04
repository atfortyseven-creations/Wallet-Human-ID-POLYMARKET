"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { Zap, Wallet, Layers, ChevronRight, Activity, Clock, Rocket, Turtle, Gauge, Cpu, Box } from 'lucide-react';
import { OMNI_CHAINS } from '@/lib/blockchain/OmniChainConstants';
import { ChainPulseCard } from '@/components/network/ChainPulseCard';

//  Pool Colors 
const POOL_COLORS = [
    '#0f172a','#4f46e5','#0891b2','#059669','#ea580c',
    '#9333ea','#e11d48','#2563eb','#d97706','#7c3aed',
    '#0d9488','#475569','#94a3b8',
];

const TABS = [
    { id: 'fees',      label: 'L1 Fees',      icon: Zap },
    { id: 'l2fees',    label: 'L2 Gas',       icon: Gauge },
    { id: 'portfolio', label: 'Portfolio',    icon: Wallet },
    { id: 'chains',    label: 'Chain Pulse',  icon: Layers },
] as const;
type TabId = typeof TABS[number]['id'];

// 
// L2 FEES PANEL (NEW)
// 
function L2FeesPanel() {
    const { data: healthData, isLoading } = useQuery<any[]>({
        queryKey: ['multiverse', 'health'],
        queryFn: async () => {
            const res = await fetch('/api/network/multiverse/health');
            if (!res.ok) throw new Error('failed');
            return res.json();
        },
        refetchInterval: 10_000,
    });

    const l2s = ['arbitrum', 'optimism', 'base', 'polygon', 'scroll', 'linea', 'blast'];
    const l2Data = (Array.isArray(healthData) ? healthData : []).filter(h => h && h.id && l2s.includes(h.id));

    if (isLoading) return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl" />)}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.35em]">Secondary Layer Activity</div>
                    <div className="text-base font-black text-white mt-0.5 uppercase">L2 Network Fees</div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <Cpu size={12} className="text-cyan-400" />
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Active Updates</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {l2Data.map((chain) => {
                    const price = chain.gasPriceGwei || 0;
                    const usd = chain.gasUsd || (price * 0.0000035);
                    const chainMeta = OMNI_CHAINS.find(c => c.id === chain.id);
                    
                    return (
                        <motion.div 
                            key={chain.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg hover:border-cyan-500/30 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5">
                                         <div className="w-4 h-4 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: chainMeta?.color, boxShadow: `0 0 10px ${chainMeta?.color}` }} />
                                    </div>
                                    <span className="text-sm font-black text-white/90 uppercase tracking-wide">{chainMeta?.name}</span>
                                </div>
                                <div className="px-2 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                                    <span className="text-[8px] font-black text-cyan-400 uppercase">Active</span>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-2xl font-black font-mono text-white">
                                    {price.toFixed(4)}
                                    <span className="text-[10px] text-white/40 ml-1.5 uppercase tracking-tighter">gwei</span>
                                </div>
                                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">
                                    Est. Gas: ${usd.toFixed(6)}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Speed: {chain.latency}ms</span>
                                <Box size={12} className="text-white/10 group-hover:text-cyan-400 transition-colors" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// 
// FEES PANEL
// 
function FeesPanel() {
    const { data: fees, isLoading: feesLoading } = useQuery<any>({
        queryKey: ['network', 'fees', 'recommended'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/fees/recommended');
            if (!res.ok) throw new Error('failed');
            return res.json();
        },
        refetchInterval: 10_000,
        retry: 2,
    });

    const { data: mempool } = useQuery<any[]>({
        queryKey: ['network', 'mempool-blocks'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/fees/mempool-blocks');
            if (!res.ok) throw new Error('failed');
            return res.json();
        },
        refetchInterval: 8_000,
        retry: 2,
    });

    const blocks = (Array.isArray(mempool) ? mempool : [])
        .slice(0, 4)
        .filter((b: any) => b && typeof b === 'object')
        .map((b: any) => ({
            medianFee: b.medianFee ?? b.median_fee ?? b.fee ?? null,
            nTx:       b.nTx ?? b.n_tx ?? b.txCount ?? null,
            sizeMB:    b.size ? (parseFloat(b.size) / 1e6).toFixed(2) : b.sizeMB ?? null,
        }));

    const BLOCK_LABELS = ['IMMINENT BLOCK', 'PROJECTED +1', 'PROJECTED +2', 'PROJECTED +3'];
    const FEES = [
        { label: 'Economic', value: fees?.hourFee,     icon: Turtle, hint: '~1h', color: 'text-white/40' },
        { label: 'Standard', value: fees?.halfHourFee, icon: Clock,  hint: '~30m', color: 'text-cyan-400', accent: true },
        { label: 'Priority', value: fees?.fastestFee,  icon: Rocket, hint: '~10m', color: 'text-rose-400' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.35em]">Main Protocol Metrics</div>
                    <div className="text-base font-black text-white mt-0.5 uppercase">Network Stats</div>
                </div>
                <div className="flex items-center gap-1.5 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">Global Sync</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Projected Blocks */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BLOCK_LABELS.map((lbl, i) => {
                        const b = blocks[i];
                        const isImminent = i === 0;
                        return (
                            <div
                                key={i}
                                className={`flex flex-col justify-between p-6 rounded-2xl border transition-all ${
                                    isImminent 
                                        ? 'bg-white/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                                        : 'bg-white/5 border-white/5'
                                }`}
                            >
                                <div className={`text-[7px] font-black uppercase tracking-[0.3em] mb-4 ${isImminent ? 'text-cyan-400' : 'text-white/30'}`}>
                                    {lbl}
                                </div>
                                <div className="space-y-1">
                                    <div className={`text-3xl font-black font-mono leading-none ${isImminent ? 'text-white' : 'text-white/90'}`}>
                                        {b?.medianFee != null ? b.medianFee.toFixed(1) : ''}
                                        <span className="text-[10px] font-bold text-white/20 ml-2">SAT/VB</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <div className="text-[10px] font-mono font-black text-white/40 uppercase">
                                            {b?.nTx != null ? Number(b.nTx).toLocaleString() : ''} TXS
                                        </div>
                                        <div className="text-[10px] text-white/20 font-bold uppercase">
                                            {b?.sizeMB != null ? `${b.sizeMB} MB` : ''} BUCKET
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Priority Tiers */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {FEES.map(({ label, value, icon: Icon, hint, color, accent }) => (
                        <div
                            key={label}
                            className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                                accent ? 'bg-white/10 border-cyan-500/30' : 'bg-white/5 border-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${color}`}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-white/30 uppercase tracking-widest">{label} Level</div>
                                    <div className={`text-base font-black ${accent ? 'text-white' : 'text-white/80'} uppercase`}>{hint} wait time</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl font-black font-mono ${color}`}>
                                    {value ?? ''}
                                </div>
                                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">SAT/VB</div>
                            </div>
                        </div>
                    ))}
                    <div className="mt-auto pt-2 text-[8px] font-black text-white/10 uppercase tracking-[0.4em] text-center">
                        Relay Minimum Threshold: 1.0 Sat/vB
                    </div>
                </div>
            </div>
        </div>
    );
}

// 
// PORTFOLIO PANEL
// 
function PortfolioPanel() {
    const { address: connectedAddress } = useSystemAccount();
    const [address, setAddress] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [totalUsd, setTotalUsd] = useState(0);
    const [chainBalances, setChainBalances] = useState<Record<string, number>>({});

    // Auto-detect connected wallet
    React.useEffect(() => {
        if (connectedAddress && !address) {
            setAddress(connectedAddress);
        }
    }, [connectedAddress]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = address || connectedAddress;
        if (!target) return;
        
        setIsScanning(true);
        setHasScanned(false);
        try {
            const res = await fetch(`/api/network/multiverse/portfolio?address=${encodeURIComponent(target.trim())}`);
            if (!res.ok) throw new Error('scan failed');
            const data = await res.json();
            setTotalUsd(data?.totalUsd ?? 0);
            setChainBalances(data?.chains ?? {});
        } catch {
            setChainBalances({});
            setTotalUsd(0);
        } finally {
            setIsScanning(false);
            setHasScanned(true);
        }
    };

    const entries = Object.entries(chainBalances)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.35em]">Aggregated Holdings</div>
                    <div className="text-base font-black text-white mt-0.5 uppercase">Portfolio Profile</div>
                    <div className="text-[10px] text-white/40 mt-0.5 uppercase tracking-tighter">Unified overview of holdings across all primary and secondary networks.</div>
                </div>
                {hasScanned && totalUsd > 0 && (
                    <div className="text-right shrink-0 ml-8">
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Aggregated Net Worth</div>
                        <div className="text-2xl font-black font-mono text-white">
                            ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                    </div>
                )}
            </div>

            {/* Search */}
            <form onSubmit={handleScan} className="flex gap-3">
                <input
                    type="text"
                    placeholder="Enter 0x Address or ENS"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 h-12 text-[13px] text-white font-mono placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all shadow-lg"
                    autoComplete="off"
                    spellCheck={false}
                />
                <button
                    type="submit"
                    disabled={isScanning || !address.trim()}
                    className="h-12 px-7 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                    {isScanning
                        ? <Activity size={14} className="animate-spin" />
                        : <><ChevronRight size={14} /> Perform Scan</>
                    }
                </button>
            </form>

            {/* Results */}
            {hasScanned && entries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {entries.map(([chain, bal]) => (
                            <div key={chain} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-cyan-500/30 hover:shadow-lg transition-all">
                                <div className="text-[8px] font-black text-white/30 uppercase tracking-wider truncate mb-2">{chain}</div>
                                <div className="text-[13px] font-mono font-black text-white">
                                    ${Number(bal).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {hasScanned && entries.length === 0 && (
                <div className="py-12 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/2">
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        No cryptographic assets detected on target networks
                    </div>
                </div>
            )}

            {!hasScanned && (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl gap-3 bg-white/2">
                    <Wallet size={28} className="text-white/10" />
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        Initialize sequence: Input target address to begin
                    </div>
                </div>
            )}
        </div>
    );
}

// 
// CHAIN PULSE PANEL  Full grid, no clipping
// 
function ChainPanel() {
    const { data: healthData, isLoading } = useQuery<any[]>({
        queryKey: ['multiverse', 'health'],
        queryFn: async () => {
            const res = await fetch('/api/network/multiverse/health');
            if (!res.ok) throw new Error('failed');
            return res.json();
        },
        refetchInterval: 10_000,
        retry: 2,
    });

    return (
        <div>
            <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.35em] mb-5">
                {OMNI_CHAINS.length} Networks · Deep Grid Pulse
            </div>
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                    {Array.from({ length: OMNI_CHAINS.length }).map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl" style={{ opacity: 1 - i * 0.02 }} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                    {OMNI_CHAINS.map((chain, idx) => {
                        const healthDataArray = Array.isArray(healthData) ? healthData : [];
                        const metrics = healthDataArray.find(
                            (h: any) => h && (h.id === chain.id || h.chain === chain.id || h.chainId === chain.id)
                        );
                        return (
                            <ChainPulseCard
                                key={chain.id}
                                chain={chain}
                                metrics={metrics}
                                delay={idx * 0.02}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// 
// MAIN: VipAnalyticsStack
// 
export function VipAnalyticsStack({ theme = 'arctic' }: { theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const [activeTab, setActiveTab] = useState<TabId>('fees');

    return (
        <section className="bg-black/40 backdrop-blur-2xl border-t border-white/10 relative z-40 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(6,182,212,0.05),_transparent_70%)] pointer-events-none" />
            {/* Tab bar */}
            <div className="flex items-center border-b border-white/5 bg-black/40 px-6 overflow-x-auto no-scrollbar">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-3 px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap ${
                            activeTab === id
                                ? 'border-cyan-500 text-cyan-400 bg-white/5 -mb-px rounded-t-xl shadow-[0_-10px_30px_-10px_rgba(6,182,212,0.3)]'
                                : 'border-transparent text-white/30 hover:text-white/60 hover:bg-white/5'
                        }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Panel  full natural height, with adaptive padding */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 py-6 md:px-10 md:py-10 max-h-[80vh] overflow-y-auto custom-scrollbar"
                >
                    <div className="max-w-[1600px] mx-auto">
                        {activeTab === 'fees'      && <FeesPanel />}
                        {activeTab === 'l2fees'    && <L2FeesPanel />}
                        {activeTab === 'portfolio' && <PortfolioPanel />}
                        {activeTab === 'chains'    && <ChainPanel />}
                    </div>
                </motion.div>
            </AnimatePresence>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </section>
    );
}
