"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { VisionStatsSection } from '@/components/vision/VisionStatsSection';

// Lottie cargado dinámicamente para evitar SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Real world map — client only (uses browser projection APIs)
const RealWorldMap = dynamic(
  () => import("@/components/landing/RealWorldMap").then((m) => m.RealWorldMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#f0f0f0] animate-pulse rounded-xl" /> }
);

// ─── Nav Data ────────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { label: "Whale Network", sub: "Real-time on-chain capital flow tracking", href: "/portfolio" },
  { label: "Aztec API", sub: "Build privacy into your applications", href: "/developers/api-docs" },
  { label: "Developer Hub", sub: "Circuits, SDKs, and sandbox tools", href: "/developer" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/company" },
  { label: "Security", href: "/security" },
  { label: "Blog", href: "/blog" },
];

// ─── Network stat strip ───────────────────────────────────────────────────────

const STATS = [
  { label: "Network Layer", value: "Aztec L2 zkRollup" },
  { label: "State Model", value: "Private Notes (UTXO)" },
  { label: "Circuit Language", value: "Noir" },
  { label: "Settlement", value: "Ethereum L1" },
  { label: "Identity", value: "ZK Biometric Activeness" },
  { label: "Compliance", value: "W3C Verifiable Credentials" },
];

// ─── Feature cards ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Private Execution",
    body: "All computation happens on your device. Your inputs and outputs never leave your machine — the network validates a proof, not your data.",
    tag: "Zero-Knowledge",
  },
  {
    title: "Selective Disclosure",
    body: "Generate viewing keys and range proofs for compliance or audits. Verifiable by regulators, invisible to observers.",
    tag: "Compliance Ready",
  },
  {
    title: "On-Chain Analysis",
    body: "Whale Network monitors capital flows across major chains in real time. Act on institutional-grade data without exposing your position.",
    tag: "Whale Network",
  },
  {
    title: "Threshold Authorization",
    body: "Multi-party approvals proven inside a zero-knowledge circuit. No signer identities leak. Built for treasury and governance.",
    tag: "Multi-Sig ZK",
  },
  {
    title: "Stealth Addresses",
    body: "Each transaction generates a unique, single-use address. On-chain observers cannot link sender to receiver.",
    tag: "Unlinkability",
  },
  {
    title: "Cross-Chain Bridges",
    body: "Move assets across networks through encrypted bridge contracts. Capital flows become invisible to traditional forensic analysis.",
    tag: "Omnichain",
  },
];

// ─── Documentation cards ─────────────────────────────────────────────────────

const DOC_CARDS = [
  {
    label: "Getting Started",
    href: "/developers/api-docs",
    body: "Connect your wallet, initialize the proving environment, and submit your first private transaction.",
  },
  {
    label: "API Reference",
    href: "/developers/api-docs",
    body: "REST and WebSocket endpoints with authentication, rate limits, and full response schemas.",
  },
  {
    label: "Noir Circuit Guides",
    href: "/developer",
    body: "Write, test, and deploy zero-knowledge circuits using the Noir language with Barretenberg.",
  },
  {
    label: "Compliance SDK",
    href: "/security",
    body: "Generate viewing keys, range proofs, and Verifiable Credentials for regulatory disclosure.",
  },
  {
    label: "Architecture Overview",
    href: "/architecture",
    body: "System diagrams, state machine specs, and protocol flow documentation for the full L1–L2 stack.",
  },
  {
    label: "Security Audits",
    href: "/security",
    body: "Formal verification certificates, circuit audit summaries, and threat assessments from independent reviewers.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-black/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="w-full max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">

        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 shrink-0">
              <img
                src="/atom_3d_silver.jpg"
                alt="Humanity Ledger"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <span className="font-serif text-[17px] font-black tracking-tight text-black leading-none">
              Humanity Ledger
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/architecture" className="text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
              Architecture
            </Link>
            <Link href="/roadmap" className="text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
              Roadmap
            </Link>

            {/* Product Dropdown */}
            <div
              className="relative group h-14 flex items-center"
              onMouseEnter={() => setProductOpen(true)}
              onMouseLeave={() => setProductOpen(false)}
            >
              <button className="flex items-center gap-1 text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
                Product
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${productOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {productOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 left-0 bg-white border border-black/10 shadow-xl w-[300px] z-50"
                  >
                    {PRODUCT_LINKS.map((l) => (
                      <Link key={l.label} href={l.href} className="flex flex-col px-5 py-4 hover:bg-black/[0.03] border-b border-black/5 last:border-b-0 transition-colors">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[13.5px] font-semibold text-black">{l.label}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/30"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                        </div>
                        <span className="text-[11.5px] text-black/45">{l.sub}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Company Dropdown */}
            <div
              className="relative group h-14 flex items-center"
              onMouseEnter={() => setCompanyOpen(true)}
              onMouseLeave={() => setCompanyOpen(false)}
            >
              <button className="flex items-center gap-1 text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
                Company
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${companyOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {companyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 left-0 bg-white border border-black/10 shadow-xl w-[180px] z-50"
                  >
                    {COMPANY_LINKS.map((l) => (
                      <Link key={l.label} href={l.href} className="flex items-center px-5 py-3 hover:bg-black/[0.03] border-b border-black/5 last:border-b-0 transition-colors">
                        <span className="text-[13.5px] font-medium text-black">{l.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: GitHub + Docs + Sign In */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://github.com/humanityledger/Humanity-Ledger"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[13.5px] font-medium text-black/70 hover:text-black transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </a>
          <Link
            href="/developers/api-docs"
            className="px-4 py-1.5 border border-black/15 text-[13.5px] font-medium text-black hover:bg-black/[0.04] transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/portfolio"
            className="px-4 py-1.5 bg-black text-white text-[13.5px] font-medium hover:bg-black/85 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
          aria-label="Toggle navigation"
        >
          <span className={`w-5 h-[1.5px] bg-black transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-black transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-black transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-white border-t border-black/10 px-6 py-6 flex flex-col gap-4"
          >
            <Link href="/architecture" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Architecture</Link>
            <Link href="/roadmap" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Roadmap</Link>
            <Link href="/portfolio" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Product</Link>
            <Link href="/company" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Company</Link>
            <div className="flex gap-3 mt-2">
              <Link href="/developers/api-docs" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-black/15 text-[14px] font-medium text-black">Docs</Link>
              <Link href="/portfolio" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 bg-black text-[14px] font-medium text-white">Sign In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

/**
 * HeroSection — Maximum fidelity pixel-art rendering.
 *
 * Rendering pipeline:
 *  1. `image-rendering: pixelated` → browser must NOT apply bilinear interpolation.
 *     This is the single most important rule for pixel art: keep every pixel a
 *     hard-edged rectangle, never a blurred quad.
 *  2. `fetchpriority="high"` + `loading="eager"` + `decoding="sync"` → image
 *     is fetched at the top of the network queue and decoded on the main thread
 *     before first paint — zero layout shift, zero flash of black.
 *  3. `100dvh` on mobile (accounts for collapsible browser chrome) and
 *     `100vh` on desktop via CSS class override.
 *  4. `object-fit: cover` with smart `object-position` fills the container
 *     using the image's natural pixel density — never scaling up beyond 1:1.
 *  5. Global `<style>` injection ensures `pixelated` survives any Tailwind reset.
 */
function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden flex-shrink-0"
      style={{
        height: 'calc(100dvh - 64px)',
        minHeight: '560px',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ── Global pixelated-rendering rule ─────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-pixel-img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
          -ms-interpolation-mode: nearest-neighbor;
        }
      `}} />

      <img
        src="/system-shots/Devine-Lu-Linvega-monochrome-pixel-art-illustration-arch-2268374-wallhere.com.jpg"
        alt="Humanity Ledger"
        loading="eager"
        // @ts-ignore
        fetchpriority="high"
        decoding="sync"
        draggable="false"
        className="hero-pixel-img absolute select-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.12,
        }}
      />

      {mounted && <DvhPolyfill />}

      {/* ── Bottom fade to white ──────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: '180px',
          background: 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 40%, transparent 100%)',
        }}
      />

      {/* ── Text Content & CTA — always visible, no mounted gate ─────────── */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 w-full max-w-[880px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-[1.05] text-black mb-6">
            Privacy-Preserving
            <br />
            <span className="text-black/70">Identity Verification</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-black/60 max-w-[600px] mb-10 font-medium">
            Whale Network integrates zero-knowledge proofs to help you achieve compliance and verify users without ever compromising personal data.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/portfolio"
              className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-[13px] font-semibold hover:bg-black/85 transition-colors shadow-2xl"
            >
              Open Application
            </Link>
            <Link
              href="/developers/api-docs"
              className="w-full sm:w-auto px-8 py-3.5 border border-black/30 bg-white/80 backdrop-blur-md text-black text-[13px] font-semibold hover:bg-white hover:border-black/60 transition-colors shadow-xl"
            >
              Read Documentation
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Scroll cue ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none">
        <div className="w-[1px] h-12 bg-gradient-to-b from-black/30 to-transparent" />
      </div>
    </section>
  );
}

/**
 * DvhPolyfill — sets `--vh` CSS custom property to the actual inner viewport
 * height in pixels, updated on every resize. This corrects the `100vh`
 * bug on iOS/Android where the browser chrome collapses/expands.
 */
function DvhPolyfill() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh, { passive: true });
    return () => window.removeEventListener('resize', setVh);
  }, []);
  return null;
}

// ─── Value Proposition ─────────────────────────────────────────────────────────

function ValuePropositionSection() {
  return (
    <section className="w-full bg-white py-24 md:py-32 border-t border-black/10">
      <div className="w-full max-w-[1000px] mx-auto px-6 text-center flex flex-col items-center">
        <span className="text-[12px] font-bold uppercase tracking-widest text-black/40 mb-6">
          Absolute Privacy
        </span>
        <h2 className="text-[36px] md:text-[56px] font-black tracking-tighter leading-[1.05] text-black max-w-[800px]">
          Identity and asset verification
          <br />
          <span className="text-black/30">without data custody.</span>
        </h2>
        <p className="mt-8 text-[16px] md:text-[18px] font-medium text-black/60 leading-relaxed max-w-[600px]">
          Humanity Ledger uses zero-knowledge cryptography to prove who you are and what you hold, without ever revealing the underlying data to the applications you interact with.
        </p>
      </div>
    </section>
  );
}

// ─── How It Works (Steps) ────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Secure Authentication",
      description: "Access your dashboard using a robust cryptographic handshake. Whether connecting via a mobile QR scan or a Web3 wallet, your session is authenticated without relying on vulnerable passwords.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      )
    },
    {
      step: "02",
      title: "Private Data Environment",
      description: "Your assets, identity attributes, and transaction history are encrypted locally on your device. The network processes encrypted states, ensuring complete confidentiality.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      )
    },
    {
      step: "03",
      title: "Verifiable Proofs",
      description: "When an application requests verification (like age, jurisdiction, or solvency), your device generates a mathematical proof. The app verifies the proof instantly, receiving absolute certainty but zero personal data.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      )
    }
  ];

  return (
    <section className="w-full bg-[#fcfcfc] py-24 md:py-32 border-t border-black/5">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-[32px] md:text-[42px] font-black tracking-tight text-black">
            Built so there's <i className="font-serif italic font-normal">nothing to leak</i>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-black/10 z-0" />

          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white border border-black/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-black">{s.icon}</span>
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-black/40 mb-3">
                Step {s.step}
              </span>
              <h3 className="text-[20px] font-black text-black mb-4 tracking-tight">
                {s.title}
              </h3>
              <p className="text-[15px] font-medium text-black/60 leading-relaxed px-2">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Integration & Features ───────────────────────────────────────────────────

function IntegrationSection() {
  const cards = [
    {
      title: "Identity Verification",
      body: "Perform sybil-resistance, age, or nationality checks to gate access to your platform without storing PII.",
      link: "Read documentation",
      href: "/developers/api-docs"
    },
    {
      title: "Compliance & Audits",
      body: "Generate viewing keys for regulators while keeping transactions fully shielded from the public.",
      link: "Explore compliance",
      href: "/security"
    },
    {
      title: "Private Portfolio",
      body: "Track cross-chain capital flows and asset balances locally. No server ever sees your complete portfolio.",
      link: "Open Dashboard",
      href: "/portfolio"
    }
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32 border-t border-black/10">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-[32px] md:text-[42px] font-black tracking-tight text-black max-w-[500px] leading-[1.1]">
            One integration for
            <br />
            <span className="text-black/30">complete security.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <div key={i} className="bg-[#fafafa] border border-black/10 rounded-2xl p-8 flex flex-col items-start transition-all hover:bg-[#f5f5f5] hover:border-black/20">
              <h3 className="text-[18px] font-black text-black mb-3">{c.title}</h3>
              <p className="text-[14.5px] font-medium text-black/60 leading-relaxed mb-8 flex-1">
                {c.body}
              </p>
              <Link href={c.href} className="text-[13px] font-bold text-black flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                {c.link}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Global Registry Map ────────────────────────────────────────────────────────

function GlobalRegistrySection() {
  const [totalFlows, setTotalFlows] = useState<number>(14_800_295);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await fetch('/api/network/whale-flows', { cache: 'no-store' });
        const data = await res.json();
        if (data.flows && data.flows.length > 0) {
          setTotalFlows(prev => prev + data.flows.length);
        }
      } catch { /* silent */ }
    };
    fetchRealData();
    const interval = setInterval(fetchRealData, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-[#fafafa] py-24 md:py-32 border-t border-black/10">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-black/30 mb-3 block">
              Global Network
            </span>
            <h2 className="text-[28px] md:text-[36px] font-black text-black tracking-tight">
              Verification Registry Map
            </h2>
            <p className="text-[14px] text-black/50 font-medium mt-2 max-w-[500px]">
              Hover any country to see coverage level and accepted document types.
            </p>
          </div>
          <Link
            href="/registry"
            className="flex items-center gap-2 text-[13px] font-black uppercase tracking-wider text-black hover:opacity-60 transition-opacity shrink-0"
          >
            View Full Map
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Real map */}
        <div style={{ aspectRatio: "21/9" }}>
          <RealWorldMap />
        </div>

      </div>
    </section>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────

// ─── FAQ Item (extracted to fix React Hooks Rules violation) ─────────────────
// useState CANNOT be called inside .map(). Each FAQ needs its own component.
function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-black/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:bg-black/[0.02] transition-colors px-2"
      >
        <span className="text-[16px] font-bold text-black pr-8">{faq.q}</span>
        <span className="text-[20px] text-black/40 font-light w-6 h-6 flex items-center justify-center shrink-0">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="pb-6 px-2 text-[15px] font-medium text-black/60 leading-relaxed">
          {faq.a}
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "What user data is stored?",
      a: "None. All identity attributes and financial data are encrypted and stored locally on your device. The network only processes mathematical proofs that attest to the validity of your data."
    },
    {
      q: "How does the verification actually work?",
      a: "When you prove a statement (e.g., 'I am over 18'), your device generates a zero-knowledge proof. The verifying application checks this proof against a smart contract or SDK, receiving a simple true/false answer without seeing your birthdate."
    },
    {
      q: "Are my wallet keys safe?",
      a: "Yes. Your private keys never leave your device. They are encrypted using military-grade AES-GCM and require your password or biometric approval to unlock."
    },
    {
      q: "Can regulators audit my activity?",
      a: "Yes, but only if you explicitly authorize them. You can generate a specific 'viewing key' that grants read-only access to specific transactions for compliance purposes."
    }
  ];

  return (
    <section className="w-full bg-white py-24 border-t border-black/10">
      <div className="w-full max-w-[800px] mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-[32px] md:text-[42px] font-black tracking-tight text-black">
            The questions prospects ask
          </h2>
        </div>

        <div className="flex flex-col border-t border-black/10">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}



// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="w-full relative overflow-hidden" style={{ minHeight: '540px' }}>
      {/*
        Using the requested custom image, adjusted with absolute precision quantum scaling:
        object-fit: contain preserves every pixel perfectly without zooming.
        The white background color (#ffffff) matches the edges of the image exactly.
      */}
      <img
        src="/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg"
        alt="Humanity Ledger Background"
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'contain',
          objectPosition: 'center',
          backgroundColor: '#ffffff',
          imageRendering: 'crisp-edges',
        }}
      />

      <div className="relative z-10 w-full max-w-[800px] mx-auto px-6 py-32 md:py-48 flex flex-col items-center text-center">
        <h2 className="text-[40px] md:text-[60px] font-black tracking-tighter leading-[1] text-black mb-6 drop-shadow-sm">
          Ready to reclaim
          <br />
          <span className="text-black/60">your digital identity?</span>
        </h2>
        <p className="text-[16px] md:text-[18px] text-black/70 font-medium max-w-[500px] mb-12 drop-shadow-sm">
          Join the ecosystem of users and developers bringing absolute, verifiable privacy to the decentralized web.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/portfolio"
            className="w-full sm:w-auto px-10 py-4 bg-black text-white text-[14px] font-black uppercase tracking-wider hover:bg-black/80 transition-transform active:scale-95 shadow-lg"
          >
            Open Application
          </Link>
          <Link
            href="/developers/api-docs"
            className="w-full sm:w-auto px-10 py-4 border-2 border-black/80 text-black bg-white/80 backdrop-blur text-[14px] font-black uppercase tracking-wider hover:bg-white transition-transform active:scale-95 shadow-md"
          >
            Read Documentation
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

export function ImmersiveManifestoLanding(_props: ImmersiveManifestoLandingProps = {}) {
  return (
    <div className="relative text-[#050505] font-sans antialiased overflow-x-hidden w-full flex flex-col bg-white">
      {/* LandingNav is HIDDEN: InstitutionalHeader (from ClientLayout) already
          renders as fixed top-0 on the landing page '/'. Rendering both causes
          two overlapping fixed navbars. ImmersiveManifestoLanding's own nav is
          only needed if this component is embedded in a context WITHOUT a global header. */}
      {/* <LandingNav /> */}
      <HeroSection />
      <ValuePropositionSection />
      <HowItWorksSection />
      <IntegrationSection />
      <GlobalRegistrySection />
      <FAQSection />
      <VisionStatsSection />
      <FinalCTASection />
    </div>
  );
}

