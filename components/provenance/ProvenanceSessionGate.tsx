'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSystemAccount } from '@/hooks/useSystemAccount';

// SECURITY: Session gate for Studio Provenance / Terminal.
// Authentication priority:
//   1. Server-side JWT (human_session / whale_session) via /api/auth/verify-session
//   2. Live system/wagmi wallet connection (address present = wallet connected in browser)
//
// Rationale: The terminal is a read-heavy dashboard. A connected wallet is
// sufficient to view your own data. Destructive write operations within each
// module perform their own SIWE re-authentication at the action level.

export function ProvenanceSessionGate({ children }: { children: React.ReactNode }) {
  // null = loading, true = authenticated, false = not authenticated
  const [authState, setAuthState] = useState<null | boolean>(null);
  const { address, isConnected } = useSystemAccount();

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      // Fast path: wagmi has a connected address — let them through immediately
      if (isConnected && address) {
        if (!cancelled) setAuthState(true);
        return;
      }

      // Slow path: no wagmi address, check server JWT
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
  }, [isConnected, address]);

  // Loading state
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
        <a
          href="https://humanidfi.com/connect"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/50 mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </a>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto text-center gap-4">
          <h1 className="text-xl font-black tracking-tight">Connect your wallet</h1>
          <p className="text-sm text-black/60 leading-relaxed">
            Connect your wallet to access the Whale Network terminal and all its modules. By logging in through humanidfi.com/connect, you will receive 3 free passport creations.
          </p>
          <a
            href="https://humanidfi.com/connect"
            className="w-full py-4 rounded-2xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest"
          >
            Connect Wallet
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

