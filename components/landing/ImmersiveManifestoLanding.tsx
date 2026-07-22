"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import dynamic from "next/dynamic";
import { EmailLoginModal } from "@/components/auth/EmailLoginModal";
import { useSystemSignOut } from "@/hooks/useSystemSignOut";
import { SystemFooter } from "./SystemFooter";
import { useAppKit } from "@reown/appkit/react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

// ─── Dynamic imports ─────────────────────────────────────────────────────────
const RealWorldMap = dynamic(
  () =>
    import("@/components/landing/RealWorldMap").then((m) => m.RealWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-50 animate-pulse rounded-2xl" />
    ),
  }
);

// ─── Motion variants ──────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const fadeUp: any = {
  hidden: { opacity: 0, y: 56 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE_OUT_EXPO, delay },
  }),
};

const fadeIn: any = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

const stagger: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

// ─── Nav data ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Architecture", href: "/architecture" },
  { label: "Docs", href: "/developers/api-docs" },
  { label: "Roadmap", href: "/roadmap" },
];
const PRODUCT_LINKS = [
  {
    label: "Studio Provenance",
    sub: "On-chain asset registry",
    href: "/portfolio",
  },
  {
    label: "Aztec Identity",
    sub: "Client-side ZK accounts",
    href: "/developers/api-docs",
  },
  {
    label: "Whale Chat",
    sub: "Encrypted P2P messaging",
    href: "/developer",
  },
];

// ─── Nav ─────────────────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const { nuclearDisconnect } = useSystemSignOut();
  const { open: rkOpenModal } = useAppKit();

  useEffect(() => {
    // The landing page uses a bounded scroll container (the <main> tag),
    // so we must listen to it rather than window. We find the scrollable parent
    // by traversing up from the document. As a fallback we also listen to window.
    const checkScroll = (el: Element | Window) => {
      const scrollTop = el === window
        ? (document.documentElement.scrollTop || document.body.scrollTop)
        : (el as Element).scrollTop;
      setScrolled(scrollTop > 24);
    };

    // Find the closest scrollable ancestor by querying all overflow-y-auto elements
    const findScrollParent = (): Element | Window => {
      const candidates = document.querySelectorAll('main, [data-scroll-container]');
      for (const el of Array.from(candidates)) {
        if (el.scrollHeight > el.clientHeight) return el;
      }
      return window;
    };

    let scrollParent: Element | Window = window;
    // Delay slightly to allow the DOM to mount
    const setupTimer = setTimeout(() => {
      scrollParent = findScrollParent();
      scrollParent.addEventListener('scroll', () => checkScroll(scrollParent), { passive: true });
    }, 100);

    // Also listen to window as fallback
    const onWindowScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    return () => {
      clearTimeout(setupTimer);
      scrollParent?.removeEventListener?.('scroll', () => checkScroll(scrollParent));
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, []);

  useEffect(() => {
    const handleOpenEmail = () => setEmailModalOpen(true);
    window.addEventListener('open-email-modal', handleOpenEmail);
    return () => window.removeEventListener('open-email-modal', handleOpenEmail);
  }, []);


  useEffect(() => {
    try {
      const m = document.cookie.match(
        /system_handshake=(0x[a-fA-F0-9]{40}|email_[^;\s]+)/i
      );
      if (m?.[1]) setConnectedAddress(m[1].toLowerCase());
    } catch {}
  }, []);

  const fmtAddr = (a: string) =>
    a.startsWith("email_")
      ? a.replace("email_", "").slice(0, 16) + "…"
      : `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/96 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="w-full max-w-[1440px] mx-auto px-6 md:px-12 h-[60px] flex items-center justify-between gap-8">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Humanity Ledger — home"
            className="flex items-center gap-2.5 shrink-0"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-[14px] font-semibold tracking-tight leading-none">
              Humanity Ledger
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 text-[13px] font-medium text-black/50 hover:text-black transition-colors rounded-lg hover:bg-black/[0.035]"
              >
                {l.label}
              </Link>
            ))}
            {/* Products dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductOpen(true)}
              onMouseLeave={() => setProductOpen(false)}
            >
              <button
                id="products-menu-btn"
                aria-haspopup="true"
                aria-expanded={productOpen}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-black/50 hover:text-black transition-colors rounded-lg hover:bg-black/[0.035]"
              >
                Products
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${productOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <AnimatePresence>
                {productOpen && (
                  <motion.div
                    id="products-dropdown"
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-black/[0.06] w-[272px] overflow-hidden z-50"
                  >
                    {PRODUCT_LINKS.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        role="menuitem"
                        className="flex flex-col gap-0.5 px-5 py-3.5 hover:bg-zinc-50 transition-colors border-b border-black/[0.05] last:border-b-0 group"
                      >
                        <span className="text-[13px] font-semibold text-black group-hover:text-black/80 transition-colors">
                          {l.label}
                        </span>
                        <span className="text-[11.5px] text-black/40">
                          {l.sub}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/humanityledger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] font-medium text-black/40 hover:text-black transition-colors"
            >
              GitHub
            </a>
            {connectedAddress ? (
              <>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-black/[0.06] rounded-full text-[11px] font-mono text-black/55">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {fmtAddr(connectedAddress)}
                </span>
                <Link
                  href="/terminal"
                  className="px-4 py-2 bg-black text-white rounded-full text-[12.5px] font-semibold hover:bg-black/80 transition-colors"
                >
                  Dashboard →
                </Link>
                <button
                  onClick={() => nuclearDisconnect()}
                  className="text-[11.5px] text-black/30 hover:text-red-500 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  id="email-access-btn"
                  onClick={() => setEmailModalOpen(true)}
                  className="px-4 py-2 border border-black/10 rounded-full text-[12.5px] font-semibold text-black hover:bg-zinc-50 transition-colors"
                >
                  Sign in with Email
                </button>
                <button
                  id="connect-wallet-nav-btn"
                  onClick={() => {
                    try { rkOpenModal(); } catch {}
                  }}
                  className="px-4 py-2 bg-black text-white rounded-full text-[12.5px] font-semibold hover:bg-black/80 transition-all hover:-translate-y-px"
                >
                  Connect Wallet
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={`w-5 h-[1.5px] bg-black transition-all origin-center ${
                mobileOpen ? "rotate-45 translate-y-[3.25px]" : ""
              }`}
            />
            <span
              className={`w-5 h-[1.5px] bg-black transition-all origin-center ${
                mobileOpen ? "-rotate-45 -translate-y-[3.25px]" : ""
              }`}
            />
          </button>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="md:hidden bg-white border-t border-black/[0.06] overflow-hidden"
            >
              <div className="px-6 pt-4 pb-6 flex flex-col gap-1">
                {[...NAV_LINKS, ...PRODUCT_LINKS].map((l) => (
                  <Link
                    key={l.href + l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-[15px] font-medium text-black/60 hover:text-black transition-colors border-b border-black/[0.04] last:border-0"
                  >
                    {l.label}
                  </Link>
                ))}
                    <div className="flex flex-col gap-2.5 mt-5 pt-5 border-t border-black/[0.06]">
                  {connectedAddress ? (
                    <>
                      <span className="flex items-center justify-center gap-1.5 py-2 text-[12px] font-mono text-black/55 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {fmtAddr(connectedAddress)}
                      </span>
                      <Link
                        href="/terminal"
                        onClick={() => setMobileOpen(false)}
                        className="w-full text-center py-3.5 bg-black rounded-2xl text-[14px] font-semibold text-white hover:bg-black/80 transition-colors"
                      >
                        Dashboard →
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          nuclearDisconnect();
                        }}
                        className="w-full py-3.5 border border-black/10 rounded-2xl text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-row items-center gap-2.5 w-full">
                      <button
                        id="mobile-email-btn"
                        onClick={() => {
                          setMobileOpen(false);
                          setEmailModalOpen(true);
                        }}
                        className="flex-1 py-3.5 border border-black/10 rounded-2xl text-[12.5px] font-semibold text-black hover:bg-zinc-50 transition-colors text-center"
                      >
                        Sign in with Email
                      </button>
                      <button
                        id="mobile-connect-wallet-nav-btn"
                        onClick={() => {
                          setMobileOpen(false);
                          try { rkOpenModal(); } catch {}
                        }}
                        className="flex-1 py-3.5 bg-black rounded-2xl text-[12.5px] font-semibold text-white hover:bg-black/80 transition-colors text-center active:scale-[0.97]"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <EmailLoginModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />

      {/* ── Fixed mobile bottom CTA bar ───────────────────────────────────────
          Always visible on mobile without needing to open the hamburger menu.
          Only shown when NOT connected. Hidden on md+ screens. */}
      {!connectedAddress && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.07] px-4 py-3 flex gap-2.5"
          style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            id="landing-mobile-email-cta"
            onClick={() => setEmailModalOpen(true)}
            className="flex-1 py-3 border border-black/15 rounded-2xl text-[13px] font-bold text-black hover:bg-zinc-50 transition-colors text-center"
          >
            Sign in with Email
          </button>
          <button
            id="landing-mobile-connect-cta"
            onClick={() => {
              try { rkOpenModal(); } catch {}
            }}
            className="flex-1 py-3 bg-black rounded-2xl text-[13px] font-bold text-white hover:bg-black/80 transition-colors text-center active:scale-[0.97]"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[100svh] bg-white flex flex-col justify-center items-center text-center overflow-hidden"
      style={{ paddingTop: 60 }}
    >
      {/* Subtle dot-grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial vignette — fades the grid at edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, white 90%)",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center"
      >
        {/* "You are now entering" — Aztec's iconic pre-title */}
        <motion.p
          variants={fadeIn}
          custom={0}
          className="text-[13px] tracking-[0.3em] uppercase text-black/30 font-medium mb-5"
        >
          You are now entering
        </motion.p>

        {/* Main heading — Martel serif, massive clamp */}
        <motion.h1
          variants={fadeUp}
          custom={0.05}
          className="tracking-tight leading-[0.9] text-black mb-8"
          style={{
            fontFamily: "var(--font-aztec-serif), Georgia, serif",
            fontSize: "clamp(3.8rem, 11vw, 9rem)",
            fontWeight: 700,
          }}
        >
          The Privacy Layer
          <br />
          <span style={{ color: "rgba(0,0,0,0.2)" }}>
            for Everything On-Chain.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          custom={0.1}
          className="text-[16px] md:text-[19px] text-black/45 leading-relaxed max-w-[520px] mb-12 font-medium"
        >
          Humanity Ledger is built on Aztec Network — ZK identity, shielded
          assets, encrypted communications. All client-side. All yours.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          custom={0.15}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/portfolio"
            id="hero-launch-btn"
            className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-full text-[14px] font-semibold hover:bg-black/80 transition-all shadow-[0_6px_28px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.25)] hover:-translate-y-0.5"
          >
            Launch Application →
          </Link>
          <Link
            href="/developers/api-docs"
            id="hero-docs-btn"
            className="w-full sm:w-auto px-8 py-4 bg-white border border-black/10 text-black rounded-full text-[14px] font-semibold hover:bg-zinc-50 hover:border-black/20 transition-all"
          >
            Read Documentation
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.25em] uppercase text-black/20 font-semibold">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="block w-px h-8 bg-gradient-to-b from-black/15 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ─── Big Statement ────────────────────────────────────────────────────────────
function StatementSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      ref={ref}
      className="w-full bg-white border-t border-black/[0.05] py-32 md:py-48"
    >
      <div className="w-full max-w-5xl mx-auto px-6">
        {/* Big serif statement */}
        <motion.p
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          className="leading-[1.1] text-black mb-24"
          style={{
            fontFamily: "var(--font-aztec-serif), Georgia, serif",
            fontSize: "clamp(2.2rem, 6vw, 5rem)",
            fontWeight: 700,
          }}
        >
          Privacy isn&apos;t a feature.
          <br />
          <span style={{ color: "rgba(0,0,0,0.2)" }}>
            It&apos;s the foundation.
          </span>
        </motion.p>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-black/[0.06] pt-16">
          {[
            {
              n: "01",
              title: "Client-Side Proving",
              body: "Noir circuits run inside your device — your Private Execution Environment. No server ever sees your data.",
            },
            {
              n: "02",
              title: "Encrypted State",
              body: "Balances and credentials are encrypted UTXO notes on Aztec L2. Only your keys unlock them.",
            },
            {
              n: "03",
              title: "Hybrid Execution",
              body: "Bridge Ethereum liquidity with private Aztec execution. Full composability, zero metadata leakage.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.n}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={i * 0.12}
              className="flex flex-col gap-4"
            >
              <span className="font-mono text-[10.5px] text-black/20 tracking-[0.2em] uppercase">
                {item.n}
              </span>
              <h3
                className="text-[20px] text-black tracking-tight"
                style={{
                  fontFamily: "var(--font-aztec-serif), Georgia, serif",
                  fontWeight: 700,
                }}
              >
                {item.title}
              </h3>
              <p className="text-[14px] text-black/50 leading-relaxed">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Protocol Modules ─────────────────────────────────────────────────────────
const MODULES = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    ),
    tag: "On-Chain Registry",
    title: "Studio Provenance",
    desc: "Register real-world assets on Aztec L2. The proof is public. Ownership stays private.",
    href: "/portfolio",
    cta: "Open Studio",
    id: "module-studio-btn",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    tag: "Encrypted Messaging",
    title: "Whale Chat",
    desc: "End-to-end encrypted P2P messaging. Gated by your Aztec ZK identity. No phone. No IP.",
    href: "/developer",
    cta: "Open Chat",
    id: "module-chat-btn",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    tag: "Shielded Analytics",
    title: "Portfolio Terminal",
    desc: "Multi-chain asset tracking inside your PXE. Block explorers see nothing.",
    href: "/terminal",
    cta: "Open Terminal",
    id: "module-terminal-btn",
  },
];

function ModulesSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="w-full bg-[#fafafa] border-t border-black/[0.05] py-32 md:py-48"
    >
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className="mb-20">
          <motion.span
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            className="block text-[10.5px] font-mono uppercase tracking-[0.25em] text-black/30 mb-5"
          >
            Protocol Modules
          </motion.span>
          <motion.h2
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            style={{
              fontFamily: "var(--font-aztec-serif), Georgia, serif",
              fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
              fontWeight: 700,
            }}
            className="leading-[1.05] tracking-tight text-black"
          >
            Three products.
            <br />
            <span style={{ color: "rgba(0,0,0,0.2)" }}>One identity.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={i * 0.12}
              className="flex flex-col bg-white rounded-3xl border border-black/[0.06] p-8 gap-6 hover:border-black/12 hover:shadow-[0_4px_32px_rgba(0,0,0,0.06)] transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-zinc-50 border border-black/[0.06] rounded-xl flex items-center justify-center text-black/40 group-hover:text-black/70 transition-colors">
                {mod.icon}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25">
                  {mod.tag}
                </span>
                <h3
                  className="text-[20px] text-black tracking-tight"
                  style={{
                    fontFamily: "var(--font-aztec-serif), Georgia, serif",
                    fontWeight: 700,
                  }}
                >
                  {mod.title}
                </h3>
                <p className="text-[13.5px] text-black/50 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
              <Link
                href={mod.href}
                id={mod.id}
                className="self-start flex items-center gap-1.5 text-[13px] font-semibold text-black/60 hover:text-black hover:gap-2.5 transition-all duration-200"
              >
                {mod.cta}
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Network Map ──────────────────────────────────────────────────────────────
function RegistrySection({ hideMap }: { hideMap?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  if (hideMap) return null;

  return (
    <section
      ref={ref}
      className="w-full bg-white border-t border-black/[0.05] py-32 md:py-48"
    >
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <motion.span
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeIn}
              className="block text-[10.5px] font-mono uppercase tracking-[0.25em] text-black/30 mb-5"
            >
              Global Network
            </motion.span>
            <motion.h2
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-aztec-serif), Georgia, serif",
                fontSize: "clamp(2rem, 4.5vw, 4rem)",
                fontWeight: 700,
              }}
              className="leading-[1.05] tracking-tight text-black"
            >
              Verification
              <br />
              <span style={{ color: "rgba(0,0,0,0.2)" }}>Registry Map</span>
            </motion.h2>
          </div>
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            custom={0.2}
          >
            <Link
              href="/registry"
              id="registry-view-btn"
              className="inline-flex items-center gap-2 px-6 py-3 border border-black/10 rounded-full text-[13px] font-semibold text-black hover:bg-zinc-50 hover:border-black/20 transition-all"
            >
              View Live Registry
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          custom={0.1}
          style={{ aspectRatio: "21/9" }}
          className="rounded-3xl overflow-hidden border border-black/[0.06] bg-zinc-50 shadow-[0_2px_40px_rgba(0,0,0,0.05)]"
        >
          <RealWorldMap />
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What data does the network store about me?",
    a: "None. Your identity and financial data stay encrypted inside your Private Execution Environment (PXE). The network sees only zero knowledge proofs — mathematical attestations with no underlying data.",
  },
  {
    q: "How does zero knowledge verification work?",
    a: "When you prove a statement, your device runs a Noir circuit locally and produces a ZK proof. The smart contract verifies: true or false. Your documents, balances, and private keys never leave your machine.",
  },
  {
    q: "Can regulators or auditors access my activity?",
    a: "Only if you explicitly grant it. You can generate a scoped viewing key that reveals specific transactions for attestation purposes, while the rest of your portfolio stays private.",
  },
  {
    q: "What can I do with a verified Aztec identity?",
    a: "Full access to the Humanity Ledger ecosystem: Whale Chat encrypted messaging, Studio Provenance asset registry, Portfolio Terminal analytics, and cross-protocol session management.",
  },
];

function FAQItem({
  faq,
  index,
  inView,
}: {
  faq: { q: string; a: string };
  index: number;
  inView: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={index * 0.08}
      className="border-b border-black/[0.07]"
    >
      <button
        id={`faq-item-${index}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full py-6 flex items-start justify-between text-left gap-8 group"
      >
        <span
          className="text-[15px] text-black font-medium group-hover:text-black/70 transition-colors"
          style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}
        >
          {faq.q}
        </span>
        <span
          className={`shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full border border-black/10 text-black/40 transition-all duration-300 ${
            open ? "rotate-45 border-black/20 bg-zinc-50" : ""
          }`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[14px] text-black/50 leading-relaxed">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="w-full bg-[#fafafa] border-t border-black/[0.05] py-32 md:py-48"
    >
      <div className="w-full max-w-3xl mx-auto px-6">
        <motion.span
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn}
          className="block text-[10.5px] font-mono uppercase tracking-[0.25em] text-black/30 mb-5"
        >
          FAQ
        </motion.span>
        <motion.h2
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-aztec-serif), Georgia, serif",
            fontSize: "clamp(2rem, 4.5vw, 4rem)",
            fontWeight: 700,
          }}
          className="leading-[1.05] tracking-tight text-black mb-16"
        >
          Common questions
        </motion.h2>
        <div className="border-t border-black/[0.07]">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA + Premium Wordmark ─────────────────────────────────────────
// CRITICAL FIX: Changed from dark bg-[#050505] to white bg-white.
// The dark section was causing the black zone visible below the footer
// because it bled into the page body background.
function AztecCTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="relative w-full bg-white border-t border-black/[0.06] py-24 md:py-40 overflow-hidden flex flex-col items-center"
    >
      {/* Subtle background ambient — light mode */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/[0.025] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-black/[0.03]"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/50">
            Network Initialization
          </span>
        </motion.div>

        <motion.h2
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-aztec-serif), Georgia, serif",
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            fontWeight: 700,
          }}
          className="leading-[1.05] tracking-tight text-black"
        >
          Your identity.
          <br />
          <span className="text-black/30 italic">
            Proven without disclosure.
          </span>
        </motion.h2>

        <motion.p
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          custom={0.1}
          className="text-[16px] md:text-[18px] text-black/50 max-w-[500px] leading-relaxed"
        >
          Join the sovereign tier. Powered by zero knowledge architecture, client-side proving, and unstoppable cryptography.
        </motion.p>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          custom={0.2}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <Link
            href="/connect"
            id="cta-launch-btn"
            className="group relative w-full sm:w-auto px-10 py-4 bg-black text-white rounded-full text-[14px] font-bold overflow-hidden transition-all hover:scale-105 shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Initialize Session
              <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </Link>
          <Link
            href="/architecture"
            id="cta-arch-btn"
            className="w-full sm:w-auto px-10 py-4 border border-black/20 text-black rounded-full text-[14px] font-medium hover:bg-black/[0.04] transition-all"
          >
            Read the Architecture
          </Link>
        </motion.div>
      </div>

      {/* ── GIANT "WHALE" WORDMARK — responsive and contained ── */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none mt-20 md:mt-28 flex justify-center h-[12vw] min-h-[80px] max-h-[200px]">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 0.04, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute bottom-0 leading-[0.75] font-black text-black whitespace-nowrap"
          style={{
            fontFamily: "var(--font-aztec-serif), Georgia, serif",
            fontSize: "clamp(6rem, 24vw, 22rem)",
            letterSpacing: "-0.04em",
          }}
        >
          WHALE
        </motion.p>
      </div>
    </section>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function ImmersiveManifestoLanding({
  onOpenScanner: _onOpenScanner,
  hideMap = false,
}: ImmersiveManifestoLandingProps = {}) {
  return (
    // CRITICAL FIX: Remove min-h-screen and bg-[#050505] from root wrapper.
    // min-h-screen on a flex column causes the dark background to bleed BELOW
    // the footer creating a scrollable black zone. Use bg-white throughout.
    <div className="w-full flex flex-col bg-white text-black antialiased overflow-x-hidden">
      <LandingNav />
      <main id="main-content" className="flex-1 bg-white">
        <HeroSection />
        <StatementSection />
        <ModulesSection />
        <RegistrySection hideMap={hideMap} />
        <FAQSection />
        <AztecCTASection />
      </main>
      <SystemFooter />
    </div>
  );
}
