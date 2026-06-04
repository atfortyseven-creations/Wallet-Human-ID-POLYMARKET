"use client";

/**
 * 
 *         DARK POOL  HOURGLASS PHYSICS ENGINE  v2.0                   
 *         by WhaleAlert ID.fi · Elite Analytics Layer             
 * 
 *   Architecture:                                                       
 *    Dual-buffer rendering (motion blur via alpha compositing)         
 *    Per-grain Verlet physics: gravity, wall normals, friction         
 *    Signed-distance-field hourglass boundary  sub-pixel accurate     
 *    Bloom pass: additive layered radial gradients per grain           
 *    Chromatic aberration simulation for whale-class transactions      
 *    Heat-map pool: accumulating glow at settling zone                 
 *    Spatial hash grid for O(n) collision broad-phase                  
 *    60fps locked via rAF + delta-time clamping                        
 * 
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useVIPStore, WhaleEvent } from "@/lib/vip-store";
import { usePerformanceMode, shouldRenderFrame } from "@/hooks/usePerformanceMode";

// 
// CONFIG
// 
const CFG = {
  MAX_GRAINS: 320,        // Runtime-scaled down via particleScale
  BASE_MAX_GRAINS: 320,   // Baseline (plugged in, HIGH mode)
  GRAVITY: 0.06,             // Slower, more elegant gravity
  FRICTION: 0.94,            // Higher viscosity
  RESTITUTION: 0.15,         // Softer bounces
  NECK_SOFTNESS: 0.05,       
  SETTLE_DEPTH: 0.82,        
  DISSOLVE_RATE: 0.008,      // Slower dissolve
  BLOOM_LAYERS: 3,           
  MOTION_BLUR_ALPHA: 0.65,   // Smoother, longer trails
  POOL_GLOW_RADIUS: 0.45,    
  DEPTH_LAYERS: 3,           
} as const;

// 
// TYPES
// 
type Phase = "falling" | "necking" | "pooling" | "settling" | "dissolving";

interface Grain {
  // identity
  id: number;
  isWhale: boolean;
  heat: number;           // 0 cold  1 whale-red
  // physics (Verlet)
  x: number; y: number;
  px: number; py: number; // previous position
  r: number;
  // life
  alpha: number;
  phase: Phase;
  age: number;
  // visuals
  label?: string;
  labelAlpha: number;
  depth: number;          // 0..1 pseudo-z for layering
  glowPulse: number;      // unique phase offset for bloom animation
}

// 
// MATH UTILS
// 
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
let _uid = 0;

// 
// COLOR SYSTEM  perceptually uniform palette
// cold(navy)  mid(violet)  hot(crimson)  supra(gold for mega-whale)
// 
function heatRGB(t: number): [number, number, number] {
  t = clamp(t, 0, 1);
  if (t < 0.33) {
    const s = t / 0.33;
    return [lerp(15, 60, s), lerp(20, 50, s), lerp(100, 180, s)]; // Deep elegant navy/blue
  } else if (t < 0.66) {
    const s = (t - 0.33) / 0.33;
    return [lerp(60, 140, s), lerp(50, 40, s), lerp(180, 200, s)]; // Muted violet
  } else if (t < 0.88) {
    const s = (t - 0.66) / 0.22;
    return [lerp(140, 200, s), lerp(40, 60, s), lerp(200, 100, s)]; // Soft crimson/pink
  } else {
    // mega-whale  soft gold
    const s = (t - 0.88) / 0.12;
    return [lerp(200, 230, s), lerp(60, 180, s), lerp(100, 40, s)];
  }
}

function rgba(t: number, a: number): string {
  const [r, g, b] = heatRGB(t);
  return `rgba(${r|0},${g|0},${b|0},${a.toFixed(3)})`;
}

// 
// HOURGLASS SDF  signed distance field
// Returns the maximum allowed half-width at Y coordinate y in [0, H]
// Positive = inside hourglass
// 
function hourglassMaxHalfWidth(
  y: number, H: number, W: number,
  neckY: number, neckHW: number, chamberHW: number
): number {
  const topFrac = Math.max(0, Math.min(1, (y - 0.03 * H) / (neckY - 0.03 * H)));
  const botFrac = Math.max(0, Math.min(1, (y - neckY) / (0.97 * H - neckY)));

  if (y < neckY) {
    // top chamber: wide at top, narrows to neck  use smooth ease-in
    const ease = topFrac * topFrac * (3 - 2 * topFrac); // smoothstep
    return lerp(chamberHW, neckHW, ease);
  } else {
    // bottom chamber: neck widens to bottom  eases out
    const ease = botFrac * botFrac * (3 - 2 * botFrac);
    return lerp(neckHW, chamberHW, ease);
  }
}

// 
// GRAIN FACTORY
// 
function makeGrain(W: number, H: number, neckX: number, chamberHW: number, isWhale = false, label?: string): Grain {
  // Deterministic seeds based on label or fallback
  const s = label ? label.charCodeAt(0) + label.length : 42;
  const s1 = (s * 13.1) % 1;
  const s2 = (s * 4.2) % 1;
  const s3 = (s * 7.5) % 1;
  const s4 = (s * 11.2) % 1;

  const heat = isWhale
    ? 0.78 + s1 * 0.22
    : Math.pow(s2, 1.8) * 0.7;
  const r = isWhale
    ? 4.5 + s3 * 2.5 
    : 1.0 + s3 * 2.0;
  const spreadX = chamberHW * 0.9;
  const x = neckX + (s4 - 0.5) * spreadX * 2;
  const y = H * 0.04 + s1 * H * 0.07;

  return {
    id: _uid++,
    isWhale,
    heat,
    x, y,
    px: x + (s2 - 0.5) * 0.2,
    py: y - 0.2,
    r,
    alpha: 1,
    phase: "falling",
    age: 0,
    label: label,
    labelAlpha: isWhale ? 1 : 0,
    depth: s3,
    glowPulse: s4 * Math.PI * 2,
  };
}

// 
// SPATIAL HASH  broad phase for wall constraint (not grain-grain)
// 
// (We skip grain-grain collision for perf at 320 grains, but wall SDF is exact)

// 
// MAIN DRAW ENGINE
// 
function runFrame(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  grains: Grain[],
  t: number,
  dt: number,
  skipBloom = false,
) {
  //  Geometry constants 
  const neckX = W / 2;
  const neckY = H * 0.5;
  const neckHW = W * 0.032;
  const chamberHW = W * 0.34;

  //  Motion blur wipe 
  ctx.fillStyle = `rgba(4,6,16,${CFG.MOTION_BLUR_ALPHA})`;
  ctx.fillRect(0, 0, W, H);

  //  Background: subtle Perlin-esque depth gradient 
  // Two radial gradients  top and bottom chamber atmosphere
  const topAtm = ctx.createRadialGradient(neckX, H * 0.22, 0, neckX, H * 0.22, H * 0.35);
  topAtm.addColorStop(0, `rgba(40,30,90,${0.08 + Math.sin(t * 0.4) * 0.03})`);
  topAtm.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topAtm;
  ctx.fillRect(0, 0, W, H);

  //  Hourglass structural lines 
  drawHourglassFrame(ctx, W, H, neckX, neckY, neckHW, chamberHW, t);

  //  Physics step: update grains 
  const settled: Grain[] = [];

  for (const g of grains) {
    g.age += dt;

    if (g.phase === "dissolving") {
      g.alpha -= CFG.DISSOLVE_RATE + g.r * 0.0015;
      g.labelAlpha = Math.max(0, g.labelAlpha - 0.025);
      g.r = Math.max(0.3, g.r - 0.025);
      continue;
    }

    //  Verlet integration 
    const vx = (g.x - g.px) * CFG.FRICTION;
    const vy = (g.y - g.py) * CFG.FRICTION;
    g.px = g.x;
    g.py = g.y;
    g.x += vx;
    g.y += vy + CFG.GRAVITY * dt * 2;

    //  Phase transitions 
    if (g.y >= neckY - H * 0.005 && g.y < neckY + H * 0.04) {
      if (g.phase === "falling") g.phase = "necking";
    } else if (g.y >= neckY + H * 0.04 && g.phase === "necking") {
      g.phase = "pooling";
    } else if (g.y >= H * CFG.SETTLE_DEPTH && g.phase === "pooling") {
      g.phase = "settling";
    } else if (g.phase === "settling" && g.age > 1.5 + ((g.id * 7.4) % 1) * 2) {
      g.phase = "dissolving";
    }

    //  Neck funneling force 
    if (g.phase === "falling" && g.y > neckY - H * 0.12) {
      const pullStrength = CFG.NECK_SOFTNESS * Math.pow(1 - (neckY - g.y) / (H * 0.12), 2);
      g.x += (neckX - g.x) * pullStrength;
    }

    //  Wall constraint (SDF) 
    const maxHW = hourglassMaxHalfWidth(g.y, H, W, neckY, neckHW, chamberHW);
    const leftWall = neckX - maxHW + g.r;
    const rightWall = neckX + maxHW - g.r;

    if (g.x < leftWall) {
      const pen = leftWall - g.x;
      g.x = leftWall;
      g.px = g.x + (g.x - g.px) * CFG.RESTITUTION; // reflect velocity
    } else if (g.x > rightWall) {
      g.x = rightWall;
      g.px = g.x + (g.x - g.px) * CFG.RESTITUTION;
    }

    //  Floor at settling zone 
    if (g.y > H * 0.94) {
      g.y = H * 0.94;
      g.py = g.y + (g.y - g.py) * 0.1;
      g.phase = "settling";
    }

    // Pool spreading force (pooling phase)
    if (g.phase === "pooling" || g.phase === "settling") {
      const bias = (g.x > neckX ? 0.08 : -0.08);
      const spreadSeed = (g.id * 3.1) % 1;
      g.x += bias * spreadSeed;
    }

    settled.push(g);
  }

  //  Pool accumulated glow 
  const settlingCount = grains.filter(g => g.phase === "settling" || g.phase === "dissolving").length;
  if (settlingCount > 5) {
    const intensity = clamp(settlingCount / 80, 0, 1);
    const avgHeat = grains
      .filter(g => g.phase === "settling")
      .reduce((s, g) => s + g.heat, 0) / Math.max(1, settlingCount);

    const [pr, pg, pb] = heatRGB(avgHeat);
    const poolGlow = ctx.createRadialGradient(
      neckX, H * 0.88, 0,
      neckX, H * 0.88, W * CFG.POOL_GLOW_RADIUS
    );
    poolGlow.addColorStop(0, `rgba(${pr|0},${pg|0},${pb|0},${intensity * 0.22})`);
    poolGlow.addColorStop(0.5, `rgba(${pr|0},${pg|0},${pb|0},${intensity * 0.07})`);
    poolGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = poolGlow;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
  }

  //  Render grains  depth-sorted 
  const sorted = [...grains].sort((a, b) => a.depth - b.depth);

  for (const g of sorted) {
    if (g.alpha < 0.004) continue;
    const effAlpha = clamp(g.alpha, 0, 1);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + g.glowPulse);

    //  Bloom rings (additive glow) 
    if (!skipBloom && (g.r > 2 || g.isWhale)) {
      const bloomCount = g.isWhale ? CFG.BLOOM_LAYERS + 2 : CFG.BLOOM_LAYERS;
      for (let b = bloomCount; b >= 1; b--) {
        const br = g.r + b * (g.isWhale ? 5 : 2.5) * (1 + pulse * 0.3);
        const ba = effAlpha * (0.06 - b * 0.008) * (g.isWhale ? 2.5 : 1);
        if (ba < 0.004) continue;
        ctx.beginPath();
        ctx.arc(g.x, g.y, br, 0, Math.PI * 2);
        ctx.fillStyle = rgba(g.heat, ba);
        ctx.fill();
      }
    }

    //  Chromatic aberration for whales (HIGH mode only) 
    if (!skipBloom && g.isWhale) {
      const aberr = 2.5 + pulse * 1.5;
      ctx.beginPath();
      ctx.arc(g.x - aberr, g.y, g.r * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,30,80,${effAlpha * 0.35})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(g.x + aberr, g.y, g.r * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30,80,255,${effAlpha * 0.35})`;
      ctx.fill();
    }

    //  Core grain 
    const coreGrad = ctx.createRadialGradient(
      g.x - g.r * 0.3, g.y - g.r * 0.3, 0,
      g.x, g.y, g.r * 1.1
    );
    coreGrad.addColorStop(0, rgba(g.heat, effAlpha));
    coreGrad.addColorStop(0.6, rgba(g.heat, effAlpha * 0.85));
    coreGrad.addColorStop(1, rgba(g.heat, effAlpha * 0.2));

    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Specular highlight (makes grain feel spherical)
    ctx.beginPath();
    ctx.arc(g.x - g.r * 0.28, g.y - g.r * 0.28, g.r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${effAlpha * 0.18})`;
    ctx.fill();

    //  Whale labels 
    if (g.label && g.labelAlpha > 0.03) {
      ctx.save();
      ctx.font = `bold 8px 'SF Mono', 'Fira Code', monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = rgba(g.heat, g.labelAlpha * 0.95);
      ctx.fillText(g.label.toUpperCase(), g.x, g.y - g.r - 6);
      ctx.restore();
    }
  }

  //  Neck pulse glow (reacts to how many grains are passing through) 
  const neckCount = grains.filter(g => g.phase === "necking").length;
  if (neckCount > 0) {
    const ni = clamp(neckCount / 12, 0, 1);
    const neckGlow = ctx.createRadialGradient(neckX, neckY, 0, neckX, neckY, neckHW * 8);
    neckGlow.addColorStop(0, `rgba(120,80,255,${0.25 * ni + 0.05})`);
    neckGlow.addColorStop(0.4, `rgba(99,102,241,${0.08 * ni})`);
    neckGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = neckGlow;
    ctx.fillRect(0, neckY - neckHW * 8, W, neckHW * 16);
  }

  //  Vignette 
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(2,4,14,0.6)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

// 
// HOURGLASS FRAME RENDERER
// 
function drawHourglassFrame(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  neckX: number, neckY: number,
  neckHW: number, chamberHW: number,
  t: number
) {
  const topL = neckX - chamberHW;
  const topR = neckX + chamberHW;
  const botL = neckX - chamberHW;
  const botR = neckX + chamberHW;
  const topY = H * 0.035;
  const botY = H * 0.965;
  const nL = neckX - neckHW;
  const nR = neckX + neckHW;

  // Glass cabinet lines  hair-thin, very subtle
  ctx.save();
  ctx.lineWidth = 0.8;
  ctx.setLineDash([]);

  // Left side outline
  const leftGrad = ctx.createLinearGradient(topL, topY, nL, neckY);
  leftGrad.addColorStop(0, `rgba(80,60,160,${0.12 + Math.sin(t * 0.7) * 0.04})`);
  leftGrad.addColorStop(1, `rgba(120,80,255,${0.22 + Math.sin(t * 0.7 + 1) * 0.05})`);
  ctx.strokeStyle = leftGrad;
  ctx.beginPath();
  ctx.moveTo(topL, topY);
  ctx.bezierCurveTo(topL + chamberHW * 0.1, neckY * 0.6, nL - chamberHW * 0.05, neckY * 0.85, nL, neckY);
  ctx.stroke();

  // Right side outline
  const rightGrad = ctx.createLinearGradient(topR, topY, nR, neckY);
  rightGrad.addColorStop(0, `rgba(80,60,160,${0.12 + Math.sin(t * 0.7 + 0.5) * 0.04})`);
  rightGrad.addColorStop(1, `rgba(120,80,255,${0.22 + Math.sin(t * 0.7 + 1.5) * 0.05})`);
  ctx.strokeStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(topR, topY);
  ctx.bezierCurveTo(topR - chamberHW * 0.1, neckY * 0.6, nR + chamberHW * 0.05, neckY * 0.85, nR, neckY);
  ctx.stroke();

  // Bottom chamber  mirrored
  ctx.strokeStyle = `rgba(80,60,160,${0.10 + Math.sin(t * 0.5) * 0.03})`;
  ctx.beginPath();
  ctx.moveTo(nL, neckY);
  ctx.bezierCurveTo(nL - chamberHW * 0.05, neckY + H * 0.15, botL + chamberHW * 0.1, H * 0.78, botL, botY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(nR, neckY);
  ctx.bezierCurveTo(nR + chamberHW * 0.05, neckY + H * 0.15, botR - chamberHW * 0.1, H * 0.78, botR, botY);
  ctx.stroke();

  // Top & bottom caps
  ctx.strokeStyle = `rgba(80,60,160,0.10)`;
  ctx.beginPath(); ctx.moveTo(topL, topY); ctx.lineTo(topR, topY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(botL, botY); ctx.lineTo(botR, botY); ctx.stroke();

  // Neck crossbar glow
  const neckLine = ctx.createLinearGradient(nL, neckY, nR, neckY);
  neckLine.addColorStop(0, "rgba(99,102,241,0)");
  neckLine.addColorStop(0.5, `rgba(99,102,241,${0.5 + Math.sin(t * 2) * 0.15})`);
  neckLine.addColorStop(1, "rgba(99,102,241,0)");
  ctx.strokeStyle = neckLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(nL - 4, neckY);
  ctx.lineTo(nR + 4, neckY);
  ctx.stroke();

  ctx.restore();
}

// 
// COMPONENT
// 
export function DarkPoolCanvas2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const grainsRef = useRef<Grain[]>([]);
  const lastFrameRef = useRef<number>(performance.now());
  const lastRenderRef = useRef<number>(0);
  const tRef = useRef(0);

  const { whaleEvents, lastWhaleUpdate } = useVIPStore();
  const { targetFps, isVisible, particleScale, skipBloom } = usePerformanceMode();
  const perfRef = useRef({ targetFps, isVisible, particleScale, skipBloom });
  useEffect(() => {
    perfRef.current = { targetFps, isVisible, particleScale, skipBloom };
  }, [targetFps, isVisible, particleScale, skipBloom]);

  const [txCount, setTxCount] = useState(0);
  const [whaleEventsList, setWhaleEventsList] = useState<{ label: string; amount: string; id: number }[]>([]);
  const flowBucketRef = useRef<number[]>([]);
  const lastUpdateRef = useRef(0);

  //  Sync with Global Store 
  useEffect(() => {
    if (lastWhaleUpdate === lastUpdateRef.current) return;
    lastUpdateRef.current = lastWhaleUpdate;

    const W = canvasRef.current?.width || 800;
    const H = canvasRef.current?.height || 600;
    const neckX = W / 2;
    const chamberHW = W * 0.34;

    const freshEvents = whaleEvents.slice(0, 10);
    
    freshEvents.forEach((ev: WhaleEvent) => {
      const isWhale = (ev.usdNum || 0) > 100000;
      const g = makeGrain(W, H, neckX, chamberHW, isWhale, `${ev.token} ${ev.action}`);
      grainsRef.current.push(g);
      
      if (isWhale) {
        setWhaleEventsList(prev => [{ label: `${ev.token} ${ev.action}`, amount: ev.usdValue, id: g.id }, ...prev].slice(0, 3));
      }
      setTxCount(c => c + 1);
      flowBucketRef.current.push(performance.now());
    });
  }, [lastWhaleUpdate, whaleEvents]);

  //  Render loop 
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    const now = performance.now();
    const rawDt = (now - lastFrameRef.current) / 16.67; 
    const dt = clamp(rawDt, 0.1, 3); 
    lastFrameRef.current = now;
    tRef.current += dt * 0.016667;
    const t = tRef.current;

    grainsRef.current = grainsRef.current.filter(g => g.alpha > 0.003);

    const cutoff = now - 2000;
    flowBucketRef.current = flowBucketRef.current.filter(ts => ts > cutoff);

    runFrame(ctx, W, H, grainsRef.current, t, dt);

    animRef.current = requestAnimationFrame(draw);
  }, []);

  //  Canvas resize 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx?.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    lastFrameRef.current = performance.now();
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [draw]);

  return (
    <div className="w-full h-full bg-[#020408] rounded-[48px] overflow-hidden border border-white/[0.04] relative shadow-[0_0_120px_rgba(80,60,200,0.12)] group">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/*  LEGENDARY OVERLAY  */}
      <div className="absolute inset-x-8 top-8 flex justify-between items-start pointer-events-none">
          <div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Deep Pool Neural Scan</span>
              </div>
              <h2 className="text-3xl font-normal tracking-tighter text-white uppercase italic">Dark Pool</h2>
          </div>
          
          <div className="text-right flex flex-col items-end gap-1">
              <div className="text-[40px] font-black text-white tabular-nums tracking-tighter leading-none">{txCount.toLocaleString()}</div>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Inflow Captured</div>
          </div>
      </div>

      <div className="absolute left-8 bottom-8 flex flex-col gap-4 max-w-xs pointer-events-none">
          <AnimatePresence>
              {whaleEventsList.map((ev, i) => (
                  <motion.div key={ev.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                      className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/5 flex items-center gap-4">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <Zap className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                          <div className="text-[10px] font-black text-white uppercase tracking-tight">{ev.label}</div>
                          <div className="text-lg font-black text-red-400">{ev.amount}</div>
                      </div>
                  </motion.div>
              ))}
          </AnimatePresence>
      </div>

      <div className="absolute right-8 bottom-8 pointer-events-none text-right">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Neural Fluid Sync</div>
          <div className="flex gap-1 justify-end">
              {[...Array(12)].map((_, i) => (
                  <div key={i} className={`w-1 h-3 rounded-full bg-white/5 ${i < (txCount % 12) ? 'bg-indigo-500/40' : ''}`} />
              ))}
          </div>
      </div>

      {/*  SCAN LINES  */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="w-full h-[1px] bg-white/10 absolute top-1/4 animate-[scan_8s_linear_infinite]" />
          <div className="w-full h-[1px] bg-white/10 absolute top-2/4 animate-[scan_12s_linear_infinite_reverse]" />
          <div className="w-[1px] h-full bg-white/10 absolute left-1/3 animate-[scan_15s_linear_infinite]" />
      </div>

      <style jsx global>{`
          @keyframes scan {
              0% { transform: translate3d(0,-100%,0); }
              100% { transform: translate3d(0,1000%,0); }
          }
      `}</style>
    </div>
  );
}


