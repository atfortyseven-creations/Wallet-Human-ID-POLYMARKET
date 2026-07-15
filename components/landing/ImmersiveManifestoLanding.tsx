"use client";

import React, { useRef, useEffect, useState, MouseEvent, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValue, useMotionTemplate } from "framer-motion";
import dynamic from "next/dynamic";
import { EmailLoginModal } from '@/components/auth/EmailLoginModal';
import { signOut } from 'next-auth/react';

// ─── NAV DATA ────────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { label: "Studio Provenance", sub: "Zero-knowledge verifiable provenance", href: "/portfolio" },
  { label: "Aztec Identity", sub: "Privacy-preserving portfolio layer", href: "/developers/api-docs" },
  { label: "Whale Chat", sub: "Encrypted, verifiable communications", href: "/developer" },
  { label: "Registry Explorer", sub: "Global network topology & coverage", href: "/registry" },
];

const COMPANY_LINKS = [
  { label: "About Humanity Ledger", href: "/company" },
  { label: "Legal & Compliance", href: "/legal/compliance" },
  { label: "Security & Audits", href: "/security" },
  { label: "Network Forum", href: "/forum" },
];

// ─── BACKGROUND GRID (IMMERSIVE) ─────────────────────────────────────────────

const DottedGrid = React.memo(() => (
  <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden bg-white" aria-hidden="true">
    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-multiply" />
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 100%)'
      }}
    />
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
        backgroundSize: '20px 20px',
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)'
      }}
    />
  </div>
));
DottedGrid.displayName = "DottedGrid";

// ─── LANDING NAV ──────────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    const getContainer = () =>
      (document.querySelector('main[class*="overflow-y-auto"]') as HTMLElement | null)
      ?? document.documentElement;

    const onScroll = () => {
      const el = getContainer();
      setScrolled((el.scrollTop ?? window.scrollY) > 20);
    };

    const container = getContainer();
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const readSession = () => {
      try {
        const m = document.cookie.match(/system_handshake=(0x[a-fA-F0-9]{40}|email_[^;\s]+)/i);
        if (m?.[1]) {
          setConnectedAddress(m[1].toLowerCase());
          return;
        }
        const raw = localStorage.getItem('system_session_v2');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.wallet && parsed?.exp > Date.now()) {
            setConnectedAddress(parsed.wallet.toLowerCase());
            return;
          }
        }
      } catch {}
      setConnectedAddress(null);
    };
    readSession();
    window.addEventListener('storage', readSession);
    document.addEventListener('visibilitychange', readSession);
    return () => {
      window.removeEventListener('storage', readSession);
      document.removeEventListener('visibilitychange', readSession);
    };
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      document.cookie.split(';').forEach(c => { 
        document.cookie = `${c.split('=')[0].trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`; 
      });
      try { sessionStorage.clear(); localStorage.removeItem('system_session_v2'); } catch {}
      try { await signOut({ redirect: false }); } catch {}
      window.location.replace('/');
    } catch { window.location.replace('/'); }
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-2xl border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
          : "bg-transparent"
      }`}
    >
      <nav className="w-full max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main Navigation">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Humanity Ledger Home">
            <div className="w-6 h-6 shrink-0 opacity-80 mix-blend-multiply group-hover:rotate-180 transition-transform duration-700 ease-in-out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-black" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-serif text-[18px] font-black tracking-tight text-black leading-none">
              Whale Network
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/architecture" className="text-[13.5px] font-semibold text-black/50 hover:text-black transition-colors">Architecture</Link>
            
            <div className="relative group h-16 flex items-center" onMouseEnter={() => setProductOpen(true)} onMouseLeave={() => setProductOpen(false)}>
              <button className="flex items-center gap-1.5 text-[13.5px] font-semibold text-black/50 hover:text-black transition-colors" aria-expanded={productOpen} aria-haspopup="true">
                Ecosystem <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${productOpen ? "rotate-180" : ""}`} aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {productOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="absolute top-16 left-0 bg-white border border-black/5 shadow-2xl rounded-2xl p-2 w-[340px] z-50">
                    {PRODUCT_LINKS.map((l) => (
                      <Link key={l.label} href={l.href} className="flex flex-col px-4 py-3 hover:bg-black/[0.02] rounded-xl transition-colors">
                        <span className="text-[14px] font-bold text-black mb-1">{l.label}</span>
                        <span className="text-[12px] font-medium text-black/40">{l.sub}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group h-16 flex items-center" onMouseEnter={() => setCompanyOpen(true)} onMouseLeave={() => setCompanyOpen(false)}>
              <button className="flex items-center gap-1.5 text-[13.5px] font-semibold text-black/50 hover:text-black transition-colors" aria-expanded={companyOpen} aria-haspopup="true">
                Entity <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${companyOpen ? "rotate-180" : ""}`} aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {companyOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="absolute top-16 left-0 bg-white border border-black/5 shadow-2xl rounded-2xl p-2 w-[220px] z-50">
                    {COMPANY_LINKS.map((l) => (
                      <Link key={l.label} href={l.href} className="flex items-center px-4 py-2.5 hover:bg-black/[0.02] rounded-xl transition-colors">
                        <span className="text-[14px] font-bold text-black">{l.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/developers/api-docs" className="text-[13.5px] font-bold text-black/60 hover:text-black transition-colors mr-2">
            Documentation
          </Link>
          {connectedAddress ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.03] border border-black/5 rounded-full" aria-label="Connected Wallet">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" aria-hidden="true" />
                <span className="text-[12px] font-mono font-bold text-black/70">
                  {connectedAddress.startsWith('email_') ? connectedAddress.replace('email_', '').slice(0, 15) + '…' : `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}`}
                </span>
              </div>
              <Link href="/terminal" className="px-5 py-2 bg-black text-white text-[13.5px] font-bold rounded-full hover:bg-black/80 hover:scale-105 transition-all duration-300 shadow-lg">
                Dashboard →
              </Link>
              <button
                onClick={handleDisconnect}
                className="w-9 h-9 flex items-center justify-center bg-black/[0.03] border border-black/5 rounded-full text-black/40 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all duration-300"
                title="Disconnect"
                aria-label="Disconnect Session"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => setEmailModalOpen(true)} className="flex items-center gap-2 px-5 py-2 bg-black/[0.03] border border-black/5 rounded-full text-[13.5px] font-bold text-black/80 hover:bg-black/[0.06] hover:scale-105 transition-all duration-300">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="" aria-hidden="true" />
                Connect Gmail
              </button>
              <Link href="/portfolio" className="px-5 py-2 bg-black text-white text-[13.5px] font-bold rounded-full hover:bg-black/80 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/20">
                Connect Wallet
              </Link>
            </div>
          )}
        </div>
      </nav>
      <EmailLoginModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </header>
  );
}

// ─── HERO SCROLL ENGINE ─────────────────────────────────────────────────────

function HeroScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45]);

  return (
    <section ref={containerRef} className="relative w-full h-[120vh] flex items-center justify-center overflow-hidden pt-20" aria-label="Hero Section">
      <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-20 right-[10%] w-[500px] h-[500px] border-[1px] border-black/[0.03] rounded-full pointer-events-none" aria-hidden="true" />
      <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] left-[5%] w-[800px] h-[800px] border-[1px] border-black/[0.02] rounded-full pointer-events-none" aria-hidden="true" />

      <motion.div 
        style={{ opacity, scale, y }}
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-black/5 mb-10"
        >
          <div className="relative flex items-center justify-center w-3 h-3" aria-hidden="true">
            <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[12px] font-bold text-black/80 tracking-widest uppercase">Aztec Alpha Testnet Live (rc.2)</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[72px] md:text-[110px] leading-[0.9] font-serif font-black text-black tracking-tighter max-w-[1100px]"
        >
          Absolute Privacy <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-black/30 via-black/80 to-black/30">for Ethereum.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 text-[20px] md:text-[26px] leading-[1.4] text-black/50 font-medium max-w-[800px]"
        >
          Whale Network is a sovereign-grade identity terminal and cryptographic analytics ecosystem built natively for the Aztec Network. We provide provable censorship resistance via Zero-Knowledge (ZK) cryptography.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/developers/api-docs" className="group relative h-16 px-10 bg-black text-white rounded-full flex items-center justify-center text-[16px] font-bold overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2">Read Documentation <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
          </Link>
          <Link href="/architecture" className="h-16 px-10 bg-white border border-black/10 text-black rounded-full flex items-center justify-center text-[16px] font-bold hover:bg-black/[0.02] hover:scale-105 transition-all duration-300 shadow-sm">
            Explore Architecture
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── THE CYPHERPUNK MANDATE ──────────────────────────────────────────────────

function CypherpunkMandateSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full py-32 bg-[#050505] text-white z-10" aria-labelledby="mandate-heading">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-screen pointer-events-none" aria-hidden="true" />
      <div className="max-w-[1200px] mx-auto px-6" ref={ref}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.05] rounded-full border border-white/10 mb-6">
            <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase">Philosophical Foundation</span>
          </div>
          <h2 id="mandate-heading" className="text-[40px] md:text-[64px] font-serif font-black leading-[1] tracking-tighter">
            The Cypherpunk Mandate.
          </h2>
          <p className="mt-8 text-[20px] text-white/50 font-medium max-w-[800px] mx-auto leading-relaxed">
            Privacy is a fundamental right. Architecture is a declaration of values. In an era of pervasive telemetry and centralized tracking, Whale Network represents a hard cryptographic boundary.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "No Analytics", desc: "There is no Google Analytics, no Vercel Analytics, no tracking cookies. Zero client-side surveillance.", icon: "🚫" },
            { title: "No IP Logging", desc: "The routing layer employs zero-metadata onion-like IP obfuscation (SHA-256 hashes with environmental salts).", icon: "🌐" },
            { title: "Absolute Data Siloing", desc: "Cross-contamination of smart contract state is mathematically prevented via strict PXE proxy isolation.", icon: "🔒" },
            { title: "Sovereign Killswitch", desc: "Initiating nuclearDisconnect performs a forensic purge of all local storage, keys, and session data irreversibly.", icon: "☢️" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="text-4xl mb-6">{item.icon}</div>
              <h3 className="text-[20px] font-bold mb-3 font-serif">{item.title}</h3>
              <p className="text-[15px] text-white/50 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SYSTEM TOPOLOGY & ACCESS GUIDE ──────────────────────────────────────────

function SystemTopologySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const modules = [
    {
      title: "Studio Provenance",
      path: "/portfolio",
      desc: "Track cross-chain capital flows and asset balances locally. No server ever sees your complete portfolio. Proof generation happens via WebAssembly directly in your browser.",
      action: "Access Portfolio →"
    },
    {
      title: "Registry Explorer",
      path: "/registry",
      desc: "Explore countries with supported documents, view node coverage and density. A real-time supervision map of the global network topology including Aztec sequencers.",
      action: "View Explorer →"
    },
    {
      title: "Whale Chat",
      path: "/developer",
      desc: "Peer-to-Peer encrypted communications using Perfect Forward Secrecy (ephemeral X25519 keys) and zero-metadata routing. Structurally immune to central surveillance.",
      action: "Launch Chat →"
    },
    {
      title: "Aztec Identity & Docs",
      path: "/developers/api-docs",
      desc: "The core of the project. Attest complex criteria using locally compiled Noir circuits. Read the full SDK documentation to integrate privacy-preserving identity verification into your dApps.",
      action: "Read Docs →"
    },
    {
      title: "Network Forum",
      path: "/forum",
      desc: "The decentralized governance and discussion hub for the Humanity Ledger ecosystem. Participate in protocol upgrades and cryptographic research.",
      action: "Join Discussion →"
    },
    {
      title: "System Terminal",
      path: "/terminal",
      desc: "For advanced users. Directly interface with the Private Execution Environment (PXE) nodes, monitor local proof generation, and manage cryptographic keychains.",
      action: "Open Terminal →"
    }
  ];

  return (
    <section className="relative w-full py-40 bg-white z-10 border-t border-black/5" aria-labelledby="topology-heading">
      <div className="max-w-[1400px] mx-auto px-6" ref={ref}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 max-w-[900px]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/[0.03] rounded-full border border-black/5 mb-6">
            <span className="text-[11px] font-bold text-black/60 tracking-widest uppercase">Ecosystem Map</span>
          </div>
          <h2 id="topology-heading" className="text-[48px] md:text-[64px] font-serif font-black text-black leading-[1] tracking-tighter">
            System Topology & <br/><span className="text-black/30">Documentation Hub.</span>
          </h2>
          <p className="mt-8 text-[22px] text-black/50 font-medium max-w-[700px] leading-relaxed">
            Whale Network consists of multiple sovereign modules running over the Aztec protocol. We provide absolute transparency on how to access every corner of our system. Nobody is locked out of the documentation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col p-8 border border-black/10 rounded-3xl hover:border-black/30 hover:shadow-xl transition-all duration-500 bg-white group"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[24px] font-bold font-serif text-black">{mod.title}</h3>
                <span className="px-3 py-1 bg-black/[0.05] rounded-full text-[11px] font-mono font-bold text-black/60">{mod.path}</span>
              </div>
              <p className="text-[16px] text-black/60 font-medium leading-[1.6] mb-8 flex-1">
                {mod.desc}
              </p>
              <Link href={mod.path} className="inline-flex items-center gap-2 text-[15px] font-bold text-emerald-600 group-hover:text-emerald-500 transition-colors">
                {mod.action}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HORIZONTAL SCROLL TIMELINE (THE ARCHITECTURE) ──────────────────────────

function HorizontalTransactionFlow() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#050505]" aria-label="Transaction Lifecycle Timeline">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-screen pointer-events-none" aria-hidden="true" />
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="absolute top-32 left-12 md:left-24 z-20 pointer-events-none">
          <h2 className="text-[32px] md:text-[48px] font-serif font-black text-white leading-none">
            The Lifecycle of a <br/><span className="text-emerald-400">Private Transaction</span>
          </h2>
        </div>

        <motion.div style={{ x }} className="flex w-[300vw]">
          <div className="w-screen h-screen flex items-center justify-center px-12 md:px-24">
            <article className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-[14px] font-bold text-white/50 tracking-widest mb-4">PHASE 01</div>
                <h3 className="text-[40px] font-serif font-black text-white mb-6 leading-tight">Client-Side Proving</h3>
                <p className="text-[18px] text-white/70 leading-relaxed font-medium">
                  Transactions are constructed and proven entirely on your local device within the Private Execution Environment (PXE). Your private keys and raw data never leave your browser, generating a highly compressed zero-knowledge proof using the Noir WASM compiler.
                </p>
              </div>
              <figure className="h-[400px] border border-white/10 rounded-3xl bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" aria-hidden="true" />
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-500 animate-pulse relative z-10" aria-label="Client Proving Icon">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </figure>
            </article>
          </div>

          <div className="w-screen h-screen flex items-center justify-center px-12 md:px-24">
            <article className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-[14px] font-bold text-white/50 tracking-widest mb-4">PHASE 02</div>
                <h3 className="text-[40px] font-serif font-black text-white mb-6 leading-tight">Decentralized Sequencer Network</h3>
                <p className="text-[18px] text-white/70 leading-relaxed font-medium">
                  Local proofs are broadcasted to Aztec's decentralized network of sequencers and provers. The network aggregates thousands of UltraHonk ZK-proofs into a single master state transition proof, guaranteeing extreme scalability and anonymity sets without inspecting user payloads.
                </p>
              </div>
              <figure className="h-[400px] border border-white/10 rounded-3xl bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center shadow-2xl">
                 <div className="grid grid-cols-3 gap-4" aria-hidden="true">
                   {[...Array(9)].map((_, i) => (
                     <div key={i} className="w-12 h-12 border border-white/20 rounded-md bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                   ))}
                 </div>
              </figure>
            </article>
          </div>

          <div className="w-screen h-screen flex items-center justify-center px-12 md:px-24">
            <article className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-[14px] font-bold text-white/50 tracking-widest mb-4">PHASE 03</div>
                <h3 className="text-[40px] font-serif font-black text-white mb-6 leading-tight">Ethereum L1 Finality</h3>
                <p className="text-[18px] text-white/70 leading-relaxed font-medium">
                  The aggregated master proof and encrypted state diffs are submitted to Aztec's rollup contracts on Ethereum Mainnet. The result is absolute, mathematically guaranteed settlement backed by the world's most secure network. Privacy on L2, Security on L1.
                </p>
              </div>
              <figure className="h-[400px] border border-white/10 rounded-3xl bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center shadow-2xl">
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white" aria-label="Ethereum L1 Icon">
                    <polygon points="12 2 2 22 12 17 22 22 12 2"/>
                 </svg>
              </figure>
            </article>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── REGULATORY & COMPLIANCE SECTION ────────────────────────────────────────

function RegulatoryComplianceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full py-40 bg-white z-10 border-t border-black/5" aria-labelledby="compliance-heading">
      <div className="max-w-[1200px] mx-auto px-6" ref={ref}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/[0.05] rounded-full border border-red-500/20 mb-6">
            <span className="text-[11px] font-bold text-red-600 tracking-widest uppercase">Institutional & Government Notice</span>
          </div>
          <h2 id="compliance-heading" className="text-[40px] md:text-[56px] font-serif font-black text-black leading-[1] tracking-tighter">
            Legal & Regulatory Architecture.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="prose prose-lg prose-p:text-black/60 prose-p:font-medium prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-black max-w-none"
          >
            <h3>GDPR Compliance by Mathematical Default</h3>
            <p>
              Humanity Ledger S.L. operates a system that is <strong>structurally incapable of collecting, processing, or storing Personal Identifiable Information (PII)</strong>. Because all identity attestations occur locally within the user's browser via Zero-Knowledge Proofs, the network only ever receives encrypted cryptographic hashes. Consequently, the system is inherently compliant with strict data protection regulations (GDPR/CCPA) by eliminating the database itself.
            </p>
            <h3>Aztec Foundation Open-Source Mandate</h3>
            <p>
              Humanity Ledger and Whale Network are built as public goods for the Zero-Knowledge ecosystem. We proudly acknowledge the <strong>Aztec Foundation Grant program</strong>. To satisfy the open-source mandate of this grant, the cryptographic primitives and routing logic of this repository are provided transparently for public audit.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-black/[0.02] border border-black/10 rounded-3xl p-8"
          >
            <h3 className="text-[24px] font-serif font-bold text-black mb-6">The Dual License Model</h3>
            <p className="text-[16px] text-black/60 font-medium leading-[1.6] mb-6">
              This repository (`humanityledger/Humanity-Ledger`) is released under a Dual License model to protect the authors from unauthorized commercial exploitation while supporting the open-source ecosystem.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-white border border-black/5 rounded-xl">
                <h4 className="font-bold text-[14px] uppercase tracking-wider mb-2 text-emerald-600">Section 1: Public Good Use</h4>
                <p className="text-[14px] text-black/60">Strictly non-commercial or academic use aligned with the Aztec Network infrastructure is granted freely (MIT Variant).</p>
              </div>
              <div className="p-4 bg-white border border-black/5 rounded-xl">
                <h4 className="font-bold text-[14px] uppercase tracking-wider mb-2 text-red-600">Section 2: Commercial Prohibition</h4>
                <p className="text-[14px] text-black/60">Operating a commercial service, monetizing transactions, or deploying clones of this system requires explicit written authorization from Humanity Ledger S.L.</p>
              </div>
            </div>
            <Link href="/legal/compliance" className="inline-block mt-8 text-[14px] font-bold text-black border-b border-black hover:text-black/50 transition-colors">
              Read Full Legal Terms
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


// ─── CURSOR-AWARE BENTO GRID (INNOVATION) ───────────────────────────────────

function CursorCard({ title, description, icon, delay }: { title: string, description: string, icon: React.ReactNode, delay: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: true, margin: "-50px" });

  const handleMouseMove = useCallback(({ currentTarget, clientX, clientY }: MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={inViewRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className="group relative p-10 bg-white border border-black/5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full overflow-hidden"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(0,0,0,0.04),
                transparent 80%
              )
            `,
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 w-14 h-14 flex items-center justify-center bg-black/[0.02] border border-black/5 rounded-2xl mb-8 text-black shadow-inner" aria-hidden="true">
          {icon}
        </div>
        <h3 className="relative z-10 text-[22px] font-bold text-black tracking-tight mb-4 font-serif">{title}</h3>
        <p className="relative z-10 text-[16px] text-black/60 leading-[1.7] font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function BentoFeaturesSection() {
  return (
    <section className="relative w-full py-40 bg-white z-10 border-t border-black/5" aria-labelledby="features-heading">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-24 max-w-[900px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/[0.03] rounded-full border border-black/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-black/40" aria-hidden="true" />
            <span className="text-[11px] font-bold text-black/60 tracking-widest uppercase">Platform Primitives</span>
          </div>
          <h2 id="features-heading" className="text-[56px] md:text-[80px] font-serif font-black text-black leading-[1] tracking-tighter">
            Institutional-Grade <br/><span className="text-black/30">Confidentiality.</span>
          </h2>
          <p className="mt-8 text-[22px] text-black/50 font-medium max-w-[700px] leading-relaxed">
            Built entirely on Aztec's architecture, we provide a unified stack for privacy-first decentralized applications. Cryptographically secure, computationally scalable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CursorCard delay={0} title="Zero-Knowledge Accounts" description="Your identity is a Noir-proven ZK account. No passwords, no phone numbers. A cryptographic keypair proving who you are without disclosing your public address." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <CursorCard delay={0.1} title="Client-Side Proving" description="Noir circuits run entirely on your device via the Aztec PXE (Private Execution Environment). The network receives only a validity proof, never your private state." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>} />
          <CursorCard delay={0.2} title="Noir Smart Contracts" description="Write, test, and deploy zero-knowledge circuits using Noir. The record is public on L2, but the payload stays strictly private in encrypted UTXOs." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>} />
        </div>
      </div>
    </section>
  );
}

// ─── INTERACTIVE CODE SHOWCASE (TABS) ───────────────────────────────────────

const NOIR_CONTRACTS = {
  transfer: `// Aztec Noir Smart Contract: Private Transfer
contract PrivateToken {
    #[aztec(private)]
    fn transfer(
        from: AztecAddress,
        to: AztecAddress,
        amount: Field,
        nonce: Field
    ) {
        // Prove authorization without revealing the signer
        let signature = context.request_signature(from, nonce);
        assert(signature.is_valid());

        // Nullify the sender's private note
        let sender_balance = storage.balances.at(from);
        sender_balance.sub(amount);

        // Create a new encrypted note for the receiver
        let receiver_balance = storage.balances.at(to);
        receiver_balance.add(amount);
    }
}`,
  identity: `// Aztec Noir Smart Contract: ZK Identity
contract HumanityLedger {
    #[aztec(private)]
    fn prove_humanity(
        user: AztecAddress,
        merkle_root: Field,
        inclusion_proof: [Field; 32]
    ) {
        // Verify user is part of the verified human set
        let is_verified = std::merkle::check_membership(
            merkle_root,
            user.to_field(),
            inclusion_proof
        );
        assert(is_verified == true);

        // Emit an encrypted log only the user can decrypt
        emit_encrypted_log(user, "Humanity verified");
    }
}`
};

// Robust syntax highlighter for Noir
function highlightNoir(code: string) {
  let highlighted = code
    .replace(/contract/g, '<span class="text-emerald-400">contract</span>')
    .replace(/fn [a-zA-Z_]+/g, match => `<span class="text-blue-400">${match}</span>`)
    .replace(/#\[aztec\(private\)\]/g, '<span class="text-yellow-400">#[aztec(private)]</span>')
    .replace(/let /g, '<span class="text-purple-400">let </span>')
    .replace(/assert/g, '<span class="text-red-400">assert</span>')
    .replace(/Field|AztecAddress|bool/g, match => `<span class="text-emerald-200">${match}</span>`)
    .replace(/\/\/.*/g, match => `<span class="text-white/40">${match}</span>`);

  return highlighted;
}

function CodeShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'transfer' | 'identity'>('transfer');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const codeString = NOIR_CONTRACTS[activeTab];

  return (
    <section className="relative w-full py-40 bg-[#050505] z-10 border-t border-white/10" aria-labelledby="developer-heading">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-screen pointer-events-none" aria-hidden="true" />
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative z-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.05] rounded-full border border-white/10 mb-6">
            <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase">The Noir Language</span>
          </div>
          <h2 id="developer-heading" className="text-[48px] md:text-[64px] font-serif font-black text-white leading-[1] tracking-tighter mb-8">
            Write Private Smart Contracts.
          </h2>
          <p className="text-[20px] text-white/50 font-medium mb-10 leading-relaxed">
            Leverage Aztec's Rust-like ZK domain-specific language. Noir allows you to write private business logic that compiles to ultra-efficient Barretenberg circuits seamlessly.
          </p>
          
          <div className="flex gap-4 mb-8" role="tablist">
            <button 
              role="tab"
              aria-selected={activeTab === 'transfer'}
              onClick={() => setActiveTab('transfer')}
              className={`px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTab === 'transfer' ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              Private Transfer
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'identity'}
              onClick={() => setActiveTab('identity')}
              className={`px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTab === 'identity' ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              ZK Identity
            </button>
          </div>
        </motion.div>

        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 w-full bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />
          
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <span className="text-[12px] font-mono font-bold text-white/40 tracking-wider uppercase">
              {activeTab === 'transfer' ? 'PrivateToken.nr' : 'Identity.nr'}
            </span>
          </div>
          <div className="p-8 overflow-x-auto text-[14px] leading-[1.7] font-mono text-white/80 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                dangerouslySetInnerHTML={{
                  __html: `<pre><code>${codeString.split('\n').map((line, i) => `<div class="table-row"><span class="table-cell text-white/20 select-none pr-6 text-right">${i + 1}</span><span class="table-cell whitespace-pre">${highlightNoir(line)}</span></div>`).join('')}</code></pre>`
                }}
              />
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ─── FAQ SECTION ────────────────────────────────────────────────────────────

function FAQSection() {
  const faqs = [
    { q: "How is data kept private on a public blockchain?", a: "Aztec uses zero-knowledge cryptography (zk-SNARKs). Your data is encrypted and stored locally in your Private Execution Environment (PXE). When you transact, you generate a mathematical proof that the transaction is valid without revealing the actual data. Only the proof is sent to the network." },
    { q: "Do I need a new wallet?", a: "No. Aztec accounts are generated deterministically from your existing Ethereum keys (like MetaMask or WalletConnect) via signatures. You use your same Ethereum wallet, but interact within Aztec's shielded layer." },
    { q: "What is Noir?", a: "Noir is Aztec's domain-specific programming language for writing zero-knowledge circuits. It abstracts away complex cryptography, allowing developers to write private smart contracts using familiar Rust-like syntax." },
    { q: "Where can I find the official license?", a: "The source code is governed by a Dual License protecting against commercial exploitation while remaining open for public goods via the Aztec Network grant. You can review the full legal terms on our GitHub repository under the LICENSE file." }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative w-full py-40 bg-white z-10 border-t border-black/5" aria-labelledby="faq-heading">
      <div className="max-w-[1000px] mx-auto px-6">
        <h2 id="faq-heading" className="text-[40px] md:text-[56px] font-serif font-black text-black leading-[1] tracking-tighter mb-16 text-center">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-black/10 rounded-2xl overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left bg-transparent"
                aria-expanded={openIndex === i}
              >
                <span className="text-[18px] font-bold text-black font-serif pr-8">{faq.q}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transform transition-transform duration-300 shrink-0 ${openIndex === i ? 'rotate-180 text-emerald-500' : 'text-black/30'}`} aria-hidden="true">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-[16px] text-black/60 font-medium leading-relaxed border-t border-black/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="relative w-full py-40 bg-white z-10 border-t border-black/5" aria-labelledby="cta-heading">
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <div className="w-24 h-24 mx-auto bg-black/[0.02] border border-black/5 rounded-3xl flex items-center justify-center mb-10 shadow-inner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-black">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 id="cta-heading" className="text-[56px] md:text-[80px] font-serif font-black text-black leading-[1] tracking-tighter mb-8">
          Enter the <br/><span className="text-black/30">Sanctuary.</span>
        </h2>
        <p className="text-[20px] text-black/50 font-medium mb-12 max-w-[600px] mx-auto leading-relaxed">
          Initialize your Private Execution Environment and deploy your first confidential smart contract today. The future of Ethereum is verifiable and unconditionally private.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/portfolio" className="h-16 px-10 bg-black text-white rounded-full flex items-center justify-center text-[16px] font-bold hover:bg-black/80 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.2)] w-full sm:w-auto">
            Access Portfolio
          </Link>
          <Link href="/developers/api-docs" className="h-16 px-10 bg-white border border-black/10 text-black rounded-full flex items-center justify-center text-[16px] font-bold hover:bg-black/[0.02] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto shadow-sm">
            Read Full Documentation
          </Link>
        </div>
        <p className="mt-12 text-[13px] text-black/40 font-medium max-w-[400px] mx-auto">
          © 2026-2027 Humanity Ledger S.L.<br/>
          Licensed under the Whale Network Dual License.
        </p>
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding() {
  return (
    <main className="relative w-full bg-white text-black selection:bg-emerald-500/30 selection:text-black font-sans">
      <DottedGrid />
      <LandingNav />
      <HeroScrollSection />
      <CypherpunkMandateSection />
      <SystemTopologySection />
      <HorizontalTransactionFlow />
      <BentoFeaturesSection />
      <CodeShowcaseSection />
      <RegulatoryComplianceSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
