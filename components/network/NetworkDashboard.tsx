"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { NetworkStats } from '@/components/network/NetworkStats';
import { LatestBlocks } from '@/components/network/LatestBlocks';
import { MempoolVisualizer } from '@/components/network/MempoolVisualizer';
import { LightningStats } from '@/components/network/LightningStats';
import { HashrateVisualizer } from '@/components/network/HashrateVisualizer';
import { NetworkSearch } from '@/components/network/NetworkSearch';
import { FeeEstimator } from '@/components/network/FeeEstimator';
import { WhaleWatch } from '@/components/network/WhaleWatch';
import { NetworkTabs } from '@/components/network/NetworkTabs';
import { FusionMiningVisualizer } from '@/components/network/FusionMiningVisualizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';

export function NetworkDashboard() {
    return (
        <div className="min-h-screen bg-transparent text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Arctic Protocol Wallpaper */}
            <div className="fixed inset-0 z-0">
                <UniversalEliteWallpaper />
            </div>

            <div className="relative z-10 pt-32 pb-32 px-6 max-w-[2560px] mx-auto space-y-24 text-left">
                <NetworkTabs />

                {/* Visualizer strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <FusionMiningVisualizer />
                </motion.div>

                {/* Page title block  editorial style */}
                <div className="border-b border-slate-100 pb-16 flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="space-y-8"
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-4">
                                Distributed Ledger Verification
                            </p>
                            <h1 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none uppercase">
                                Protocol<br />
                                <span className="text-indigo-600">Observation</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-lg leading-relaxed max-w-xl font-medium">
                            Real-time auditing of Account Status transitions. Precision forensic analysis of block propagation, fee markets, and settlement finality.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="shrink-0 w-full md:w-auto"
                    >
                        <NetworkSearch />
                    </motion.div>
                </div>

                {/* Key metrics */}
                <div>
                    <NetworkStats />
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
                    {/* Primary: blocks */}
                    <div className="flex flex-col gap-12">
                        <LatestBlocks />
                    </div>

                    {/* Secondary: live signals */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-black/5 border border-slate-100 rounded-[2.5rem] p-2">
                            <FeeEstimator />
                        </div>

                        <div className="bg-black/5 border border-slate-100 rounded-[2.5rem] overflow-hidden p-8 shadow-sm">
                            <MempoolVisualizer />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <LightningStats />
                            <HashrateVisualizer />
                        </div>

                        <div className="flex-grow min-h-[300px]">
                            <WhaleWatch />
                        </div>

                        {/* Quick nav */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { href: '/network/blocks', label: 'Blocks' },
                                { href: '/network/mining', label: 'Mining' },
                                { href: '/network/lightning', label: 'Nodes' },
                            ].map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="h-14 flex items-center justify-center border border-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-950 hover:bg-black/5 hover:border-slate-200 transition-all"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
