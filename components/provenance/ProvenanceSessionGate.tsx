'use client';

import Link from 'next/link';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { ArrowLeft } from 'lucide-react';

function hasHandshakeCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((r) => r.startsWith('system_handshake=0x'));
}

export function ProvenanceSessionGate({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useSystemAccount();
  const linked = Boolean(address) || isConnected || hasHandshakeCookie();

  if (!linked) {
    return (
      <div className="min-h-[100dvh] bg-[#FFFFFF] text-[#050505] flex flex-col px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <Link
          href="/connect"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/50 mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto text-center gap-4">
          <h1 className="text-xl font-black tracking-tight">Connect your wallet</h1>
          <p className="text-sm text-black/60 leading-relaxed">
            Provenance Studio needs a linked wallet session to create product passports and anchor them on chain.
          </p>
          <Link
            href="/connect"
            className="w-full py-4 rounded-2xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest"
          >
            Go to connect
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
