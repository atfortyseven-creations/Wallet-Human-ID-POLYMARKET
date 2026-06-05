/**
 * 
 *    LIQUIDITY DYNAMICS  Capital Velocity Index                        
 *    Whale Alert Network Pro · Infrastructure Suite                             
 * 
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Zap, Activity, Radio, BarChart3 } from "lucide-react";
import { useMempoolStream } from "@/hooks/useMempoolStream";
import { usePerformanceMode, shouldRenderFrame } from "@/hooks/usePerformanceMode";

// 
// TYPES
// 
type VectorDir = "EXPAND" | "NEUTRAL" | "CONTRACT";

interface ActiveSignal {
  key: string;
  label: string;
  value: string;
  prev: number;
  current: number;
  color: string;
  unit: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// 
// VELOCITY CANVAS  renders scrolling frequency map
// 
function VelocityCanvas({
  history,
  direction,
}: {
  history: number[];
  direction: VectorDir;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastRenderRef = useRef(0);

  const perfMode = usePerformanceMode();
  const perfRef = useRef(perfMode);
  perfRef.current = perfMode;

  const draw = useCallback((time: number) => {
    animRef.current = requestAnimationFrame(draw);

    if (!perfRef.current.isVisible) return;
    if (!shouldRenderFrame(time, lastRenderRef.current, perfRef.current.targetFps)) return;
    lastRenderRef.current = time;

    const delta = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false }); // Opaque fallback performance
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    tRef.current += delta;
    const t = tRef.current;

    // Background - Pure White
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    if (history.length < 2) {
      return;
    }

    const maxVal = Math.max(...history, 0.5);
    const pts = history.length;
    const stepX = W / (pts - 1);

    // Direction color mapping for Light Mode
    const dirColors: Record<VectorDir, [number, number, number]> = {
      EXPAND: [16, 185, 129],   // Emerald 600
      NEUTRAL: [79, 70, 229],   // Indigo 600
      CONTRACT: [225, 29, 72],  // Rose 600
    };
    const [cr, cg, cb] = dirColors[direction];

    // Filled area under curve
    ctx.beginPath();
    ctx.moveTo(0, H);
    history.forEach((v, i) => {
      const x = i * stepX;
      const y = H - (v / maxVal) * H * 0.75;
      i === 0 ? ctx.lineTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo((pts - 1) * stepX, H);
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, 0, 0, H);
    areaGrad.addColorStop(0, `rgba(${cr},${cg},${cb},0.08)`);
    areaGrad.addColorStop(1, `rgba(${cr},${cg},${cb},0.01)`);
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Grid lines - Subtle
    ctx.strokeStyle = "rgba(226,232,240,0.6)"; // Slate 200
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (H / 4) * i);
        ctx.lineTo(W, (H / 4) * i);
        ctx.stroke();
    }

    // Line
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    history.forEach((v, i) => {
      const x = i * stepX;
      const y = H - (v / maxVal) * H * 0.75;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.8)`;
    ctx.stroke();

    // Oscilloscope head
    const scanX = (W * ((t % 4) / 4));
    ctx.fillStyle = `rgba(${cr},${cg},${cb},1)`;
    ctx.beginPath();
    const currentY = H - (history[history.length - 1] / maxVal) * H * 0.75;
    ctx.arc(scanX, currentY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Max label
    if (perfRef.current.mode === "HIGH") {
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "right";
      ctx.fillText(`${maxVal.toFixed(1)} tx/s peak`, W - 12, 18);
    }
  }, [history, direction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// 
// CONFIG
// 
const DIR_CONFIG = {
  EXPAND: {
    label: "INFLOW",
    sublabel: "Institutional Accumulation",
    Icon: TrendingUp,
    color: "text-emerald-600",
    ring: "border-emerald-100",
    shadow: "shadow-[0_20px_60px_rgba(16,185,129,0.05)]",
    bg: "from-emerald-50/50 via-white to-white",
    bar: "from-emerald-500 to-emerald-400",
    desc: "Whale and institutional activity is currently expanding capital positions. Real-time network demand indicates high settlement priority and intense liquidity flow.",
  },
  NEUTRAL: {
    label: "STABLE",
    sublabel: "Equilibrium Verified",
    Icon: Minus,
    color: "text-indigo-600",
    ring: "border-indigo-100",
    shadow: "shadow-[0_20px_60px_rgba(79,70,229,0.05)]",
    bg: "from-indigo-50/50 via-white to-white",
    bar: "from-indigo-500 to-indigo-400",
    desc: "Market participants are in relative balance. No dominant directional pressure detected in the recent block sequence. Optimal window for standard network interactions.",
  },
  CONTRACT: {
    label: "OUTFLOW",
    sublabel: "Liquidity Absorption",
    Icon: TrendingDown,
    color: "text-rose-600",
    ring: "border-rose-100",
    shadow: "shadow-[0_20px_60px_rgba(225,29,72,0.05)]",
    bg: "from-rose-50/50 via-white to-white",
    bar: "from-rose-500 to-rose-400",
    desc: "Network activity suggests capital contraction or large-scale withdrawal cycles. Lower transaction density observed alongside a decrease in relative gas priority bidding.",
  },
};

export function MempoolCollider() {
  const { transactions, isConnected, rate } = useMempoolStream(true);
  const historyRef = useRef<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [direction, setDirection] = useState<VectorDir>("NEUTRAL");
  const [confidence, setConfidence] = useState(55);
  const [signals, setSignals] = useState<ActiveSignal[]>([]);
  const prevSignalsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (transactions.length === 0) return;

    const total = transactions.length;
    const whaleTxs = transactions.filter(tx => tx.type === "whale").length;
    const whalePct = (whaleTxs / total) * 100;
    const avgGas = transactions.reduce((s, tx) => s + tx.gasPrice, 0) / total;
    const gasPressure = clamp((avgGas / 80) * 100, 0, 100);
    const avgValue = transactions.reduce((s, tx) => s + tx.value, 0) / total;

    const score = clamp(rate * 4.5 + whalePct * 2.5 + gasPressure * 0.8, 0, 100);
    const dir: VectorDir = score > 58 ? "EXPAND" : score < 32 ? "CONTRACT" : "NEUTRAL";
    setDirection(dir);
    setConfidence(Math.round(clamp(35 + score * 0.55, 45, 96)));

    historyRef.current = [...historyRef.current, rate].slice(-60);
    setHistory([...historyRef.current]);

    const prev = prevSignalsRef.current;
    const newSignals: ActiveSignal[] = [
      {
        key: "rate",
        label: "Block Velocity",
        value: rate.toFixed(1),
        prev: prev.rate ?? rate,
        current: rate,
        unit: "tx per second",
        color: "text-slate-950",
      },
      {
        key: "whale",
        label: "Elite Ratio",
        value: `${whalePct.toFixed(1)}%`,
        prev: prev.whale ?? whalePct,
        current: whalePct,
        unit: "institutional share",
        color: "text-slate-950",
      },
      {
        key: "gas",
        label: "Utilization",
        value: `${gasPressure.toFixed(0)}`,
        prev: prev.gas ?? gasPressure,
        current: gasPressure,
        unit: "pressure index",
        color: "text-slate-950",
      },
      {
        key: "value",
        label: "Avg Value",
        value: avgValue.toFixed(2),
        prev: prev.value ?? avgValue,
        current: avgValue,
        unit: "ETH per transaction",
        color: "text-slate-950",
      },
    ];
    prevSignalsRef.current = {
      rate, whale: whalePct, gas: gasPressure, value: avgValue,
    };
    setSignals(newSignals);
  }, [transactions, rate]);

  const cfg = DIR_CONFIG[direction];
  const DirIcon = cfg.Icon;

  return (
    <div className="w-full bg-white border border-slate-100 rounded-[3rem] overflow-hidden relative shadow-sm">
      
      {/* Header */}
      <div className="p-10 border-b border-slate-50 bg-black/5/50">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Activity size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-950">
                        Liquidity Dynamics
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Real-time Capital Velocity Index</p>
                </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <span className={`flex h-2 w-2 relative`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"} opacity-40`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {isConnected ? "Active Flow" : "Interrupted"}
                </span>
            </div>
        </div>
        <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-2xl">
            Monitoring mempool pressure vectors through transactional velocity, utilization rates, and institutional participant ratios to determine high-fidelity capital direction.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Main Readout */}
        <div className={`lg:col-span-4 p-12 bg-gradient-to-b ${cfg.bg} flex flex-col items-center justify-center transition-all duration-700`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={direction}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <div className={`w-28 h-28 mx-auto rounded-[3rem] bg-white border ${cfg.ring} flex items-center justify-center ${cfg.shadow} relative overflow-hidden`}>
                <DirIcon className={`w-12 h-12 ${cfg.color} relative z-10`} />
                <div className={`absolute inset-0 bg-gradient-to-tr ${cfg.bg} opacity-50`} />
              </div>

              <div className="space-y-1">
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${cfg.color}`}>{cfg.sublabel}</p>
                <p className="text-5xl font-black tracking-tighter text-slate-950">{cfg.label}</p>
              </div>

              <div className="w-full space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Confidence</span>
                  <span>{confidence}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full`}
                    animate={{ width: `${confidence}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  />
                </div>
              </div>

              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px] mx-auto opacity-70">
                {cfg.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Signal Inputs */}
        <div className="lg:col-span-4 p-10 bg-white">
            <div className="flex items-center gap-3 mb-10">
                <Zap size={14} className="text-indigo-600" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Active Infrastructure Signals</h3>
            </div>
          <div className="grid grid-cols-2 gap-4">
            {signals.map((sig) => {
              const delta = sig.current - sig.prev;
              const isUp = delta > 0.05;
              const isDown = delta < -0.05;
              return (
                <div key={sig.key} className="bg-black/5 border border-slate-100 rounded-3xl p-6 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{sig.label}</p>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-black font-mono text-slate-950 tracking-tighter">
                      {sig.value}
                    </div>
                    <div className={`text-xs font-black ${isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-slate-300'}`}>
                        {isUp ? '' : isDown ? '' : ''}
                    </div>
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">{sig.unit}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Velocity Map */}
        <div className="lg:col-span-4 p-10 bg-white flex flex-col">
            <div className="flex items-center gap-3 mb-10">
                <BarChart3 size={14} className="text-indigo-600" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Velocity Frequency Map</h3>
            </div>
            
            <div className="flex-1 min-h-[220px] relative rounded-[2rem] overflow-hidden bg-black/5/50 border border-slate-100">
                <VelocityCanvas history={history} direction={direction} />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-50 pt-8">
                {[
                  { label: "SPIKE", sub: "Outlier Activity" },
                  { label: "SURGE", sub: "Volume Expansion" },
                  { label: "STABLE", sub: "Verified Flow" },
                ].map(({ label, sub }) => (
                  <div key={label} className="text-center space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-950">{label}</p>
                    <p className="text-[8px] font-medium text-slate-400 uppercase tracking-tight">{sub}</p>
                  </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

