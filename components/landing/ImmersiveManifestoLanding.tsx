"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { NetworkMapPanel } from '@/components/terminal/NetworkMapPanel';
import { ChevronDown, ArrowRight, Shield, Zap, Lock, Database, Terminal, Cpu, Key, Activity, MessageSquare } from "lucide-react";

// Lottie cargado dinámicamente
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Real world map
const RealWorldMap = dynamic(
  () => import("@/components/landing/RealWorldMap").then((m) => m.RealWorldMap),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-black/[0.02] animate-pulse rounded-xl" /> }
);

// ─── Animation Variants ───────────────────────────────────────────────────────

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const FADE_IN = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: "easeOut" } }
};

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

// ─── Nav ──────────────────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    const readSession = () => {
      try {
        const m = document.cookie.match(/system_handshake=(0x[a-fA-F0-9]{40})/i);
        if (m?.[1]) { setConnectedAddress(m[1].toLowerCase()); return; }
      } catch {}
      setConnectedAddress(null);
    };
    readSession();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-white/90 backdrop-blur-xl border-b border-black/5" : "bg-transparent"
      }`}
    >
      <nav className="w-full max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 overflow-hidden">
            <img src="/atom_3d_silver.jpg" alt="Logo" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
          </div>
          <span className="font-serif text-[18px] font-black tracking-tight text-black">
            Whale Network
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Architecture", "Security", "Ecosystem", "Docs"].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`} className="text-[13px] font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors">
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {connectedAddress ? (
            <Link href="/terminal" className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all rounded-full">
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <Link href="/connect" className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all rounded-full hover:scale-105">
              Connect <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

// ─── Hero Section with Parallax ──────────────────────────────────────────────

function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.92]);

  return (
    <section className="relative w-full bg-[#fcfcfc] overflow-hidden min-h-[100vh] flex flex-col items-center justify-center pt-20">
      {/* Animated Topographic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
           style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#fcfcfc]/80 to-[#fcfcfc]" />

      <motion.div 
        style={{ y: y1, opacity, scale }}
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10 px-5 py-2.5 bg-white border border-black/10 rounded-full shadow-sm"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-black/70">
            Aztec Testnet V5 Active
          </span>
        </motion.div>

        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
          className="text-[60px] md:text-[90px] lg:text-[120px] font-black tracking-tighter leading-[0.85] text-black mb-8"
        >
          <motion.span variants={FADE_UP} className="block">Programmable</motion.span>
          <motion.span variants={FADE_UP} className="block text-black/30 italic font-serif font-light">Privacy.</motion.span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-[18px] md:text-[24px] font-medium text-black/60 max-w-[800px] leading-[1.6] mb-12"
        >
          The fully shielded application layer. Sovereign execution over Aztec's zero-knowledge Rollup. Write private smart contracts in Noir, prove locally, and settle securely on Ethereum.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <Link href="/connect" className="group relative flex items-center justify-center px-10 py-5 bg-black text-white text-[14px] font-bold uppercase tracking-widest overflow-hidden rounded-xl">
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            <span className="relative flex items-center gap-3">Initialize Terminal <ArrowRight size={16} /></span>
          </Link>
          <Link href="/architecture" className="flex items-center justify-center px-10 py-5 border-2 border-black/10 text-black text-[14px] font-bold uppercase tracking-widest hover:border-black transition-colors rounded-xl">
            Read the Docs
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Scroll to explore</span>
        <div className="w-[2px] h-16 bg-gradient-to-b from-black/20 to-transparent rounded-full" />
      </motion.div>
    </section>
  );
}

// ─── Deep Technical Architecture ──────────────────────────────────────────────

function TechnicalArchitecture() {
  const specs = [
    { 
      step: "01",
      title: "Local Client Proving (PXE)", 
      desc: "Whale Network leverages Aztec's Private Execution Environment (PXE). Instead of sending raw parameters to a public mempool, your local device compiles the Noir circuit into ACIR and generates a Barretenberg SNARK proof. The network only receives the mathematical proof of correctness, never your data.", 
      icon: Cpu 
    },
    { 
      step: "02",
      title: "Encrypted UTXO State", 
      desc: "Balances and portfolio states are stored as encrypted notes on an append-only Merkle tree. You possess the Viewing Key required to decrypt your notes. To transfer value, a deterministic Nullifier is generated, preventing double-spending while maintaining absolute anonymity.", 
      icon: Lock 
    },
    { 
      step: "03",
      title: "L1 to L2 Message Boxes", 
      desc: "Capital flows seamlessly and trustlessly between Ethereum (L1) and the shielded L2 pool. Using Aztec's native Outbox/Inbox architecture, smart contracts communicate cross-chain with cryptographic finality without relying on centralized multisig bridges.", 
      icon: Zap 
    }
  ];

  return (
    <section className="w-full bg-white py-40 border-t border-black/5 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="mb-24 text-center flex flex-col items-center"
        >
          <motion.span variants={FADE_UP} className="font-mono text-[12px] font-black uppercase tracking-[0.3em] text-black/40 mb-6 block">
            Cryptographic Protocol
          </motion.span>
          <motion.h2 variants={FADE_UP} className="text-[50px] md:text-[80px] font-black tracking-tighter leading-[0.95] text-black mb-8 max-w-[900px]">
            Engineered for <br/>
            <span className="text-black/30">absolute stealth.</span>
          </motion.h2>
          <motion.p variants={FADE_UP} className="text-[20px] text-black/60 leading-[1.6] max-w-[700px] font-medium">
            We don't obfuscate data. We eliminate it. By using advanced zero-knowledge cryptography, your interactions are mathematically proven without being revealed.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {specs.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={FADE_UP}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col group p-10 bg-[#fcfcfc] border border-black/5 hover:border-black/20 hover:bg-white transition-all duration-500 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 text-[180px] font-black text-black/[0.02] pointer-events-none transition-transform group-hover:scale-110">
                  {spec.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-8 shadow-xl">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-[24px] font-black tracking-tight mb-4">{spec.title}</h3>
                <p className="text-[16px] text-black/60 leading-relaxed font-medium relative z-10">{spec.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── The Terminal Modules (Bento Grid) ────────────────────────────────────────

function TerminalModules() {
  return (
    <section className="w-full bg-[#0A0A0A] text-white py-40 border-t border-white/5 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="mb-20"
        >
          <motion.span variants={FADE_UP} className="font-mono text-[12px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 block">
            The Sovereign Terminal
          </motion.span>
          <motion.h2 variants={FADE_UP} className="text-[50px] md:text-[70px] font-black tracking-tighter leading-[0.95] text-white max-w-[800px]">
            Comprehensive privacy across every layer.
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Module 1: Identity */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            whileHover={{ scale: 1.01 }}
            className="col-span-1 lg:col-span-7 p-12 bg-white/[0.02] border border-white/10 rounded-3xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Key size={24} /></div>
                <span className="font-mono text-[13px] uppercase tracking-widest text-white/50">Aztec Identity</span>
              </div>
              <h3 className="text-[32px] font-black tracking-tight mb-4">Indexed ZK Signatures</h3>
              <p className="text-[17px] text-white/50 leading-relaxed max-w-[500px]">
                Prove you are a unique human without exposing any personal data. Whale Network implements a rigorous 200 Beta Supply Indexed Wallet Signature protocol directly querying the Aztec Native Context.
              </p>
            </div>
          </motion.div>

          {/* Module 2: Chat */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            whileHover={{ scale: 1.01 }}
            className="col-span-1 lg:col-span-5 p-12 bg-white/[0.02] border border-white/10 rounded-3xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><MessageSquare size={24} /></div>
                <span className="font-mono text-[13px] uppercase tracking-widest text-white/50">Encrypted Comms</span>
              </div>
              <h3 className="text-[32px] font-black tracking-tight mb-4">Whale Chat</h3>
              <p className="text-[17px] text-white/50 leading-relaxed">
                XMTP-powered end-to-end encrypted messaging between verified cryptographic identities. No phone numbers, no metadata leakage, offline persistence.
              </p>
            </div>
          </motion.div>

          {/* Module 3: Portfolio */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            whileHover={{ scale: 1.01 }}
            className="col-span-1 lg:col-span-12 p-12 bg-white/[0.02] border border-white/10 rounded-3xl flex flex-col md:flex-row items-center gap-12"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Activity size={24} /></div>
                <span className="font-mono text-[13px] uppercase tracking-widest text-white/50">Shielded Wealth</span>
              </div>
              <h3 className="text-[32px] font-black tracking-tight mb-4">Private Portfolio Analytics</h3>
              <p className="text-[17px] text-white/50 leading-relaxed max-w-[600px]">
                Monitor your capital flows and manage shielded assets across Ethereum L1 and L2s. Whale Analytics tracks the market without the market tracking you. 100% Zero-Mock architecture.
              </p>
            </div>
            <div className="flex-1 w-full flex justify-end">
              <div className="w-full max-w-[400px] h-[200px] rounded-2xl bg-gradient-to-tr from-white/[0.05] to-transparent border border-white/10 flex items-center justify-center">
                 <Terminal size={48} className="text-white/20" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Visual Topography (Network Map) ──────────────────────────────────────────

function TopographySection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section ref={ref} className="w-full bg-[#f5f5f5] py-40 overflow-hidden relative border-t border-black/10">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER_CONTAINER} className="relative z-10">
          <motion.span variants={FADE_UP} className="font-mono text-[12px] font-black uppercase tracking-[0.3em] text-black/40 mb-6 block">
            System Map
          </motion.span>
          <motion.h2 variants={FADE_UP} className="text-[50px] md:text-[70px] font-black tracking-tighter leading-[0.95] text-black mb-8">
            The verifiable <br/>
            <span className="text-black/30">registry.</span>
          </motion.h2>
          <motion.p variants={FADE_UP} className="text-[18px] text-black/60 leading-[1.6] max-w-[500px] mb-12 font-medium">
            Live topological mapping of the protocol stack. From L1 settlement on Ethereum to private execution on Aztec, observe the flow of shielded transactions in real time.
          </motion.p>
          <motion.div variants={FADE_UP}>
            <Link href="/architecture" className="inline-flex items-center gap-4 text-[14px] font-bold uppercase tracking-widest text-black group">
              <span className="border-b-2 border-black pb-1">View Full Specification</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative h-[700px] w-full">
          <motion.div style={{ y }} className="absolute inset-0 rounded-3xl border border-black/10 bg-white shadow-2xl overflow-hidden">
              <NetworkMapPanel />
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="w-full relative overflow-hidden flex flex-col justify-center items-center bg-black py-40">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER_CONTAINER}
        className="relative z-20 w-full max-w-[900px] mx-auto px-6 text-center flex flex-col items-center"
      >
        <motion.span variants={FADE_UP} className="font-mono text-[12px] font-black uppercase tracking-[0.3em] text-white/50 mb-8 border border-white/20 px-6 py-2 rounded-full backdrop-blur-md">
          Join the Beta
        </motion.span>
        <motion.h2 variants={FADE_UP} className="text-[60px] md:text-[90px] lg:text-[110px] font-black tracking-tighter leading-[0.9] text-white mb-10">
          Enter the <br/>
          <span className="text-emerald-400">Network.</span>
        </motion.h2>
        <motion.p variants={FADE_UP} className="text-[20px] text-white/60 mb-12 max-w-[600px] font-medium">
          Deploy your identity on the Aztec L2. Absolute privacy is not a feature, it is the foundation.
        </motion.p>
        <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-6 mt-4">
          <Link href="/connect" className="px-14 py-6 bg-white text-black font-black uppercase tracking-widest text-[15px] hover:scale-105 transition-transform rounded-2xl">
            Connect Wallet
          </Link>
          <Link href="/architecture" className="px-14 py-6 border-2 border-white/20 text-white font-bold uppercase tracking-widest text-[15px] hover:bg-white/10 transition-colors rounded-2xl">
            Read Docs
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding() {
  return (
    <div className="relative font-sans antialiased bg-white w-full flex flex-col overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TechnicalArchitecture />
      <TerminalModules />
      <TopographySection />
      <FinalCTASection />
    </div>
  );
}
