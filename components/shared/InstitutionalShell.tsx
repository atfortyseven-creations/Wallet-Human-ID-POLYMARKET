"use client";

import React from "react";
import { motion } from "framer-motion";
import { WhaleLogo } from "./WhaleLogo";

interface InstitutionalShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "lime" | "emerald" | "rose" | "orchid" | "amber";
  fullWidth?: boolean;
}

//  THE MASTER STACK SHELL  COSMIC WALLPAPER EDITION 
export function InstitutionalShell({
  children,
  title,
  subtitle,
  badge,
  fullWidth = false
}: InstitutionalShellProps) {

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 text-white relative font-aztec-body overflow-x-hidden">

      {/*  Layer 1: Cosmic ukiyo-e pattern  exact same as landing page hero  */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-[url('/patron-cosmico-4k.png')] bg-repeat bg-left-top"
        style={{
          backgroundSize: 'clamp(100px, 25vw, 400px)',
          opacity: 0.60,
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      />

      {/*  Layer 2: Dark readability wash  */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-black/40 " />

      {/*  Main content  */}
      <div className="flex-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ transform: 'translateZ(0)' }}
          className={`min-h-full pb-0 ${fullWidth ? 'w-full' : 'container mx-auto'}`}
        >
          {children}
        </motion.div>
      </div>

      {/*  DOWNPAGE: Hokusai wave footer  mirroring landing page exactly  */}
      <div className="relative pt-24 pb-0 overflow-hidden border-t border-black/[0.05] z-10 mt-20">

        {/* Layer A: Cosmic pattern continues */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none bg-[url('/patron-cosmico-4k.png')] bg-repeat bg-left-top"
          style={{
            backgroundSize: 'clamp(100px, 25vw, 400px)',
            opacity: 0.72,
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        />

        {/* Layer B: Hokusai blue waves  responsive scaling without quality loss */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none select-none bg-[url('/olas-hokusai-4k.png')] bg-bottom bg-repeat-x"
          style={{
            backgroundSize: 'auto 100%',
            opacity: 0.90,
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        />

        {/* Layer C: Dark mode overlay (hidden in light mode) */}
        <div className="absolute inset-0 z-[2] pointer-events-none hidden " style={{ background: '#050810', opacity: 0.80 }} />

        {/* Footer band */}
        <div className="relative z-20 border-t border-black/10  px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/65  backdrop-blur-xl mt-48 md:mt-64">
          <div className="flex items-center gap-3">
            <WhaleLogo className="w-5 h-5" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/60  font-black">
              Immutable Data · Zero-Trust Verification · Extreme Precision
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-black/40  font-bold text-center md:text-right">
            Privacy by Void · No data stored · All communication is end-to-end verified
          </span>
        </div>
      </div>

    </div>
  );
}
