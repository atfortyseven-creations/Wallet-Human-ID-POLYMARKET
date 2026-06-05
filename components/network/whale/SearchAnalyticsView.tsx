"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Shield, Target, TrendingUp, AlertTriangle, 
    Globe, Zap, Cpu, Database, Fingerprint, Activity,
    ChevronDown, ChevronUp, ExternalLink, ArrowRight,
    ArrowRightLeft, Radar, Search
} from 'lucide-react';

interface SearchAnalyticsViewProps {
    result: any;
    onClose: () => void;
}

/**
 *  LEGENDARY SEARCH ANALYTICS VIEW 
 * Elite-grade visualization for deep on-chain discovery.
 */
export function SearchAnalyticsView({ result, onClose }: SearchAnalyticsViewProps) {
    if (!result) return null;

    const { type, query, analytics, forensics, data, chain } = result;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 30, opacity: 0 }}
                    className="w-full max-w-[2560px] mx-auto text-left h-[85vh] bg-[#0a0a0f] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
                >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between p-8 lg:p-10 border-b border-white/5 gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0">
                                {type === 'ADDRESS' ? <Fingerprint size={32} className="text-black" /> : <Database size={32} className="text-black" />}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Real-Time Forensic Scan</span>
                                    <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">Active</div>
                                </div>
                                <h1 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-white mt-1 break-all truncate">{query}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Globe size={12} className="text-white/20" />
                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{chain} Network</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                        <div className="grid lg:grid-cols-12 gap-10">
                            
                            {/* Analytics Sidebar */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Elite Profile</p>
                                        <h3 className="text-2xl font-black tracking-tight">{forensics?.label || 'UNKNOWN ENTITY'}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-1">
                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Risk Score</div>
                                            <div className={`text-3xl font-black font-mono tracking-tighter ${analytics?.riskScore > 70 ? 'text-red-400' : 'text-white/80'}`}>
                                                {analytics?.riskScore || 0}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-1">
                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Trust Index</div>
                                            <div className="text-3xl font-black font-mono tracking-tighter text-[#ef4444]">
                                                {analytics?.trustScore || 100}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em]">
                                            <span className="text-white/40">Market Impact</span>
                                            <span className="text-white">{analytics?.impact || 'LOW'}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${analytics?.EliteConfidence || 50}%` }}
                                                className="h-full bg-gradient-to-r from-[#ef4444] via-[#ef4444]/80 to-white/20"
                                            />
                                        </div>
                                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Elite Alpha Confidence</p>
                                    </div>

                                    {/* Token Breakdown - Legendary Visual */}
                                    {type === 'ADDRESS' && data?.breakdown && Object.keys(data.breakdown).length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-4">Portfolio Allocation</h4>
                                            <div className="flex flex-wrap gap-3 px-2">
                                                {Object.entries(data.breakdown as Record<string, number>)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .slice(0, 5)
                                                    .map(([symbol, value], i) => (
                                                        <motion.div
                                                            key={symbol}
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: i * 0.1, type: 'spring' }}
                                                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 group hover:bg-white/10 transition-colors"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                            <span className="text-[10px] font-black text-white/80">{symbol}</span>
                                                            <span className="text-[9px] font-mono text-white/20 group-hover:text-white/40 transition-colors">{value.toFixed(1)}%</span>
                                                        </motion.div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-4">Forensic Signal Stream</h4>
                                    <div className="space-y-3">
                                        {forensics?.signals?.map((sig: any, i: number) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-start gap-4"
                                            >
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sig.type === 'negative' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : sig.type === 'positive' ? 'bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'bg-white/20'}`} />
                                                <div>
                                                    <div className="text-xs font-black uppercase text-white/80 leading-none mb-1.5">{sig.title}</div>
                                                    <div className="text-[10px] text-white/40 leading-relaxed font-medium">{sig.description}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Analytics Body */}
                            <div className="lg:col-span-8 space-y-10">
                                
                                {/* Deep Insight Box */}
                                <div className="bg-indigo-500/[0.03] border border-indigo-500/20 rounded-[3rem] p-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8">
                                            <Activity size={48} className="text-[#ef4444]/10 group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Target className="text-[#ef4444]" size={24} />
                                            <h4 className="text-sm font-black uppercase tracking-[0.4em] text-white/60">Executive On-Chain Summary</h4>
                                        </div>
                                        <p className="text-xl lg:text-3xl text-white/80 font-medium tracking-tight leading-tight max-w-2xl italic">
                                            "{forensics?.summary || 'Deep indexers are calibrating additional data points for this specific query.'}"
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center gap-10 pt-6">
                                            {type === 'ADDRESS' && (
                                                <>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-none">Capital Under Management</div>
                                                        <div className="text-3xl font-black font-mono tracking-tighter text-white">
                                                            ${(data?.totalValue || 0).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="w-px h-12 bg-white/10 hidden sm:block" />
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-none">Execution History</div>
                                                        <div className="text-3xl font-black font-mono tracking-tighter text-white">
                                                            {data?.txCount || 0} <span className="text-xs text-white/20 font-black">SIGS</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {type === 'TRANSACTION' && (
                                                <>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-none">Transfer Liquidity</div>
                                                        <div className="text-3xl font-black font-mono tracking-tighter text-white">
                                                            ${(data?.valueUsd || 0).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="w-px h-12 bg-white/10 hidden sm:block" />
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-none">Asset Classification</div>
                                                        <div className="text-3xl font-black font-mono tracking-tighter text-[#ef4444]">
                                                            {data?.token || 'NATIVE'}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Flow / Telemetry Visual */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Analytics Stream Output</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Real-Time Sync</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                                        {type === 'ADDRESS' && data?.recentTransfers && (
                                            <div className="divide-y divide-white/5">
                                                {data.recentTransfers.slice(0, 8).map((tx: any, i: number) => (
                                                    <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 bg-white/[0.03] ${tx.type === 'IN' ? 'text-white' : 'text-red-400'}`}>
                                                                <TrendingUp size={16} className={tx.type === 'OUT' ? 'rotate-180' : ''} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-white tracking-tight">{tx.amount.toFixed(4)} {tx.token}</div>
                                                                <div className="text-[10px] text-white/20 font-mono mt-1 group-hover:text-white/40 transition-colors uppercase tracking-widest">{tx.hash.slice(0, 24)}...</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-black font-mono text-white/80">${tx.valueUsd.toLocaleString()}</div>
                                                            <div className="text-[10px] text-white/20 uppercase font-black mt-1">{new Date(tx.timestamp).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {type === 'TRANSACTION' && data && (
                                            <div className="p-10 space-y-10">
                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <div className="space-y-6">
                                                        <div className="p-6 bg-white/5 rounded-3xl border border-emerald-500/20">
                                                            <div className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                <Shield size={10} /> Origin Node
                                                            </div>
                                                            <div className="text-xs font-mono text-white/60 break-all select-all leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">{data.from_address}</div>
                                                        </div>
                                                        <div className="flex justify-center -my-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 animate-bounce">
                                                                <ChevronDown size={14} className="text-white/20" />
                                                            </div>
                                                        </div>
                                                        <div className="p-6 bg-white/5 rounded-3xl border border-indigo-500/20">
                                                            <div className="text-[10px] text-[#ef4444] font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                <Shield size={10} /> Destination Node
                                                            </div>
                                                            <div className="text-xs font-mono text-white/60 break-all select-all leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">{data.to_address}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 flex flex-col justify-between">
                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center text-[#ef4444] border border-[#ef4444]/30">
                                                                    <Cpu size={20} />
                                                                </div>
                                                                <div className="text-sm font-black uppercase tracking-widest text-white/60">EVM Telemetry</div>
                                                            </div>
                                                            <div className="grid gap-6">
                                                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Network Fee</span>
                                                                    <span className="text-sm font-black font-mono text-white/80">{(data.gas_price / 1e9).toFixed(1)} GWEI</span>
                                                                </div>
                                                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Block Height</span>
                                                                    <span className="text-sm font-black font-mono text-white/80">#{data.block_number}</span>
                                                                </div>
                                                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Smart Contract</span>
                                                                    <span className="text-sm font-black font-mono text-[#ef4444] uppercase tracking-tighter truncate max-w-[150px]">{data.method_label || 'DIRECT_TRANSFER'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <a 
                                                            href={`https://etherscan.io/tx/${query}`}
                                                            target="_blank"
                                                            className="flex items-center justify-center gap-3 py-4 bg-white font-black text-[10px] text-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/90 transition-all mt-8"
                                                        >
                                                            <ExternalLink size={12} /> Source Verification
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
