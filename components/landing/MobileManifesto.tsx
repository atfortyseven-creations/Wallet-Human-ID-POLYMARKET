"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants, useScroll } from "framer-motion";
import { ArrowRight, Cpu, Lock, Zap, Key, MessageSquare, Activity } from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────────────────

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// ─── Mobile App Download Section ─────────────────────────────────────────────

function AppDownloadSection() {
  return (
    <section className="px-6 py-24 bg-black text-white relative overflow-hidden" id="mobile-app">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.div variants={FADE_UP} className="flex items-center gap-2 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            Mobile App — Q4 2026
          </span>
        </motion.div>

        <motion.h2 variants={FADE_UP} className="text-[36px] font-black tracking-tighter leading-[1.0] text-white mb-6">
          Programmable Privacy
          <br />
          <span className="text-white/40 italic font-serif font-light">in your pocket.</span>
        </motion.h2>

        <motion.p variants={FADE_UP} className="text-[15px] text-white/50 leading-relaxed mb-12 max-w-[300px] font-medium">
          The full Whale Network terminal — ZK identity, encrypted chat, and shielded portfolio — engineered for iOS & Android.
        </motion.p>

        <motion.div variants={FADE_UP} className="flex flex-col gap-4 w-full max-w-[280px]">
          {/* iOS */}
          <a href="#" className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] transition-all">
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.08 1.21-2.06 3.61.03 2.86 2.51 3.81 2.54 3.82-.03.07-.39 1.35-1.3 2.69zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Download on the</span>
              <span className="text-[17px] font-bold text-white leading-tight">App Store</span>
            </div>
          </a>

          {/* Android */}
          <a href="#" className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] transition-all">
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.35.2.74.24 1.12.12l11.5-6.63-2.43-2.44-10.19 8.95zm-1.1-19.82c-.08.2-.08.43-.08.67v18.8c0 .24 0 .47.08.67l.08.06 10.52-10.52v-.25L2.16 3.88l-.08.06zM19.77 10.81l-2.98-1.73-2.7 2.71 2.7 2.71 3-1.73c.86-.49.86-1.27-.02-1.96zm-17.61 9.45l.08-.08 10.52-10.52-2.43-2.43L1.16 18.13l.1.13z" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Get it on</span>
              <span className="text-[17px] font-bold text-white leading-tight">Google Play</span>
            </div>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MobileManifesto() {
  const [hasSession, setHasSession] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setHasSession(
      document.cookie.includes("system_handshake=") ||
        document.cookie.includes("siwe_session=")
    );
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="relative bg-[#fcfcfc] text-black font-sans antialiased overflow-x-hidden flex flex-col w-full"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* ── Sticky top nav ── */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white/90 backdrop-blur-xl border-b border-black/5" : "bg-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <nav className="flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-3">
            <img src="/atom_3d_silver.jpg" alt="Whale Network" className="w-7 h-7 object-contain mix-blend-multiply" />
            <span className="font-serif text-[17px] font-black tracking-tight text-black">
              Whale Network
            </span>
          </Link>
          <Link
            href={hasSession ? "/terminal" : "/connect"}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[12px] font-bold uppercase tracking-widest rounded-full active:scale-[0.97] transition-transform"
          >
            {hasSession ? "App" : "Connect"}
          </Link>
        </nav>
      </motion.header>

      {/* ══════════════════════════════════════════════════════
          1. HERO
         ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col justify-center items-center overflow-hidden bg-[#fcfcfc]"
        style={{
          paddingTop: "max(6rem, calc(env(safe-area-inset-top, 0px) + 6rem))",
          paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))",
          minHeight: "100dvh",
        }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#fcfcfc]/80 to-[#fcfcfc]" />

        <motion.div
          initial="hidden" animate="visible" variants={STAGGER}
          className="relative z-10 flex flex-col items-center text-center w-full px-6"
        >
          <motion.div variants={FADE_UP} className="flex items-center gap-2 mb-10 px-4 py-2 bg-white border border-black/10 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/60">
              Aztec Testnet V5 Active
            </span>
          </motion.div>

          <motion.h1 variants={FADE_UP} className="text-[50px] font-black tracking-tighter leading-[0.9] text-black mb-6">
            Programmable
            <br />
            <span className="text-black/30 italic font-serif font-light">Privacy.</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="text-[16px] text-black/60 leading-[1.6] mb-12 max-w-[320px] font-medium">
            The fully shielded application layer. Sovereign execution over Aztec's zero-knowledge Rollup. Write private smart contracts in Noir, prove locally, and settle securely on Ethereum.
          </motion.p>

          <motion.div variants={FADE_UP} className="flex flex-col gap-3 w-full max-w-[320px]">
            <Link href={hasSession ? "/terminal" : "/connect"} className="flex items-center justify-center w-full h-[56px] bg-black text-white rounded-[16px] font-bold text-[14px] uppercase tracking-widest active:scale-[0.98] transition-transform">
              {hasSession ? "Open Terminal" : "Initialize"}
            </Link>
            <Link href="/architecture" className="flex items-center justify-center w-full h-[56px] border border-black/20 text-black rounded-[16px] font-bold text-[14px] uppercase tracking-widest active:scale-[0.98] transition-transform">
              Read Docs
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30">Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-black/30 to-transparent" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. DEEP ARCHITECTURE (The Technical Depth)
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 bg-white border-t border-black/5">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="flex flex-col gap-12">
          <motion.div variants={FADE_UP}>
            <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-black/40 block mb-4">Architecture</span>
            <h2 className="text-[36px] font-black tracking-tighter text-black leading-[0.95]">
              Engineered <br/> <span className="text-black/30">for stealth.</span>
            </h2>
            <p className="mt-4 text-[15px] text-black/60 font-medium leading-relaxed">
              We don't obfuscate data. We eliminate it. By using advanced zero-knowledge cryptography, your interactions are mathematically proven without being revealed.
            </p>
          </motion.div>

          <div className="flex flex-col gap-10">
            {[
              { 
                step: "01", 
                title: "Local Client Proving (PXE)", 
                desc: "Whale Network leverages Aztec's Private Execution Environment (PXE). Instead of sending raw parameters to a public mempool, your local device compiles the Noir circuit into ACIR and generates a Barretenberg SNARK proof.",
                icon: Cpu
              },
              { 
                step: "02", 
                title: "Encrypted UTXO State", 
                desc: "Balances and portfolio states are stored as encrypted notes on an append-only Merkle tree. You possess the Viewing Key required to decrypt your notes. To transfer value, a deterministic Nullifier is generated, preventing double-spending.",
                icon: Lock
              },
              { 
                step: "03", 
                title: "L1 to L2 Message Boxes", 
                desc: "Capital flows seamlessly and trustlessly between Ethereum (L1) and the shielded L2 pool. Using Aztec's native Outbox/Inbox architecture, smart contracts communicate cross-chain with cryptographic finality.",
                icon: Zap
              },
            ].map((s, i) => {
               const Icon = s.icon;
               return (
                <motion.div key={i} variants={FADE_UP} className="flex gap-5 items-start border-l-2 border-black/10 pl-5 relative">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-black/20" />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <Icon size={16} className="text-black/50" />
                       <span className="font-mono text-[12px] font-black text-black/30">{s.step}</span>
                    </div>
                    <h3 className="text-[18px] font-black text-black mb-2">{s.title}</h3>
                    <p className="text-[14px] text-black/60 leading-relaxed font-medium">{s.desc}</p>
                  </div>
                </motion.div>
               )
            })}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. THE TERMINAL MODULES (Bento)
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 bg-[#0A0A0A] text-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="flex flex-col gap-6">
          <motion.div variants={FADE_UP} className="mb-4">
            <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 block mb-4">The Sovereign Terminal</span>
            <h2 className="text-[36px] font-black tracking-tighter text-white leading-[0.95]">
              Comprehensive privacy across every layer.
            </h2>
          </motion.div>

          <motion.div variants={FADE_UP} className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 w-fit mb-5"><Key size={20} /></div>
            <h3 className="text-[22px] font-black tracking-tight mb-3">Indexed ZK Signatures</h3>
            <p className="text-[15px] text-white/50 leading-relaxed">
              Prove you are a unique human without exposing personal data via 200 Beta Supply Indexed Signatures.
            </p>
          </motion.div>

          <motion.div variants={FADE_UP} className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 w-fit mb-5"><MessageSquare size={20} /></div>
            <h3 className="text-[22px] font-black tracking-tight mb-3">Whale Chat</h3>
            <p className="text-[15px] text-white/50 leading-relaxed">
              XMTP-powered end-to-end encrypted messaging between verified cryptographic identities. No metadata leakage.
            </p>
          </motion.div>

          <motion.div variants={FADE_UP} className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 w-fit mb-5"><Activity size={20} /></div>
            <h3 className="text-[22px] font-black tracking-tight mb-3">Shielded Wealth</h3>
            <p className="text-[15px] text-white/50 leading-relaxed">
              Monitor capital flows across L1 and L2s privately. Whale Analytics tracks the market without the market tracking you.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. APP DOWNLOAD
         ══════════════════════════════════════════════════════ */}
      <AppDownloadSection />

      {/* ══════════════════════════════════════════════════════
          5. POWERED BY AZTEC
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-32 bg-white text-center flex flex-col items-center border-t border-black/10" style={{ paddingBottom: "max(8rem, calc(env(safe-area-inset-bottom, 0px) + 8rem))" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="flex flex-col items-center w-full">
          <motion.span variants={FADE_UP} className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-6 block">
            Join the Beta
          </motion.span>
          <motion.h2 variants={FADE_UP} className="text-[40px] font-black tracking-tighter leading-[0.9] text-black mb-10">
            Enter the <br/>
            <span className="text-emerald-500">Network.</span>
          </motion.h2>
          <motion.div variants={FADE_UP} className="w-full flex flex-col gap-4 max-w-[320px]">
            <Link href={hasSession ? "/terminal" : "/connect"} className="w-full py-5 bg-black text-white font-bold uppercase tracking-widest text-[13px] rounded-2xl active:scale-95 transition-transform">
              {hasSession ? "Open Terminal" : "Connect Wallet"}
            </Link>
            <Link href="/architecture" className="w-full py-5 border-2 border-black/10 text-black font-bold uppercase tracking-widest text-[13px] rounded-2xl active:scale-95 transition-transform">
              Read Docs
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
