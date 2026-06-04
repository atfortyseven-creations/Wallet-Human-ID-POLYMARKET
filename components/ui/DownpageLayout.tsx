"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface DownpageSection {
  title: string;
  paragraphs: string[];
}

export interface DownpageLayoutProps {
  pageTitle: string;
  subtitle: string;
  indexTitle: string;
  sections: DownpageSection[];
}

export function DownpageLayout({ pageTitle, subtitle, indexTitle, sections }: DownpageLayoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col md:flex-row bg-[#FFFFFF] text-black selection:bg-black selection:text-white">
      {/* LEFT NAVIGATION */}
      <aside className="w-full md:w-[300px] shrink-0 border-b md:border-b-0 md:border-r border-black/10 flex flex-col px-6 pt-8 pb-12 md:h-[100dvh] md:sticky md:top-0 bg-[#FFFFFF] z-50">
        
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/atom.png" alt="Quantum Atom" className="w-full h-full object-contain mix-blend-multiply opacity-80" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-black text-black">
              {indexTitle}
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-full border-t border-black/10 mb-8" />

        {/* INDEX */}
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/40 mb-6 shrink-0 pl-2">
          Índice Estructural
        </div>
        
        <nav className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-8">
          {sections.map((sec, index) => (
            <a 
              key={index} 
              href={`#section-${index + 1}`} 
              className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-black/5 bg-black/[0.02] hover:bg-black/[0.05] hover:border-black/30 active:scale-[0.97] transition-all duration-200 shadow-sm"
            >
              <div className="flex-1 text-left">
                <p className="text-[12px] font-bold uppercase tracking-tight text-black/80 group-hover:text-black leading-snug transition-colors">
                  {sec.title}
                </p>
              </div>
            </a>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-8 md:px-16 pt-16 md:pt-24 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24"
        >
          <h1 className="text-[48px] sm:text-[64px] md:text-[72px] font-black tracking-[-0.04em] leading-[1.05] mb-8 uppercase max-w-[800px]">
            {pageTitle}
          </h1>
          <p className="text-[18px] md:text-[21px] leading-[1.6] text-black/70 font-medium max-w-[650px]">
            {subtitle}
          </p>
        </motion.div>

        <div className="flex flex-col gap-24 max-w-[800px]">
          {sections.map((sec, index) => (
            <motion.section
              key={index}
              id={`section-${index + 1}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '100px' }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[26px] md:text-[32px] font-black tracking-tight mb-8 text-black uppercase">
                {sec.title}
              </h2>
              <div className="space-y-6">
                {sec.paragraphs.map((p, j) => (
                  <p key={j} className="text-[16px] md:text-[18px] leading-[1.8] text-black/80 font-medium text-justify">
                    {p}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <footer className="mt-48 pt-12 border-t border-black/10 max-w-[800px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
            © 2026 Whale Alert Network · Desarrollado por Aztec Network
          </p>
        </footer>
      </main>
    </div>
  );
}
