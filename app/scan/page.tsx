'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ScanLine, Loader2 } from 'lucide-react';

const UniversalScanModal = dynamic(() => import('@/components/scan/UniversalScanModal'), { ssr: false });

export default function ScanPage() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const p = urlParams.get('payload');
      if (p) setPayload(decodeURIComponent(p));
      // Auto-open scanner after short delay to allow page to paint
      setTimeout(() => setOpen(true), 350);
    }
  }, []);

  return (
    <div
      className="fixed inset-0 bg-white flex flex-col items-center justify-center"
      style={{ minHeight: '-webkit-fill-available' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        {/* Logo */}
        <img
          src="/whale-logo.png"
          alt="Whale Network"
          className="w-16 h-16 object-contain rounded-2xl shadow-sm"
        />

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Whale Network</h1>
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-slate-400 font-bold">
            Aztec ZK Identity Portal
          </p>
        </div>

        {!mounted ? (
          <Loader2 size={24} className="animate-spin text-blue-500" />
        ) : open ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ScanLine size={22} className="text-blue-500" />
            </div>
            <p className="text-[12px] text-slate-500 font-medium max-w-[220px] leading-relaxed">
              Scanner is open. Allow camera access to link your session.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            <ScanLine size={16} />
            Open Scanner
          </button>
        )}

        <p className="text-[10px] text-slate-300 font-mono mt-2">
          humanidfi.com · Powered by Aztec Network
        </p>
      </div>

      <UniversalScanModal
        isOpen={open}
        onClose={() => setOpen(false)}
        mode="session-only"
        initialScanData={payload}
      />
    </div>
  );
}
