"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EmailLoginModal } from "@/components/auth/EmailLoginModal";
import { useSystemSignOut } from "@/hooks/useSystemSignOut";
import { SystemFooter } from "./SystemFooter";
import { useAppKit } from "@reown/appkit/react";

export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: (d: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: EASE, delay: d },
  }),
};

// ─── Nav ─────────────────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const { nuclearDisconnect } = useSystemSignOut();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fn = () => setEmailModalOpen(true);
    window.addEventListener("open-email-modal", fn);
    return () => window.removeEventListener("open-email-modal", fn);
  }, []);

  useEffect(() => {
    try {
      const m = document.cookie.match(/system_handshake=(0x[a-fA-F0-9]{40}|email_[^;\s]+)/i);
      if (m?.[1]) setConnectedAddress(m[1].toLowerCase());
    } catch {}
  }, []);

  const fmtAddr = (a: string) =>
    a.startsWith("email_") ? a.replace("email_", "").slice(0, 16) + "…" : `${a.slice(0, 6)}…${a.slice(-4)}`;

  const NAV = [
    { label: "Architecture", href: "/architecture" },
    { label: "Docs", href: "/developers/api-docs" },
    { label: "Roadmap", href: "/roadmap" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white/96 backdrop-blur-2xl border-b border-black/[0.07] shadow-sm" : "bg-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <nav className="w-full max-w-[1280px] mx-auto px-5 md:px-10 h-[60px] flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className="text-[15px] font-bold tracking-tight">Humanity Ledger</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-2 text-[13px] font-medium text-black/55 hover:text-black transition-colors rounded-lg hover:bg-black/[0.04]">
                {l.label}
              </Link>
            ))}
            <Link href="/hub" className="px-3 py-2 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50">App Hub</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="https://github.com/humanityledger" target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-black/50 hover:text-black transition-colors">GitHub</a>
            {connectedAddress ? (
              <>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-black/[0.07] rounded-full text-[11px] font-mono text-black/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />{fmtAddr(connectedAddress)}
                </span>
                <Link href="/hub" className="px-4 py-2 bg-black text-white rounded-full text-[13px] font-bold hover:bg-black/80 transition-all">App Hub →</Link>
                <button onClick={() => nuclearDisconnect()} className="text-[12px] text-black/40 hover:text-red-500 transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => setEmailModalOpen(true)} className="px-4 py-2 border border-black/10 rounded-full text-[13px] font-semibold text-black hover:bg-zinc-50 transition-colors">Sign in</button>
                <Link href="/connect" className="px-4 py-2 bg-black text-white rounded-full text-[13px] font-bold hover:bg-black/80 transition-all hover:-translate-y-px">Connect Wallet</Link>
              </>
            )}
          </div>
          <button aria-label="Open navigation" onClick={() => setMobileOpen((v) => !v)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px]">
            <span className={`w-5 h-[1.5px] bg-black transition-all origin-center ${mobileOpen ? "rotate-45 translate-y-[3.25px]" : ""}`} />
            <span className={`w-5 h-[1.5px] bg-black transition-all origin-center ${mobileOpen ? "-rotate-45 -translate-y-[3.25px]" : ""}`} />
          </button>
        </nav>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div key="mnav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="md:hidden bg-white border-t border-black/[0.06] overflow-hidden">
              <div className="px-6 pt-4 pb-8 flex flex-col gap-1">
                {[...NAV, { label: "App Hub", href: "/hub" }].map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="py-3 text-[16px] font-medium text-black/70 hover:text-black border-b border-black/[0.05] last:border-0">{l.label}</Link>
                ))}
                <div className="flex flex-col gap-3 mt-5">
                  {connectedAddress ? (
                    <>
                      <Link href="/hub" onClick={() => setMobileOpen(false)} className="w-full text-center py-3.5 bg-black text-white rounded-2xl text-[15px] font-bold">App Hub →</Link>
                      <button onClick={() => { setMobileOpen(false); nuclearDisconnect(); }} className="w-full py-3.5 border border-black/10 rounded-2xl text-[15px] font-semibold text-red-500">Sign out</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setMobileOpen(false); setEmailModalOpen(true); }} className="w-full py-3.5 border border-black/12 rounded-2xl text-[15px] font-bold text-black">Sign in with Email</button>
                      <Link href="/connect" onClick={() => setMobileOpen(false)} className="w-full text-center py-3.5 bg-black text-white rounded-2xl text-[15px] font-bold">Connect Wallet</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <EmailLoginModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      {!connectedAddress && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/96 backdrop-blur-xl border-t border-black/[0.07] px-5 py-3 flex gap-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}>
          <button onClick={() => setEmailModalOpen(true)} className="flex-1 py-3 border-2 border-black/10 rounded-2xl text-[14px] font-bold text-black">Sign in</button>
          <Link href="/connect" className="flex-1 py-3 bg-black text-white rounded-2xl text-[14px] font-bold text-center">Connect Wallet</Link>
        </div>
      )}
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center bg-white px-6 overflow-hidden pt-20">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }} className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-zinc-50 border border-black/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-black/55">El futuro de la comunicacion</span>
        </div>
        <h1 className="text-[50px] sm:text-[70px] md:text-[90px] lg:text-[110px] leading-[0.92] tracking-tight font-black text-black mb-8" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>
          Privacidad<br /><span className="text-black/35">absoluta.</span>
        </h1>
        <p className="text-[18px] md:text-[21px] text-black/60 leading-relaxed font-medium max-w-[660px] mb-12">
          Humanity Ledger presenta una nueva era donde la libertad de comunicacion es un derecho inquebrantable. Descubre Ledger Chat, un ecosistema donde ninguna corporacion puede rastrear o almacenar tu informacion personal. Todo esta encriptado nativamente desde tu dispositivo.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/chat" className="w-full sm:w-auto px-9 py-4 bg-black text-white rounded-full text-[15px] font-bold hover:bg-black/80 active:scale-95 transition-all shadow-[0_6px_30px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">Acceder a Ledger Chat</Link>
        </div>
      </motion.div>
    </section>
  );
}


function WhatIsSection() {
  return (
    <section className="w-full bg-zinc-50 text-black py-24 md:py-36 px-6 border-t border-black/[0.05]">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: EASE }}>
          <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-black/40 mb-5">El Estandar Definitivo</span>
          <h2 className="text-[32px] md:text-[48px] font-black leading-tight tracking-tight text-black mb-6" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>
            Superando a<br /><span className="text-black/35">la competencia.</span>
          </h2>
          <p className="text-[17px] text-black/60 leading-relaxed">
            Aplicaciones tradicionales como Telegram o WhatsApp requieren tu numero de telefono, comprometiendo tu identidad desde el primer segundo, almacenando metadatos y contactos en servidores centralizados expuestos a vulnerabilidades y censura global.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }} className="flex flex-col gap-5">
          {[
            { n: "01", t: "Sin numeros telefonicos", d: "Tu identidad se protege utilizando identificadores nativos descentralizados que no dejan huellas en la red." },
            { n: "02", t: "Encriptacion de extremo a extremo real", d: "Cada mensaje audio y archivo multimedia es encriptado en el dispositivo antes de transitar por la red, garantizando inmunidad total." },
            { n: "03", t: "Soberania de datos", d: "No existen servidores centrales que acumulen tu informacion. Tu eres el unico custodio de tus conversaciones privadas." },
          ].map((item) => (
            <div key={item.n} className="flex gap-4 items-start p-5 bg-white rounded-2xl border border-black/[0.06]">
              <span className="font-mono text-[10px] text-black/30 tracking-widest mt-1 shrink-0">{item.n}</span>
              <div>
                <p className="font-bold text-[15px] text-black mb-1">{item.t}</p>
                <p className="text-[13px] text-black/50 leading-relaxed">{item.d}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}



// ─── Ledger Chat Flagship ──────────────────────────────────────────────────────
function LedgerChatSection() {
  return (
    <section className="w-full py-24 md:py-36 px-6 bg-white border-t border-black/[0.05]">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-14">
          <div className="w-10 h-10 rounded-2xl bg-[#1C7AFF] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-black/40">Launching January 2027</p>
            <h2 className="text-[17px] font-black text-black tracking-tight">Flagship Mini-App</h2>
          </div>
          <span className="ml-auto px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold uppercase tracking-widest border border-blue-100 shrink-0">Full Functionality</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }}>
            <h3 className="text-[40px] md:text-[56px] font-black leading-[0.95] tracking-tight text-black mb-6" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>
              LedgerChat.<br /><span className="text-black/35">Fully encrypted.</span>
            </h3>
            <p className="text-[17px] text-black/60 leading-relaxed mb-8">
              The first application launching in January 2027. Experience end to end encrypted messaging, peer to peer voice and video calls, audio messages, and file sharing — all gated by your wallet identity.
            </p>
            <div className="flex flex-col gap-3 mb-10">
              {[
                "End to end encrypted messages via ECDH X25519",
                "Wallet to wallet voice & video calls (WebRTC)",
                "Encrypted audio messages & sticker packs",
                "Identity gated by zero knowledge credentials",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <svg className="shrink-0 text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-[14px] text-black/70 font-medium">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/chat" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1C7AFF] text-white rounded-full text-[14px] font-bold hover:bg-blue-600 active:scale-95 transition-all">
              Open Ledger Chat
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </motion.div>
          {/* Chat mockup */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }} className="relative aspect-[4/5] rounded-[28px] bg-[#F2F2F7] border border-black/10 overflow-hidden shadow-xl flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-black/[0.06]">
              <div className="w-9 h-9 rounded-full bg-[#1C7AFF] flex items-center justify-center text-white font-bold text-[13px]">W</div>
              <div>
                <p className="text-[14px] font-bold text-black">LedgerChat</p>
                <p className="text-[11px] text-black/40">End-to-end encrypted</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-3 p-5">
              <div className="self-start max-w-[75%] px-4 py-3 bg-white rounded-2xl rounded-tl-sm shadow-sm">
                <p className="text-[13px] text-black font-medium">Your ZK identity verified ✓</p>
              </div>
              <div className="self-end max-w-[75%] px-4 py-3 bg-[#1C7AFF] rounded-2xl rounded-tr-sm">
                <p className="text-[13px] text-white font-medium">All messages private 🔒</p>
              </div>
              <div className="self-start max-w-[80%] px-4 py-3 bg-white rounded-2xl rounded-tl-sm shadow-sm">
                <p className="text-[13px] text-black font-medium">Zero-knowledge credentials protect identity on every tx.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-black/[0.06]">
              <div className="flex-1 h-9 rounded-full bg-[#F2F2F7] px-4 flex items-center">
                <span className="text-[13px] text-black/30">Message...</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1C7AFF] flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Aztec Strip ──────────────────────────────────────────────────────────────
function AztecStrip() {
  return (
    <section className="w-full py-16 px-6 bg-zinc-50 border-t border-black/[0.06]">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-black/40">Powered by</span>
          <h3 className="text-[22px] md:text-[28px] font-black text-black tracking-tight">Aztec Network L2 · Zero Knowledge Proofs</h3>
          <p className="text-[14px] text-black/50 leading-relaxed max-w-md">Ledger Chat settles on Aztec Network, the leading zero knowledge L2 on Ethereum, providing complete transaction privacy and institutional compliance from day one.</p>
        </div>
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
          <a href="https://aztec.network" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white rounded-full text-[13px] font-bold hover:bg-black/80 transition-colors whitespace-nowrap">Learn about Aztec →</a>
          <Link href="/developers/api-docs" className="flex items-center justify-center gap-2 px-6 py-3.5 border border-black/15 rounded-full text-[13px] font-medium text-black/60 hover:text-black hover:border-black/30 transition-colors">View Documentation</Link>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const FAQS = [
    { q: "What is Ledger Chat?", a: "Ledger Chat is a zero knowledge encrypted communication application secured by the Aztec Network L2." },
    { q: "When does Ledger Chat launch?", a: "Ledger Chat launches with full production functionality in January 2027. This includes end to end encrypted messaging, wallet to wallet voice and video calls, audio messages, and stickers." },
    { q: "How does it connect to Aztec Network?", a: "Aztec Network is the Layer 2 settlement protocol. Ledger Chat acts as the application and identity layer, running Noir zero knowledge circuits locally in your browser and settling encrypted state on Aztec for absolute privacy." },
    { q: "Are my messages stored on any server?", a: "No. Messages are end to end encrypted using X25519 ECDH keys exchanged directly between wallets and transmitted peer to peer via WebRTC. Relay nodes are only used for peer discovery, never for message content." },
    { q: "Do I need a crypto wallet?", a: "You can sign in with email for basic access. A self custodial wallet (MetaMask, Coinbase Wallet, Rainbow) is required for L2 execution, zero knowledge credential issuance, and full privacy features." },
  ];
  return (
    <section className="w-full py-24 md:py-36 px-6 bg-white border-t border-black/[0.05]">
      <div className="w-full max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-14 text-center">
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight text-black" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>Common Questions</h2>
        </motion.div>
        <div className="flex flex-col divide-y divide-black/[0.06]">
          {FAQS.map((f, i) => (
            <div key={i} className="py-5">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 text-left">
                <span className="text-[17px] font-bold text-black leading-snug">{f.q}</span>
                <span className={`shrink-0 w-7 h-7 rounded-full border-2 border-black/10 flex items-center justify-center transition-transform ${open === i ? "rotate-45" : ""}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.p initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="text-[15px] text-black/60 leading-relaxed overflow-hidden">
                    {f.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section className="w-full py-28 md:py-40 px-6 bg-white text-black text-center border-t border-black/[0.05]">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="max-w-2xl mx-auto">
        <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-black/40 mb-5">January 2027</span>
        <h2 className="text-[36px] md:text-[60px] font-black leading-tight tracking-tight mb-6 text-black" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>Ready to enter?</h2>
        <p className="text-[17px] text-black/50 leading-relaxed mb-12 max-w-lg mx-auto">Ledger Chat goes live in January 2027. Connect your wallet now to claim your zero knowledge identity and be first in.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/connect" className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-full text-[15px] font-black hover:bg-black/80 active:scale-95 transition-all hover:-translate-y-0.5 shadow-[0_6px_30px_rgba(0,0,0,0.15)]">Connect Wallet →</Link>
          <Link href="/chat" className="w-full sm:w-auto px-10 py-4 border-2 border-black/12 text-black rounded-full text-[15px] font-bold hover:bg-zinc-50 active:scale-95 transition-all">Launch LedgerChat</Link>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function ImmersiveManifestoLanding({ onOpenScanner: _o, hideMap = false }: ImmersiveManifestoLandingProps = {}) {
  return (
    <div className="w-full flex flex-col bg-white text-black antialiased overflow-x-hidden">
      <LandingNav />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <WhatIsSection />
        <LedgerChatSection />
        <AztecStrip />
        <FAQSection />
        <FinalCTASection />
      </main>
      <SystemFooter />
    </div>
  );
}
