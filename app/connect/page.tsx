"use client";
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RemoteLottie } from '@/components/ui/RemoteLottie';


// Desktop connect page (QR handshake)
const ConnectPage = dynamic(() => import('@/components/landing/ConnectPage'), { 
  ssr: false,
  loading: () => null
});
// Mobile gate — same immersive gate used on the root landing page
const MobileImmersiveGate = dynamic(
  () => import('@/components/landing/MobileImmersiveGate').then(m => ({ default: m.MobileImmersiveGate })),
  { 
    ssr: false,
    loading: () => null
  }
);


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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasUuid = urlParams.has('uuid') || urlParams.has('s');

    // ── Disconnect guard: user explicitly logged out → always show connect UI ──
    let isGuarded = false;
    try {
      isGuarded = sessionStorage.getItem("__disconnected__") === "1" || localStorage.getItem("__disconnected__") === "1";
    } catch {}

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

    if (isGuarded) {
      setView(isMobileDevice ? 'mobile' : 'desktop');
      return;
    }

    // ── Session detection ────────────────────────────────────────────────────
    // ONLY redirect if there is a hard cookie (wallet QR handshake) OR an
    // explicit email session flag.  Do NOT redirect based solely on wagmi
    // isConnected because wagmi can persist stale state from a previous
    // disconnected session, causing a redirect loop to /portfolio (blank page).
    const hasCookie = document.cookie.split('; ').some(r =>
      r.startsWith('system_handshake=0x') ||
      r.startsWith('system_handshake=email_')
    );

    let hasLocalSession = false;
    try {
      hasLocalSession = sessionStorage.getItem('portfolio_unlocked') === 'true';
    } catch {}

    // Use hasCookie || hasLocalSession as the ONLY trusted signals for redirect.
    // wagmi isConnected is NOT trusted here alone — it can be stale.
    const isAlreadyLinked = hasCookie || hasLocalSession;

    if (isAlreadyLinked && !hasUuid) {
      const next = urlParams.get('next') || urlParams.get('returnUrl');
      // Only redirect to a safe destination — never back to /connect or /sign-up
      const isSafe = (url: string) =>
        url.startsWith('/') &&
        !url.startsWith('/connect') &&
        !url.startsWith('/sign-up') &&
        url !== '/';
      const destination = (next && isSafe(next)) ? next : '/terminal';
      window.location.replace(destination);
      return;
    }

    // Not authenticated — show appropriate connect UI
    setView(isMobileDevice ? 'mobile' : 'desktop');
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return view === 'mobile' ? <MobileImmersiveGate /> : <ConnectPage />;
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
