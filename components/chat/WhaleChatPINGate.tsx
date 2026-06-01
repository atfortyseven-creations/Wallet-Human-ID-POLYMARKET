'use client';

import React, { useEffect, useRef } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { AlertTriangle } from 'lucide-react';

interface Props {
  onEnter: () => void;
}

export default function WhaleChatPINGate({ onEnter }: Props) {
  const { address, isConnected, isChecking, isLocalSystemWallet } = useAccount();
  const { open } = useAppKit();

  const onEnterRef = useRef(onEnter);
  useEffect(() => { onEnterRef.current = onEnter; }, [onEnter]);

  useEffect(() => {
    if (!address || isChecking) return;

    if (isLocalSystemWallet) {
        // Block Humanity Ledger completely per rules
        return;
    }

    // Connect automatically without PIN
    onEnterRef.current();
  }, [address, isChecking, isLocalSystemWallet]);

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
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl">
        <div className="text-center space-y-4">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#050505]">No Wallet Connected</h2>
          <p className="text-[14px] text-black/50 font-medium">Please connect a wallet to access Whale Chat.</p>
          <button
            onClick={() => open()}
            className="mt-4 px-8 py-3.5 rounded-[18px] bg-[#050505] text-white font-black tracking-widest text-[12px] uppercase shadow-lg hover:bg-[#111] transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (isLocalSystemWallet) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl">
        <div className="text-center space-y-4 max-w-sm px-6">
          <AlertTriangle size={40} className="text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#050505]">Acceso Denegado</h2>
          <p className="text-[14px] text-black/50 font-medium">Con HumanityLedger por el momento aún no es posible ya que requiere de una firma. Debes ingresar únicamente y precisamente con WalletConnect.</p>
          <button
            onClick={() => open()}
            className="mt-4 w-full py-4 rounded-[18px] bg-[#050505] text-white font-black tracking-widest text-[12px] uppercase shadow-lg hover:bg-[#111] transition-all"
          >
            Conectar WalletConnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-black/40">Entrando a Whale Chat…</p>
        </div>
    </div>
  );
}
