"use client";

import React, { useEffect, useState } from 'react';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { ClientMobileLanding } from '@/components/landing/ClientMobileLanding';

// ── Minimal white skeleton shown during JS hydration on mobile ──────────────
// ClientMobileLanding (MobileImmersiveGate) has ssr:false because it reads
// cookies synchronously to decide its starting phase. While the bundle loads,
// we show a white screen with the "WHALE NETWORK" wordmark so the user never
// sees a blank flash.
function MobileSkeleton() {
  return (
    <div
      className="fixed inset-0 bg-white flex flex-col items-center justify-center"
      style={{ height: '100dvh' }}
    >
      <div className="flex flex-col items-center gap-5">
        <h1 className="font-serif text-[13.5vw] font-normal tracking-[-0.02em] text-[#0A0A0A] leading-none select-none text-center">
          WHALE
          <br />
          NETWORK
        </h1>
        <div className="w-6 h-6 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A]/60 rounded-full animate-spin" />
      </div>
    </div>
  );
}

export function SmartLandingRouter({ isMobileUserAgent }: { isMobileUserAgent: boolean }) {
    const [mounted, setMounted] = useState(false);
    const [isPhysicallyMobile, setIsPhysicallyMobile] = useState(isMobileUserAgent);

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        // [ANDROID TABLET FIX] UA detection MUST take priority over screen size.
        // Android tablets (Galaxy Tab, Lenovo Tab) have screen.width >= 768 and
        // maxTouchPoints > 0 but isSmallScreen = false. The old logic:
        //   isMobile = isUaMobile || (isTouchScreen && isSmallScreen)
        // ...sent tablets to the DESKTOP router, breaking the mobile auth flow.
        // Any device with 'android' or 'iphone/ipad' in the UA IS mobile regardless
        // of screen dimensions. We treat all touch-primary Android/iOS as mobile.
        const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
        // Secondary: touch screen + no fine pointer (tablet/phone, not touch laptop)
        const isTouchPrimary = navigator.maxTouchPoints > 1 && !window.matchMedia('(pointer: fine)').matches;
        const isSmallScreen = window.screen.width < 1024; // extended breakpoint: covers large phones + tablets

        setIsPhysicallyMobile(isUaMobile || (isTouchPrimary && isSmallScreen));
        setMounted(true);
        // [SESSION INTEGRITY FIX] The old code cleared ALL cookies + storage here.
        // This was destroying valid sessions (QR handshake, Humanity Ledger, MetaMask,
        // Rainbow) the instant the user landed on '/'. Sessions must NEVER be wiped
        // at route level — logout is handled exclusively by useSystemSignOut.
    }, []);

    // Fast-path: server already told us it's mobile.
    // ClientMobileLanding has ssr:false so we show the skeleton wordmark
    // instead of the old <ClientMobileLanding /> to avoid a hydration mismatch.
    if (!mounted && isMobileUserAgent) return <MobileSkeleton />;

    // Always show the landing page — never auto-redirect to /terminal.
    // The dashboard redirect is handled exclusively by ConnectPage after
    // a successful wallet signature. This ensures that on page reload
    // the user always lands on the public landing page.
    if (isPhysicallyMobile) {
        return <ClientMobileLanding />;
    }

    return <ClientRootRouter />;
}
