"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Activity, Shield, Zap, Globe, Database, Cpu, PieChart } from 'lucide-react';
import { UniversalEliteWallpaper } from "@/components/shared/UniversalEliteWallpaper";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { NetworkStats } from "@/components/network/NetworkStats";
import { UniversalChainDistribution } from "@/components/network/UniversalChainDistribution";
import { LatestBlocks } from "@/components/network/LatestBlocks";
import { MempoolVisualizer } from "@/components/network/MempoolVisualizer";
import { WhaleWatch } from "@/components/network/WhaleWatch";
import { MultiversePortfolio } from "@/components/network/MultiversePortfolio";
import { LightningStats } from "@/components/network/LightningStats";
import { TopLightningNodes } from "@/components/network/TopLightningNodes";
import { MiningPoolDistribution } from "@/components/network/MiningPoolDistribution";
import { FusionMiningVisualizer } from "@/components/network/FusionMiningVisualizer";
import { HashrateVisualizer } from "@/components/network/HashrateVisualizer";
import Link from 'next/link';

export function UnifiedExplorerTerminal() {
    return (
        <div className="relative min-h-screen text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-transparent">
            <UniversalEliteWallpaper />
            
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Institutional Header is handled by ClientLayout */}
                
                <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 flex flex-col gap-12">
                    
                    {/* Header: Terminal Context */}
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity size={16} className="text-indigo-600 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">System Pulse Active</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase">
                            Unified <span className="text-slate-300">Network Grid</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 max-w-2xl">
                            Epoch 4 institutional grade synchronization. Resolving global liquidity, computational armor, and atomic execution layers in real-time.
                        </p>
                    </header>

                    {/* Section 1: Global Pulse (Epoch 3 & 4) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <Globe size={18} className="text-slate-400" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Global Pulse & Security</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <NetworkStats theme="arctic" />
                            <UniversalChainDistribution theme="arctic" />
                        </div>
                    </section>

                    {/* Section 2: Atomic Execution (Epoch 3) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <Database size={18} className="text-slate-400" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Atomic Ledger Execution</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            <LatestBlocks theme="arctic" />
                            <MempoolVisualizer theme="arctic" />
                        </div>
                    </section>

                    {/* Section 3: Liquidity Analytics (Epoch 2 & 3) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <Activity size={18} className="text-slate-400" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Whale Analytics & Flow</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                            <WhaleWatch theme="arctic" />
                            <MultiversePortfolio theme="arctic" />
                        </div>
                    </section>

                    {/* Section 4: Arterial Infrastructure (L2 & Mining) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <Zap size={18} className="text-slate-400" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Arterial Network Infrastructure</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            <LightningStats theme="arctic" />
                            <HashrateVisualizer theme="arctic" />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <TopLightningNodes theme="arctic" />
                        </div>
                    </section>

                    {/* Section 5: Computational Armor (Epoch 3) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <Cpu size={18} className="text-slate-400" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Fusion Pulse Visualizer</h2>
                        </div>
                        <FusionMiningVisualizer theme="arctic" />
                    </section>

                    {/* Section 6: Resource Allocation (Mining) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <PieChart size={18} className="text-slate-400" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Computational Resource Allocation</h2>
                        </div>
                        <MiningPoolDistribution theme="arctic" />
                    </section>

                </main>

                <footer className="py-12 px-8 border-t border-slate-100 bg-black/5/50 backdrop-blur-md">
                    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2">
                                <Landmark size={18} className="text-indigo-600" />
                                <span className="text-sm font-black text-slate-900 tracking-tighter">ARCTIC PROTOCOL</span>
                            </Link>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v4.2.0-STABLE</span>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Operational</span>
                            </div>
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                &copy; 2026 System Infrastructure Group
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
