"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { getParsedMarkets, RAW_NETWORKS } from '@/lib/data/markets-data';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenLogo } from '@/components/ui/TokenLogo';
import { useWhaleFeed } from '@/hooks/useWhaleFeed';
import {
    Activity, ArrowRightLeft, Database,
    Fingerprint, ChevronDown, ChevronUp, Search,
    Zap, Scale, Menu, X
} from 'lucide-react';
import { GlobalMarketSessions } from '@/components/premium/GlobalMarketSessions';
import { EliteAnalyticsNews } from '@/components/premium/EliteAnalyticsNews';
import { SplashContainer } from '@/components/shared/SplashContainer';

// ─── Whale Transaction Explorer ──────────────────────────────────────────────

function getExplorerLink(item: any) {
    const hash = item.hash;
    const chain = (item.chain || 'ETHEREUM').toUpperCase();
    if (chain === 'BITCOIN' || chain === 'BTC') return `/network/tx/${hash}`;
    if (chain === 'ETHEREUM' || chain === 'ETH') return `https://etherscan.io/tx/${hash}`;
    if (chain === 'SOLANA' || chain === 'SOL') return `https://solscan.io/tx/${hash}`;
    if (chain === 'BASE') return `https://basescan.org/tx/${hash}`;
    if (chain === 'POLYGON' || chain === 'MATIC') return `https://polygonscan.com/tx/${hash}`;
    if (chain === 'ARBITRUM') return `https://arbiscan.io/tx/${hash}`;
    if (chain === 'OPTIMISM') return `https://optimistic.etherscan.io/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
}

function TransactionRow({ item }: { item: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const auditLink = getExplorerLink(item);
    const dateObj = new Date(item.timestamp);
    const fullDateTime =
        dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) +
        ' ' +
        dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' UTC';

    return (
        <motion.div
            layout
            className="group border-b border-white/5 last:border-0 bg-transparent hover:bg-white/[0.03] transition-all duration-300"
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 cursor-pointer relative"
            >
                <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/8 shadow-sm group-hover:border-white/15 transition-colors">
                        {item.type?.includes('SELL') ? <Scale className="text-white/70" size={16} /> :
                         item.type?.includes('BUY')  ? <Zap   className="text-white/70" size={16} /> :
                         <Activity className="text-white/40" size={16} />}
                    </div>
                    {/* Mobile: show summary inline */}
                    <div className="sm:hidden flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{item.tier?.replace(' tier','') || 'INST'}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{item.type || 'TX'}</span>
                        </div>
                        <div className="text-[10px] font-mono font-black text-white/80 mt-0.5">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <div className="sm:hidden text-right">
                        <div className="text-sm font-black text-white/90">${item.usdValue?.toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2 w-full">
                    <div className="hidden sm:flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{item.tier?.replace(' tier','') || 'Sovereign'}</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{item.type || 'EXCHANGE TRANSFER'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <span className="text-lg sm:text-2xl font-black tracking-tighter text-white font-mono">
                            {item.amount?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            <span className="text-xs sm:text-sm text-white/40 ml-1.5 font-black">{item.asset}</span>
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-xl border border-white/6 w-full sm:w-auto">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white/40 truncate flex-1 sm:max-w-[110px]">{item.from}</span>
                            <ArrowRightLeft size={9} className="text-white/25 shrink-0" />
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white/40 truncate flex-1 sm:max-w-[110px]">{item.to}</span>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:block text-right space-y-1 shrink-0">
                    <div className="text-white text-lg font-black tracking-tighter font-mono">${item.usdValue?.toLocaleString()}</div>
                    <div className="text-white/35 text-[9px] font-black uppercase tracking-widest flex items-center justify-end gap-1.5">
                        <Database size={9} /> {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 text-white/25 group-hover:text-white/60 transition-colors p-1.5 rounded-full hover:bg-white/5">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white/[0.01] px-6 pb-8"
                    >
                        <div className="border-t border-white/5 pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em] bg-white/5 px-3 py-2 rounded-lg border border-white/10 self-start inline-block">
                                        {fullDateTime}
                                    </div>
                                    <div className="text-[9px] font-mono font-bold text-white/40 break-all bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                        {item.hash}
                                    </div>
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/35">Execution Fee</div>
                                        <div className="text-sm font-mono font-black text-white/80">
                                            {item.gasPriceGwei || (item.chain === 'BITCOIN' ? 'L1 Standard' : '0.00')} <span className="text-[10px] text-white/25">GWEI</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 md:border-l md:border-white/5 md:pl-8">
                                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                        <div className="text-[8px] font-black text-white/35 uppercase tracking-widest mb-1">Source</div>
                                        <div className="text-[10px] font-mono font-bold text-white/80 break-all">{item.from}</div>
                                    </div>
                                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                        <div className="text-[8px] font-black text-white/35 uppercase tracking-widest mb-1">Destination</div>
                                        <div className="text-[10px] font-mono font-bold text-white/80 break-all">{item.to}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-col items-center gap-4">
                                <div className="text-[11px] font-black text-white/80 flex items-center gap-2">
                                    <span className="text-white/40 font-bold">Valuation:</span>
                                    <span>${item.usdValue?.toLocaleString()} USD</span>
                                    <span className="text-white/20 mx-1">|</span>
                                    <span className="text-white/50">({(item.usdValue * 0.92).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR)</span>
                                </div>
                                <a
                                    href={auditLink}
                                    target={auditLink.startsWith('http') ? '_blank' : '_self'}
                                    rel={auditLink.startsWith('http') ? 'noopener noreferrer' : ''}
                                    className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                                >
                                    <Fingerprint size={14} /> Full Audit
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function WhaleTransactionExplorer() {
    const { unifiedWhaleFeed, isLoading } = useWhaleFeed();
    const [txSearch, setTxSearch] = useState('');
    const [txTab, setTxTab] = useState('ALL');
    const [showNews, setShowNews] = useState(false);

    const filtered = useMemo(() => {
        let result = unifiedWhaleFeed;
        if (txTab === 'TOKENS') result = result.filter(tx => tx.chain !== 'BITCOIN');
        if (txTab === 'BTC')    result = result.filter(tx => tx.chain === 'BITCOIN');
        if (txSearch) {
            const q = txSearch.toLowerCase();
            result = result.filter(tx =>
                tx.hash?.toLowerCase().includes(q) ||
                tx.from?.toLowerCase().includes(q) ||
                tx.to?.toLowerCase().includes(q) ||
                tx.asset?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [unifiedWhaleFeed, txSearch, txTab]);

    return (
        <div className="relative bg-[#050505] text-white/90 font-sans overflow-x-hidden">
            {/* News panel */}
            <AnimatePresence>
                {showNews && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowNews(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg z-[100] shadow-2xl"
                        >
                            <div className="absolute top-8 left-[-4.5rem] z-10">
                                <button
                                    onClick={() => setShowNews(false)}
                                    className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-110 transition-all active:scale-90 flex items-center justify-center group backdrop-blur-md"
                                >
                                    <X size={22} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                            <EliteAnalyticsNews />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="w-full max-w-[1400px] mx-auto flex flex-col px-6 sm:px-10 pt-16 pb-12 space-y-16">
                {/* Hero */}
                <div className="flex flex-col items-center text-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="w-48 h-48 flex items-center justify-center mx-auto relative group"
                    >
                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                        <SplashContainer className="w-full h-full transition-transform duration-500 scale-110 group-hover:scale-125 relative z-10 flex items-center justify-center">
                            <img src="/official-whale-monochrome.png" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" alt="Whale Network" />
                        </SplashContainer>
                    </motion.div>

                    <div className="space-y-3">
                        <h2 className="text-3xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-white">
                            Search your <span className="text-white/35">Transaction</span>
                        </h2>
                        <p className="text-[11px] text-white/40 uppercase tracking-[0.25em] font-black">Real-time on-chain intelligence · Multi-chain</p>
                    </div>

                    <div className="w-full flex justify-center">
                        <GlobalMarketSessions />
                    </div>

                    {/* Search input */}
                    <div className="w-full max-w-3xl relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/30 group-focus-within:text-white transition-colors">
                            <Search size={22} />
                        </div>
                        <input
                            value={txSearch}
                            onChange={(e) => setTxSearch(e.target.value)}
                            placeholder="QUERY BY TX HASH / WALLET SIGNATURE / ASSET..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold tracking-tight outline-none focus:border-white/40 focus:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all text-white placeholder:text-white/25 shadow-xl"
                        />
                    </div>
                </div>

                {/* Filter bar */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between border-b border-white/8 pb-6">
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
                            {['ALL', 'BTC', 'TOKENS'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setTxTab(tab)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap ${
                                        txTab === tab
                                        ? 'bg-white text-black shadow-lg scale-105'
                                        : 'bg-white/[0.03] text-white/35 border border-white/6 hover:text-white/80 hover:border-white/15'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-black text-white/35 uppercase tracking-widest mb-0.5">Observational Load</div>
                            <div className="text-sm font-mono font-black text-white/70">{filtered.length} Sequences</div>
                        </div>
                    </div>

                    {/* Transaction list */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="tx-list"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="bg-[#0a0a0a] border border-white/8 rounded-[2rem] overflow-hidden shadow-2xl"
                        >
                            {isLoading && (
                                <div className="h-[500px] flex flex-col items-center justify-center gap-8">
                                    <div className="w-12 h-12 border-4 border-white/5 border-t-white animate-spin rounded-full shadow-lg" />
                                    <div className="text-center space-y-2">
                                        <span className="block text-[11px] uppercase font-black tracking-[0.6em] text-white animate-pulse">Synchronizing Block Data</span>
                                        <span className="block text-[9px] font-black text-white/25 uppercase tracking-widest">Resolving Ledger State</span>
                                    </div>
                                </div>
                            )}

                            {!isLoading && filtered.length > 0 && (
                                <div className="divide-y divide-white/5">
                                    {filtered.slice(0, 50).map((tx, i) => (
                                        <TransactionRow key={tx.id || i} item={tx} />
                                    ))}
                                </div>
                            )}

                            {!isLoading && filtered.length === 0 && (
                                <div className="h-[500px] flex flex-col items-center justify-center gap-8 opacity-25">
                                    <div className="p-8 bg-white/[0.02] rounded-[3rem] border border-white/5">
                                        <Database size={60} className="text-white/20" />
                                    </div>
                                    <span className="text-sm uppercase font-black tracking-[0.5em] text-white/40">No results</span>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ─── Token Markets Table ──────────────────────────────────────────────────────

export function InstitutionalMarkets() {
    const [tokens, setTokens] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filterChain, setFilterChain] = useState<string | null>(null);
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortDesc, setSortDesc] = useState(true);
    const [showChainDropdown, setShowChainDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeSection, setActiveSection] = useState<'markets' | 'explorer'>('markets');
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        setTokens(getParsedMarkets());
    }, []);

    const parseNum = (val: string) => {
        const cleaned = val.replace(/[^0-9.-]/g, '');
        let num = parseFloat(cleaned);
        if (val.includes('B')) num *= 1e9;
        if (val.includes('M')) num *= 1e6;
        if (val.includes('T')) num *= 1e12;
        if (val.includes('K')) num *= 1e3;
        return isNaN(num) ? 0 : num;
    };

    const sortedAndFiltered = useMemo(() => {
        let result = tokens;
        if (filterChain) result = result.filter(t => t.network === filterChain);
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(t => t.name.toLowerCase().includes(term) || t.ticker.toLowerCase().includes(term));
        }
        if (sortCol) {
            result = [...result].sort((a, b) => {
                let aVal: number, bVal: number;
                switch(sortCol) {
                    case 'Price':       aVal = parseNum(a.price);       bVal = parseNum(b.price);       break;
                    case '24h change':  aVal = parseNum(a.change24h);   bVal = parseNum(b.change24h);   break;
                    case 'Market cap':  aVal = parseNum(a.mcap);        bVal = parseNum(b.mcap);        break;
                    case 'Circulation': aVal = parseNum(a.circulation); bVal = parseNum(b.circulation); break;
                    default: aVal = 0; bVal = 0;
                }
                if (aVal < bVal) return sortDesc ? 1 : -1;
                if (aVal > bVal) return sortDesc ? -1 : 1;
                return 0;
            });
        }
        return result;
    }, [tokens, search, filterChain, sortCol, sortDesc]);

    const handleSort = (col: string) => {
        if (sortCol === col) setSortDesc(!sortDesc);
        else { setSortCol(col); setSortDesc(true); }
    };

    const isNegative = (chg: string) => chg.startsWith('-');

    const totalPages = Math.ceil(sortedAndFiltered.length / ITEMS_PER_PAGE);
    const paginatedAssets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedAndFiltered.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedAndFiltered, currentPage]);

    return (
        <div className="w-full h-full min-h-0 flex flex-col bg-white text-[#050505] font-mono overflow-hidden transition-colors">

            {/* ── Section Switcher ─────────────────────────── */}
            <div className="flex-shrink-0 border-b border-[#E5E5E5] bg-[#FAFAFA] px-4 md:px-8 pt-4 pb-0">
                <div className="max-w-[1400px] mx-auto flex items-center gap-1">
                    {[
                        { id: 'markets',  label: 'Markets',              tag: '[MKT]' },
                        { id: 'explorer', label: 'Transaction Explorer', tag: '[EXP]' },
                    ].map(sec => (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id as 'markets' | 'explorer')}
                            className={`relative px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeSection === sec.id
                                    ? 'text-[#050505]'
                                    : 'text-[#999999] hover:text-[#555555]'
                            }`}
                        >
                            {activeSection === sec.id && (
                                <motion.div
                                    layoutId="marketsSectionUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#050505] rounded-t-full"
                                />
                            )}
                            <span className="font-mono text-[9px] opacity-50 mr-1.5">{sec.tag}</span>
                            {sec.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Section Content ──────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeSection === 'markets' ? (
                    <motion.div
                        key="markets"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 min-h-0 flex flex-col p-4 md:p-8 overflow-hidden"
                    >
                        {/* Header / Search & Filter */}
                        <div className="max-w-[1400px] mx-auto w-full flex-shrink-0">
                            <div className="flex flex-col md:flex-row gap-4 mt-2 relative z-20">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="font-mono text-[10px] font-black text-[#888888]">[SCH]</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-11 pr-4 py-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl text-[13px] text-[#050505] focus:outline-none focus:ring-1 focus:ring-[#050505] transition-all font-mono"
                                        placeholder="Filter by name, ticker, or contract address"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowChainDropdown(!showChainDropdown)}
                                            className="flex items-center gap-2 px-5 py-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl text-[13px] font-bold text-[#050505] hover:bg-[#E5E5E5] transition-colors"
                                        >
                                            {filterChain ? filterChain : 'Blockchain'}
                                            <span className="font-mono text-[10px] font-black opacity-50">[v]</span>
                                        </button>

                                        <AnimatePresence>
                                            {showChainDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-64 max-h-[300px] overflow-y-auto bg-white border border-[#E5E5E5] shadow-2xl rounded-xl z-50 py-2"
                                                >
                                                    <div className="px-4 py-2 border-b border-[#E5E5E5] sticky top-0 bg-white font-black text-[10px] text-[#888888] tracking-widest uppercase">Select Network</div>
                                                    {RAW_NETWORKS.map(net => (
                                                        <button
                                                            key={net}
                                                            onClick={() => { setFilterChain(net); setShowChainDropdown(false); }}
                                                            className={`w-full text-left px-4 py-2 text-[12px] hover:bg-[#F0F0F0] transition-colors ${filterChain === net ? 'font-bold bg-[#F9F9F9]' : ''}`}
                                                        >
                                                            {net}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <button
                                        onClick={() => { setFilterChain(null); setSearch(''); }}
                                        className="flex items-center justify-center p-3 text-[#888888] hover:text-[#050505] bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl transition-colors group"
                                        title="Reset filters"
                                    >
                                        <span className="font-mono text-[10px] font-black group-hover:scale-110 transition-transform duration-500">[RST]</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0 mt-6 md:mt-8 border border-[#E5E5E5] rounded-2xl overflow-hidden bg-white shadow-sm relative z-10">
                            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-4 border-b border-[#E5E5E5] bg-[#F9F9F9] text-[11px] font-black text-[#888888] uppercase tracking-widest sticky top-0 z-10">
                                <div className="cursor-pointer hover:text-[#050505] flex items-center" onClick={() => handleSort('Token')}>Token <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                                <div className="cursor-pointer hover:text-[#050505] flex items-center justify-end text-right" onClick={() => handleSort('Price')}>Price <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                                <div className="cursor-pointer hover:text-[#050505] flex items-center justify-end text-right" onClick={() => handleSort('24h change')}>24h change <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                                <div className="cursor-pointer hover:text-[#050505] flex items-center justify-end text-right" onClick={() => handleSort('Market cap')}>Market cap <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                                <div className="cursor-pointer hover:text-[#050505] flex items-center justify-end text-right" onClick={() => handleSort('Circulation')}>Circulation <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {paginatedAssets.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[12px] text-[#888888] uppercase tracking-widest font-black">
                                        NO ASSETS FOUND FOR SELECTED CRITERIA
                                    </div>
                                ) : (
                                    paginatedAssets.map((t, idx) => (
                                        <div key={idx} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] p-4 md:px-6 md:py-4 border-b border-[#F0F0F0] hover:bg-[#F9F9F9] transition-colors md:items-center gap-3 md:gap-0">
                                            <div className="flex items-center justify-between md:justify-start gap-4 min-w-0">
                                                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                    <TokenLogo
                                                        symbol={t.ticker}
                                                        name={t.name}
                                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-inner shrink-0"
                                                        fallbackClassName="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[12px] md:text-[14px] font-black shrink-0 text-[#050505] shadow-inner"
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[14px] md:text-[15px] font-bold truncate text-[#050505]">{t.name}</span>
                                                        <span className="text-[11px] text-[#888888] uppercase tracking-wide">{t.ticker}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end md:hidden">
                                                    <div className="text-right text-[14px] font-bold text-[#050505]">{t.price} <span className="text-[10px] text-[#888888] font-normal">{t.currencyPrice}</span></div>
                                                    <div className={`text-right text-[12px] font-bold ${isNegative(t.change24h) ? 'text-black opacity-60' : 'text-black'}`}>{t.change24h}</div>
                                                </div>
                                            </div>

                                            <div className="hidden md:block text-right text-[14px] font-bold text-[#050505]">{t.price} <span className="text-[10px] text-[#888888] font-normal">{t.currencyPrice}</span></div>
                                            <div className={`hidden md:block text-right text-[14px] font-bold ${isNegative(t.change24h) ? 'text-black opacity-60' : 'text-black'}`}>{t.change24h}</div>

                                            <div className="flex items-center justify-between md:hidden pt-3 border-t border-[#F0F0F0]">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-[#888888] uppercase font-black tracking-widest mb-0.5">Market Cap</span>
                                                    <div className="text-[13px] font-bold text-[#050505]">{t.mcap} <span className="text-[9px] text-[#888888] font-normal">{t.mcapCurrency}</span></div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] text-[#888888] uppercase font-black tracking-widest mb-0.5">Circulation</span>
                                                    <div className="text-[13px] font-bold text-[#050505]">{t.circulation}</div>
                                                </div>
                                            </div>

                                            <div className="hidden md:block text-right text-[14px] font-bold text-[#050505]">{t.mcap} <span className="text-[10px] text-[#888888] font-normal">{t.mcapCurrency}</span></div>
                                            <div className="hidden md:block text-right text-[14px] font-bold text-[#050505]">{t.circulation}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 mt-4 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl max-w-[1400px] mx-auto w-full flex-shrink-0">
                                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-[#E5E5E5] bg-white rounded-lg text-[10px] font-black uppercase tracking-widest text-[#050505]/60 hover:text-[#050505] disabled:opacity-30 disabled:pointer-events-none transition-colors">Previous</button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-[#E5E5E5] bg-white rounded-lg text-[10px] font-black uppercase tracking-widest text-[#050505]/60 hover:text-[#050505] disabled:opacity-30 disabled:pointer-events-none transition-colors">Next</button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="explorer"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 min-h-0 overflow-y-auto"
                    >
                        <WhaleTransactionExplorer />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
