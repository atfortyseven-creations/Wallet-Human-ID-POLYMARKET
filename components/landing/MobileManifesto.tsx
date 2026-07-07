"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Shield, Lock, Zap, Globe, MessageSquare, BarChart3, ArrowRight } from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────────────────

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const SLIDE_IN: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Mobile App Download Section ─────────────────────────────────────────────

function AppDownloadSection() {
  return (
    <section className="px-6 py-24 bg-black text-white relative overflow-hidden" id="mobile-app">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={STAGGER}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.div variants={FADE_UP} className="flex items-center gap-2 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            Mobile App — Q4 2026
          </span>
        </motion.div>

        <motion.h2 variants={FADE_UP} className="text-[36px] font-black tracking-tighter leading-[1.0] text-white mb-6">
          Sovereign Finance
          <br />
          <span className="text-white/40 italic font-serif font-light">in your pocket.</span>
        </motion.h2>

        <motion.p variants={FADE_UP} className="text-[15px] text-white/50 leading-relaxed mb-12 max-w-[300px] font-medium">
          The full Whale Network terminal — ZK identity, encrypted chat, and private portfolio — engineered for iOS & Android.
        </motion.p>

        {/* Store Badges */}
        <motion.div variants={FADE_UP} className="flex flex-col gap-4 w-full max-w-[280px]">
          {/* iOS — App Store */}
          <a href="#" className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] transition-all">
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.08 1.21-2.06 3.61.03 2.86 2.51 3.81 2.54 3.82-.03.07-.39 1.35-1.3 2.69zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Download on the</span>
              <span className="text-[17px] font-bold text-white leading-tight">App Store</span>
            </div>
          </a>

          {/* Android — Google Play */}
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

// ─── Feature Cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Shield,
    tag: "Identity",
    title: "ZK Identity",
    desc: "Prove you are a unique human using Noir zero-knowledge circuits — no personal data exposed to anyone.",
  },
  {
    icon: Lock,
    tag: "Privacy",
    title: "Encrypted Wallet",
    desc: "Your private keys never leave your device. AES-GCM encrypted, unlocked only by your biometric or password.",
  },
  {
    icon: MessageSquare,
    tag: "Chat",
    title: "Whale Chat",
    desc: "End-to-end encrypted messages between verified wallets. No phone number, no IP tracking, no metadata.",
  },
  {
    icon: BarChart3,
    tag: "Portfolio",
    title: "Private Analytics",
    desc: "Monitor capital flows and manage shielded assets across Ethereum L1 and L2 — completely private.",
  },
];

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
          1. HERO — iOS/Android safe-area aware
         ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col justify-center items-center overflow-hidden bg-[#fcfcfc]"
        style={{
          paddingTop: "max(6rem, calc(env(safe-area-inset-top, 0px) + 6rem))",
          paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))",
          minHeight: "100dvh",
        }}
      >
        {/* Animated Topographic Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#fcfcfc]/80 to-[#fcfcfc]" />

        <motion.div
          initial="hidden" animate="visible" variants={STAGGER}
          className="relative z-10 flex flex-col items-center text-center w-full px-6"
        >
          {/* Live status badge */}
          <motion.div variants={FADE_UP} className="flex items-center gap-2 mb-10 px-4 py-2 bg-white border border-black/10 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/60">
              Aztec Testnet V5 Active
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 variants={FADE_UP} className="text-[54px] font-black tracking-tighter leading-[0.9] text-black mb-6">
            Absolute
            <br />
            <span className="text-black/30 italic font-serif font-light">Sovereignty.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={FADE_UP} className="text-[16px] text-black/60 leading-[1.6] mb-12 max-w-[320px] font-medium">
            The definitive application layer over Aztec's zero-knowledge execution environment.
          </motion.p>

          {/* Primary CTA */}
          <motion.div variants={FADE_UP} className="flex flex-col gap-3 w-full max-w-[320px]">
            <Link href={hasSession ? "/terminal" : "/connect"} className="flex items-center justify-center w-full h-[56px] bg-black text-white rounded-[16px] font-bold text-[14px] uppercase tracking-widest active:scale-[0.98] transition-transform">
              {hasSession ? "Open Terminal" : "Initialize"}
            </Link>
            <Link href="/architecture" className="flex items-center justify-center w-full h-[56px] border border-black/20 text-black rounded-[16px] font-bold text-[14px] uppercase tracking-widest active:scale-[0.98] transition-transform">
              Read Docs
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30">Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-black/30 to-transparent" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. FEATURE CARDS
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 bg-black text-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="flex flex-col gap-1">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} variants={FADE_UP} className="flex flex-col p-8 bg-[#0A0A0A] border border-white/5 hover:bg-[#111] transition-colors rounded-none first:rounded-t-3xl last:rounded-b-3xl">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6">
                  <Icon size={18} className="text-white/60" />
                </div>
                <h3 className="text-[20px] font-black tracking-tight mb-3 text-white">{f.title}</h3>
                <p className="text-[14px] text-white/50 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. HOW IT WORKS
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-32 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="flex flex-col gap-12">
          <motion.div variants={FADE_UP}>
            <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-black/40 block mb-4">Architecture</span>
            <h2 className="text-[40px] font-black tracking-tighter text-black leading-[0.95]">
              Engineered <br/> <span className="text-black/30">for stealth.</span>
            </h2>
          </motion.div>

          <div className="flex flex-col gap-10">
            {[
              { step: "01", title: "Local Proving", desc: "Your device runs Noir circuits locally. The proof is generated before anything touches the network." },
              { step: "02", title: "Encrypted State", desc: "Balances are stored as encrypted UTXO notes. Only your viewing key decrypts them." },
              { step: "03", title: "Trustless L1 Settlement", desc: "Cross-chain liquidity flows from Ethereum mainnet directly into the shielded L2 pool." },
            ].map((s, i) => (
              <motion.div key={i} variants={FADE_UP} className="flex gap-6 items-start border-l-2 border-black/10 pl-6 relative">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-black/20" />
                <div>
                  <span className="font-mono text-[12px] font-black text-black/30 mb-2 block">{s.step}</span>
                  <h3 className="text-[20px] font-black text-black mb-3">{s.title}</h3>
                  <p className="text-[15px] text-black/60 leading-relaxed font-medium">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. WHALE CHAT — dark section
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-32 bg-[#050505] text-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="flex flex-col">
          <motion.span variants={FADE_UP} className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 block">
            Encrypted Comms
          </motion.span>
          <motion.h2 variants={FADE_UP} className="text-[40px] font-black tracking-tighter leading-[0.95] text-white mb-8">
            The standard <br/> in <span className="text-emerald-500/80">privacy.</span>
          </motion.h2>
          <motion.p variants={FADE_UP} className="text-[16px] text-white/50 leading-[1.6] max-w-[320px] mb-12 font-medium">
            Built on XMTP. End-to-end encrypted directly with your wallet keys. No telecom provider, no interception.
          </motion.p>
          <motion.div variants={FADE_UP}>
            <Link href="/chat" className="inline-flex items-center gap-4 text-[13px] font-bold uppercase tracking-widest text-emerald-400">
              Open Whale Chat <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. HOSPITAL PARTNERSHIP — Colțea
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-32 bg-[#fcfcfc] border-b border-black/10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="flex flex-col items-center text-center">
          <motion.img variants={FADE_UP} src="/coltea_logo.png" alt="Coltea Hospital" className="h-14 opacity-50 grayscale mb-10" />
          <motion.h2 variants={FADE_UP} className="text-[28px] font-black tracking-tighter leading-[1.0] text-black mb-8">
            The first hospital in history to secure medical records on Ethereum.
          </motion.h2>
          <motion.p variants={FADE_UP} className="text-[15px] text-black/50 leading-relaxed font-medium mb-10">
            Spitalul Clinic Colțea partners with Whale Network to hash discharge records into the Aztec L2 state, ensuring absolute privacy.
          </motion.p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. APP DOWNLOAD
         ══════════════════════════════════════════════════════ */}
      <AppDownloadSection />

      {/* ══════════════════════════════════════════════════════
          7. POWERED BY AZTEC
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-32 bg-white text-center flex flex-col items-center border-t border-black/10" style={{ paddingBottom: "max(8rem, calc(env(safe-area-inset-bottom, 0px) + 8rem))" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="flex flex-col items-center">
          <motion.h2 variants={FADE_UP} className="text-[32px] font-black tracking-tighter leading-[1.0] text-black mb-10">
            Powered by <span className="text-black/30">Aztec.</span>
          </motion.h2>
          <motion.img variants={FADE_UP} src="/aztec-logo-black.png" alt="Aztec Network" className="h-12 object-contain opacity-80 mb-12" />
          <motion.div variants={FADE_UP} className="w-full flex flex-col gap-4">
            <Link href={hasSession ? "/terminal" : "/connect"} className="w-full py-5 bg-black text-white font-bold uppercase tracking-widest text-[13px] rounded-2xl active:scale-95 transition-transform">
              {hasSession ? "Open Terminal" : "Connect"}
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
