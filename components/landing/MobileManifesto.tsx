"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAppKit } from '@reown/appkit/react';

//  Constants 

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

//  Component 

export function MobileManifesto() {
  const [hasSession, setHasSession] = useState(false);
  const [noteExpanded, setNoteExpanded] = useState(false);
  const { open } = useAppKit();

  useEffect(() => {
    setHasSession(document.cookie.includes("system_handshake=") || document.cookie.includes("siwe_session="));
  }, []);

  return (
    <div className="relative bg-[#F9F8F6] text-[#0A0A0A] font-sans antialiased overflow-x-hidden min-h-[100dvh] selection:bg-black/10 flex flex-col w-full">

      {/* 
          1. HERO ÔÇö iOS/Android safe-area aware
          Uses env(safe-area-inset-top) for notch/dynamic island devices.
          min-h uses 100dvh (dynamic viewport height) so Chrome mobile
          toolbar collapse doesn't cause clipping.
       */}
      <section
        className="px-6 pb-16 border-b border-[#EBEBEB] bg-[#F9F8F6] relative overflow-hidden flex flex-col justify-center"
        style={{
          paddingTop: "max(5rem, calc(env(safe-area-inset-top, 0px) + 5rem))",
          minHeight: "100dvh",
          paddingBottom: "max(4rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))"
        }}
      >
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#0A0A0A 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        
        <motion.div initial="hidden" animate="visible" variants={STAGGER} className="relative z-10 flex flex-col items-center text-center">

          {/* Premium background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Partnership badge */}
          <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 bg-white shadow-sm backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]/70">
                Sovereign Network
              </span>
            </div>
          </motion.div>

          <motion.h1 variants={FADE_UP} className="text-[40px] sm:text-[48px] font-black tracking-tighter leading-[0.95] text-[#0A0A0A] mb-6 max-w-[320px] mx-auto">
            The Sovereign Gateway
            <br />
            <span className="text-[#0A0A0A]/30">to Aztec.</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="text-[15px] text-[#444] leading-[1.6] mb-10 max-w-[340px] mx-auto px-4 font-medium">
            Whale Network operates as the sovereign application layer over Aztec's zero-knowledge execution environment. We abstract the complexity of ZK circuits into a sovereign-grade terminal.
          </motion.p>

          <motion.div variants={FADE_UP} className="w-full max-w-[300px] mx-auto flex flex-col items-center gap-3">
            <button
              onClick={() => open()}
              className="flex items-center justify-center w-full h-[56px] bg-black text-white rounded-2xl text-[14px] font-bold tracking-wide active:scale-[0.98] transition-transform shadow-lg shadow-black/20"
            >
              Connect Wallet
            </button>
            <Link
              href="/developers/api-docs"
              className="flex items-center justify-center w-full h-[56px] bg-transparent border border-black/15 text-black rounded-2xl text-[14px] font-bold tracking-wide active:scale-[0.98] transition-transform"
            >
              Read the Docs
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* 
          2. ARCHITECTURE
       */}
      <section className="px-6 py-20 border-b border-[#EBEBEB] bg-white space-y-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="text-center space-y-4 mb-12 relative z-10">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="text-[36px] font-black tracking-tighter leading-[0.95] text-[#0A0A0A]">
                Absolute <span className="text-[#0A0A0A]/30">Privacy.</span>
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="text-[16px] text-[#555] font-medium leading-relaxed max-w-[320px] mx-auto px-2">
                By leveraging the Aztec Network Private Execution Environment, we shift all computation to your local device.
            </motion.p>
        </div>

        <div className="space-y-6 relative z-10">
          {[
            { num: '01', title: 'Local Proving', desc: 'Your device runs Noir circuits locally, generating a zero-knowledge proof before touching the network.' },
            { num: '02', title: 'Encrypted State', desc: 'Balances and identity credentials are stored as encrypted UTXO notes on the Aztec L2.' },
            { num: '03', title: 'Nullifier Resistance', desc: 'The protocol emits a deterministic nullifier, preventing double spending while keeping you completely anonymous.' },
          ].map((block, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="flex flex-col gap-3 bg-[#F9F8F6] p-8 rounded-3xl border border-[#EBEBEB] shadow-sm">
              <span className="font-black text-[12px] text-indigo-500 tracking-widest uppercase">Step {block.num}</span>
              <h3 className="text-[20px] font-black tracking-tight text-[#0A0A0A] leading-none">{block.title}</h3>
              <p className="text-[15px] font-medium text-[#555] leading-[1.6] mt-1">
                  {block.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </section>

      {/* 
          3. WHALE CHAT ÔÇö dark section
          All text must be visible on the #0A0A0A background.
          Minimum: white/80 for body, white for headers.
       */}
      <section className="px-6 py-20 bg-[#0A0A0A] text-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
          <div className="flex items-center gap-3 mb-12">
            <div className="flex-1 h-px bg-white/20" />
            <span className="font-mono text-[8px] font-black uppercase tracking-[0.3em] text-white/60">Whale Chat</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <h2 className="text-[40px] font-black tracking-tighter uppercase leading-[0.95] text-white mb-6 text-center">
            Sovereign <span className="text-emerald-400">Privacy.</span>
          </h2>

          <div className="space-y-6 font-serif text-[16px] text-white/80 leading-[1.7] text-center max-w-[340px] mx-auto mb-10 px-2">
            <p>
              Centralized messaging platforms are liabilities for sovereign operations. Whale Chat is built on XMTP ÔÇö encrypted directly with authorized personnel keys.
            </p>
            
            <AnimatePresence>
              {noteExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
                  <p className="pt-2 text-white/70">
                    No telecom provider or unauthorized entity can intercept the data. 
                  </p>
                  <p className="text-white/70">
                    Used daily for secure transfers and cryptographic attestation where perfect sovereign privacy is mandatory.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setNoteExpanded((v) => !v)} className="flex items-center justify-center gap-3 w-full max-w-[300px] mx-auto h-[56px] rounded-2xl bg-white/10 border border-white/20 font-mono text-[11px] font-black tracking-[0.2em] uppercase text-white active:bg-white/15 transition-colors">
            {noteExpanded ? "Collapse" : "Read More"}
            <ChevronDown size={16} className={`transition-transform duration-300 ${noteExpanded ? "rotate-180" : ""}`} />
          </button>
        </motion.div>
      </section>

      {/* 
          4. AZTEC
       */}
      <section
        className="px-6 py-24 bg-[#F9F8F6] border-t border-black/10 text-center flex-1"
        style={{ paddingBottom: "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 6rem))" }}
      >
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
          <span className="inline-block font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]/55 mb-6 px-3 py-1.5 border border-black/15 rounded-full">
            Infrastructure Partner
          </span>
          <h2 className="text-[32px] font-black tracking-tighter uppercase leading-[0.95] text-[#0A0A0A] mb-6">
            Powered by <br/><span className="text-[#0A0A0A]/55">Aztec Network.</span>
          </h2>
          <p className="font-serif text-[15px] text-[#555] leading-[1.6] max-w-[320px] mx-auto px-2">
            The foundation of this absolute transparency and security is built upon the Aztec Network L2 zk-Rollup. It is the definitive infrastructure for sovereign security.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

