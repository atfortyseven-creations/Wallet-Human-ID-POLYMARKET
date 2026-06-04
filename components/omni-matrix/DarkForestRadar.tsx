"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Activity, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

export function DarkForestRadar() {
    const { data, isLoading } = useQuery({
        queryKey: ['dark-forest'],
        queryFn: async () => {
            const res = await fetch('/api/network/dark-forest');
            if (!res.ok) throw new Error('Dark Forest API Failed');
            return res.json();
        },
        refetchInterval: 15000,
    });

    return (
        <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-slate-200 relative overflow-hidden group shadow-sm">
            {/* Background Radar Pulse */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-[400px] h-[400px] rounded-full border border-red-500 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <div className="absolute w-[200px] h-[200px] rounded-full border border-red-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            </div>

            <div className="relative z-10 flex items-center justify-between mb-6 border-b border-red-500/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                        <Crosshair size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Dark Forest Radar</h3>
                        <p className="text-[10px] text-red-500 uppercase tracking-widest">Real-Time MEV Extraction</p>
                    </div>
                </div>
                {isLoading ? (
                    <div className="w-4 h-4 rounded-full border-t-2 border-red-500 animate-spin" />
                ) : (
                    <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">${data?.total_extracted_usd?.toLocaleString() || 0}</div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Extracted / Last Block</p>
                    </div>
                )}
            </div>

            <div className="space-y-3 relative z-10 hidden sm:block">
                {(data?.incidents || []).slice(0, 4).map((incident: any, idx: number) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={incident.hash} 
                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border-l-2 border-red-500/50 hover:bg-red-500/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Activity size={14} className="text-red-500" />
                            <div>
                                <div className="text-xs font-black text-slate-900 uppercase tracking-wider">{incident.type}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{incident.to.substring(0, 12)}...</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-red-500">${incident.extracted_usd.toLocaleString()}</div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest">Bribe: {incident.priority_fee_gwei} Gwei</div>
                        </div>
                    </motion.div>
                ))}
                
                {data?.incidents?.length === 0 && !isLoading && (
                    <div className="text-center py-6">
                        <ShieldAlert size={24} className="text-emerald-500/50 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mempool Clear. No attacks detected.</p>
                    </div>
                )}
            </div>
            {/* Mobile simplified view */}
            <div className="sm:hidden text-center py-4">
               <span className="text-xs text-red-400 uppercase tracking-widest">{data?.mev_detected || 0} Attacks Detected</span>
            </div>
        </div>
    );
}
