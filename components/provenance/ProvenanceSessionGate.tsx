'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// SECURITY FIX VULN-03: The previous implementation trusted the JS-readable
// `system_handshake` cookie which any user could forge via browser console:
//   document.cookie = 'system_handshake=0xAnyAddress'
// This would grant full access to Studio Provenance without a real session.
// Now we verify against the server-side JWT endpoint — the only cryptographic
// source of truth for authentication.

export function ProvenanceSessionGate({ children }: { children: React.ReactNode }) {
  // null = loading, true = authenticated, false = not authenticated
  const [authState, setAuthState] = useState<null | boolean>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/verify-session', { credentials: 'include', cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setAuthState(data.authenticated === true);
        } else {
          setAuthState(false);
        }
      } catch {
        if (!cancelled) setAuthState(false);
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  // Loading state — show nothing to prevent flicker
  if (authState === null) {
    return (
      <div className="min-h-[100dvh] bg-[#FFFFFF] flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-black/30" />
      </div>
    );
  }

  if (!authState) {
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
