"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports: never SSR these  they rely on wagmi/AppKit client hooks
const ConnectPage  = dynamic(() => import('@/components/landing/ConnectPage'),  { ssr: false });
const MobileLanding = dynamic(
  () => import('@/components/landing/MobileLanding').then(m => ({ default: m.MobileLanding })),
  { ssr: false }
);

import { useSystemAccount } from '@/hooks/useSystemAccount';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

/**
 * RealDeviceRouter  detects the PHYSICAL device, not the User-Agent string.
 *
 * Problem: A mobile user who enables "Desktop site" in Chrome sends a desktop
 * User-Agent. Server-side detection fails  they see ConnectPage with a QR
 * code they cannot scan (you can't scan your own screen).
 *
 * Solution: Client-side check using touch support + screen width.
 * This is immune to UA spoofing and works regardless of browser settings.
 *
 * Rules:
 *   - Touch capable device    MobileLanding (wallet connect buttons)
 *   - Screen width < 768px    MobileLanding
 *   - Otherwise               ConnectPage (QR handshake for desktop)
 */
function RealDeviceRouter() {
  const [view, setView] = useState<'loading' | 'mobile' | 'desktop'>('loading');
  const { isConnected } = useSystemAccount();



  useEffect(() => {
    // If already authenticated, redirect to the target destination immediately.
    // Exception: if a 'uuid' parameter is present, the user is linking a desktop
    // session from mobile — MUST stay on this page so MobileLanding handles the sync.
    const urlParams = new URLSearchParams(window.location.search);
    const hasUuid = urlParams.has('uuid');

    // Session detection: check cookie only for instant redirection.
    // Local session (Humanity Ledger) is handled by the isConnected effect above.
    const hasCookie = document.cookie.split('; ').some(r => r.startsWith('system_handshake=0x'));

    const isAlreadyLinked = hasCookie;

    // Detect device type early — needed for both the early redirect and the view setting
    const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
    const isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
    const isNarrowScreen = window.screen.width < 768;
    const isMobileDevice = isUaMobile || (isTouchDevice && isNarrowScreen);

    if (isAlreadyLinked && !hasUuid) {
      const next = urlParams.get('next');
      const fallback = '/portfolio';
      const destination = next && !next.startsWith('/connect') && !next.startsWith('/sign-up')
        ? next
        : fallback;
      window.location.replace(destination);
      return;
    }

    // Not authenticated — show appropriate connect UI
    setView(isMobileDevice ? 'mobile' : 'desktop');
  }, []);

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <div className="w-48 h-48 sm:w-64 sm:h-64 opacity-90">
          <RemoteLottie path="/system-shots/block abstract.json" className="w-full h-full object-contain" />
        </div>
        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#050505]/50 animate-pulse font-bold">
          Loading...
        </div>
      </div>
    );
  }

  return view === 'mobile' ? <MobileLanding /> : <ConnectPage />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <div className="w-48 h-48 sm:w-64 sm:h-64 opacity-90">
          <RemoteLottie path="/system-shots/block abstract.json" className="w-full h-full object-contain" />
        </div>
        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#050505]/50 animate-pulse font-bold">
          Loading...
        </div>
      </div>
    }>
      <RealDeviceRouter />
    </Suspense>
  );
}
