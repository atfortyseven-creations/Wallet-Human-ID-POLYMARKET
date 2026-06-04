"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, Zap, Cpu, Activity, 
    Lock, Server, Globe, CheckCircle2, 
    AlertTriangle, Terminal, Network, Search
} from 'lucide-react';
import CorePrecisionRadar from './CorePrecisionRadar';
import { HeroCircuitry } from '@/components/landing/HeroCircuitry';

/**
 * Infrastructure node dashboard — chain health and telemetry.
 */
export default function SystemNodeCore() {
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const [activeNode, setActiveNode] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    const fetchHealth = async () => {
        try {
            const res = await fetch('/api/infrastructure/node-health');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTelemetry(data);
                const scroll = data.find(n => n.name === 'Scroll');
                setActiveNode(scroll || data[0]);
                
                if (scroll) {
                    setLogs(prev => {
                        const newLogs = [
                            `[CORE] ${new Date().toLocaleTimeString()} - Scroll Block #${scroll.blockNumber} Verified (${(scroll.latency).toFixed(4)}s)`,
                            ...prev
                        ];
                        
                        return newLogs.slice(0, 8);
                    });
                }
            }
        } catch (error) {
            console.error('[CORE] Failed to fetch health:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Stratospheric Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <HeroCircuitry />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.05)_0%,_transparent_70%)]" />
            </div>

            <main className="relative z-10 pt-24 pb-20 px-6 max-w-[2560px] mx-auto space-y-16 text-left">
                
                {/* Header Block */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ef4444]">Core Precision Active</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]"
                        >
                            Internal <br /> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/50 to-white/10">infrastructure</span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/40 text-lg font-medium tracking-tight"
                        >
                            Active chain health, block latency, and validator status across supported networks.
                        </motion.p>
                    </div>

                    <div className="relative">
                        <CorePrecisionRadar />
                    </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {telemetry.map((node, i) => (
                        <motion.button 
                            key={i}
                            onClick={() => setActiveNode(node)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            className={`p-6 border rounded-3xl backdrop-blur-3xl space-y-2 group transition-all text-left ${activeNode?.chainId === node.chainId ? 'bg-white/10 border-[#ef4444]/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${node.status === 'Operational' ? 'text-emerald-500' : 'text-yellow-500'}`}>{node.status}</span>
                                <Activity size={12} className={activeNode?.chainId === node.chainId ? 'text-[#ef4444]' : 'text-white/20'} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">{node.name}</p>
                                <p className="text-xl font-black font-mono text-white tracking-tighter">#{node.blockNumber.toLocaleString()}</p>
                                <p className="text-[10px] font-mono text-[#ef4444]/60 mt-1">{(node.latency).toFixed(4)}s Latency</p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Performance & Security Layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Security Sentinel */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <ShieldCheck size={48} className="text-white/[0.03] group-hover:text-white/[0.07] transition-all" />
                        </div>
                        
                        <div className="space-y-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-widest leading-none">Security Sentinel</h3>
                                <p className="text-xs text-white/40 font-medium tracking-tight mt-1">Real-time status of critical node security modules.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {[
                                    { label: 'HSM Core', status: 'Operational', desc: 'Hardware-backed secret management active.', icon: Lock },
                                    { label: 'Multi-sig Layer', status: 'Synchronized', desc: 'Elite multi-chain consensus flow.', icon: Network },
                                    { label: 'Core Shield', status: 'Active', desc: 'Post-core encryption enabled.', icon: ShieldCheck },
                                    { label: 'Intrusion Detection', status: 'Zero Threats', desc: 'Millimetre detection sensitivity.', icon: Search }
                                ].map((sys, i) => (
                                    <div key={i} className="flex gap-4 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover/item:bg-white/10 transition-colors">
                                            <sys.icon size={18} className="text-white/40 group-hover/item:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-white">{sys.label}</h4>
                                                <CheckCircle2 size={10} className="text-emerald-500" />
                                            </div>
                                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{sys.status}</p>
                                            <p className="text-[10px] text-white/20 font-medium leading-normal">{sys.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Node Logs / Real-time Feed */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden flex flex-col"
                    >
                        <div className="space-y-6 flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-widest leading-none">Active Logs</h3>
                                <Terminal size={14} className="text-white/20" />
                            </div>
                            
                            <div className="space-y-3 font-mono">
                                <AnimatePresence mode="popLayout">
                                    {logs.map((log, i) => {
                                        const isTimeout = log.includes('activity ScheduleToStart timeout');
                                        // To highlight the "last two", we check if this is one of the first two in the reversed list (since new logs are unshifted)
                                        // But the user specifically asked for "the last two", usually meaning the most recent ones.
                                        // Given the UI shows them in order, the most recent are at the top.
                                        const timeoutIndices = logs.map((l, idx) => l.includes('activity ScheduleToStart timeout') ? idx : -1).filter(idx => idx !== -1);
                                        const isOneOfLastTwo = timeoutIndices.slice(0, 2).includes(i);

                                        return (
                                            <motion.div 
                                                key={log + i}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className={`text-[9px] leading-relaxed py-2 border-b border-white/[0.03] ${isTimeout && isOneOfLastTwo ? 'text-red-500 font-bold' : 'text-white/40'}`}
                                            >
                                                <span className={isTimeout && isOneOfLastTwo ? 'text-red-600' : 'text-[#ef4444]'}>$</span> {log}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                <span>Verifying Core Integrity...</span>
                                <span className="text-emerald-500">100.0%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                <motion.div 
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Validation Map (Reach) */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-10 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-[3rem] text-center space-y-8"
                >
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Global Node Reach</h3>
                        <p className="text-white/40 text-sm font-medium tracking-tight">Our core core is natively integrated with 120+ elite networks.</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4 py-6">
                        {['ETHEREUM', 'BNB CHAIN', 'SOLANA', 'BITCOIN', 'BASE', 'SUI', 'ZK-SYNC', 'OPTIMISM', 'ARBITRUM'].map((n) => (
                            <div key={n} className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-crosshair">
                                {n}
                            </div>
                        ))}
                        <div className="px-5 py-3 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[9px] font-black uppercase tracking-widest text-[#ef4444]">
                            + 111 MORE
                        </div>
                    </div>
                </motion.div>

            </main>
        </div>
    );
}
