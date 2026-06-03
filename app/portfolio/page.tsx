"use client";

import { useState, useEffect } from 'react';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { QuantumVaultOnboarding } from '@/components/auth/QuantumVaultOnboarding';
import { InstitutionalPortfolioView } from '@/components/bsv/InstitutionalPortfolioView';
import { UnlockVaultScreen } from '@/components/security/UnlockVaultScreen';
import { useWalletStore } from '@/lib/store/wallet-store';
import Link from 'next/link';


export default function PortfolioPage() {
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isConnected: isSystemConnected, isChecking: isSystemChecking } = useSystemAccount();
  const { isLocked, passwordHash } = useWalletStore();

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('portfolio_unlocked') === 'true') {
        setSessionUnlocked(true);
      }
    } catch(e) {}
  }, []);

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

  if (isLocked && passwordHash) {
      return <UnlockVaultScreen />;
  }

  // Gate: require wallet connection OR session storage unlock token
  const needsGate = !isSystemConnected && !sessionUnlocked;

  if (needsGate) {
    return (
      <div className="w-full flex-1 flex flex-col bg-white text-[#0A0A0A] min-h-[100dvh] overflow-x-hidden relative">
        <Link href="/" className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-black/10 flex items-center justify-center text-black/40 hover:text-black hover:bg-white transition-all shadow-sm" title="Return to Landing Page">
          <span className="font-mono text-[11px] font-black text-black/40">[&lt;]</span>
        </Link>
        <QuantumVaultOnboarding onComplete={() => {
          setSessionUnlocked(true);
        }} />
      </div>
    );
  }

  return <InstitutionalPortfolioView />;
}
