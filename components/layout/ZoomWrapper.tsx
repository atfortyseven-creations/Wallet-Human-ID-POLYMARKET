'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ZoomWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
        }
    }, [pathname]);

    // Native container without Lenis smooth scroll
    return (
        <>
            {children}
        </>
    );
}
