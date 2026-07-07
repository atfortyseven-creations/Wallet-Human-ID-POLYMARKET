"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { NetworkMapPanel } from '@/components/terminal/NetworkMapPanel';
import { ChevronDown, ArrowRight, Shield, Zap, Lock, Database } from "lucide-react";

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

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const REVEAL_TEXT = {
  hidden: { opacity: 0, clipPath: "inset(100% 0 0 0)" },
  visible: { opacity: 1, clipPath: "inset(0 0 0 0)", transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Nav ──────────────────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Check session
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
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  return (
    <section className="relative w-full bg-[#fcfcfc] overflow-hidden min-h-[100vh] flex flex-col items-center justify-center pt-20">
      {/* Animated Topographic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#fcfcfc]/80 to-[#fcfcfc]" />

      <motion.div 
        style={{ y: y1, opacity, scale }}
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10 px-4 py-2 bg-white border border-black/10 rounded-full shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black/60">
            Aztec Testnet V5 Active
          </span>
        </motion.div>

        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
          className="text-[60px] md:text-[90px] lg:text-[110px] font-black tracking-tighter leading-[0.9] text-black mb-8"
        >
          <motion.span variants={FADE_UP} className="block">Absolute</motion.span>
          <motion.span variants={FADE_UP} className="block text-black/30 italic font-serif font-light">Sovereignty.</motion.span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-[18px] md:text-[22px] font-medium text-black/60 max-w-[700px] leading-[1.6] mb-12"
        >
          The definitive application layer over Aztec&apos;s zero-knowledge execution environment. Programmable privacy, encrypted state, and trustless L1 settlement.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <Link href="/connect" className="group relative flex items-center justify-center px-10 py-5 bg-black text-white text-[14px] font-bold uppercase tracking-widest overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            <span className="relative flex items-center gap-3">Initialize Terminal <ArrowRight size={16} /></span>
          </Link>
          <Link href="/architecture" className="flex items-center justify-center px-10 py-5 border border-black text-black text-[14px] font-bold uppercase tracking-widest hover:bg-black/5 transition-colors">
            Read the Docs
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30">Scroll to explore</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-black/30 to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Immersive Features ───────────────────────────────────────────────────────

function ManifestoFeatures() {
  const features = [
    { title: "Zero-Knowledge Execution", desc: "Local proving via Noir circuits. Your device generates the cryptographic proof; the network only verifies the math. Absolute data privacy.", icon: Shield },
    { title: "Nullifier Resistance", desc: "Cryptographic nullifiers prevent double-spending and Sybil attacks while keeping the actor completely anonymous on the public ledger.", icon: Lock },
    { title: "Cross-Chain Liquidity", desc: "Trustless L1 to L2 message boxes enable seamless capital movement from Ethereum mainnet directly into the shielded pool.", icon: Zap }
  ];

  return (
    <section className="w-full bg-black text-white py-32 px-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} variants={FADE_UP} className="bg-black p-12 flex flex-col group hover:bg-[#0a0a0a] transition-colors duration-500">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Icon size={20} className="text-white/70" />
                </div>
                <h3 className="text-[22px] font-black tracking-tight mb-4">{f.title}</h3>
                <p className="text-[15px] text-white/50 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Architecture Scroll Section ──────────────────────────────────────────────

function ArchitectureSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="w-full bg-white py-40 overflow-hidden relative border-t border-black/10">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER_CONTAINER} className="relative z-10">
          <motion.span variants={FADE_UP} className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-black/40 mb-6 block">
            System Architecture
          </motion.span>
          <motion.h2 variants={FADE_UP} className="text-[50px] md:text-[70px] font-black tracking-tighter leading-[0.95] text-black mb-8">
            Engineered for <br/>
            <span className="text-black/30">stealth.</span>
          </motion.h2>
          <motion.p variants={FADE_UP} className="text-[18px] text-black/60 leading-[1.6] max-w-[500px] mb-12 font-medium">
            Whale Network operates entirely on encrypted UTXO state. By leveraging Aztec's Private Execution Environment (PXE), balances and historical states remain mathematically opaque.
          </motion.p>
          <motion.div variants={FADE_UP}>
            <Link href="/architecture" className="inline-flex items-center gap-4 text-[14px] font-bold uppercase tracking-widest text-black group">
              <span className="border-b border-black pb-1">View Full Specification</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div style={{ y }} className="relative h-[600px] w-full rounded-2xl border border-black/10 bg-[#f5f5f5] overflow-hidden">
            <NetworkMapPanel />
        </motion.div>

      </div>
    </section>
  );
}

// ─── Global Registry (RealWorldMap) ──────────────────────────────────────────

function GlobalRegistrySection() {
  return (
    <section className="w-full bg-[#050505] text-white py-32 border-t border-white/10">
      <div className="w-full max-w-[1400px] mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER_CONTAINER} className="mb-16">
          <motion.span variants={FADE_UP} className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 block">
            Global State
          </motion.span>
          <motion.h2 variants={FADE_UP} className="text-[40px] md:text-[60px] font-black tracking-tighter leading-[1.0]">
            The Verifiable <br/>
            <span className="text-white/40">Registry.</span>
          </motion.h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{ aspectRatio: "21/9" }} 
          className="border border-white/10 rounded-2xl overflow-hidden bg-black relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
          <RealWorldMap />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Hospital Partnership ─────────────────────────────────────────────────────

function PartnershipSection() {
  return (
    <section className="w-full bg-white py-32 border-t border-black/10">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER_CONTAINER} className="flex flex-col items-center">
          <motion.div variants={FADE_UP} className="mb-8">
            <img src="/coltea_logo.png" alt="Coltea Hospital" className="h-16 opacity-60 grayscale" />
          </motion.div>
          <motion.h2 variants={FADE_UP} className="text-[32px] md:text-[50px] font-black tracking-tighter leading-[1.0] text-black mb-8 max-w-[800px]">
            The first hospital in history to secure medical records on Ethereum via zero-knowledge proofs.
          </motion.h2>
          <motion.p variants={FADE_UP} className="text-[16px] md:text-[18px] text-black/50 font-medium max-w-[600px] mx-auto mb-12">
            Spitalul Clinic Colțea (est. 1704) partners with Whale Network to hash medical discharge records directly into the Aztec L2 state, ensuring absolute privacy and verifiable integrity.
          </motion.p>
          <motion.div variants={FADE_UP}>
            <Link href="/connect" className="px-8 py-4 border border-black text-black font-bold uppercase tracking-widest text-[13px] hover:bg-black hover:text-white transition-all">
              Enterprise Partnerships
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="w-full relative overflow-hidden flex flex-col justify-center items-center bg-black min-h-[80vh]">
      <div className="absolute inset-0 z-0 opacity-40">
        <img src="/system-shots/Aztec Image_17.jpg" alt="Aztec Background" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60 z-10" />

      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER_CONTAINER}
        className="relative z-20 w-full max-w-[900px] mx-auto px-6 text-center flex flex-col items-center"
      >
        <motion.img variants={FADE_UP} src="/aztec-logo-white.png" alt="Powered by Aztec" className="h-12 opacity-80 mb-12" />
        <motion.h2 variants={FADE_UP} className="text-[50px] md:text-[80px] lg:text-[100px] font-black tracking-tighter leading-[0.9] text-white mb-8">
          Enter the <br/>
          <span className="text-emerald-400">Network.</span>
        </motion.h2>
        <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-6 mt-8">
          <Link href="/connect" className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-[14px] hover:scale-105 transition-transform">
            Connect Wallet
          </Link>
          <Link href="/architecture" className="px-12 py-5 border border-white/30 text-white font-bold uppercase tracking-widest text-[14px] hover:bg-white/10 transition-colors">
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
    <div className="relative font-sans antialiased bg-white w-full flex flex-col">
      <LandingNav />
      <HeroSection />
      <ManifestoFeatures />
      <ArchitectureSection />
      <GlobalRegistrySection />
      <PartnershipSection />
      <FinalCTASection />
    </div>
  );
}
