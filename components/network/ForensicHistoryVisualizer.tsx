"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Database, Server } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useState, useEffect } from 'react';

// Forensic hook for 'Legendary' polish
const useForensicHistory = () => {
    const [data, setData] = useState<any[]>([]);
    const [currentStatus, setCurrentStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch('/api/network/forensics/history');
                const json = await res.json();
                if (json.status === 'success') {
                    setData(json.history);
                    setCurrentStatus(json.current);
                }
            } catch (e) {
                console.error("Forensic data fetch failed", e);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    return { data, currentStatus, loading };
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
            <p className="text-white/50 text-[10px] uppercase font-black tracking-widest mb-3">
                {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
                    <span className="text-[10px] font-bold uppercase" style={{ color: entry.color }}>
                        {entry.name}
                    </span>
                    <span className="font-mono font-black text-white text-sm">
                        {entry.value.toFixed(2)}%
                    </span>
                </div>
            ))}
        </div>
    );
};

export function ForensicHistoryVisualizer() {
    const { data, currentStatus, loading } = useForensicHistory();

    return (
        <div className="mt-12">
            <div className="flex flex-col md:flex-row items-end justify-between border-b border-white/10 pb-8 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                            <Database size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">30-Day Retention</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
                        Advanced Forensic<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">History Visualizer</span>
                    </h3>
                </div>
                <div className="flex items-center gap-6 mt-6 md:mt-0">
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">L1 Block (ETH)</p>
                        <p className="text-xl font-black font-mono text-emerald-400">{currentStatus?.l1Block || '00000000'}</p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">L2 Block (BASE)</p>
                        <p className="text-xl font-black font-mono text-indigo-400">{currentStatus?.l2Block || '00000000'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="h-[400px] w-full relative z-10">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <Activity className="animate-spin text-indigo-500/20" size={48} />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorL1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorL2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorZK" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    stroke="rgba(255,255,255,0.1)"
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="transparent" 
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}
                                    domain={[70, 100]}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                
                                <Area type="monotone" dataKey="l1Settlement" name="L1 Finality" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorL1)" />
                                <Area type="monotone" dataKey="l2Compression" name="L2 Sequencer" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorL2)" />
                                <Area type="monotone" dataKey="zkProofs" name="ZK Validity" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorZK)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/5">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Server size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-white/50 mb-1">ETH Gas Price</p>
                            <p className="text-sm text-white/80 font-medium font-mono">{currentStatus?.l1Gas || '0.00'} Gwei</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><ShieldCheck size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-white/50 mb-1">Network Compression</p>
                            <p className="text-sm text-white/80 font-medium">Real-time L2 batching efficiency anchored to Base Mainnet sequence.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Activity size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-white/50 mb-1">State Validity</p>
                            <p className="text-sm text-white/80 font-medium">Cryptographic finality verified via on-chain contract state roots.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
