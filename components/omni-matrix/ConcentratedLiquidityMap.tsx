"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function ConcentratedLiquidityMap() {
    const { data, isLoading } = useQuery({
        queryKey: ['liquidity-heatmap'],
        queryFn: async () => {
            const res = await fetch('/api/network/liquidity/heatmap');
            if (!res.ok) throw new Error('Liquidity API Failed');
            return res.json();
        },
        refetchInterval: 60000,
    });

    return (
        <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-slate-200 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
            
            <div className="relative z-10 flex items-center justify-between mb-6 border-b border-emerald-500/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Layers size={18} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Deep Liquidity Map</h3>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-widest">Smart Money Concentration</p>
                    </div>
                </div>
                {isLoading ? (
                    <div className="w-4 h-4 border-t-2 border-emerald-500 rounded-full animate-spin" />
                ) : (
                    <div className="text-right">
                        <div className="text-sm font-black text-slate-900">{data?.pool}</div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active Pool</p>
                    </div>
                )}
            </div>

            <div className="relative z-10 space-y-2 h-[240px] overflow-y-auto custom-scrollbar pr-2">
                {(data?.concentrations || []).map((node: any, idx: number) => (
                    <motion.div 
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={node.tickIndex} 
                        className="flex items-center gap-4 group"
                    >
                        <div className="w-20 text-right">
                            <span className="text-xs font-mono text-slate-600">${node.priceAsset0}</span>
                        </div>
                        
                        <div className="flex-1 h-6 bg-black/5 rounded-r-sm overflow-hidden border-l border-slate-200 relative flex items-center">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, node.concentration * 2)}%` }}
                                transition={{ duration: 1, delay: 0.5 + (idx * 0.05) }}
                                className={`absolute left-0 top-0 bottom-0 ${
                                    node.type === "RESISTANCE" ? "bg-red-500/30 border-r border-red-500" : "bg-emerald-500/30 border-r border-emerald-500"
                                }`}
                            />
                            <div className="relative z-10 px-2 flex justify-between w-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black uppercase text-slate-900 tracking-widest">{node.type} Wall</span>
                                <Activity size={10} className={node.type === "RESISTANCE" ? "text-red-500" : "text-emerald-600"} />
                            </div>
                        </div>
                    </motion.div>
                ))}

                {data?.concentrations?.length === 0 && !isLoading && (
                    <div className="text-center py-6 h-full flex flex-col items-center justify-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Awaiting On-Chain Sync.</p>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 4px; }
            `}</style>
        </div>
    );
}
