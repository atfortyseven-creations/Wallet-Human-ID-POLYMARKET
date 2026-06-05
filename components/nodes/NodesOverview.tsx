"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Shield, Zap, Cpu, Server, Globe, 
    ExternalLink, ArrowRight, Settings, Activity,
    Database, Filter, ChevronRight, CheckCircle2
} from 'lucide-react';
import { NODE_SOLUTIONS, NodeSolution } from '@/lib/constants/node-data';
import { HeroCircuitry } from '@/components/landing/HeroCircuitry';

/**
 *  DEDICATED NODE INFRASTRUCTURE OVERVIEW 
 * Elite platform for private blockchain nodes.
 */
export default function NodesOverview() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('ALL');

    const categories = ['ALL', 'EVM', 'L2', 'ZK', 'NON-EVM'];

    const filteredNodes = useMemo(() => {
        return NODE_SOLUTIONS.filter(node => {
            const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                node.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'ALL' || node.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Stratospheric Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <HeroCircuitry />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
            </div>

            <main className="relative z-10 pt-32 pb-20 px-6 max-w-[2560px] mx-auto space-y-20 text-left">
                
                {/* Hero Block */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
                    >
                        <Shield size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Elite Grade Infrastructure</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none"
                    >
                        Dedicated <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/40 to-white/10">Nodes</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 text-lg lg:text-xl font-medium tracking-tight max-w-2xl mx-auto"
                    >
                        Provision private, untethered blockchain infrastructure with 99.9%+ SLA and mission-critical performance control.
                    </motion.p>
                </div>

                {/* Selling Points Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Private Infra', desc: 'Dedicated resources with full performance control.', icon: Server, color: 'text-indigo-400' },
                        { title: 'Flexible Config', desc: 'Add-ons, plugins, and custom region APIs.', icon: Settings, color: 'text-purple-400' },
                        { title: 'Untethered Speed', desc: 'Unlimited request volume with zero throttling.', icon: Zap, color: 'text-yellow-400' },
                        { title: '99.9%+ Uptime', desc: 'High-availability clusters with redundancy.', icon: Activity, color: 'text-emerald-400' }
                    ].map((point, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl space-y-4 hover:border-white/10 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <point.icon size={20} className={point.color} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">{point.title}</h4>
                                <p className="text-xs text-white/40 font-medium leading-relaxed mt-1">{point.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search & Filter Bar */}
                <div className="sticky top-24 z-50 bg-black/40 backdrop-blur-3xl p-4 rounded-[2rem] border border-white/5 flex flex-col lg:flex-row items-center gap-6 shadow-2xl">
                    <div className="w-full relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find your protocol (e.g. Ethereum, Solana, ZKsync)..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-xs font-black tracking-widest uppercase outline-none focus:border-white/10 focus:bg-white/[0.07] transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto px-2 lg:px-0">
                        {categories.map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shrink-0 ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nodes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredNodes.map((node, i) => (
                            <motion.div 
                                key={node.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between hover:bg-white/[0.04] hover:border-white/10 transition-all group relative overflow-hidden"
                            >
                                {/* Category Badge */}
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="text-[8px] font-black tracking-widest text-white/20 uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        {node.category}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <Database size={28} className="text-black" />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">{node.name}</h3>
                                        <p className="text-[10px] text-white/40 font-medium leading-relaxed line-clamp-2">{node.description}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {node.performance.map(p => (
                                            <span key={p} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest">{p}</span>
                                        ))}
                                        {node.mode.map(m => (
                                            <span key={m} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-[8px] font-black uppercase tracking-widest">{m}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 leading-none">Monthly Tier</p>
                                        <p className="text-lg font-black font-mono text-white leading-none">from {node.price}</p>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white text-white hover:text-black transition-all group/btn">
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredNodes.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-40 text-center space-y-4"
                    >
                        <Search size={48} className="mx-auto text-white/10" />
                        <h3 className="text-xl font-black uppercase tracking-widest text-white/40">No matching infrastructure found</h3>
                        <button 
                            onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
                            className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
                        >
                            Reset System Filters
                        </button>
                    </motion.div>
                )}

                {/* Bottom CTA */}
                <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 border border-white/10 rounded-[3rem] p-12 lg:p-20 text-center space-y-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter">Ready for Provisioning?</h2>
                        <p className="text-white/40 text-lg max-w-xl mx-auto font-medium tracking-tight">
                            Deploy your private node cluster in under 60 seconds with zero-lag API endpoints.
                        </p>
                    </div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button className="px-10 py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                            Provision Now <ChevronRight size={14} />
                        </button>
                        <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            Speak to Infrastructure Team
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
