"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, Activity, Shield, ArrowRight, CornerRightDown } from "lucide-react";

export function IntentMasterySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-40 px-6 bg-white overflow-hidden">
      
      <motion.div style={{ opacity }} className="relative z-10 max-w-[2560px] mx-auto text-left">
        <div className="text-center mb-32">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-8"
          >
            System Intent Layer
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 mb-10 uppercase">
            Atomic Execution <br />
            <span className="text-slate-300">Mastery.</span>
          </h2>
          <p className="text-slate-500 text-xl leading-relaxed max-w-3xl mx-auto font-medium">
            While others track transactions after the fact, we capture **Intents** before they reach the public mempool. 
            Our Private Flow infrastructure ensures that your execution remains shielded from MEV-predators and front-running bots.
          </p>
        </div>

        {/* Execution Flow Diagram */}
        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 hidden md:block -translate-y-1/2 z-0" />
          
          <FlowCard 
            step="01"
            icon={Zap}
            title="Intent Capture"
            desc="Sign high-level intents, not just transactions. Specify 'What' you want, let our solvers handle the 'How' with zero leakage."
            color="bg-amber-500"
          />
          <FlowCard 
            step="02"
            icon={Activity}
            title="Private Mempool"
            desc="Your data is routed through encrypted relayers. No public visibility until the block is finalized. Total MEV-immunity."
            color="bg-indigo-600"
          />
          <FlowCard 
            step="03"
            icon={Shield}
            title="Atomic Settlement"
            desc="Deterministic execution across 33+ chains. If the conditions aren't met with 0.1% precision, the atom reverts instantly."
            color="bg-emerald-500"
          />
        </div>

        <div className="mt-40 bg-slate-950 rounded-[4rem] p-12 lg:p-24 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.15)_0%,transparent_50%)]" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
                <div className="flex-1">
                    <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-none">
                        AI Agent <br />
                        <span className="text-indigo-400">Session Keys.</span>
                    </h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                        Deploy autonomous agents with granular permissioning. Grant limited session keys to AI solvers for $100k execution limits and 0.1% slippage constraints. 
                        No seed phrases exposed to AI. Only signed deterministic intents.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-3xl font-black text-white mb-2">$100,000</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Strict Execution Limit</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white mb-2">0.1%</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Max Slippage Threshold</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full max-w-md">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Session_Key // Active</div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-6">
                            <div className="h-2 bg-white/10 rounded-full w-3/4" />
                            <div className="h-2 bg-white/10 rounded-full w-full" />
                            <div className="h-2 bg-white/10 rounded-full w-1/2" />
                            <div className="pt-8 border-t border-white/10 mt-8 flex justify-between items-center">
                                <span className="text-xs font-mono text-slate-500">0x716...82Ac</span>
                                <span className="text-xs font-mono text-indigo-400">Guardian Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </section>
  );
}

function FlowCard({ step, icon: Icon, title, desc, color }: { step: string; icon: any; title: string; desc: string; color: string }) {
  return (
    <motion.div 
        whileHover={{ y: -10 }}
        className="relative z-10 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/20 group hover:border-indigo-200 transition-all duration-500"
    >
        <div className="text-[10px] font-black text-slate-300 mb-8 tracking-[0.3em] uppercase">{step} / Protocol System</div>
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/10`}>
            <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-2xl font-black text-slate-950 mb-4 group-hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}
