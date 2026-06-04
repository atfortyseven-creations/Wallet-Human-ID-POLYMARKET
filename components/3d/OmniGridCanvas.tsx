"use client";

/**
 * 
 * OmniGridCanvas  Epicentro 2: 2D Institutional Visualizer
 * 
 * Pure HTML5 Canvas 2D implementation. Zero WebGL / Three.js.
 * Zero external dependencies. Runs on any device, any browser.
 *
 * Architecture:
 *  - requestAnimationFrame loop at native vsync (60120 FPS)
 *  - 800 particles simulated entirely on the main canvas
 *  - Zustand store polled imperatively inside rAF  zero React re-renders
 *  - Particles form constellations: proximity edges drawn between nodes < threshold
 *  - Intensity from whale event count modulates speed + brightness in real time
 *  - GPU composite: willChange + translateZ to push canvas to own compositor layer
 * 
 */

import React, { useRef, useEffect } from 'react';
import { useVIPStore } from '@/lib/vip-store';
import { useAccount } from 'wagmi';
import { usePerformanceMode, shouldRenderFrame } from '@/hooks/usePerformanceMode';

//  Config 
const BASE_PARTICLE_COUNT = 450; // Scaled down by particleScale at runtime
const EDGE_THRESHOLD    = 100;  // px
const EDGE_THRESHOLD_SQ = 10000; // threshold^2 to avoid Math.sqrt
const BASE_SPEED        = 0.22; // Slightly faster for responsiveness
const GOLD              = { r: 212, g: 175, b: 55 };
const DIM               = { r: 30,  g: 40,  b: 60  };

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  isHot: boolean; // gold node vs dim node
  phase: number;  // individual flicker phase offset
}

function initParticles(w: number, h: number, count: number = BASE_PARTICLE_COUNT): Particle[] {
  const arr: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const isHot = Math.random() > 0.82;
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_SPEED * (0.5 + Math.random() * 0.5);
    arr.push({
      x:      Math.random() * w,
      y:      Math.random() * h,
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed,
      radius: isHot ? 1.8 + Math.random() * 1.4 : 0.9 + Math.random() * 0.8,
      isHot,
      phase:  Math.random() * Math.PI * 2,
    });
  }
  return arr;
}

export function OmniGridCanvas() {
  const { isConnected, address } = useAccount();
  const { mode, targetFps, isVisible, particleScale, skipBloom, skipEdges } = usePerformanceMode();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{
    particles: Particle[];
    raf: number;
    lastTime: number;
    lastRender: number;
    t: number;
  }>({ particles: [], raf: 0, lastTime: 0, lastRender: 0, t: 0 });

  // Keep perf values accessible inside rAF without re-creating the effect
  const perfRef = useRef({ targetFps, isVisible, particleScale, skipBloom, skipEdges });
  useEffect(() => {
    perfRef.current = { targetFps, isVisible, particleScale, skipBloom, skipEdges };
  }, [targetFps, isVisible, particleScale, skipBloom, skipEdges]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Size canvas to its container
    const PARTICLE_COUNT = Math.round(BASE_PARTICLE_COUNT * perfRef.current.particleScale);
    const observer = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        canvas.width  = Math.floor(width  * (window.devicePixelRatio || 1));
        canvas.height = Math.floor(height * (window.devicePixelRatio || 1));
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        stateRef.current.particles = initParticles(width, height);
      }
    });
    observer.observe(canvas.parentElement!);

    // Initial particles
    const w = canvas.parentElement!.clientWidth;
    const h = canvas.parentElement!.clientHeight;
    canvas.width  = Math.floor(w * (window.devicePixelRatio || 1));
    canvas.height = Math.floor(h * (window.devicePixelRatio || 1));
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    const PARTICLE_COUNT_INIT = Math.round(BASE_PARTICLE_COUNT * perfRef.current.particleScale);
    stateRef.current.particles = initParticles(w, h, PARTICLE_COUNT_INIT);

    //  rAF render loop 
    function tick(now: number) {
      const s = stateRef.current;
      s.raf = requestAnimationFrame(tick);

      //  PERFORMANCE GATE 
      const perf = perfRef.current;
      if (!perf.isVisible) return; // Tab hidden  keep rAF alive but skip render
      if (!shouldRenderFrame(now, s.lastRender, perf.targetFps)) return;
      s.lastRender = now;

      // Calculate delta
      if (!s.lastTime) s.lastTime = now;
      const dt = Math.min((now - s.lastTime) / 16.67, 3); // clamped to avoid spiral of death
      s.lastTime = now;
      s.t += 0.016 * dt;

      const cw = canvas!.width  / (window.devicePixelRatio || 1);
      const ch = canvas!.height / (window.devicePixelRatio || 1);

      //  Read whale store imperatively (zero React re-render) 
      //  Genesis vs System Theme 
      const MAIN_HUB_COLOR = isConnected ? { r: 212, g: 175, b: 55 } : { r: 0, g: 195, b: 255 }; // Gold vs Cyan
      const MESH_COLOR     = isConnected ? { r: 30,  g: 40,  b: 60  } : { r: 10, g: 20, b: 40  };
      const events         = useVIPStore.getState().whaleEvents ?? [];
      const intensity      = Math.min(events.length / 400, 1.0);
      const speedMult      = (isConnected ? 1.0 : 0.6) + intensity * 1.8;

      //  Background clear 
      ctx!.fillStyle = '#020202';
      ctx!.fillRect(0, 0, cw, ch);

      //  Update positions 
      for (const p of s.particles) {
        p.x += p.vx * speedMult * dt;
        p.y += p.vy * speedMult * dt;
        // Wrap around screen edges (toroidal topology)
        if (p.x < 0)   p.x += cw;
        if (p.x > cw)  p.x -= cw;
        if (p.y < 0)   p.y += ch;
        if (p.y > ch)  p.y -= ch;
      }

      //  Draw constellation edges (O(n²))  skip on REDUCED/MINIMAL 
      if (!perfRef.current.skipEdges) {
        const edgeAlpha = 0.06 + intensity * 0.2;
        ctx!.lineWidth = 0.5;
        for (let i = 0; i < s.particles.length; i++) {
          const pi = s.particles[i];
          for (let j = i + 1; j < s.particles.length; j++) {
            const pj = s.particles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < EDGE_THRESHOLD_SQ) {
              const alpha = edgeAlpha * (1 - distSq / EDGE_THRESHOLD_SQ);
              if (pi.isHot && pj.isHot) {
                ctx!.strokeStyle = `rgba(${MAIN_HUB_COLOR.r},${MAIN_HUB_COLOR.g},${MAIN_HUB_COLOR.b},${alpha})`;
              } else {
                ctx!.strokeStyle = `rgba(${MESH_COLOR.r},${MESH_COLOR.g},${MESH_COLOR.b},${alpha * 0.6})`;
              }
              ctx!.beginPath();
              ctx!.moveTo(pi.x, pi.y);
              ctx!.lineTo(pj.x, pj.y);
              ctx!.stroke();
            }
          }
        }
      }

      //  Draw particles 
      const skipBloomNow = perfRef.current.skipBloom;
      for (const p of s.particles) {
        const flicker = 0.6 + 0.4 * Math.sin(s.t * 2.4 + p.phase);
        const glow    = p.isHot ? 0.55 + intensity * 0.45 : 0.18;
        const alpha   = flicker * glow;

        if (p.isHot && !skipBloomNow) {
          // HIGH mode: full radial gradient glow
          const glowR = p.radius * (3 + intensity * 3);
          const grad  = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(${MAIN_HUB_COLOR.r},${MAIN_HUB_COLOR.g},${MAIN_HUB_COLOR.b},${alpha})`);
          grad.addColorStop(1, `rgba(${MAIN_HUB_COLOR.r},${MAIN_HUB_COLOR.g},${MAIN_HUB_COLOR.b},0)`);
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx!.fill();
          const coreColor = isConnected ? '255,230,100' : '200,240,255';
          ctx!.fillStyle = `rgba(${coreColor},${Math.min(alpha * 1.5, 1)})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx!.fill();
        } else if (p.isHot) {
          // REDUCED/MINIMAL: flat solid circle, no gradient allocation
          const coreColor = isConnected ? '212,175,55' : '0,195,255';
          ctx!.fillStyle = `rgba(${coreColor},${Math.min(alpha, 1)})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          ctx!.fillStyle = `rgba(${MESH_COLOR.r},${MESH_COLOR.g},${MESH_COLOR.b},${alpha})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      //  Radial vignette (only in HIGH mode  expensive gradient) 
      if (!skipBloomNow) {
        const vignette = ctx!.createRadialGradient(cw / 2, ch / 2, cw * 0.25, cw / 2, ch / 2, cw * 0.85);
        vignette.addColorStop(0, 'rgba(2,2,2,0)');
        vignette.addColorStop(1, 'rgba(2,2,2,0.82)');
        ctx!.fillStyle = vignette;
        ctx!.fillRect(0, 0, cw, ch);
      }

      //  Active stats HUD & Genesis Status 
      ctx!.font = '9px "Roboto Mono", monospace';
      ctx!.fillStyle = isConnected ? 'rgba(212,175,55,0.45)' : 'rgba(0,195,255,0.45)';
      const statusText = isConnected ? `Connected ${address?.slice(0,6)}` : 'Not connected';
      ctx!.fillText(`${statusText}  ${events.length} EVT  INT ${(intensity * 100).toFixed(0)}%`, 12, ch - 12);
    }

    requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      observer.disconnect();
    };
  }, [isConnected, address]);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[0] overflow-hidden bg-[#020202]"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
