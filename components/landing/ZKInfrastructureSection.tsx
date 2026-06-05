"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Shield, Cpu, Layers, Lock, Zap, Activity } from "lucide-react";

export function ZKInfrastructureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);
  
  return (
    <section ref={containerRef} className="relative py-40 px-6 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] overflow-hidden">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
      </div>

      <motion.div style={{ opacity, scale }} className="relative z-10 max-w-[2560px] mx-auto text-left">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-xs font-black uppercase tracking-[0.5em] text-[var(--aztec-orchid)] mb-8"
            >
              Protocol Phase 16 / Infrastructure
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-[0.9]">
              The Layer of <br />
              <span className="text-[var(--aztec-orchid)]">Absolute Truth.</span>
            </h2>
            <p className="text-[var(--aztec-parchment)]/60 text-xl leading-relaxed mb-12 font-light max-w-xl">
              Arctic Protocol L3 isn't just a dashboard; it's a **System Execution Environment**. 
              We leverage recursive Zero-Knowledge proofs to aggregate the state of 33+ chains into a single, 
              mathematically certain liquidity grid.
            </p>

            <div className="space-y-10">
              <SpecItem 
                icon={Shield}
                title="Groth16/Plonk Verification"
                desc="Every event detected is verified via off-chain ZK-SNARKs. We don't trust RPC providers; we verify the Merkle proof of every transaction locally before delivery."
              />
              <SpecItem 
                icon={Layers}
                title="L3 Aggregation Theory"
                desc="By abstracting the consensus layer of underlying chains, we eliminate the latency of multi-hop bridging. Arctic L3 acts as the master clearing house for cross-chain intent."
              />
              <SpecItem 
                icon={Cpu}
                title="Decentralized Prover Clusters"
                desc="A globally distributed network of high-performance provers ensures sub-10ms proof generation, enabling real-time forensic detection without central failure points."
              />
            </div>
          </div>

          {/* Visual Representation of the ZK-Stack */}
          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="relative h-full flex items-center justify-center">
                <ZKArchitectureVisual />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function SpecItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-500">
        <Icon size={20} className="text-[var(--aztec-orchid)]" />
      </div>
      <div>
        <h3 className="font-black text-white text-lg mb-2 uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
      </div>
    </div>
  );
}

function ZKArchitectureVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
        {/* Animated Layers */}
        {[0, 1, 2, 3].map((i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 1 }}
                className="absolute w-64 h-64 border border-[var(--aztec-orchid)]/30 rounded-3xl bg-[var(--aztec-orchid)]/5 backdrop-blur-3xl"
                style={{ 
                    transform: `rotateX(60deg) rotateZ(45deg) translateZ(${i * 60}px)`,
                    boxShadow: i === 3 ? '0 0 50px rgba(99,102,241,0.2)' : 'none'
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-[1px] bg-indigo-500/20 animate-scan" style={{ top: `${i * 25}%` }} />
                    {i === 3 && <Zap size={40} className="text-indigo-400 rotate-[-45deg] scale-[2]" />}
                </div>
            </motion.div>
        ))}
        
        {/* Data Stream Particles */}
        {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-indigo-400 rounded-full"
                animate={{ 
                    y: [-100, 200],
                    opacity: [0, 1, 0]
                }}
                transition={{ 
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                }}
                style={{ 
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + Math.random() * 80}%`
                }}
            />
        ))}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-[10px] font-mono text-indigo-500/50 uppercase tracking-[0.5em] rotate-[-90deg] translate-x-48 font-black">
                PROVER_MESH_V1.6.2
            </div>
        </div>
    </div>
  );
}
