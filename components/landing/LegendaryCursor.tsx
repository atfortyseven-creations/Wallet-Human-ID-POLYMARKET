"use client";

import { useEffect, useRef } from "react";

/**
 * LegendaryCursor
 * 
 * Scroll-proof custom cursor using RAF + CSS transforms (no Framer Motion).
 * Two layers:
 *  - dot:   6px white circle  instant snap (interpolation factor 1.0)
 *  - ring: 40px outline ring  smooth lag (interpolation factor 0.1)
 *
 * Tracks clientX/clientY (viewport-relative) so it is always correct
 * even when the user scrolls deep into the page.
 */
export function LegendaryCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouse  = { x: -100, y: -100 };
    let ring   = { x: -100, y: -100 };
    let rafId  = 0;
    let hidden = false;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (hidden) {
        hidden = false;
        dotRef.current!.style.opacity  = "1";
        ringRef.current!.style.opacity = "1";
      }
    };

    const onLeave = () => {
      hidden = true;
      dotRef.current!.style.opacity  = "0";
      ringRef.current!.style.opacity = "0";
    };

    const tick = () => {
      // ring lags behind mouse with lerp
      ring.x += (mouse.x - ring.x) * 0.12;
      ring.y += (mouse.y - ring.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform  = `translate3d(${mouse.x - 3}px, ${mouse.y - 3}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x - 20}px, ${ring.y - 20}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Core dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#ffffff",
          pointerEvents: "none",
          zIndex: 99999,
          willChange: "transform",
          mixBlendMode: "difference",
          transition: "opacity 0.2s",
        }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.6)",
          pointerEvents: "none",
          zIndex: 99998,
          willChange: "transform",
          mixBlendMode: "difference",
          transition: "opacity 0.2s",
        }}
      />
    </>
  );
}
