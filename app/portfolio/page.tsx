"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSystemAccount } from '@/hooks/useSystemAccount';
// Removed legacy QuantumVaultOnboarding import
import { InstitutionalPortfolioView } from '@/components/bsv/InstitutionalPortfolioView';
import { useWalletStore } from '@/lib/store/wallet-store';
import Link from 'next/link';


export default function PortfolioPage() {
  const router = useRouter();
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected: isSystemConnected, isChecking: isSystemChecking } = useSystemAccount();
  const { isLocked, passwordHash } = useWalletStore();

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('portfolio_unlocked') === 'true') {
        setSessionUnlocked(true);
      }
    } catch(e) {}
  }, []);

  // [ATOMIC INDEXING] Log portfolio access once per day per wallet
  useEffect(() => {
    if (typeof window === 'undefined' || isSystemChecking || !isSystemConnected) return;
    if (!address) return;
    const key = `provenance_portfolio_${address}_${new Date().toDateString()}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      fetch('/api/provenance/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'PORTFOLIO_ACCESS', details: { path: '/portfolio', address } })
      }).catch(() => {});
    }
  }, [isSystemChecking, isSystemConnected]);

  // CRITICAL FIX: Never return null here — TitaniumGate sees a blank page and
  // redirects to /connect, which then redirects back to /portfolio → infinite loop.
  // Instead render a proper loading screen that TitaniumGate won't misinterpret.
  if (!mounted || isSystemChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // Legacy unlock screen removed.

  // Gate: require wallet connection OR session storage unlock token
  const needsGate = !isSystemConnected && !sessionUnlocked;

  useEffect(() => {
    if (needsGate && mounted && !isSystemChecking) {
      router.replace('/');
    }
  }, [needsGate, mounted, isSystemChecking, router]);

  if (needsGate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 animate-pulse">
          Redirecting...
        </div>
      </div>
    );
  }

  return <InstitutionalPortfolioView />;
}
