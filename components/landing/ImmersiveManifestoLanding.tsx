"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { EmailLoginModal } from '@/components/auth/EmailLoginModal';
import { useDisconnect } from 'wagmi';
import { signOut } from 'next-auth/react';

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const PRODUCT_LINKS = [
  { label: "Studio Provenance", sub: "Zero-knowledge verifiable provenance", href: "/portfolio" },
  { label: "Aztec Identity", sub: "Privacy-preserving portfolio layer", href: "/developers/api-docs" },
  { label: "Whale Chat", sub: "Encrypted, verifiable communications", href: "/developer" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/company" },
  { label: "Security", href: "/security" },
  { label: "Blog", href: "/blog" },
];

const DottedGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-multiply" />
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
      }}
    />
  </div>
);

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      setScrolled((el.scrollTop ?? window.scrollY) > 10);
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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="w-full max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 shrink-0 opacity-80 mix-blend-multiply">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-black">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-serif text-[17px] font-black tracking-tight text-black leading-none">
              Humanity Ledger
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/architecture" className="text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">Architecture</Link>
            <Link href="/roadmap" className="text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">Roadmap</Link>

            <div className="relative group h-14 flex items-center" onMouseEnter={() => setProductOpen(true)} onMouseLeave={() => setProductOpen(false)}>
              <button className="flex items-center gap-1 text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
                Product <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${productOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {productOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="absolute top-14 left-0 bg-white border border-black/10 shadow-xl w-[300px] z-50">
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

            <div className="relative group h-14 flex items-center" onMouseEnter={() => setCompanyOpen(true)} onMouseLeave={() => setCompanyOpen(false)}>
              <button className="flex items-center gap-1 text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
                Company <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${companyOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {companyOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="absolute top-14 left-0 bg-white border border-black/10 shadow-xl w-[180px] z-50">
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

        <div className="hidden md:flex items-center gap-4">
          <a href="https://github.com/humanityledger" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[13.5px] font-medium text-black/70 hover:text-black transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </a>
          <Link href="/developers/api-docs" className="px-4 py-1.5 border border-black/15 text-[13.5px] font-medium text-black hover:bg-black/[0.04] transition-colors">
            Docs
          </Link>
          {connectedAddress ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.04] border border-black/10 text-[12px] font-mono text-black/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                {connectedAddress.startsWith('email_') ? connectedAddress.replace('email_', '').slice(0, 18) + '…' : `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}`}
              </span>
              <Link href="/terminal" className="px-4 py-1.5 bg-black text-white text-[13.5px] font-medium hover:bg-black/85 transition-colors">
                Dashboard →
              </Link>
              <button
                onClick={async () => {
                  try {
                    document.cookie.split(';').forEach(c => {
                      const name = c.split('=')[0].trim();
                      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
                    });
                    try { sessionStorage.clear(); localStorage.removeItem('system_session_v2'); } catch {}
                    try { await signOut({ redirect: false }); } catch {}
                    window.location.replace('/');
                  } catch { window.location.replace('/'); }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-black/15 text-[12px] font-medium text-black/50 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setEmailModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 border border-black/15 text-[13.5px] font-medium text-black/70 hover:text-black hover:bg-black/[0.04] transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 opacity-75" alt="Google" />
                Gmail
              </button>
              <Link href="/portfolio" className="px-4 py-1.5 bg-black text-white text-[13.5px] font-medium hover:bg-black/85 transition-colors">
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

function HeroScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div ref={containerRef} className="relative w-full h-[100vh] min-h-[800px] flex items-center justify-center pt-20">
      <motion.div 
        style={{ opacity, scale, y }}
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] border border-black/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12px] font-semibold text-black/70 tracking-wide uppercase">Powered by Aztec Network</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[64px] md:text-[96px] leading-[0.95] font-serif font-black text-black tracking-tight max-w-[1000px]"
        >
          Programmable Privacy <br/>
          <span className="text-black/40">for Ethereum.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-[18px] md:text-[22px] leading-relaxed text-black/60 font-medium max-w-[700px]"
        >
          Humanity Ledger leverages Aztec’s zero-knowledge execution environment to provide fully verifiable, unconditionally private interactions on-chain.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/developer" className="h-14 px-8 bg-black text-white rounded-none flex items-center justify-center text-[15px] font-semibold hover:bg-black/80 transition-colors w-full sm:w-auto">
            Build with Noir
          </Link>
          <Link href="/architecture" className="h-14 px-8 bg-transparent border border-black/20 text-black rounded-none flex items-center justify-center text-[15px] font-semibold hover:bg-black/[0.03] transition-colors w-full sm:w-auto">
            Read Architecture
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
        className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
        className="absolute top-40 left-10 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" 
      />
    </div>
  );
}

function FeatureCard({ title, description, icon, delay }: { title: string, description: string, icon: React.ReactNode, delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative p-8 bg-white border border-black/10 hover:border-black/30 transition-colors duration-500 flex flex-col h-full overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
      <div className="w-12 h-12 flex items-center justify-center bg-black/[0.03] rounded-sm mb-6 text-black">
        {icon}
      </div>
      <h3 className="text-[20px] font-bold text-black tracking-tight mb-3 font-serif">{title}</h3>
      <p className="text-[15px] text-black/60 leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}

function BentoFeaturesSection() {
  return (
    <section className="relative w-full py-32 bg-white z-10 border-t border-black/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-20 max-w-[800px]">
          <h2 className="text-[40px] md:text-[56px] font-serif font-black text-black leading-[1.1] tracking-tight">
            Institutional-Grade Confidentiality.
          </h2>
          <p className="mt-6 text-[18px] text-black/60 font-medium">
            Built entirely on Aztec's architecture, we provide a unified stack for privacy-first decentralized applications. Cryptographically secure, computationally scalable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard delay={0} title="Zero-Knowledge Accounts" description="Your identity is a Noir-proven ZK account. No passwords, no phone numbers. A cryptographic keypair proving who you are without disclosing your public address." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <FeatureCard delay={0.1} title="Client-Side Proving" description="Noir circuits run entirely on your device via the Aztec PXE (Private Execution Environment). The network receives only a validity proof, never raw inputs." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>} />
          <FeatureCard delay={0.2} title="Noir Smart Contracts" description="Write, test, and deploy zero-knowledge circuits using Noir. The record is public on L2, but the payload stays strictly private in encrypted UTXOs." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>} />
          <FeatureCard delay={0.3} title="Ethereum L1 Settlement" description="Security inherited directly from the Ethereum mainnet. Aztec rollups batch and prove transactions, posting state diffs to L1 for absolute finality." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 22 12 17 22 22 12 2"/></svg>} />
          <FeatureCard delay={0.4} title="Encrypted Verification" description="Issue and verify verifiable credentials (VCs) without revealing the underlying data, ensuring compliance without compromising user privacy." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
          <FeatureCard delay={0.5} title="Shielded Portfolio" description="Track balances and transactions shielded inside the Aztec environment. Your wealth remains completely invisible to the public state." icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
        </div>
      </div>
    </section>
  );
}

function ArchitectureDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div ref={ref} className="w-full mt-20 relative p-8 md:p-16 border border-black/10 bg-black/[0.01] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-multiply" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 max-w-[900px] mx-auto">
        <motion.div variants={nodeVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="w-full md:w-[250px] bg-white border border-black/15 p-6 shadow-sm relative z-20">
          <div className="text-[11px] font-bold tracking-widest text-black/50 mb-4 uppercase">Layer 3</div>
          <h4 className="text-[18px] font-bold text-black font-serif">Local Device</h4>
          <p className="text-[13px] text-black/60 mt-2">Private Execution Environment (PXE). Generates ZK proofs locally.</p>
        </motion.div>

        <div className="hidden md:flex flex-1 h-[2px] bg-black/10 relative">
          <motion.div initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : { scaleX: 0 }} transition={{ duration: 1, delay: 0.4 }} className="absolute top-0 left-0 w-full h-full bg-emerald-500 origin-left" />
        </div>

        <motion.div variants={nodeVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} transition={{ delay: 0.6 }} className="w-full md:w-[250px] bg-black text-white p-6 shadow-xl relative z-20">
          <div className="text-[11px] font-bold tracking-widest text-white/50 mb-4 uppercase">Layer 2</div>
          <h4 className="text-[18px] font-bold text-white font-serif">Aztec Rollup</h4>
          <p className="text-[13px] text-white/60 mt-2">Sequencers aggregate UltraHonk proofs. Public state is updated.</p>
        </motion.div>

        <div className="hidden md:flex flex-1 h-[2px] bg-black/10 relative">
          <motion.div initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : { scaleX: 0 }} transition={{ duration: 1, delay: 1 }} className="absolute top-0 left-0 w-full h-full bg-black origin-left" />
        </div>

        <motion.div variants={nodeVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} transition={{ delay: 1.2 }} className="w-full md:w-[250px] bg-white border border-black/15 p-6 shadow-sm relative z-20">
          <div className="text-[11px] font-bold tracking-widest text-black/50 mb-4 uppercase">Layer 1</div>
          <h4 className="text-[18px] font-bold text-black font-serif">Ethereum Mainnet</h4>
          <p className="text-[13px] text-black/60 mt-2">Verifies ZK-rollup proofs. Absolute settlement and finality.</p>
        </motion.div>
      </div>
    </div>
  );
}

function ArchitectureOverviewSection() {
  return (
    <section className="relative w-full py-32 bg-white z-10 border-t border-black/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-[800px] mx-auto">
          <h2 className="text-[40px] md:text-[56px] font-serif font-black text-black leading-[1.1] tracking-tight">
            The Protocol Stack.
          </h2>
          <p className="mt-6 text-[18px] text-black/60 font-medium">
            By shifting computation to the client-side via the PXE, the network achieves unparalleled privacy and scalability without compromising the security guarantees of Ethereum.
          </p>
        </div>
        <ArchitectureDiagram />
      </div>
    </section>
  );
}

function CodeShowcaseSection() {
  const codeString = `
// Aztec Noir Smart Contract: Private Transfer
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

        // The L2 sequencer only sees a valid proof,
        // identities and amounts remain strictly confidential.
    }
}
`.trim();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full py-32 bg-black z-10">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <h2 className="text-[40px] md:text-[56px] font-serif font-black text-white leading-[1.1] tracking-tight mb-6">
            Write Private Smart Contracts in Noir.
          </h2>
          <p className="text-[18px] text-white/60 font-medium mb-8">
            Leverage Aztec's Rust-like ZK domain-specific language. Noir allows you to write private business logic that compiles to ultra-efficient Barretenberg circuits.
          </p>
          <ul className="space-y-4">
            {['Abstracted cryptography', 'Native private state variables', 'Seamless L1/L2 interoperability'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M20 6L9 17l-5-5"/></svg>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link href="/developer" className="inline-flex h-12 px-8 bg-white text-black items-center justify-center text-[15px] font-semibold hover:bg-white/90 transition-colors">
              Developer Docs
            </Link>
          </div>
        </motion.div>

        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
          <div className="flex items-center px-4 py-3 bg-white/5 border-b border-white/5 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[12px] font-mono text-white/40">PrivateToken.nr</span>
          </div>
          <div className="p-6 overflow-x-auto text-[13px] md:text-[14px] leading-[1.6] font-mono text-white/80" dangerouslySetInnerHTML={{
            __html: `<pre><code>${codeString.split('\n').map((line, i) => `<div class="table-row"><span class="table-cell text-white/20 select-none pr-4 text-right">${i + 1}</span><span class="table-cell whitespace-pre">${line.replace('contract', '<span class="text-emerald-400">contract</span>').replace('fn transfer', '<span class="text-blue-400">fn transfer</span>').replace('#[aztec(private)]', '<span class="text-yellow-400">#[aztec(private)]</span>').replace(/\/\/.*/g, '<span class="text-white/40">$&</span>')}</span></div>`).join('')}</code></pre>`
          }} />
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative w-full py-32 bg-white z-10 border-t border-black/5">
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <h2 className="text-[40px] md:text-[56px] font-serif font-black text-black leading-[1.1] tracking-tight mb-8">
          Ready to build on Aztec?
        </h2>
        <p className="text-[18px] text-black/60 font-medium mb-10 max-w-[600px] mx-auto">
          Initialize your Private Execution Environment and deploy your first confidential smart contract today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/portfolio" className="h-14 px-8 bg-black text-white rounded-none flex items-center justify-center text-[15px] font-semibold hover:bg-black/80 transition-colors w-full sm:w-auto">
            Connect Wallet
          </Link>
          <a href="https://discord.gg/aztec" target="_blank" rel="noreferrer" className="h-14 px-8 bg-transparent border border-black/20 text-black rounded-none flex items-center justify-center text-[15px] font-semibold hover:bg-black/[0.03] transition-colors w-full sm:w-auto">
            Join the Community
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ImmersiveManifestoLanding() {
  return (
    <div className="relative w-full bg-white text-black selection:bg-emerald-500/30 selection:text-black">
      <DottedGrid />
      <LandingNav />
      <HeroScrollSection />
      <BentoFeaturesSection />
      <ArchitectureOverviewSection />
      <CodeShowcaseSection />
      <CTASection />
    </div>
  );
}
