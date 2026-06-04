"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap } from 'lucide-react';

interface ChainPulseCardProps {
    chain: {
        id: string;
        name: string;
        color: string;
        type: string;
    };
    metrics?: {
        tps: number;
        health: number;
        isActive: boolean;
    };
    delay?: number;
}

export function ChainPulseCard({ chain, metrics, delay = 0, theme = 'default' }: ChainPulseCardProps & { theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const isDataAvailable = !!metrics;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, boxShadow: isArctic ? `0 20px 40px ${chain.color}10` : `0 20px 40px ${chain.color}15` }}
            className={`relative rounded-3xl p-5 group cursor-pointer transition-all overflow-hidden shadow-sm border ${isArctic ? 'bg-white/40 backdrop-blur-xl border-slate-200 hover:bg-white hover:border-indigo-200' : 'bg-white border-slate-200 hover:bg-black/5 hover:border-slate-300'}`}
        >
            {/* Background Pulse (Authentic) */}
            <motion.div
                animate={isDataAvailable && metrics.isActive ? { 
                    scale: [1, 1.05, 1],
                    opacity: [0.03, 0.08, 0.03]
                } : { opacity: 0 }}
                transition={{ duration: metrics && metrics.tps > 0 ? Math.max(0.5, 50 / metrics.tps) : 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ backgroundColor: chain.color }}
            />

            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ 
                                backgroundColor: isDataAvailable ? chain.color : '#cbd5e1',
                                boxShadow: isDataAvailable ? `0 0 10px ${chain.color}66` : 'none'
                            }} 
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                            {chain.name}
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                        {chain.type}
                    </span>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Velocity</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-lg font-black font-mono tracking-tighter drop-shadow-sm ${isDataAvailable ? 'text-slate-900' : 'text-slate-400'}`}>
                                {isDataAvailable ? metrics.tps.toFixed(1) : '---'}
                            </span>
                            {isDataAvailable && <span className="text-[8px] font-bold text-slate-500">TPS</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Integrity</p>
                        <span className={`text-[10px] font-black font-mono drop-shadow-sm ${isDataAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isDataAvailable ? `${metrics.health.toFixed(0)}%` : 'OFFLINE'}
                        </span>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isDataAvailable ? `${metrics.health}%` : '0%' }}
                        className="h-full"
                        style={{ backgroundColor: chain.color }}
                    />
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1">
                        <Zap size={10} className={metrics?.isActive ? "text-amber-500 shadow-sm rounded-full" : "text-slate-300"} />
                        <Shield size={10} className={isDataAvailable ? "text-indigo-500" : "text-slate-300"} />
                        <Activity size={10} className={isDataAvailable ? "text-rose-500" : "text-slate-300"} />
                    </div>
                    <span className={`text-[7px] font-mono uppercase tracking-widest ${isDataAvailable ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isDataAvailable ? 'Node Synchronized' : 'Waiting for Chain Layer'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
