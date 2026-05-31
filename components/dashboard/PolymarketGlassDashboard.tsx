"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck,
    AlertTriangle,
    Loader2,
    Brain,
    Activity as ActivityIcon,
    Globe
} from "lucide-react";
import { useChainId } from "wagmi";
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { polygon } from "wagmi/chains";
import { useRealWalletData } from "@/hooks/useRealWalletData";
import { usePolymarketSession } from "@/hooks/usePolymarketSession";
import { usePolymarketOrderbook } from "@/hooks/usePolymarketOrderbook";
import { usePolymarketTrade } from "@/hooks/usePolymarketTrade";
import { usePolymarketMarkets, PolymarketMarket } from "@/hooks/usePolymarketMarkets";
import SendModal from "@/components/wallet/SendModal";
import ReceiveModal from "@/components/wallet/ReceiveModal";
import NetworkSwitcher from "@/components/wallet/NetworkSwitcher";
import { Toaster, toast } from "sonner";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    },
};

export default function PolymarketGlassDashboard({ embedded = false }: { embedded?: boolean }) {
    const { address: web3Address } = useAccount();
    const chainId = useChainId();
    const isPolygon = chainId === polygon.id;

    const { isProxyEnabled, login } = usePolymarketSession();
    
    // Real Data Hooks L1
    const { totalBalance: portfolioValue, usdcBalance, address } = useRealWalletData([], web3Address);
    
    // Dynamic Markets L1
    const { markets, isLoading: isMarketsLoading, error: marketsError } = usePolymarketMarkets();
    const [selectedMarket, setSelectedMarket] = useState<PolymarketMarket | null>(null);
    const [currentMarketPage, setCurrentMarketPage] = useState(1);

    // Default auto-select top market
    useEffect(() => {
        if (!selectedMarket && markets.length > 0) {
            setSelectedMarket(markets[0]);
        }
    }, [markets, selectedMarket]);

    // Derived logic dynamically from live endpoints
    const activeTokenIdYes = selectedMarket?.tokens[0]?.token_id || "";
    const activeTokenIdNo = selectedMarket?.tokens[1]?.token_id || "";

    const { orderBook, isLoading: isBookLoading } = usePolymarketOrderbook(isPolygon ? activeTokenIdYes : "");
    const { trade, status: tradeStatus } = usePolymarketTrade();

    const [side, setSide] = useState<"YES" | "NO">("YES");
    const [amount, setAmount] = useState("");

    // Modals
    const [isSendOpen, setIsSendOpen] = useState(false);
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);

    const handleTrade = () => {
        if (!isPolygon || !selectedMarket) return;
        
        // Anti-latency precision check
        const activeTokenIdToTrade = side === "YES" ? activeTokenIdYes : activeTokenIdNo;
        if (!activeTokenIdToTrade) {
             toast.error("Cryptographic Error: Unrecognized Token ID for this market.");
             return;
        }

        const bestPrice = side === "YES"
            ? (orderBook.asks[0]?.price || 0.5)
            : (1 - (orderBook.bids[0]?.price || 0.5));

        const sanitizedAmount = amount.trim();
        if (!sanitizedAmount || isNaN(parseFloat(sanitizedAmount))) {
            toast.error("Invalid amount.");
            return;
        }

        trade("BUY", sanitizedAmount, bestPrice, activeTokenIdToTrade);
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className={`w-full h-full min-h-0 text-[#050505] font-sans selection:bg-[#050505]/20 flex flex-col overflow-hidden ${embedded ? '' : 'p-4 md:p-6'}`}
        >
            <Toaster position="bottom-right" theme="light" richColors />

            <SendModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
            <ReceiveModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} />

            {/* A. IVORY HEADER */}
            {!embedded && (
                <motion.header
                    variants={itemVariants}
                    className="shrink-0 px-6 pt-5 pb-4 mb-4 flex items-center justify-between border border-[#E5E5E5] rounded-2xl bg-[#FFFFFF] shadow-sm"
                >
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#050505]">
                                Prediction Network
                            </h1>
                        </div>
                        <p className="text-[10px] text-[#050505]/40 font-bold uppercase tracking-[0.2em] leading-tight">
                            Decentralized oracle consensus mapping probability vectors.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NetworkSwitcher />
                        <div className="hidden md:flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            <ActivityIcon size={14} className={isPolygon ? 'text-emerald-600 animate-pulse' : 'text-[#050505]/30'} />
                            <span className="text-xs font-black tracking-widest text-emerald-700 uppercase">
                                {isPolygon ? "L1 Connectivity: Native" : "Cross-Chain Relayed"}
                            </span>
                        </div>
                    </div>
                </motion.header>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-2">

                {/* B. PORTFOLIO & DYNAMIC MARKETS AREA */}
                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
                    <div className="relative p-8 rounded-[28px] bg-[#FFFFFF] border border-[#E5E5E5] shadow-sm overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <Globe className="w-32 h-32 text-[#050505]" />
                        </div>

                        <h2 className="text-xs uppercase tracking-[0.3em] text-[#050505]/40 font-black mb-2">Total Portfolio Value</h2>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-[#050505]">
                                ${portfolioValue}
                            </span>
                        </div>

                        <div className="mt-6 flex space-x-8 items-end relative z-10">
                            <div className="flex-1">
                                <p className="text-[10px] text-emerald-700 uppercase tracking-[0.2em] mb-1 font-black">L1 Liquid Capital (USDC)</p>
                                <p className="text-2xl font-black font-mono text-emerald-600">${usdcBalance}</p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsSendOpen(true)}
                                    className="px-5 py-2.5 rounded-xl bg-[#050505] text-[#FFFFFF] hover:bg-[#050505]/80 border border-[#050505] flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105"
                                >
                                    <ArrowUpRight className="w-4 h-4" /> Send
                                </button>
                                <button
                                    onClick={() => setIsReceiveOpen(true)}
                                    className="px-5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFFFFF] border border-[#E5E5E5] flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-sm transition-all hover:scale-105 text-[#050505]"
                                >
                                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> Receive
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC MARKETS FROM L1 REST API */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-[#050505]/50 uppercase tracking-[0.25em] flex items-center gap-2">
                                <Globe size={14} className="text-[#050505]/30" />
                                L1 Market Terminal
                            </h3>
                            {isMarketsLoading && (
                                <div className="flex items-center gap-2 text-emerald-600 text-[9px] uppercase tracking-widest font-black animate-pulse">
                                    <Loader2 size={12} className="animate-spin" /> Syncing CLOB Nodes...
                                </div>
                            )}
                            {marketsError && (
                                <div className="flex items-center gap-2 text-rose-600 text-[10px] uppercase font-black tracking-widest">
                                    <AlertTriangle size={12} /> {marketsError}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {markets.slice((currentMarketPage - 1) * 8, currentMarketPage * 8).map((market, i) => {
                                const isSelected = selectedMarket?.condition_id === market.condition_id;
                                return (
                                    <motion.div 
                                        key={market.condition_id}
                                        onClick={() => setSelectedMarket(market)}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`p-5 rounded-[1.5rem] bg-[#FFFFFF] transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full border shadow-sm ${isSelected ? 'border-emerald-300 shadow-emerald-50' : 'border-[#E5E5E5] hover:border-[#050505]/20 hover:shadow-md'}`}
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                            <Brain size={48} className="text-[#050505]" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="text-[10px] font-black text-[#050505]/40 uppercase tracking-widest">
                                                On-Chain Event //
                                            </div>
                                            {isSelected && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-100">Active Link</span>}
                                        </div>
                                        <h4 className="text-sm font-black text-[#050505] line-clamp-3 leading-snug">
                                            {market.question}
                                        </h4>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-[9px] font-mono text-[#050505]/30 uppercase">{market.condition_id.slice(0, 10)}...</div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'border-emerald-300 bg-emerald-50' : 'border-[#E5E5E5] bg-[#FFFFFF] group-hover:border-[#050505]/20'}`}>
                                                <ArrowUpRight size={14} className={isSelected ? 'text-emerald-600' : 'text-[#050505]/40'} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {!isMarketsLoading && markets.length === 0 && !marketsError && (
                                <div className="col-span-full py-12 text-center text-[#050505]/30 font-black uppercase tracking-widest text-xs">
                                    No active markets synchronized in the local node currently.
                                </div>
                            )}
                        </div>

                        {/* MARKETS PAGINATION */}
                        {markets.length > 8 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentMarketPage(p => Math.max(1, p - 1))}
                                    disabled={currentMarketPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-black uppercase text-[#050505]/50 hover:text-[#050505]"
                                >
                                    Prev
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.ceil(markets.length / 8) }).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentMarketPage(idx + 1)}
                                            className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-mono font-black transition-colors ${currentMarketPage === idx + 1 ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-[#FFFFFF] border border-[#E5E5E5] text-[#050505]/40 hover:bg-black/5 hover:text-[#050505]'}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentMarketPage(p => Math.min(Math.ceil(markets.length / 8), p + 1))}
                                    disabled={currentMarketPage === Math.ceil(markets.length / 8)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-black uppercase text-[#050505]/50 hover:text-[#050505]"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* C. THE EXECUTION TERMINAL L1 */}
                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4">

                    {!isPolygon ? (
                        <div className="p-8 rounded-[2rem] bg-[#FFFFFF] border border-[#E5E5E5] shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[320px]">
                            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                                <ActivityIcon className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-black uppercase text-[#050505] tracking-widest">Jurisdictional Halt</h3>
                            <p className="text-[#050505]/50 font-bold text-xs max-w-[220px] uppercase tracking-wider">
                                Orderbook routing restricted. Please switch to Polygon network.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* PROXY SECURE HANDSHAKE */}
                            {!isProxyEnabled && (
                                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start space-x-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-700 mb-1">Handshake Required</h3>
                                        <p className="text-[10px] text-[#050505]/50 mb-3 font-medium">Asymmetric vault disables injections without EIP-712 Proxy.</p>
                                        <button
                                            onClick={login}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors"
                                        >
                                            Authorize Channel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 rounded-[2rem] bg-[#FFFFFF] border border-[#E5E5E5] shadow-sm h-full flex flex-col">
                                <div className="mb-6 border-b border-[#E5E5E5] pb-6">
                                    <h3 className="text-[10px] font-black text-[#050505]/50 uppercase tracking-[0.2em] mb-2 flex items-center space-x-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        <span>Active Orderbook  CLOB L1</span>
                                    </h3>
                                    <p className="text-sm font-black text-[#050505] leading-tight">
                                        {selectedMarket ? selectedMarket.question : "Select market to track liquidity"}
                                    </p>
                                </div>

                                {/* VISUAL ORDERBOOK MULTIMETRIC */}
                                <div className="space-y-1 mb-6 font-mono text-[11px] font-bold tracking-tight">
                                    {(isBookLoading && orderBook.asks.length === 0) && (
                                        <div className="text-center py-6 text-[#050505]/40 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Loader2 size={12} className="animate-spin text-emerald-600" /> Analyzing block...
                                        </div>
                                    )}

                                    {/* ASKS (SELLERS) - RED */}
                                    <div className="space-y-1 p-2 rounded-xl bg-rose-50 border border-rose-100">
                                        {orderBook.asks.slice(0, 3).reverse().map((ask, i) => (
                                            <div key={i} className="flex justify-between text-rose-600 relative items-center h-6 px-2">
                                                <span className="z-10">{parseFloat(ask.price.toString()).toFixed(2)}¢</span>
                                                <span className="z-10 text-rose-400">{ask.size.toFixed(0)}</span>
                                                <div
                                                    className="absolute right-0 top-0 h-full bg-rose-500/10 rounded"
                                                    style={{ width: `${Math.min((ask.size / 6000) * 100, 100)}%` }}
                                                />
                                            </div>
                                        ))}
                                        {orderBook.asks.length === 0 && !isBookLoading && <div className="text-[#050505]/20 text-center italic py-2">Empty</div>}
                                    </div>

                                    <div className="py-2 text-center text-[9px] text-[#050505]/30 font-black tracking-[0.3em] uppercase">Mid Spread</div>

                                    {/* BIDS (BUYERS) - GREEN */}
                                    <div className="space-y-1 p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                                        {orderBook.bids.slice(0, 3).map((bid, i) => (
                                            <div key={i} className="flex justify-between text-emerald-600 relative items-center h-6 px-2">
                                                <span className="z-10">{parseFloat(bid.price.toString()).toFixed(2)}¢</span>
                                                <span className="z-10 text-emerald-400">{bid.size.toFixed(0)}</span>
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-emerald-500/10 rounded"
                                                    style={{ width: `${Math.min((bid.size / 6000) * 100, 100)}%` }}
                                                />
                                            </div>
                                        ))}
                                        {orderBook.bids.length === 0 && !isBookLoading && <div className="text-[#050505]/20 text-center italic py-2">Empty</div>}
                                    </div>
                                </div>

                                {/* ACTION PANEL */}
                                <div className="mt-auto">
                                    <div className="p-1 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] flex mb-6">
                                        <button
                                            onClick={() => setSide("YES")}
                                            className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${side === "YES" ? "bg-emerald-600 text-white shadow-sm" : "text-[#050505]/40 hover:text-[#050505]"}`}
                                        >
                                            BUY YES
                                        </button>
                                        <button
                                            onClick={() => setSide("NO")}
                                            className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${side === "NO" ? "bg-rose-600 text-white shadow-sm" : "text-[#050505]/40 hover:text-[#050505]"}`}
                                        >
                                            BUY NO
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] text-[#050505]/50 uppercase font-black tracking-widest">L1 Allocation (USDC)</label>
                                            <div className="relative mt-2">
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl py-4 pl-4 pr-12 text-2xl font-black font-mono text-[#050505] focus:outline-none focus:border-[#050505] transition-colors placeholder:text-[#050505]/20"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <span className="text-[10px] font-black tracking-widest text-[#050505]/40">USDC</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-[11px] py-1 border-t border-[#E5E5E5] pt-4 font-bold uppercase tracking-widest">
                                            <span className="text-[#050505]/40">Projected Shares</span>
                                            <span className="text-[#050505] font-mono">{amount ? (parseFloat(amount) / 0.65).toFixed(2) : "0.00"}</span>
                                        </div>

                                        <button
                                            onClick={handleTrade}
                                            disabled={tradeStatus === "APPROVING" || tradeStatus === "SIGNING" || tradeStatus === "POSTING" || !amount || !selectedMarket}
                                            className="w-full py-4 rounded-xl bg-[#050505] text-white font-black uppercase tracking-widest text-[11px] transition-all hover:bg-[#050505]/80 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
                                        >
                                            {tradeStatus === "APPROVING" && <><Loader2 className="animate-spin w-4 h-4" /> EIP-2612 Signature...</>}
                                            {tradeStatus === "SIGNING" && <><Loader2 className="animate-spin w-4 h-4" /> ECDSA Handshake...</>}
                                            {tradeStatus === "POSTING" && <><Loader2 className="animate-spin w-4 h-4" /> Routing L1...</>}
                                            {tradeStatus === "SUCCESS" && "Trade Settled"}
                                            {tradeStatus === "IDLE" && "SIGN & SUBMIT L1 ORDER"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
            </div>
        </motion.div>
    );
}
