"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useVIPStore } from '@/lib/vip-store';
import { Copy, Check, ExternalLink, Activity } from 'lucide-react';

export function LegendaryWhaleLeaderboard() {
    const { leaderboard500, whaleEvents } = useVIPStore();
    const [copied, setCopied] = React.useState<string | null>(null);
    const [isExpanded, setIsExpanded] = React.useState(false);

    const rankings = React.useMemo(() => {
        if (!leaderboard500 || leaderboard500.length === 0) return [];
        return leaderboard500.slice(0, isExpanded ? 500 : 50);
    }, [leaderboard500, isExpanded]);

    const copyToClipboard = (wallet: string) => {
        navigator.clipboard.writeText(wallet);
        setCopied(wallet);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatEuros = (usdFormat: number) => {
        return `${(usdFormat / 1.09 / 1000000).toFixed(2)}M`;
    };

    const getLatestTxForWallet = (wallet: string) => {
        return whaleEvents?.find(e => e.wallet.toLowerCase() === wallet.toLowerCase());
    }

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 group h-full transition-all duration-500 hover:border-cyan-500/30">
            <div className="p-6 border-b border-slate-100 bg-black/5/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Performance (Real-Time)</span>
            </div>
            
            <div className={`divide-y divide-slate-100 overflow-y-auto custom-scrollbar transition-all duration-500 ${isExpanded ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
                {rankings.map((rank, i) => {
                    const latestTx = getLatestTxForWallet(rank.address);
                    const pnlDisplay = rank.pnlUsd || 0;
                    const pnlColor = pnlDisplay > 0 ? 'text-green-500' : pnlDisplay < 0 ? 'text-red-500' : 'text-slate-400';
                    const pnlPrefix = pnlDisplay > 0 ? '+' : '';
                    
                    return (
                        <div key={rank.address} className="p-4 flex items-center gap-6 hover:bg-black/5 transition-colors group/row">
                            <span className="text-xl font-black text-slate-200 group-hover/row:text-cyan-500/20 transition-colors w-8">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 truncate w-[140px]">{rank.label}</span>
                                    <span className="text-[9px] font-mono text-slate-400">{rank.address.slice(0, 8)}...{rank.address.slice(-6)}</span>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(rank.address)}
                                    className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-300 hover:text-cyan-500"
                                >
                                    {copied === rank.address ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                            </div>

                            <div className="flex-1 flex items-center justify-between gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real PNL (24h)</span>
                                    <span className={`text-sm font-black ${pnlColor} font-mono tracking-tighter`}>
                                        {pnlPrefix}{formatEuros(pnlDisplay)}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</span>
                                    <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">
                                        {formatEuros(rank.volume24h || 0)}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right min-w-[80px]">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reliability</span>
                                    <span className="text-xs font-bold text-slate-600">
                                        {rank.txCount > 50 ? 'ELITE' : 'ACTIVE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {rankings.length === 0 && (
                <div className="p-12 text-center space-y-4">
                    <Activity className="mx-auto text-slate-200 animate-pulse" size={40} />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scanning Blockchain for Whales...</p>
                </div>
            )}

            {!isExpanded && rankings.length > 0 && (
                <div className="p-4 bg-black/5/50 border-t border-slate-100">
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="w-full py-4 border border-dashed border-slate-200 bg-white rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-cyan-500 hover:text-cyan-600 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        View Full Tactical Ranking (+450 Entities)
                        <ExternalLink size={12} className="group-hover/btn:translate-y-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}
