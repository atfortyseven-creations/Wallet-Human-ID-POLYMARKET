"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * WavesSpotlight
 * 
 * Re-engineered for maximum stability across Next.js route transitions.
 * Uses a native CSS mask over a fixed div instead of a Canvas API loop.
 * This prevents context loss, resizing bugs, and memory leaks when changing tabs,
 * while being infinitely more performant since it runs on the GPU compositor.
 */
export function WavesSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const displayed = useRef({ x: -9999, y: -9999 });
  const rafId = useRef<number>(0);
  
  // Triggers re-evaluation on route changes if needed, 
  // though the fixed layout div persists safely.
  const pathname = usePathname();

  useEffect(() => {
    // Disable on touch devices
    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchOnly) return;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    const draw = () => {
      // Smooth lerp (0.12 is a good balance between smooth and responsive)
      displayed.current.x += (mouse.current.x - displayed.current.x) * 0.12;
      displayed.current.y += (mouse.current.y - displayed.current.y) * 0.12;

      if (spotlightRef.current) {
        const x = displayed.current.x;
        const y = displayed.current.y;
        
        // CSS Mask: black means visible, transparent means hidden.
        // This reveals the bg-waves ONLY in a soft circle around the cursor.
        const mask = `radial-gradient(350px circle at ${x}px ${y}px, black 0%, transparent 100%)`;
        spotlightRef.current.style.maskImage = mask;
        spotlightRef.current.style.webkitMaskImage = mask;
      }

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [pathname]); // Re-bind safely if pathname changes to prevent stale refs

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: 0.18,                 // Keeps text completely legible
        mixBlendMode: "multiply",      // Blends naturally with the white background
        backgroundImage: "url('/bg-waves.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "500px",       // Optimized tile size
        // Start hidden off-screen until mouse moves
        maskImage: "radial-gradient(350px circle at -9999px -9999px, black 0%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(350px circle at -9999px -9999px, black 0%, transparent 100%)",
      }}
    />
  );
}
