'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ScanLine } from 'lucide-react';

const UniversalScanModal = dynamic(() => import('@/components/scan/UniversalScanModal'), { ssr: false });

export default function ScanPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-[100dvh] bg-[#FFFFFF] flex flex-col items-center justify-center px-6 text-center">
      <ScanLine size={32} className="text-black/30 mb-4" />
      <h1 className="text-xl font-black tracking-tight mb-2">Scan</h1>
      <p className="text-sm text-black/50 max-w-sm mb-6">
        Point your camera at a session QR, wallet code, product label, or GS1 link.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-[#050505] text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
      >
        Open scanner
      </button>
      <UniversalScanModal isOpen={open} onClose={() => setOpen(false)} mode="universal" />
    </div>
  );
}
