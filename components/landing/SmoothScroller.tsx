"use client";

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollerProps {
    children: ReactNode;
}

export function SmoothScroller({ children }: SmoothScrollerProps) {
    useEffect(() => {
        // Initialize buttery smooth scrolling
        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}

