'use client';

import React, { useEffect, useState } from 'react';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

export function PassportWalletGuard({ children, passportTitle }: { children: React.ReactNode, passportTitle: string }) {
  const { isConnected } = useSystemAccount();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-black/30" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-[100dvh] bg-[#F9FAFB] text-[#050505] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200/60 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">Secure Record</h1>
          <p className="text-sm text-slate-500 mb-8 font-mono tracking-widest text-center break-words max-w-full">
            [{passportTitle}]
          </p>
          <p className="text-sm text-black/70 leading-relaxed mb-8">
            This Studio Provenance cryptographic passport requires wallet verification to be viewed. Please authenticate your identity to decrypt the on-chain metadata.
          </p>
          <button
            onClick={() => open()}
            className="w-full py-4 rounded-xl bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldAlert size={16} />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
