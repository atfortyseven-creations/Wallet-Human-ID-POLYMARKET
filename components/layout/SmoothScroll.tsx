"use client";

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

// Singleton RAF handle  prevents double-RAF if React strict mode double-fires
let rafId: number | null = null;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Cancel any existing RAF from a previous mount (React Strict Mode)
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      infinite: false,
      // Prevent Lenis from intercepting scroll inside elements
      // that have their own scroll container (e.g. modals, dropdowns)
      prevent: (node: Element) =>
        node.closest('[data-lenis-prevent]') !== null ||
        node.closest('[role="dialog"]') !== null ||
        node.closest('[role="listbox"]') !== null,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
