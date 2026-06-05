"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, Shield, Activity, BarChart2 } from "lucide-react";
import { UniversalChainDistribution } from "@/components/network/UniversalChainDistribution";

export function OmniChainGridSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-40 px-6 bg-black/5 overflow-hidden">
      <motion.div style={{ opacity }} className="relative z-10 max-w-[2560px] mx-auto text-left">
        <div className="text-center mb-32">
          <div className="text-xs font-black uppercase tracking-[0.5em] text-indigo-600 mb-8">Global Security Grid</div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 mb-10 leading-[0.9] uppercase">
             The Omni-Chain <br />
             <span className="text-slate-200">Artery.</span>
          </h2>
          <p className="text-slate-500 text-xl leading-relaxed max-w-3xl mx-auto font-medium">
             Arctic Protocol monitors the heartbeat of **33+ Verified Chains** in real-time. 
             From the hash-heavy fortresses of Bitcoin and Ethereum to the high-throughput L2s of Base and Arbitrum.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-16 shadow-2xl shadow-slate-200/50">
           <UniversalChainDistribution />
        </div>

        <div className="grid md:grid-cols-4 gap-8 mt-20">
            <MetricBox label="Multiverse Security" value="48.2 EH/s" />
            <MetricBox label="Aggregated Liquidity" value="$12.8B" />
            <MetricBox label="Atomic Settlement" value="0.5s" />
            <MetricBox label="Verification Latency" value="< 12ms" />
        </div>
      </motion.div>
    </section>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-center p-8 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 transition-all">
            <div className="text-4xl font-black text-slate-950 mb-2 font-mono tracking-tighter">{value}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</div>
        </div>
    );
}
