"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any } }
};

const CHAT_DATA = [
  {
    feature: "Who can read the messages?",
    us: "Only you and your contact (Point-to-Point Encryption)",
    common: "Company servers and governments",
    usState: "positive",
    commonState: "negative",
  },
  {
    feature: "Phone Number Requirement",
    us: "Unnecessary. 100% Anonymous Privacy.",
    common: "Mandatory (Linked to your identity)",
    usState: "positive",
    commonState: "negative",
  },
  {
    feature: "Risk of Censorship or Ban",
    us: "Impossible. System Infrastructure.",
    common: "Accounts unilaterally deleted",
    usState: "positive",
    commonState: "negative",
  },
  {
    feature: "Vulnerability to SIM Swapping",
    us: "Immune. Cryptographic Hardware Security.",
    common: "Critical risk of identity theft",
    usState: "positive",
    commonState: "warning",
  },
];

export function WhaleChatComparison() {
  return (
    <section className="w-full py-32 md:py-48 bg-[#FFFFFF] relative overflow-hidden flex flex-col items-center">
      {/* Cinematic subtle grid background */}
      <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-[0.015] pointer-events-none mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col items-center text-center mb-20 md:mb-32">
          <motion.div variants={FADE_UP} className="w-px h-16 bg-gradient-to-b from-transparent to-black/20 mb-8" />
          <motion.h2 variants={FADE_UP} className="text-[48px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.85] text-[#0A0A0A] mb-8">
            Armored<br />
            <span className="text-black/20">Communications.</span>
          </motion.h2>
          <motion.p variants={FADE_UP} className="font-serif text-[18px] md:text-[24px] text-black/60 leading-relaxed max-w-[700px] font-medium">
            Traditional messaging applications commercialize your data. Whale Chat restores the absolute right to corporate confidentiality.
          </motion.p>
        </motion.div>

        {/* ULTRA-PREMIUM COMPARISON TABLE */}
        <div className="w-full relative">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr] gap-6 px-8 pb-6 border-b border-black/5 mb-6">
            <div className="flex items-end pb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-black/30">Security Metrics</span>
            </div>
            <div className="flex flex-col p-6 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/[0.03]">
              <span className="text-[20px] font-black tracking-tight uppercase text-[#0A0A0A]">Whale Chat</span>
              <span className="text-[12px] font-mono text-emerald-600/80 uppercase tracking-widest mt-1">Institutional Level</span>
            </div>
            <div className="flex flex-col p-6 bg-black/[0.02] rounded-2xl border border-transparent">
              <span className="text-[20px] font-bold tracking-tight text-[#0A0A0A]/50">Common Apps</span>
              <span className="text-[12px] font-mono text-black/30 uppercase tracking-widest mt-1">WhatsApp, Telegram</span>
            </div>
          </div>

          {/* Data Rows */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={STAGGER} className="flex flex-col gap-4">
            {CHAT_DATA.map((row, i) => (
              <motion.div 
                key={i} 
                variants={FADE_UP}
                style={{ transform: "translateZ(0)", willChange: "transform" }}
                className="group flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr] gap-4 md:gap-6 items-stretch"
              >
                {/* Feature Column */}
                <div className="flex items-center px-6 py-6 md:px-8 bg-transparent md:border-b border-black/5 group-hover:border-black/10 transition-colors">
                  <p className="font-serif text-[18px] md:text-[22px] font-medium text-[#0A0A0A]/80 leading-snug">
                    {row.feature}
                  </p>
                </div>

                {/* Whale Chat Column (Elevated) */}
                <div className="flex items-center p-6 md:p-8 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/[0.03] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] group-hover:-translate-y-0.5 transition-all duration-500">
                  <div className="flex gap-4 items-start">
                    <CheckCircle2 size={22} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="font-sans text-[14px] md:text-[16px] font-bold text-[#0A0A0A] leading-relaxed">
                      {row.us}
                    </span>
                  </div>
                </div>

                {/* Common Apps Column */}
                <div className="flex items-center p-6 md:p-8 bg-black/[0.015] rounded-2xl group-hover:bg-black/[0.03] transition-colors duration-500">
                  <div className="flex gap-4 items-start opacity-70">
                    {row.commonState === 'warning' ? (
                      <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                    ) : (
                      <XCircle size={22} className="text-rose-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    )}
                    <span className="font-sans text-[14px] md:text-[16px] font-medium text-[#0A0A0A]/60 leading-relaxed">
                      {row.common}
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
