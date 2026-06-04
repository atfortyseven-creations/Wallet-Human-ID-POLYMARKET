"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any } }
};

const COMPARISON_DATA = [
  {
    feature: "Funds Custody",
    us: "Absolute Control (You own the keys)",
    common: "Under your control, complex interface",
    exchange: "Funds under platform control",
    usState: "positive",
    commonState: "neutral",
    exchangeState: "negative",
  },
  {
    feature: "Block Immunity",
    us: "Mathematically Impossible to Block",
    common: "Subject to local jurisdictions",
    exchange: "Frequent account closures without notice",
    usState: "positive",
    commonState: "warning",
    exchangeState: "negative",
  },
  {
    feature: "Transactional Privacy",
    us: "Zero Tracking. Privacy by Design.",
    common: "IP and metadata tracking",
    usState: "positive",
    commonState: "negative",
    exchangeState: "negative",
  },
  {
    feature: "Operation Speed",
    us: "Instantaneous (Direct Browser Fusion)",
    common: "Requires plugins and manual approvals",
    exchange: "Fast, but with withdrawal delays",
    usState: "positive",
    commonState: "negative",
    exchangeState: "warning",
  },
];

export function WalletComparisonChart() {
  return (
    <section className="w-full py-32 md:py-48 bg-white relative overflow-hidden flex flex-col items-center">
      {/* Cinematic subtle grid background */}
      <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-[0.015] pointer-events-none mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col items-center text-center mb-20 md:mb-32">
          <motion.div variants={FADE_UP} className="w-px h-16 bg-gradient-to-b from-transparent to-black/20 mb-8" />
          <motion.h2 variants={FADE_UP} className="text-[48px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.85] text-[#0A0A0A] mb-8">
            Our Wallet<br />
            <span className="text-black/20">vs The Rest.</span>
          </motion.h2>
          <motion.p variants={FADE_UP} className="font-serif text-[18px] md:text-[24px] text-black/60 leading-relaxed max-w-[700px] font-medium">
            The world's most advanced institutional infrastructure. Designed to be unbreakable, ultra-fast, and exceptionally beautiful.
          </motion.p>
        </motion.div>

        {/* ULTRA-PREMIUM COMPARISON TABLE */}
        <div className="w-full relative">
          {/* Header Row */}
          <div className="hidden lg:grid grid-cols-[1.5fr_1.2fr_1fr_1fr] gap-6 px-8 pb-6 border-b border-black/5 mb-6">
            <div className="flex items-end pb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-black/30">Evaluation Criteria</span>
            </div>
            <div className="flex flex-col p-6 bg-[#FFFFFF] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.04] scale-105 origin-bottom z-10">
              <span className="text-[20px] font-black tracking-tight uppercase text-[#0A0A0A]">Whale Alert Wallet</span>
              <span className="text-[12px] font-mono text-emerald-600/80 uppercase tracking-widest mt-1">Total Systemty</span>
            </div>
            <div className="flex flex-col p-6 bg-black/[0.01] rounded-2xl border border-transparent">
              <span className="text-[18px] font-bold tracking-tight text-[#0A0A0A]/50">Common Wallets</span>
              <span className="text-[11px] font-mono text-black/30 uppercase tracking-widest mt-1">Metamask, Trust</span>
            </div>
            <div className="flex flex-col p-6 bg-black/[0.01] rounded-2xl border border-transparent">
              <span className="text-[18px] font-bold tracking-tight text-[#0A0A0A]/50">Exchanges</span>
              <span className="text-[11px] font-mono text-black/30 uppercase tracking-widest mt-1">Binance, Coinbase</span>
            </div>
          </div>

          {/* Data Rows */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={STAGGER} className="flex flex-col gap-4">
            {COMPARISON_DATA.map((row, i) => (
              <motion.div 
                key={i} 
                variants={FADE_UP}
                style={{ transform: "translateZ(0)", willChange: "transform" }}
                className="group flex flex-col lg:grid lg:grid-cols-[1.5fr_1.2fr_1fr_1fr] gap-4 lg:gap-6 items-stretch"
              >
                {/* Feature Column */}
                <div className="flex items-center px-6 py-6 lg:px-8 bg-transparent lg:border-b border-black/5 group-hover:border-black/10 transition-colors">
                  <p className="font-serif text-[18px] lg:text-[22px] font-medium text-[#0A0A0A]/80 leading-snug">
                    {row.feature}
                  </p>
                </div>

                {/* Whale Alert Column (Elevated & Emphasized) */}
                <div className="flex items-center p-6 lg:p-8 bg-[#FFFFFF] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] group-hover:-translate-y-0.5 transition-all duration-500 relative z-10">
                  <div className="flex gap-4 items-start">
                    <CheckCircle2 size={22} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="font-sans text-[14px] lg:text-[16px] font-bold text-[#0A0A0A] leading-relaxed">
                      {row.us}
                    </span>
                  </div>
                </div>

                {/* Common Wallets Column */}
                <div className="flex items-center p-6 lg:p-8 bg-black/[0.015] rounded-2xl group-hover:bg-black/[0.03] transition-colors duration-500">
                  <div className="flex gap-4 items-start opacity-70">
                    {row.commonState === 'warning' ? (
                      <MinusCircle size={22} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                    ) : row.commonState === 'neutral' ? (
                       <CheckCircle2 size={22} className="text-black/30 shrink-0 mt-0.5" strokeWidth={2.5} />
                    ) : (
                      <XCircle size={22} className="text-rose-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    )}
                    <span className="font-sans text-[14px] lg:text-[15px] font-medium text-[#0A0A0A]/60 leading-relaxed">
                      {row.common}
                    </span>
                  </div>
                </div>

                {/* Exchanges Column */}
                <div className="flex items-center p-6 lg:p-8 bg-black/[0.015] rounded-2xl group-hover:bg-black/[0.03] transition-colors duration-500">
                  <div className="flex gap-4 items-start opacity-70">
                     {row.exchangeState === 'warning' ? (
                      <MinusCircle size={22} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                    ) : row.exchangeState === 'neutral' ? (
                       <CheckCircle2 size={22} className="text-black/30 shrink-0 mt-0.5" strokeWidth={2.5} />
                    ) : (
                      <XCircle size={22} className="text-rose-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    )}
                    <span className="font-sans text-[14px] lg:text-[15px] font-medium text-[#0A0A0A]/60 leading-relaxed">
                      {row.exchange}
                    </span>
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
