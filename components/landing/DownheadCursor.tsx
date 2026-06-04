"use client";

import React, { useEffect, useRef, useCallback } from "react";

/**
 * DownheadCursor  Core Dot Trail System
 * 
 * LIVE TRAIL: A stream of crisp purple square dots follows the mouse cursor
 *             inside the DownheadSection, fading from opaque near the cursor
 *             to transparent in the tail. Rendered at 60/120/240hz via rAF.
 *
 * CLICK STAMP: On mousedown, the current trail snapshot is permanently painted
 *              onto a persistent canvas layer that persists until page navigation
 *              or full refresh. Stamps accumulate infinitely.
 *
 * The custom CSS cursor arrow is replaced with a tiny purple diamond so the
 * native cursor is hidden and the dot trail IS the cursor.
 */

//  Config 

const DOT_SIZE       = 6;       // px  exact square side length
const DOT_GAP        = 10;      // px  minimum distance between trail dots
const TRAIL_LENGTH   = 22;      // max live dots in trail
const PURPLE_H       = 270;     // HSL hue for purple (270° = pure purple)
const PURPLE_S       = 75;      // saturation %
const PURPLE_L       = 58;      // lightness %
const FADE_DURATION  = 420;     // ms  how long trail dots fade after cursor stops

//  Types 

interface TrailDot {
  x: number;
  y: number;
  t: number; // timestamp (ms) when the dot was created
}

interface StampedDot {
  x: number;
  y: number;
  alpha: number;
}

//  Component 

export const DownheadCursor = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  // Canvas refs
  const persistentCanvasRef = useRef<HTMLCanvasElement>(null); // stamped dots
  const liveCanvasRef        = useRef<HTMLCanvasElement>(null); // live trail

  // Trail state
  const trailRef    = useRef<TrailDot[]>([]);
  const mouseRef    = useRef({ x: -9999, y: -9999 });
  const rafRef      = useRef<number>(0);
  const lastDotRef  = useRef({ x: -9999, y: -9999 });
  const lastMoveRef = useRef<number>(0);

  //  Draw a single square dot (pixel-snapped for crispness) 
  const drawDot = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
      const px = Math.round(x - DOT_SIZE / 2);
      const py = Math.round(y - DOT_SIZE / 2);
      ctx.fillStyle = `hsla(${PURPLE_H}, ${PURPLE_S}%, ${PURPLE_L}%, ${alpha})`;
      ctx.fillRect(px, py, DOT_SIZE, DOT_SIZE);
    },
    []
  );

  //  Render loop 
  const render = useCallback(() => {
    const liveCanvas = liveCanvasRef.current;
    if (!liveCanvas) { rafRef.current = requestAnimationFrame(render); return; }
    const ctx = liveCanvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(render); return; }

    const now = performance.now();

    // Clear live canvas each frame
    ctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);

    const trail = trailRef.current;
    const total = trail.length;

    if (total > 0) {
      trail.forEach((dot, i) => {
        // Index 0 = oldest, total-1 = newest (closest to cursor)
        const positionRatio = (i + 1) / total; // 0..1, newer = higher
        const age           = now - dot.t;
        const ageFade       = Math.max(0, 1 - age / FADE_DURATION);
        const positionAlpha = positionRatio; // newer dots are more opaque
        const alpha         = Math.min(1, positionAlpha * ageFade * 1.4);

        if (alpha > 0.01) drawDot(ctx, dot.x, dot.y, alpha);
      });

      // Prune fully faded dots
      trailRef.current = trail.filter(
        (d) => performance.now() - d.t < FADE_DURATION
      );
    }

    rafRef.current = requestAnimationFrame(render);
  }, [drawDot]);

  //  Mouse move handler 
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;

      mouseRef.current   = { x, y };
      lastMoveRef.current = performance.now();

      // Only add a dot if we've moved far enough from the last one
      const dx   = x - lastDotRef.current.x;
      const dy   = y - lastDotRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= DOT_GAP) {
        trailRef.current.push({ x, y, t: performance.now() });
        // Keep trail capped
        if (trailRef.current.length > TRAIL_LENGTH) {
          trailRef.current.shift();
        }
        lastDotRef.current = { x, y };
      }
    };

    container.addEventListener("mousemove", onMove, { passive: true });
    return () => container.removeEventListener("mousemove", onMove);
  }, [containerRef]);

  //  Click: stamp current trail onto persistent canvas 
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onDown = (e: MouseEvent) => {
      const persistCanvas = persistentCanvasRef.current;
      if (!persistCanvas) return;
      const ctx  = persistCanvas.getContext("2d");
      if (!ctx)  return;

      const rect  = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY  = e.clientY - rect.top;

      const trail = trailRef.current;
      const total  = trail.length;

      // Paint the current trail snapshot permanently
      trail.forEach((dot, i) => {
        const positionRatio = (i + 1) / total;
        const alpha         = positionRatio * 0.85;
        drawDot(ctx, dot.x, dot.y, alpha);
      });

      // Also paint a bright anchor dot at exact click position
      // (slightly larger for emphasis  but pixel-perfect)
      const px = Math.round(clickX - DOT_SIZE / 2);
      const py = Math.round(clickY  - DOT_SIZE / 2);
      ctx.fillStyle = `hsla(${PURPLE_H}, ${PURPLE_S}%, ${PURPLE_L}%, 1)`;
      ctx.fillRect(px, py, DOT_SIZE, DOT_SIZE);
      // Micro glow ring (2px border)
      ctx.strokeStyle = `hsla(${PURPLE_H}, ${PURPLE_S}%, ${PURPLE_L + 15}%, 0.5)`;
      ctx.lineWidth    = 1.5;
      ctx.strokeRect(px - 2, py - 2, DOT_SIZE + 4, DOT_SIZE + 4);
    };

    container.addEventListener("mousedown", onDown);
    return () => container.removeEventListener("mousedown", onDown);
  }, [containerRef, drawDot]);

  //  Resize handler: keep canvases pixel-perfect 
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const syncSize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      [persistentCanvasRef, liveCanvasRef].forEach((ref) => {
        const c = ref.current;
        if (!c) return;
        // Only resize if dimensions actually changed (avoids clearing stamps)
        if (c.width !== w || c.height !== h) {
          // For persistent canvas: snapshot  resize  restore
          if (ref === persistentCanvasRef && c.width > 0 && c.height > 0) {
            const tempCanvas    = document.createElement("canvas");
            tempCanvas.width    = c.width;
            tempCanvas.height   = c.height;
            const tempCtx       = tempCanvas.getContext("2d");
            tempCtx?.drawImage(c, 0, 0);
            c.width  = w;
            c.height = h;
            c.getContext("2d")?.drawImage(tempCanvas, 0, 0);
          } else {
            c.width  = w;
            c.height = h;
          }
        }
      });
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  //  Start / stop RAF loop 
  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  return (
    <>
      {/* Persistent stamp layer  never cleared until unmount */}
      <canvas
        ref={persistentCanvasRef}
        className="pointer-events-none absolute inset-0 z-[48]"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Active trail layer  cleared and redrawn every frame */}
      <canvas
        ref={liveCanvasRef}
        className="pointer-events-none absolute inset-0 z-[49]"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Custom CSS cursor: tiny purple square that IS the cursor hotspot */}
      <style>{`
        .downhead-cursor-zone,
        .downhead-cursor-zone * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};
