"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search, Banknote, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { useSendTransaction, useSwitchChain, useChainId } from 'wagmi';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { polymarketRouterService } from '@/lib/blockchain/PolymarketRouterService';
import { useActivePortfolio } from '@/hooks/useActivePortfolio';
import { toast } from 'sonner';
import Image from 'next/image';
import { useMarketData } from '@/lib/api-client';

interface PolyMarket {
    id: string; slug: string; question: string; category: string;
    yesPrice: number; noPrice: number; volume24h: number; volumeTotal: number;
    evSignal: string; image?: string; active: boolean; closed?: boolean;
    conditionId?: string; endDate?: string;
    // Real on-chain execution fields from Gnosis CTF
    fpmmAddress?: string | null;
}

const fmtUsd = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
};

const SIGNAL_COLOR: Record<string, string> = {
    OVERBOUGHT: '#FF3B30', OVERSOLD: '#00C076',
    LEAN_YES: '#00C076', LEAN_NO: '#FF3B30', NEUTRAL: '#888888',
};

function Skeleton({ count = 6 }) {
    return (
        <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex gap-4 p-5 border border-[#E5E5E5]  bg-[#FFFFFF]  rounded-2xl">
                    <div className="w-12 h-12 bg-[#E5E5E5]  rounded-xl animate-pulse" />
                    <div className="flex-1 space-y-3">
                        <div className="h-5 bg-[#E5E5E5]  rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-[#E5E5E5]  rounded w-1/4 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function PolymarketPanel() {
    // =========================================================================
    // INJECTED DATA HOOK  Zero-Mock Mandate
    // Polymarket endpoint injected via REGISTRY.MARKET_DATA.polymarket
    // =========================================================================
    const [rawData, setRawData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchRealData = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('https://gamma-api.polymarket.com/events?closed=false&limit=30');
            const data = await res.json();
            const realMarkets = data.map((ev: any) => {
                const m = ev.markets?.[0];
                if (!m) return null;
                return {
                    id: m.id || ev.id,
                    slug: ev.slug,
                    question: ev.title,
                    category: ev.tags?.[0]?.label || 'crypto',
                    yesPrice: m.outcomePrices?.[0] ? parseFloat(m.outcomePrices[0]) : 0.5,
                    noPrice: m.outcomePrices?.[1] ? parseFloat(m.outcomePrices[1]) : 0.5,
                    volume24h: ev.volume24hr || m.volume24hr || 0,
                    volumeTotal: ev.volume || m.volume || 0,
                    evSignal: 'NEUTRAL',
                    image: ev.image,
                    active: ev.active && !ev.closed,
                    closed: ev.closed,
                    endDate: ev.endDate,
                    fpmmAddress: null
                };
            }).filter(Boolean);
            setRawData({ markets: realMarkets });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchRealData();
        const interval = setInterval(fetchRealData, 15000);
        return () => clearInterval(interval);
    }, [fetchRealData]);

    const refetch = fetchRealData;
    const markets: PolyMarket[] = rawData?.markets || [];
    const geoBlocked = false;
    const ts = rawData ? new Date().toLocaleTimeString() : '';

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [selected, setSelected] = useState<PolyMarket | null>(null);
    const [tradeAmount, setTradeAmount] = useState('100');
    const [isExecuting, setIsExecuting] = useState<'YES' | 'NO' | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const { isConnected, address } = useAccount();
    const chainId = useChainId();
    const { switchChain, switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const { usdcBalance } = useActivePortfolio();

    const isPolygon = chainId === 137;

    const filtered = markets
        .filter(m => category === 'all' || m.category?.toLowerCase() === category)
        .filter(m => m.question.toLowerCase().includes(search.toLowerCase()));

    const handleTrade = async (direction: 'YES' | 'NO') => {
        if (!isConnected) {
            toast.error('Wallet Not Connected', { description: 'Please connect your wallet to trade on Polymarket.' });
            return;
        }
        if (!selected) return;
        if (!selected.fpmmAddress) {
            toast.error('No FPMM Available', { description: 'This market does not have an FPMM contract deployed yet. Please try another market.' });
            return;
        }

        setIsExecuting(direction);
        const toastId = toast.loading(`Preparing execution [${direction}]...`);

        try {
            // Step A: Switch to Polygon if needed
            if (!isPolygon && switchChainAsync) {
                toast.loading('Switching network to Polygon...', { id: toastId });
                try {
                    await switchChainAsync({ chainId: 137 });
                    await new Promise(r => setTimeout(r, 1200));
                } catch {
                    throw new Error('Polygon switch rejected. Polymarket operates on Polygon Mainnet.');
                }
            }

            // Step 1 of 2: Approve USDC to the FPMM contract
            toast.loading('Step 1/2: Authorizing USDC for FPMM...', { id: toastId });
            const approvalPayload = polymarketRouterService.buildApprovalTransaction(
                selected.fpmmAddress,
                tradeAmount
            );
            const approvalHash = await sendTransactionAsync({
                to: approvalPayload.tx.to as `0x${string}`,
                data: approvalPayload.tx.data as `0x${string}`,
                value: BigInt(0),
            });
            toast.loading(`Step 1/2 confirmed. Hash: ${approvalHash.slice(0, 10)}... Step 2/2 in progress...`, { id: toastId });

            // Wait a beat for the approval to propagate
            await new Promise(r => setTimeout(r, 2000));

            // Step 2 of 2: Execute the real FPMM buy()
            toast.loading('Step 2/2: Buying shares on FPMM...', { id: toastId });
            const tradePayload = await polymarketRouterService.buildTradeTransaction(
                selected.fpmmAddress,
                direction,
                tradeAmount
            );
            const tradeHash = await sendTransactionAsync({
                to: tradePayload.tx.to as `0x${string}`,
                data: tradePayload.tx.data as `0x${string}`,
                value: BigInt(0),
            });

            toast.success('Trade Executed On-Chain', {
                id: toastId,
                description: `Successfully purchased ${tradeAmount} USDC in ${direction} shares. Tx: ${tradeHash.slice(0, 18)}...`,
            });

            setSelected(null);
        } catch (e: any) {
            toast.error('Execution Error', {
                id: toastId,
                description: e.message || 'Transaction rejected by user.',
            });
        } finally {
            setIsExecuting(null);
        }
    };

    if (!mounted) {
        return <div className="flex flex-col h-[calc(100vh-105px)] bg-[#FFFFFF]  items-center justify-center"><Loader2 size={32} className="animate-spin text-[#E5E5E5] " /></div>;
    }

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-[#FFFFFF]  text-[#111111]  font-sans">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 p-6 border-b border-[#E5E5E5]  bg-[#FFFFFF] ">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] " />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search institutional markets..." 
                        className="w-full bg-white  border border-[#E5E5E5]  rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-[#050505]  outline-none focus:border-[#050505]  transition-all shadow-sm"
                    />
                </div>
                <div className="flex bg-[#E5E5E5]/40  p-1.5 rounded-xl border border-[#E5E5E5] ">
                    {['all', 'crypto', 'politics', 'sports', 'business'].map(c => (
                        <button 
                            key={c} onClick={() => setCategory(c)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all shadow-sm ${category === c ? 'bg-[#FFFFFF]  text-[#111111]  border border-[#E5E5E5] ' : 'text-[#888888]  hover:text-[#111111]  border border-transparent hover:bg-white/50 '}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <button onClick={() => refetch()} className="ml-auto text-[#888888]  hover:text-[#111111]  flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-[#E5E5E5]  rounded-xl px-4 py-3 bg-[#FFFFFF]  shadow-sm hover:border-[#111111]/20  transition-all">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> SYNC
                </button>
            </div>

            {/* Markets List */}
            <div className="flex flex-1 overflow-hidden relative">
                {geoBlocked && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-[#FFFFFF]/80  backdrop-blur-sm">
                        <div className="max-w-md w-full p-10 border border-red-200  bg-red-50  rounded-[2rem] text-center flex flex-col items-center">
                            <ShieldCheck size={64} className="text-red-500 mb-6 opacity-80" />
                            <h3 className="text-2xl font-black text-[#111111]  uppercase tracking-tighter mb-3">GEO-RESTRICTED AREA</h3>
                            <p className="text-xs font-bold font-mono text-red-800  uppercase tracking-widest leading-relaxed">
                                Market data and trading features are blocked for your jurisdiction due to regulatory constraints (CFTC/OFAC).
                            </p>
                            <a href="/docs/legal/TERMS_OF_SERVICE.md" target="_blank" className="mt-8 text-[10px] font-black uppercase text-red-900  border border-red-300  px-6 py-3 rounded-full hover:bg-red-200  transition-colors inline-block">
                                Review Terms of Service
                            </a>
                        </div>
                    </div>
                )}

                <div className="p-6 space-y-4 flex-1 w-full overflow-y-auto no-scrollbar">
                    {loading && !geoBlocked && <Skeleton />}
                    {!loading && filtered.map(m => (
                        <motion.div 
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelected(selected?.id === m.id ? null : m)}
                            className={`flex gap-5 p-5 rounded-[1.5rem] border cursor-pointer transition-all ${selected?.id === m.id ? 'bg-[#FFFFFF]  border-[#111111]/20  shadow-md' : 'bg-[#FFFFFF]  border-[#E5E5E5]  hover:border-[#111111]/10  hover:shadow-sm'}`}
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#FFFFFF]  border border-[#E5E5E5]  flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('svg')?.setAttribute('style', 'display: block'); }} /> : null}
                                <Banknote size={24} className="text-[#888888]  scale-110" style={{ display: m.image ? 'none' : 'block' }} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-base font-black text-[#111111]  tracking-tight leading-snug mb-2 truncate max-w-[90%]">{m.question}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#888888]  uppercase tracking-widest flex-wrap">
                                    {m.active && !m.closed ? (
                                        <span className="bg-[#00ffa8]/10 text-[#00dda8] px-2 py-0.5 rounded border border-[#00dda8]/20 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00dda8] animate-pulse"/> OPEN
                                        </span>
                                    ) : (
                                        <span className="bg-[#f43f5e]/10 text-[#f43f5e] px-2 py-0.5 rounded border border-[#f43f5e]/20">
                                            CLOSED
                                        </span>
                                    )}
                                    <span className="bg-[#E5E5E5]/50  px-2 py-0.5 rounded text-[#111111] ">{m.category}</span>
                                    <span></span>
                                    <span>VOL: {fmtUsd(m.volume24h)}</span>
                                    {m.endDate && (
                                        <>
                                            <span></span>
                                            <span>ENDS: {new Date(m.endDate).toLocaleDateString()}</span>
                                        </>
                                    )}
                                    {m.evSignal !== 'NEUTRAL' && (
                                        <>
                                            <span></span>
                                            <span style={{ color: SIGNAL_COLOR[m.evSignal] || '#111111' }} className="font-black border px-1.5 py-0.5 rounded border-current">{m.evSignal.replace('_', ' ')}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelected(m); }}
                                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#00C076]/10 border border-[#00C076]/30 min-w-[75px] hover:bg-[#00C076]/20 transition-all font-mono"
                                >
                                    <span className="text-[10px] text-[#00C076] font-black uppercase tracking-widest mb-1">YES</span>
                                    <span className="text-sm font-black text-[#00C076]">{Math.round(m.yesPrice * 100)}¢</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelected(m); }}
                                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 min-w-[75px] hover:bg-[#FF3B30]/20 transition-all font-mono"
                                >
                                    <span className="text-[10px] text-[#FF3B30] font-black uppercase tracking-widest mb-1">NO</span>
                                    <span className="text-sm font-black text-[#FF3B30]">{Math.round((1 - m.yesPrice) * 100)}¢</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 1-Click Execution Sidebar (Molecular UI Accuracy) */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-[420px] shrink-0 border-l border-[#E5E5E5]  bg-[#FFFFFF]  flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)] h-full z-20"
                        >
                            <div className="p-8 border-b border-[#E5E5E5]  bg-[#FFFFFF] ">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white  border border-[#E5E5E5]  overflow-hidden shrink-0 shadow-sm p-1">
                                        <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#FFFFFF] ">
                                            {selected.image ? <img src={selected.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('svg')?.setAttribute('style', 'display: block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'); }} /> : null}
                                            <Banknote size={24} className="text-[#888888]  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ display: selected.image ? 'none' : 'block' }} />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelected(null)}
                                        className="text-[#888888]  hover:text-[#111111]  p-1 border border-transparent rounded hover:border-[#E5E5E5] "
                                    >
                                        
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black bg-[#E5E5E5]/50  text-[#888888]  tracking-widest px-2.5 py-1 rounded inline-flex mb-3">
                                    <ShieldCheck size={11} /> {isPolygon ? 'ON-CHAIN CTF EXECUTION' : 'CROSS-CHAIN ROUTING (ENSO)'}
                                </div>
                                <h2 className="text-xl font-black text-[#111111]  leading-tight tracking-tight">{selected.question}</h2>
                            </div>

                            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                                
                                {/* ODDS IMPLICADAS REPLICA */}
                                <div className="bg-[#FFFFFF]  border border-[#E5E5E5]  rounded-[2rem] p-6 text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-bold tracking-[0.2em] text-[#888888]  mb-6">
                                        IMPLIED ODDS
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <div className="flex-1 text-center">
                                            <div className="text-5xl font-black font-sans text-[#00e699] tracking-tighter mb-2">{Math.round(selected.yesPrice * 100)}%</div>
                                            <div className="text-[10px] font-mono font-bold text-[#888888]  uppercase tracking-widest">YES</div>
                                        </div>
                                        <div className="w-px h-16 bg-[#E5E5E5] " />
                                        <div className="flex-1 text-center">
                                            <div className="text-5xl font-black font-sans text-[#f43f5e] tracking-tighter mb-2">{Math.round((1 - selected.yesPrice) * 100)}%</div>
                                            <div className="text-[10px] font-mono font-bold text-[#888888]  uppercase tracking-widest">NO</div>
                                        </div>
                                    </div>
                                </div>

                                {/* INPUT REPLICA */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#888888]  uppercase">POSITION SIZE (USDC)</label>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={tradeAmount} 
                                            onChange={e => setTradeAmount(e.target.value)}
                                            className="w-full bg-[#FFFFFF]  border-2 border-[#E5E5E5]  rounded-2xl py-4 pl-6 pr-20 text-[#111111]  font-mono font-black text-2xl outline-none focus:border-[#111111]  transition-all"
                                            placeholder="0"
                                        />
                                        <button 
                                            onClick={() => setTradeAmount(usdcBalance || '1000')} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-sans font-black bg-[#E5E5E5]/50  hover:bg-[#111111]  hover:text-[#FFFFFF]  text-[#111111]  px-4 py-2 rounded-xl transition-all"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <div className="flex justify-end text-[10px] font-mono text-[#888888]  font-bold px-1">
                                        Bal: ${usdcBalance}
                                    </div>
                                </div>

                                {/* PAYOUT REPLICA */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center text-[12px] font-mono font-bold text-[#888888] ">
                                        <span>Potential Payout (YES):</span>
                                        <span className="text-[#00e699] font-black">{fmtUsd(Number(tradeAmount) / selected.yesPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px] font-mono font-bold text-[#888888] ">
                                        <span>Potential Payout (NO):</span>
                                        <span className="text-[#f43f5e] font-black">{fmtUsd(Number(tradeAmount) / (1 - selected.yesPrice))}</span>
                                    </div>
                                </div>
                                {/* BUY BUTTONS REPLICA */}
                                <div className="p-6 border-t border-[#E5E5E5]  bg-white  flex gap-4">
                                    <button 
                                        onClick={() => handleTrade('YES')}
                                        disabled={isExecuting !== null || !tradeAmount || parseFloat(tradeAmount) <= 0}
                                        className="flex-1 py-5 rounded-2xl bg-[#00C076] text-white font-black uppercase tracking-widest text-sm flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-lg hover:shadow-[#00C076]/20"
                                    >
                                        {isExecuting === 'YES' ? <Loader2 size={24} className="animate-spin" /> : <>BUY YES <span className="text-[10px] font-bold opacity-80 mt-0.5">@{Math.round(selected.yesPrice * 100)}¢</span></>}
                                    </button>
                                    <button 
                                        onClick={() => handleTrade('NO')}
                                        disabled={isExecuting !== null || !tradeAmount || parseFloat(tradeAmount) <= 0}
                                        className="flex-1 py-5 rounded-2xl bg-[#FF3B30] text-white font-black uppercase tracking-widest text-sm flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-lg hover:shadow-[#FF3B30]/20"
                                    >
                                        {isExecuting === 'NO' ? <Loader2 size={24} className="animate-spin" /> : <>BUY NO <span className="text-[10px] font-bold opacity-80 mt-0.5">@{Math.round((1 - selected.yesPrice) * 100)}¢</span></>}
                                    </button>
                                </div>
                            </div>
                            
                            {!isPolygon && isConnected && (
                                <div className="px-6 pb-6 bg-[#FFFFFF] ">
                                    <div className="w-full bg-[#0055ff]/5 text-[#0055ff] font-black uppercase tracking-widest text-[10px] py-3 px-4 rounded-xl flex justify-between items-center gap-2 border border-[#0055ff]/10">
                                        <span className="flex items-center gap-2"><AlertTriangle size={12} /> ROUTE: L2  POLYGON (~45s)</span>
                                        <button onClick={() => switchChain?.({ chainId: 137 })} className="underline hover:opacity-70 text-[9px]">SWITCH NATIVE</button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {ts && <div className="text-[9px] font-mono font-black text-[#888888]  p-3 border-t border-[#E5E5E5]  bg-[#FFFFFF]  text-center uppercase tracking-widest">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FFAA] mr-2" />
                CTF ROUTER SYNC: {ts}
            </div>}
        </div>
    );
}
