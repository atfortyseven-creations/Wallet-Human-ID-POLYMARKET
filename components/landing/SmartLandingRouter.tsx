"use client";

import React, { useEffect, useState } from 'react';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { ClientMobileLanding } from '@/components/landing/ClientMobileLanding';

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

    // Fast-path: server already told us it's mobile — render immediately
    // without waiting for JS hydration (eliminates ~3s blank white screen).
    if (!mounted && isMobileUserAgent) return <ClientMobileLanding />;

    // Always show the landing page — never auto-redirect to /dashboard.
    // The dashboard redirect is handled exclusively by ConnectPage after
    // a successful wallet signature. This ensures that on page reload
    // the user always lands on the public landing page.
    if (isPhysicallyMobile) {
        return <ClientMobileLanding />;
    }

    return <ClientRootRouter />;
}
