"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * WavesSpotlight
 * 
 * Renders a fixed full-screen canvas that shows a circular "spotlight" revealing
 * the bg-waves texture wherever the user's cursor is.  The rest of the canvas
 * is fully transparent so the underlying white page background is visible.
 *
 * Key design decisions for readability / non-intrusiveness:
 *  - Spotlight opacity capped at 0.18 so text above is ALWAYS legible
 *  - Radial gradient inside the circle fades to transparent at the edges
 *  - Canvas is pointer-events:none so it never blocks clicks
 *  - Uses requestAnimationFrame with lerp for buttery-smooth follow
 *  - Image decoded once, drawn every frame via drawImage (GPU-composited)
 *  - Hidden on touch-only devices (no cursor) to avoid stale spotlight
 */
export function WavesSpotlight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const displayed = useRef({ x: -9999, y: -9999 });
  const rafId = useRef<number>(0);
  const loaded = useRef(false);
  const visible = useRef(false);

  const RADIUS = 380;         // px – spotlight circle radius
  const LERP = 0.08;          // 0→1 : lower = smoother / more lag
  const OPACITY = 0.18;       // max canvas opacity (keeps text readable)

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded.current) {
      rafId.current = requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Lerp toward mouse
    displayed.current.x += (mouse.current.x - displayed.current.x) * LERP;
    displayed.current.y += (mouse.current.y - displayed.current.y) * LERP;

    const cx = displayed.current.x;
    const cy = displayed.current.y;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (!visible.current) {
      rafId.current = requestAnimationFrame(draw);
      return;
    }

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Draw the tiling waves image across the full canvas
    const img = imageRef.current!;
    if (img.naturalWidth > 0) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      // Tile pattern
      const pattern = ctx.createPattern(img, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, W, H);
      } else {
        // Fallback: fit cover
        const scale = Math.max(W / iw, H / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (W - dw) / 2;
        const dy = (H - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
      }
    }

    ctx.restore();

    // Radial gradient mask (fade edges of the spotlight)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS);
    grad.addColorStop(0, "rgba(255,255,255,0)");          // centre: fully transparent → shows waves
    grad.addColorStop(0.65, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(255,255,255,1)");           // edge: white → hides waves
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    rafId.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    // Don't run on touch-only screens (no mouse cursor)
    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchOnly) return;

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Load waves image
    const img = new Image();
    img.src = "/bg-waves.png";
    img.onload = () => {
      loaded.current = true;
    };
    imageRef.current = img;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      visible.current = true;
    };
    const onLeave = () => {
      visible.current = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave, { passive: true });

    rafId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [draw, resize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: OPACITY,
        mixBlendMode: "multiply",  // blends the teal waves naturally onto the white page
      }}
    />
  );
}
