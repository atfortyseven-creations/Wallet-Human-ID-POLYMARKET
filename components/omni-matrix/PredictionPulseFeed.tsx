"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function PredictionPulseFeed() {
    const { data, isLoading } = useQuery({
        queryKey: ['prediction-whales'],
        queryFn: async () => {
            const res = await fetch('/api/network/polymarket/whales');
            if (!res.ok) throw new Error('Prediction API Failed');
            return res.json();
        },
        refetchInterval: 30000,
    });

    return (
        <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-slate-200 relative overflow-hidden shadow-sm">
            {/* Aesthetic Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-6 border-b border-indigo-500/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Globe size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Prediction Whales</h3>
                        <p className="text-[10px] text-indigo-600 uppercase tracking-widest">Global Events Edge</p>
                    </div>
                </div>
                {isLoading && <div className="w-4 h-4 border-t-2 border-indigo-500 rounded-full animate-spin" />}
            </div>

            <div className="space-y-4 relative z-10">
                {(data?.whales || []).slice(0, 4).map((whale: any, idx: number) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={whale.address} 
                        className="p-3 rounded-xl bg-black/5 border border-slate-100 hover:border-indigo-300 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <img 
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${whale.address}&backgroundColor=e2e8f0`} 
                                alt="Whale" 
                                className="w-8 h-8 rounded-full border border-slate-200"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{whale.action}</span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-[8px] font-black text-indigo-600 uppercase border border-indigo-100">
                                        {whale.market}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{whale.address.substring(0, 8)}...</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-emerald-600">${whale.volume_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end mt-0.5">
                                <Clock size={8} /> LIVE
                            </div>
                        </div>
                    </motion.div>
                ))}

                {data?.whales?.length === 0 && !isLoading && (
                    <div className="text-center py-6">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">No massive predictions intercepted.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
