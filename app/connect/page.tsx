"use client";
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RemoteLottie } from '@/components/ui/RemoteLottie';


// Desktop connect page (QR handshake)
const ConnectPage = dynamic(() => import('@/components/landing/ConnectPage'), { 
  ssr: false,
  loading: () => null
});

/**
 * RealDeviceRouter — detects the PHYSICAL device, not the User-Agent string.
 *
 * Desktop → show ConnectPage (QR handshake)
 * Mobile  → redirect to / (the full ImmersiveManifestoLanding which has
 *           Connect Wallet + Sign in with Email in the nav hamburger menu)
 */
function RealDeviceRouter() {
  const [view, setView] = useState<'loading' | 'mobile' | 'desktop'>('loading');
  const [mobileRedirectUrl, setMobileRedirectUrl] = useState<string>('/');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasUuid = urlParams.has('uuid') || urlParams.has('s');
    const hasSessionParams = urlParams.has('s') && urlParams.has('p');

    // ── Device detection ─────────────────────────────────────────────────────
    const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
    const isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
    const isNarrowScreen = window.screen.width < 768;
    const isMobileDevice = isUaMobile || (isTouchDevice && isNarrowScreen);

    // ── If mobile scanned the QR, redirect to /scan with the payload ─────────
    // The QR contains ?s=<sessionId>&p=<publicKey> — when scanned via native
    // iPhone/Android camera, the user lands here on a mobile device.
    // We redirect them to /scan so the UniversalScanModal handles the handshake.
    if (isMobileDevice && hasSessionParams) {
      const scanUrl = new URL('/scan', window.location.origin);
      scanUrl.searchParams.set('payload', window.location.href);
      window.location.replace(scanUrl.toString());
      return;
    }

    // ── Session detection ────────────────────────────────────────────────────
    const hasCookie = document.cookie.split('; ').some(r =>
      r.startsWith('system_handshake=0x') ||
      r.startsWith('system_handshake=email_')
    );

    let hasLocalSession = false;
    try {
      hasLocalSession = sessionStorage.getItem('portfolio_unlocked') === 'true';
    } catch {}

    let isGuarded = false;
    try {
      isGuarded = sessionStorage.getItem('__disconnected__') === '1' || localStorage.getItem('__disconnected__') === '1';
    } catch {}

    const isAlreadyLinked = (hasCookie || hasLocalSession) && !isGuarded;

    if (isAlreadyLinked && !hasUuid) {
      const next = urlParams.get('next') || urlParams.get('returnUrl') || urlParams.get('redirect');
      const isSafe = (url: string) =>
        url.startsWith('/') &&
        !url.startsWith('/connect') &&
        !url.startsWith('/sign-up') &&
        url !== '/';
      const destination = (next && isSafe(next)) ? next : '/terminal';
      window.location.replace(destination);
      return;
    }

    setView('desktop'); // Render ConnectPage for everyone, no mobile redirect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (view === 'loading' || view === 'mobile') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-48 h-48 sm:w-64 sm:h-64 opacity-90">
          <RemoteLottie path="/system-shots/block abstract.json" className="w-full h-full object-contain" />
        </div>
        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#050505]/50 animate-pulse font-bold">
          Loading...
        </div>
      </div>
    );
  }

  return <ConnectPage />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
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
