"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Cpu, Database, Landmark } from 'lucide-react';

export function MajesticManifesto() {
    return (
        <section className="mb-16 border-b border-slate-100 pb-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ManifestoItem 
                        icon={<Activity size={18} />}
                        title="Pulse Monitor"
                        desc="A real-time synchronization of network velocity, monitoring throughput and heartbeats across five system blockchain infrastructures."
                    />
                    <ManifestoItem 
                        icon={<Landmark size={18} />}
                        title="Liquidity Grid"
                        desc="Tracking the cross-chain migration of capital, identifying institutional pivots and systemic rebalancing with millimetric precision."
                    />
                </div>
            </motion.div>
        </section>
    );
}

function ManifestoItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="group space-y-3">
            <div className="w-10 h-10 rounded-xl bg-black/5 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                {icon}
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{title}</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-600 transition-colors">
                {desc}
            </p>
        </div>
    );
}
