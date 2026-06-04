"use client";

import React from 'react';
import Link from 'next/link';

export default function InstitutionalFooter() {
  return (
    <footer className="w-full bg-[#ebe6db] border-t border-black/10 py-16 px-6 relative z-10 overflow-hidden">
      {/* Historical/Sepia 'Network' Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply" 
           style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[2560px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 relative z-10 text-left">
        
        {/* Brand Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold"></span>
            <span className="font-serif text-2xl font-black tracking-tighter uppercase text-[#1a1a1a]">Whale Protocol</span>
          </div>
          <p className="text-sm text-black/60 leading-relaxed font-serif max-w-sm">
            The System Analytics Protocol for advanced on-chain observability. 
            Built on the principles of absolute privacy and zero-knowledge state transitions.
          </p>
        </div>

        {/* Links Column 1: Core */}
        <div className="space-y-6">
          <h4 className="font-serif font-black text-[11px] uppercase tracking-[0.2em] text-[#FF2DF4]">Infrastructure</h4>
          <ul className="space-y-4">
            <li>
              <a href="https://downhead.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-black/70 hover:text-black flex items-center gap-2 group">
                Downhead
              </a>
            </li>
              <li>
              <Link href="/dashboard" className="text-sm font-bold text-black/70 hover:text-black flex items-center gap-2 group">
                Dashboard Terminal
              </Link>
            </li>
            <li>
              <Link href="/academy" className="text-sm font-bold text-black/70 hover:text-black flex items-center gap-2 group">
                Academy
              </Link>
            </li>
            <li>
              <Link href="/support" className="text-sm font-bold text-black/70 hover:text-black flex items-center gap-2 group">
                Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2: Legal */}
        <div className="space-y-6">
          <h4 className="font-serif font-black text-[11px] uppercase tracking-[0.2em] text-[#FF2DF4]">Legal</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/privacy" className="text-sm font-bold text-black/70 hover:text-black flex items-center gap-2 group">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm font-bold text-black/70 hover:text-black flex items-center gap-2 group">
                Terms
              </Link>
            </li>
          </ul>
        </div>



      </div>

      <div className="max-w-[2560px] mx-auto mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10px] font-mono font-bold text-black/40 tracking-widest uppercase">
        <div>© 2026 Whale Protocol</div>
      </div>
    </footer>
  );
}
