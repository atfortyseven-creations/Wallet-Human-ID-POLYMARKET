"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronDown, Shield, Lock, Zap, Globe, MessageSquare, BarChart3 } from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────────────────

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const SLIDE_IN: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Mobile App Download Section ─────────────────────────────────────────────

function AppDownloadSection() {
  return (
    <section
      className="px-6 py-16 bg-gradient-to-br from-[#0A0A0A] to-[#1a1a2e] text-white relative overflow-hidden"
      id="mobile-app"
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={STAGGER}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.div variants={FADE_UP} className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            Mobile App — Coming Soon
          </span>
        </motion.div>

        <motion.h2
          variants={FADE_UP}
          className="text-[32px] font-black tracking-tighter leading-[1.0] text-white mb-4"
        >
          Sovereign Finance
          <br />
          <span className="text-white/50">in your pocket.</span>
        </motion.h2>

        <motion.p
          variants={FADE_UP}
          className="text-[14px] text-white/65 leading-relaxed mb-10 max-w-[300px] font-medium"
        >
          The full Whale Network terminal — ZK identity, encrypted chat, and private portfolio — optimised for iOS &amp; Android.
        </motion.p>

        {/* Store Badges */}
        <motion.div variants={FADE_UP} className="flex flex-col gap-3 w-full max-w-[280px]">
          {/* iOS — App Store */}
          <a
            href="#"
            aria-label="Download on the App Store for iOS"
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all backdrop-blur-sm"
          >
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.08 1.21-2.06 3.61.03 2.86 2.51 3.81 2.54 3.82-.03.07-.39 1.35-1.3 2.69zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-medium text-white/55 uppercase tracking-wider">Download on the</span>
              <span className="text-[16px] font-bold text-white leading-tight">App Store</span>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] text-white/40 font-mono border border-white/20 px-2 py-0.5 rounded-full">iOS</span>
            </div>
          </a>

          {/* Android — Google Play */}
          <a
            href="#"
            aria-label="Get it on Google Play for Android"
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all backdrop-blur-sm"
          >
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.35.2.74.24 1.12.12l11.5-6.63-2.43-2.44-10.19 8.95zm-1.1-19.82c-.08.2-.08.43-.08.67v18.8c0 .24 0 .47.08.67l.08.06 10.52-10.52v-.25L2.16 3.88l-.08.06zM19.77 10.81l-2.98-1.73-2.7 2.71 2.7 2.71 3-1.73c.86-.49.86-1.27-.02-1.96zm-17.61 9.45l.08-.08 10.52-10.52-2.43-2.43L1.16 18.13l.1.13z" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-medium text-white/55 uppercase tracking-wider">Get it on</span>
              <span className="text-[16px] font-bold text-white leading-tight">Google Play</span>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] text-white/40 font-mono border border-white/20 px-2 py-0.5 rounded-full">Android</span>
            </div>
          </a>
        </motion.div>

        <motion.p variants={FADE_UP} className="mt-6 text-[11px] text-white/35 font-mono">
          Notify me at launch →{" "}
          <Link href="/connect" className="text-emerald-400 underline underline-offset-2">
            Join waitlist
          </Link>
        </motion.p>
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
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Lock,
    tag: "Privacy",
    title: "Encrypted Wallet",
    desc: "Your private keys never leave your device. AES-GCM encrypted, unlocked only by your biometric or password.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: MessageSquare,
    tag: "Chat",
    title: "Whale Chat",
    desc: "End-to-end encrypted messages between verified wallets. No phone number, no IP tracking, no metadata.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: BarChart3,
    tag: "Portfolio",
    title: "Private Analytics",
    desc: "Monitor capital flows and manage shielded assets across Ethereum L1 and L2 — completely private.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function MobileManifesto() {
  const [hasSession, setHasSession] = useState(false);
  const [noteExpanded, setNoteExpanded] = useState(false);
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
      className="relative bg-[#F8F8F7] text-[#0A0A0A] font-sans antialiased overflow-x-hidden flex flex-col w-full"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* ── Sticky top nav ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-black/8" : "bg-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <nav className="flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/atom_3d_silver.jpg"
              alt="Whale Network"
              className="w-6 h-6 object-contain mix-blend-multiply"
            />
            <span className="font-serif text-[16px] font-black tracking-tight text-black">
              Whale Network
            </span>
          </Link>
          <Link
            href={hasSession ? "/terminal" : "/connect"}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[12px] font-bold rounded-full active:scale-[0.97] transition-transform"
          >
            {hasSession ? "Dashboard" : "Connect"}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════════════
          1. HERO — iOS/Android safe-area aware
          Uses env(safe-area-inset-top) for Dynamic Island/notch.
          min-h uses 100dvh (dynamic viewport height) so Chrome mobile
          toolbar collapse doesn't cause clipping.
         ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col justify-center items-center overflow-hidden bg-white border-b border-black/8"
        style={{
          paddingTop: "max(6rem, calc(env(safe-area-inset-top, 0px) + 6rem))",
          paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))",
          paddingLeft: "max(1.5rem, env(safe-area-inset-left, 1.5rem))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right, 1.5rem))",
          minHeight: "100dvh",
        }}
      >
        {/* Dot grid background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            opacity: 0.5,
          }}
        />
        {/* Radial glow centre */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(16,185,129,0.07),transparent)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="relative z-10 flex flex-col items-center text-center w-full max-w-[380px] mx-auto"
        >
          {/* Live status badge */}
          <motion.div variants={FADE_UP} className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">
                Aztec Testnet — Live
              </span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={FADE_UP}
            className="text-[44px] font-black tracking-tighter leading-[0.95] text-black mb-5"
          >
            The sovereign
            <br />
            <span className="text-black/40">gateway to</span>
            <br />
            <span className="text-emerald-600">Aztec.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={FADE_UP}
            className="text-[15px] text-black/65 leading-[1.65] mb-10 max-w-[320px] font-medium"
          >
            Zero-knowledge identity, end-to-end encrypted messaging, and shielded portfolio management — all settled privately on Ethereum L1.
          </motion.p>

          {/* Primary CTA */}
          <motion.div variants={FADE_UP} className="flex flex-col gap-3 w-full">
            <Link
              href={hasSession ? "/terminal" : "/connect"}
              className="flex items-center justify-center w-full h-[56px] bg-black text-white rounded-2xl font-bold text-[14px] tracking-wide active:scale-[0.98] transition-transform shadow-lg shadow-black/15"
            >
              {hasSession ? "Open Dashboard →" : "Connect Wallet →"}
            </Link>
            <Link
              href="/developers/api-docs"
              className="flex items-center justify-center w-full h-[50px] border border-black/15 text-black rounded-2xl font-semibold text-[13px] tracking-wide active:scale-[0.98] transition-transform bg-white/60 backdrop-blur-sm"
            >
              Read the Docs
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.div
            variants={FADE_UP}
            className="flex items-center gap-3 mt-10 opacity-60"
          >
            <div className="h-px flex-1 bg-black/15" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/55">
              Built on Aztec Network
            </span>
            <div className="h-px flex-1 bg-black/15" />
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
          <div className="w-px h-8 bg-gradient-to-b from-black/30 to-transparent" />
          <ChevronDown size={12} className="text-black/30 animate-bounce" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. FEATURE CARDS
         ══════════════════════════════════════════════════════ */}
      <section className="px-5 py-16 bg-[#F8F8F7] border-b border-black/8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={STAGGER}
          className="flex flex-col gap-4"
        >
          <motion.div variants={FADE_UP} className="text-center mb-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
              Platform Modules
            </span>
            <h2 className="text-[28px] font-black tracking-tighter text-black mt-2 leading-[1.0]">
              Everything private.
              <br />
              <span className="text-black/45">Nothing exposed.</span>
            </h2>
          </motion.div>

          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={SLIDE_IN}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-black/8 shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                  <Icon size={18} className={f.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[9px] font-black uppercase tracking-[0.2em] ${f.color}`}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-black text-black leading-tight mb-1">{f.title}</h3>
                  <p className="text-[13px] text-black/60 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. HOW IT WORKS
         ══════════════════════════════════════════════════════ */}
      <section className="px-5 py-16 bg-white border-b border-black/8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={STAGGER}
          className="flex flex-col gap-8"
        >
          <motion.div variants={FADE_UP} className="text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
              Protocol
            </span>
            <h2 className="text-[28px] font-black tracking-tighter text-black mt-2 leading-[1.0]">
              Built so there&apos;s
              <br />
              <em className="font-serif italic font-normal text-black/50">nothing to leak.</em>
            </h2>
          </motion.div>

          {[
            {
              step: "01",
              title: "Local Proving",
              desc: "Your device runs Noir circuits locally — generating a ZK proof before anything touches the network.",
            },
            {
              step: "02",
              title: "Encrypted State",
              desc: "Balances and credentials are stored as encrypted UTXO notes on Aztec L2. Only your viewing key decrypts them.",
            },
            {
              step: "03",
              title: "Nullifier Resistance",
              desc: "A deterministic nullifier prevents double-spending and Sybil attacks while keeping the actor completely anonymous.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={FADE_UP}
              className="flex gap-5 items-start"
            >
              <div className="w-10 h-10 rounded-full border-2 border-black/10 bg-[#F8F8F7] flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono text-[11px] font-black text-black/55">{s.step}</span>
              </div>
              <div>
                <h3 className="text-[16px] font-black text-black mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-black/60 leading-relaxed font-medium">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. WHALE CHAT — dark section
         ══════════════════════════════════════════════════════ */}
      <section className="px-5 py-16 bg-[#0A0A0A] text-white border-b border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={STAGGER}
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">
              Whale Chat
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </motion.div>

          <motion.h2
            variants={FADE_UP}
            className="text-[36px] font-black tracking-tighter leading-[0.95] text-white mb-5"
          >
            Sovereign{" "}
            <span className="text-emerald-400">Privacy.</span>
          </motion.h2>

          <motion.div
            variants={FADE_UP}
            className="space-y-4 text-[14px] text-white/70 leading-[1.7] text-center max-w-[320px] mb-8 font-medium"
          >
            <p>
              Centralized messaging platforms are liabilities. Whale Chat is built on XMTP — encrypted directly with your authorised wallet keys.
            </p>

            <AnimatePresence>
              {noteExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <p className="text-white/60">
                    No telecom provider or unauthorized entity can intercept the data. Messages are anchored to your private cryptographic state.
                  </p>
                  <p className="text-white/60">
                    Used daily for secure transfers and cryptographic attestation where sovereign privacy is non-negotiable.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={FADE_UP} className="flex flex-col gap-3 w-full max-w-[280px]">
            <button
              onClick={() => setNoteExpanded((v) => !v)}
              className="flex items-center justify-center gap-2 w-full h-[50px] rounded-2xl border border-white/15 bg-white/5 font-mono text-[11px] font-black tracking-[0.18em] uppercase text-white active:bg-white/10 transition-colors"
            >
              {noteExpanded ? "Collapse" : "Read More"}
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${noteExpanded ? "rotate-180" : ""}`}
              />
            </button>
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 w-full h-[50px] rounded-2xl bg-emerald-500 text-white font-bold text-[13px] tracking-wide active:scale-[0.98] transition-transform"
            >
              Open Whale Chat →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. HOSPITAL PARTNERSHIP — Colțea
         ══════════════════════════════════════════════════════ */}
      <section className="px-5 py-16 bg-[#F8F8F7] border-b border-black/8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={STAGGER}
          className="flex flex-col gap-6"
        >
          <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/12 bg-white text-[9px] font-black uppercase tracking-[0.2em] text-black/55 font-mono">
              <Globe size={10} />
              Partnership — est. 1704
            </span>
          </motion.div>

          <motion.h2
            variants={FADE_UP}
            className="text-[30px] font-black tracking-tighter leading-[0.95] text-black"
          >
            The First Hospital
            <br />
            <span className="text-black/40">in History to</span>
            <br />
            Secure Records
            <br />
            <span className="text-emerald-600">on Chain.</span>
          </motion.h2>

          <motion.p
            variants={FADE_UP}
            className="text-[14px] text-black/60 leading-relaxed font-medium max-w-[320px]"
          >
            Spitalul Clinic Colțea (est. 1704) has partnered with Whale Network. We are the first platform to hash medical discharge records on the Ethereum blockchain. Your history is mathematically protected and belongs entirely to you.
          </motion.p>

          <motion.div variants={FADE_UP}>
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold text-[13px] tracking-wide active:scale-[0.97] transition-transform"
            >
              Partner With Us
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. APP DOWNLOAD — iOS & Android
         ══════════════════════════════════════════════════════ */}
      <AppDownloadSection />

      {/* ══════════════════════════════════════════════════════
          7. POWERED BY AZTEC
         ══════════════════════════════════════════════════════ */}
      <section
        className="px-5 py-16 bg-white border-t border-black/8 text-center flex flex-col items-center"
        style={{
          paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={STAGGER}
          className="flex flex-col items-center gap-6"
        >
          <motion.span
            variants={FADE_UP}
            className="inline-block font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/45 px-3.5 py-1.5 border border-black/12 rounded-full"
          >
            Infrastructure Partner
          </motion.span>

          <motion.h2
            variants={FADE_UP}
            className="text-[28px] font-black tracking-tighter leading-[1.0] text-black"
          >
            Powered by{" "}
            <span className="text-black/40">Aztec Network.</span>
          </motion.h2>

          <motion.img
            variants={FADE_UP}
            src="/aztec-logo-black.png"
            alt="Aztec Network"
            className="h-16 object-contain mix-blend-multiply opacity-90"
          />

          <motion.p
            variants={FADE_UP}
            className="text-[13px] text-black/55 leading-relaxed max-w-[300px] font-medium"
          >
            Built on the Aztec L2 zk-Rollup — Noir circuits, PXE local execution, and nullifier-based Sybil resistance. The definitive infrastructure for sovereign security.
          </motion.p>

          {/* Bottom CTA */}
          <motion.div variants={FADE_UP} className="flex flex-col gap-3 w-full max-w-[280px] mt-4">
            <Link
              href={hasSession ? "/terminal" : "/connect"}
              className="flex items-center justify-center w-full h-[54px] bg-black text-white rounded-2xl font-bold text-[14px] tracking-wide active:scale-[0.98] transition-transform shadow-md shadow-black/10"
            >
              {hasSession ? "Open Dashboard →" : "Get Started →"}
            </Link>
            <Link
              href="/architecture"
              className="flex items-center justify-center w-full h-[46px] border border-black/12 text-black/70 rounded-2xl font-semibold text-[13px] active:scale-[0.98] transition-transform"
            >
              View Architecture
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
