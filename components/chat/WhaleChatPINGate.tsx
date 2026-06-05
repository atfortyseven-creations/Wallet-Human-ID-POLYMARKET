'use client';

import React, { useEffect, useRef } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { AlertTriangle } from 'lucide-react';

interface Props {
  onEnter: () => void;
}

export default function WhaleChatPINGate({ onEnter }: Props) {
  const { address, isConnected, isChecking, isLocalSystemWallet, isConnecting, isReconnecting } = useAccount();
  const { open } = useAppKit();

  const onEnterRef = useRef(onEnter);
  useEffect(() => { onEnterRef.current = onEnter; }, [onEnter]);

  useEffect(() => {
    if (!address || isChecking) return;

    // Connect automatically for all authenticated wallets (both Humanity Ledger & WalletConnect)
    onEnterRef.current();
  }, [address, isChecking]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-black/40">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    if (isConnecting || isReconnecting) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#050505]/10 border-t-[#050505] rounded-full animate-spin" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-[#050505]">Connecting...</h2>
            <p className="text-[12px] text-black/50 font-medium">Please approve the connection in your wallet.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl">
        <div className="text-center space-y-4">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#050505]">No Wallet Connected</h2>
          <p className="text-[14px] text-black/50 font-medium">Please connect a wallet to access Whale Chat.</p>
          <button
            onClick={() => open()}
            className="mt-4 px-8 py-3.5 rounded-[18px] bg-[#050505] !text-white font-black tracking-widest text-[12px] uppercase shadow-lg hover:bg-[#111] transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-black/40">Entering Whale Chat…</p>
        </div>
    </div>
  );
}
