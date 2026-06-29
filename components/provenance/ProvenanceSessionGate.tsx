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

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { signMessageAsync } = import('wagmi').then(() => require('wagmi')).catch(() => ({ signMessageAsync: undefined })) as any;

  const handleManualSiwe = async () => {
    if (!address) return;
    try {
      setIsAuthenticating(true);
      const { signMessage } = await import('@wagmi/core');
      const { config } = await import('@/lib/wagmi-config');
      
      const resNonce = await fetch('/api/siwe/nonce');
      const nonce = await resNonce.text();
      
      const { SiweMessage } = await import('siwe');
      const message = new SiweMessage({
        domain: window.location.host,
        address: address as string,
        statement: 'Sign in to Whale Alert Network',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      });

      // Mobile Safari / Chrome Deep Link Helper
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
      if (isMobile) {
        setTimeout(() => {
          window.location.href = 'wc://';
        }, 50);
      }

      const signature = await signMessage(config as any, {
        message: message.prepareMessage(),
      });

      if (isMobile) {
        await new Promise(r => setTimeout(r, 400));
      }

      const verifyRes = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.prepareMessage(), signature }),
      });

      if (verifyRes.ok) {
        setAuthState(true);
      } else {
        alert('Fallo al verificar la firma. Intenta de nuevo.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      // Fast path: Live wallet connection is sufficient for viewing the terminal/dashboard
      if (isConnected && address) {
        setAuthState(true);
        return;
      }

      // Slow path: check server JWT for persistent sessions if wallet is not live
      try {
        const res = await fetch('/api/siwe/session', { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data.address) {
             setAuthState(true);
             return;
          }
        }
        setAuthState(false);
      } catch {
        if (!cancelled) setAuthState(false);
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, [isConnected, address]);

  // Loading state
  if (authState === null || isAuthenticating) {
    return (
      <div className="min-h-[100dvh] bg-[#FFFFFF] flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-black/30" />
      </div>
    );
  }

  // Not authenticated via Wagmi OR SIWE
  if (!authState) {
    return (
      <div className="min-h-[100dvh] bg-[#FFFFFF] text-[#050505] flex flex-col px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto text-center gap-4">
          <h1 className="text-xl font-black tracking-tight">{isConnected ? 'Verificar Identidad' : 'Connect your wallet'}</h1>
          <p className="text-sm text-black/60 leading-relaxed">
            {isConnected 
              ? 'Por favor, firma el mensaje en tu billetera para verificar tu identidad y habilitar la escritura en la base de datos de Studio Provenance.'
              : 'Connect your wallet to access the Whale Network terminal and all its modules.'}
          </p>
          
          {isConnected ? (
            <button
              onClick={handleManualSiwe}
              className="w-full py-4 rounded-2xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2 hover:bg-black/90 active:scale-95 transition-all"
            >
              Firmar Conexión Segura
            </button>
          ) : (
            <div className="mt-4 w-full">
              {/* @ts-ignore */}
              <appkit-button />
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

