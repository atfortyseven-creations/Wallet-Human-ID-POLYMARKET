"use client";

import { motion, useMotionValue, animate, useSpring } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { NetworkTabs } from '@/components/network/NetworkTabs';
import { OnChainFlowPanel } from '@/components/network/OnChainFlowPanel';
import { NetworkHealthRadar } from '@/components/network/NetworkHealthRadar';
import { FeeHistoryHeatmap } from '@/components/network/FeeHistoryHeatmap';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import { BarChart3, TrendingUp, TrendingDown, Zap, Shield, Cpu, Activity, Globe, Database, Hash, Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useVIPStore } from '@/lib/vip-store';

//  Animated Number 
function AnimNumber({ value, decimals = 0, prefix = '', suffix = '' }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
    const mv = useMotionValue(0);
    const [disp, setDisp] = useState('0');
    useEffect(() => {
        if (!value) return;
        const ctrl = animate(mv, value, { duration: 1.5, ease: 'easeOut' });
        const unsub = mv.on('change', v => setDisp(v.toFixed(decimals)));
        return () => { ctrl.stop(); unsub(); };
    }, [value]);
    return <span>{prefix}{disp}{suffix}</span>;
}

//  Health Score Ring 
function HealthScoreRing({ score }: { score: number }) {
    const R = 80;
    const C = 2 * Math.PI * R;
    const color = score >= 80 ? '#4f46e5' : score >= 60 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'VALIDATED' : score >= 60 ? 'OBSERVING' : 'STRESSED';

    return (
        <div className="relative w-52 h-52 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={R} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                <motion.circle cx="100" cy="100" r={R} fill="none"
                    stroke={color} strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C * (1 - score / 100) }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                />
                
                {Array.from({ length: 36 }).map((_, i) => {
                    const angle = (i / 36) * Math.PI * 2;
                    const r1 = 95, r2 = i % 9 === 0 ? 86 : 90;
                    return (
                        <line key={i}
                            x1={100 + Math.cos(angle) * r1} y1={100 + Math.sin(angle) * r1}
                            x2={100 + Math.cos(angle) * r2} y2={100 + Math.sin(angle) * r2}
                            stroke="#e2e8f0" strokeWidth="1" />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-black font-mono text-slate-950">
                    <AnimNumber value={score} />
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color }}>{label}</div>
                <div className="text-[9px] text-slate-300 uppercase tracking-widest">Protocol Health</div>
            </div>
        </div>
    );
}

//  Scanning Line Effect 
function ScanLine() {
    return (
        <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-600/10 to-transparent pointer-events-none"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
    );
}

//  Floating Hex Particle 
function HexParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i}
                    className="absolute text-indigo-600/5 font-mono text-[10px] font-bold"
                    style={{ left: `${10 + (i % 4) * 25}%`, top: `${10 + Math.floor(i / 4) * 35}%` }}
                    animate={{ opacity: [0.3, 0.6, 0.3], y: [-5, 5, -5] }}
                    transition={{ duration: 4 + i * 0.3, delay: i * 0.4, repeat: Infinity }}>
                    {['0x4A2', 'BTC', 'SHA256', 'lock', '0xE1F', 'UTXO', 'MVRV', 'NVT', 'S2F', 'HODL', 'DIFF', 'MWU'][i]}
                </motion.div>
            ))}
        </div>
    );
}

//  Active Price Ticker 
function ActivePriceTicker() {
    const { ethPrice, btcPrice, gasGwei, blockNumber } = useVIPStore();
    const items = [
        { label: 'BTC', value: btcPrice ? `$${btcPrice.toLocaleString()}` : '$104,000', color: '#0f172a', icon: <Hash size={12} /> },
        { label: 'ETH', value: ethPrice ? `$${ethPrice.toLocaleString()}` : '$3,300', color: '#0f172a', icon: <Zap size={12} /> },
        { label: 'GAS', value: gasGwei ? `${gasGwei.toFixed(1)} Gwei` : '', color: '#0f172a', icon: <Activity size={12} /> },
        { label: 'BLOCK', value: blockNumber ? `#${blockNumber.toLocaleString()}` : '', color: '#0f172a', icon: <Database size={12} /> },
    ];
    return (
        <div className="flex flex-wrap items-center gap-2">
            {items.map(item => (
                <motion.div key={item.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 bg-black/5"
                    whileHover={{ scale: 1.05 }}>
                    <span className="text-indigo-600">{item.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                    <span className="text-[11px] font-black font-mono text-slate-950">{item.value}</span>
                </motion.div>
            ))}
        </div>
    );
}

//  Macro Insight Card 
function InsightCard({ icon: Icon, title, value, sub, color, glow, delay = 0, trend }: {
    icon: any; title: string; value: string; sub: string; color: string; glow: string; delay?: number; trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
            className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all cursor-default overflow-hidden">
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon size={14} className="text-slate-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{title}</span>
                    </div>
                    {trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                    {trend === 'down' && <TrendingDown size={12} className="text-rose-500" />}
                </div>
                <div className="text-2xl font-black font-mono text-slate-950 tracking-tighter">{value}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{sub}</div>
            </div>
        </motion.div>
    );
}

//  Network Signal Bars 
function SignalBars({ level, color }: { level: number; color: string }) {
    return (
        <div className="flex items-end gap-0.5 h-5">
            {[1, 2, 3, 4, 5].map(i => (
                <motion.div key={i}
                    className="w-1.5 rounded-sm"
                    style={{ height: `${i * 20}%`, background: i <= level ? color : '#f1f5f9' }}
                    initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }} />
            ))}
        </div>
    );
}

//  Main Dashboard 
export function AnalyticsDashboard() {
    const { gasGwei, ethPrice, btcPrice } = useVIPStore();

    const healthScore = gasGwei
        ? Math.max(30, Math.min(100, 100 - (gasGwei / 3)))
        : 78;

    const networkStatus = healthScore >= 80 ? 'OPTIMAL' : healthScore >= 60 ? 'ELEVATED' : 'CONGESTED';
    const statusColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Minimalist Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            </div>

            <div className="max-w-[2560px] mx-auto space-y-24 relative z-10 pt-32 pb-32 px-6 text-left">
                <NetworkTabs />

                {/* Hero Header */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[4rem] overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-200 p-12 lg:p-20">
                    <HexParticles />
                    <ScanLine />
                    <div className="relative z-10 flex flex-col xl:flex-row items-center gap-16">
                        <HealthScoreRing score={Math.round(healthScore)} />
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                    <BarChart3 size={24} className="text-indigo-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Data Synthesis Center</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none uppercase">
                                Flow<br /><span className="text-indigo-600">Forensics</span>
                            </h1>
                            <p className="text-slate-500 text-xl leading-relaxed max-w-2xl font-medium">
                                Advanced on-chain telemetry and global capital migration. Dynamic monitoring of protocol health, liquidation vectors, and institutional positioning.
                            </p>
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex items-center gap-4 px-6 py-3 rounded-[1.5rem] border border-slate-100 bg-black/5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 12px ${statusColor}40` }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: statusColor }}>
                                        State: {networkStatus}
                                    </span>
                                    <SignalBars level={healthScore >= 80 ? 5 : healthScore >= 60 ? 3 : 2} color={statusColor} />
                                </div>
                                <ActivePriceTicker />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Macro KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InsightCard icon={Cpu}           title="Congestion Index"   value={gasGwei ? `${gasGwei.toFixed(0)} Gwei` : ''}    sub="Settlement Load"                  color="#f59e0b" glow="rgba(245,158,11,0.2)" delay={0.0} trend="up" />
                    <InsightCard icon={Globe}          title="Ecosystem Dominance" value="54.2%"                                            sub="Capital Concentration"            color="#f97316" glow="rgba(249,115,22,0.2)" delay={0.05} trend="up" />
                    <InsightCard icon={Shield}         title="Valuation Signal"    value="2.14"                                             sub="Macro MVRV Index"                 color="#6366f1" glow="rgba(99,102,241,0.2)" delay={0.1} trend="neutral" />
                    <InsightCard icon={Activity}       title="Capital Flow"        value="0.58"                                             sub="Sentiment Momentum"               color="#00ff9d" glow="rgba(0,255,157,0.2)" delay={0.15} trend="up" />
                    <InsightCard icon={Database}       title="Network Entity"      value="189.4M"                                           sub="Active Identifiers"               color="#a78bfa" glow="rgba(167,139,250,0.2)" delay={0.2} />
                    <InsightCard icon={Hash}           title="Growth Projection"   value="48.3×"                                            sub="Estimated Multiplier"             color="#facc15" glow="rgba(250,204,21,0.2)" delay={0.25} trend="up" />
                    <InsightCard icon={AlertTriangle}  title="Operational Index"   value="0.94"                                             sub="Interaction Yield"                color="#fb923c" glow="rgba(251,146,60,0.2)" delay={0.3} trend="neutral" />
                    <InsightCard icon={Clock}          title="Retention Trend"     value="65%"                                              sub="Legacy Position"                  color="#34d399" glow="rgba(52,211,153,0.2)" delay={0.35} trend="up" />
                </div>

                {/* On-Chain Flow Panel */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-10">
                    <div className="flex items-end justify-between border-b border-slate-100 pb-8 mx-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Flow Analytics</p>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight">On-Chain Forensic Panel</h2>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-sm">
                        <OnChainFlowPanel />
                    </div>
                </motion.div>

                {/* Radar + Heatmap */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    <div className="xl:col-span-1 bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                            <Shield size={16} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">Network Health Radar</span>
                        </div>
                        <div className="p-8">
                            <NetworkHealthRadar />
                        </div>
                    </div>
                    <div className="xl:col-span-2 bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                            <BarChart3 size={16} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">Interaction Intensity Heatmap</span>
                        </div>
                        <div className="p-8">
                            <FeeHistoryHeatmap />
                        </div>
                    </div>
                </motion.div>

                {/* Disclaimer */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="text-center pt-16 border-t border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Data synthesized from decentralized indexers and mempool state.
                        All analytics are provided for professional situational awareness and do not constitute financial advice.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
