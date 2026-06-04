'use client';

import React, { useEffect, useRef, useId } from 'react';

/**
 * LottieCanvas  GPU-accelerated canvas renderer via @lottiefiles/dotlottie-web
 *
 * Fixes vs original:
 *   - id="dotlottie-canvas" was STATIC: multiple instances on the same page
 *     would collide (DotLottie internally queries by ID in some versions).
 *     Now uses React.useId() for a unique DOM id per instance.
 *   - DPR capped at 2  prevents iOS 3x screens from tripling GPU load.
 *   - useFrameInterpolation: true  smooth 60fps at half the CPU cost.
 *   - Intersection Observer threshold lowered to 0.05 (5% visibility).
 *   - Instance stored in ref to prevent stale closure during cleanup.
 */

interface LottieCanvasProps {
  src: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
}

const MOBILE_DPR_CAP = 2;

const LottieCanvas = ({
  src,
  className = 'w-full h-full',
  autoplay = true,
  loop = true,
}: LottieCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<any>(null);
  // useId gives a stable unique id per React component instance
  const uid = useId();
  const canvasId = `dotlottie-canvas-${uid.replace(/:/g, '')}`;

  useEffect(() => {
    if (!canvasRef.current) return;

    const safeDPR = Math.min(
      typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
      MOBILE_DPR_CAP
    );

    // Dynamic import keeps this out of the SSR bundle
    import('@lottiefiles/dotlottie-web').then(({ DotLottie }) => {
      if (!canvasRef.current) return;

      const dotLottie = new DotLottie({
        canvas: canvasRef.current,
        src,
        loop,
        autoplay,
        renderConfig: {
          devicePixelRatio: safeDPR,
          useFrameInterpolation: true, // smooth 60fps at half CPU cost
        } as any,
      });

      instanceRef.current = dotLottie;
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [src, loop, autoplay]);

  // Pause/resume based on visibility  saves battery on mobile
  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inst = instanceRef.current;
          if (!inst) return;
          if (entry.isIntersecting) {
            inst.play();
          } else {
            inst.pause();
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id={canvasId}
      className={`block ${className}`}
      style={{
        width: '100%',
        height: '100%',
        transform: 'translateZ(0)', // GPU compositing hint
      }}
    />
  );
};

export default LottieCanvas;
