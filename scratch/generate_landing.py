import os

content = '''"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSystemSignOut } from "@/hooks/useSystemSignOut";
import { HLLogo } from "@/components/shared/HLLogo";
import { SystemFooter } from "./SystemFooter";
import { ArrowRight, Lock, MessageCircle, Shield, EyeOff, Zap, Globe, Github, Twitter } from "lucide-react";

export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Minimal Nav ─────────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const m = document.cookie.match(/system_handshake=(0x[a-fA-F0-9]{40}|email_[^;\\s]+)/i);
      if (m?.[1]) setConnectedAddress(m[1].toLowerCase());
    } catch {}
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-black/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <HLLogo variant="mark" theme="dark" size={32} />
          <span className="font-sans font-bold text-[20px] tracking-tight text-black group-hover:opacity-80 transition-opacity">
            Humanity Ledger
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-sans font-medium text-[15px] text-black/80">
          <Link href="/docs/ledger-chat" className="hover:text-black transition-colors">Features</Link>
          <Link href="/docs/architecture" className="hover:text-black transition-colors">Architecture</Link>
          <Link href="/docs/zero-knowledge" className="hover:text-black transition-colors">Zero-Knowledge</Link>
          <Link href="/docs/privacy" className="hover:text-black transition-colors">Privacy</Link>
        </div>

        <div className="flex items-center gap-4">
          {connectedAddress ? (
            <Link 
              href="/hub"
              className="bg-[#2C6BED] hover:bg-[#1A5AE3] text-white font-sans font-bold text-[15px] px-6 py-2.5 rounded-full transition-all shadow-sm"
            >
              Open Hub
            </Link>
          ) : (
            <Link 
              href="/connect"
              className="bg-[#2C6BED] hover:bg-[#1A5AE3] text-white font-sans font-bold text-[15px] px-6 py-2.5 rounded-full transition-all shadow-sm"
            >
              Get Ledger
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Main Landing ─────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding({ onOpenScanner }: ImmersiveManifestoLandingProps) {
  return (
    <div className="min-h-screen bg-[#F6F7F9] font-sans selection:bg-[#2C6BED]/20">
      <LandingNav />

      {/* HERO SECTION - SIGNAL STYLE */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-col items-start text-left z-10"
          >
            <h1 className="text-[52px] md:text-[76px] lg:text-[84px] font-bold leading-[1.05] tracking-tight text-[#1C1C1E] mb-6">
              Speak Freely.
            </h1>
            <p className="text-[18px] md:text-[22px] leading-relaxed text-[#1C1C1E]/70 font-medium mb-10 max-w-lg">
              Say "hello" to a different messaging experience. An unexpected focus on privacy, combined with all of the features you expect.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                href="/connect"
                className="bg-[#2C6BED] hover:bg-[#1A5AE3] text-white font-bold text-[16px] px-8 py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Get Humanity Ledger
              </Link>
              <Link 
                href="/docs"
                className="bg-white hover:bg-zinc-50 text-[#1C1C1E] border border-black/10 font-bold text-[16px] px-8 py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Read Documentation
              </Link>
            </div>
            
            <p className="text-sm font-medium text-black/40 mt-6 flex items-center gap-2">
              <Lock size={14} /> End-to-End Encrypted & Zero-Knowledge
            </p>
          </motion.div>

          {/* APP MOCKUP PLACEHOLDER FOR THE USER TO ADD IMAGES LATER */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="relative w-full h-[500px] md:h-[700px] flex items-center justify-center"
          >
            {/* The user will put their iPhone and Android UI images here */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2C6BED]/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-50" />
            <div className="relative w-[320px] h-[650px] bg-white rounded-[3rem] shadow-2xl border-8 border-zinc-100 overflow-hidden flex flex-col items-center justify-center text-center p-8">
              <HLLogo variant="mark" theme="dark" size={48} className="mb-6 opacity-20" />
              <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">[ iOS / ANDROID ]<br/>APP SCREENSHOT HERE</p>
            </div>
            {/* Secondary floating screen */}
            <div className="absolute right-0 bottom-10 w-[450px] h-[300px] bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden flex flex-col items-center justify-center text-center p-8 hidden md:flex translate-x-12">
              <HLLogo variant="full" theme="dark" size={32} className="mb-6 opacity-20" />
              <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">[ PC TERMINAL ]<br/>APP SCREENSHOT HERE</p>
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* FEATURES SECTION - WHITE BACKGROUND */}
      <section className="bg-white py-24 md:py-32 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[36px] md:text-[52px] font-bold tracking-tight text-[#1C1C1E] mb-6">
              Why use Humanity Ledger?
            </h2>
            <p className="text-[20px] text-[#1C1C1E]/60 font-medium leading-relaxed">
              Explore below to see why humanity is choosing the sovereign network over legacy platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="flex flex-col items-start">
              <div className="w-14 h-14 bg-blue-50 text-[#2C6BED] rounded-2xl flex items-center justify-center mb-6">
                <EyeOff size={28} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-[#1C1C1E] mb-4">Share Without Insecurity</h3>
              <p className="text-[17px] leading-relaxed text-[#1C1C1E]/70 font-medium">
                State-of-the-art end-to-end encryption (powered by the open source XMTP protocol) keeps your conversations secure. We can't read your messages or listen to your calls, and no one else can either. Privacy isn't an optional mode — it's just the way that Humanity Ledger works.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={28} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-[#1C1C1E] mb-4">No Ads. No Trackers.</h3>
              <p className="text-[17px] leading-relaxed text-[#1C1C1E]/70 font-medium">
                There are no ads, no affiliate marketers, and no creepy tracking in Humanity Ledger. So focus on sharing the moments that matter with the people who matter to you.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-[#1C1C1E] mb-4">Zero-Knowledge Architecture</h3>
              <p className="text-[17px] leading-relaxed text-[#1C1C1E]/70 font-medium">
                Unlike other platforms, we use Zero-Knowledge proofs and Onion Routing to guarantee your metadata is never stored. Your identity is your cryptographic wallet, and you retain absolute sovereignty over your social graph.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <SystemFooter />
    </div>
  );
}
'''

with open('components/landing/ImmersiveManifestoLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
