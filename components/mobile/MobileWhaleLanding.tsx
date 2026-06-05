"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, Globe, Zap } from "lucide-react";

export const MobileWhaleLanding = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-[#050505] overflow-x-hidden selection:bg-black/10">

      {/* Top status bar */}
      <div className="w-full border-b border-black/8 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4">
            <img
              src="/atom_3d_silver.jpg"
              alt="Humanity Ledger"
              className="w-full h-full object-contain mix-blend-darken contrast-[1.15] brightness-[1.05]"
            />
          </div>
          <span className="text-[11px] font-black tracking-widest uppercase text-black/70">
            Humanity Ledger
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-black" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">
            Secure
          </span>
        </div>
      </div>

      <main className="relative w-full min-h-[calc(100vh-49px)] flex flex-col items-center justify-between px-6 pt-16 pb-10">

        {/* ── TOP: Logo + Headline ── */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Logo */}
            <div className="w-full aspect-video mb-10 relative overflow-hidden rounded-xl border border-black/10">
              <img
                src="/system-shots/monochrome-illustration-science-fiction-arch-pixel-art-Devine-Lu-Linvega-2268380-wallhere.com (1).jpg"
                alt="Humanity Ledger Architecture"
                className="w-full h-full object-cover mix-blend-darken contrast-[1.15] brightness-[1.05]"
                draggable={false}
              />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mb-12">
              {[
                { icon: Lock, label: "End-to-End\nPrivacy" },
                { icon: Shield, label: "Aztec\nZK Proofs" },
                { icon: Globe, label: "20+ Chains\nMonitored" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 py-4 px-2 border border-black/8 bg-white"
                >
                  <Icon size={16} strokeWidth={1.5} className="text-black/50" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-black/50 text-center whitespace-pre-line leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── BOTTOM: Actions ── */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[360px] flex flex-col gap-3"
          >
            {/* Primary CTA */}
            <Link
              href="/connect"
              className="w-full flex items-center justify-between h-14 px-6 bg-black text-white font-semibold text-[13px] tracking-wide hover:bg-black/85 active:scale-[0.98] transition-all duration-200"
            >
              <span>Connect Wallet</span>
              <ArrowRight size={16} strokeWidth={2} />
            </Link>

            {/* Secondary */}
            <Link
              href="/developers/api-docs"
              className="w-full flex items-center justify-center h-12 px-6 border border-black/15 text-black font-medium text-[13px] tracking-wide hover:bg-black/[0.04] active:scale-[0.98] transition-all duration-200"
            >
              Read Documentation
            </Link>

            {/* Fine print */}
            <p className="text-center text-[10px] text-black/30 font-medium tracking-wide pt-2">
              Non-custodial · Open source · Aztec L2
            </p>
          </motion.div>
        )}

      </main>
    </div>
  );
};
