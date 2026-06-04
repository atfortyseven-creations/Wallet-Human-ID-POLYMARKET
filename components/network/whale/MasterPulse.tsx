"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMempoolStream } from '@/hooks/useMempoolStream';

interface PulseDataPoint {
  time: number;
  value: number;
  spike: boolean;
}

interface Props {
  // Props from whaleData aggregated in the dashboard
  totalWhaleVolume: number;      // BTC moved by whales total
  inflowScore: number;           // -100 to +100
  liquidationTotal: number;      // USD in liquidations
  activeSatoshiAlerts: number;   // count
}

// Smoothstep interpolation for EKG
function generateEkgPath(points: PulseDataPoint[], W: number, H: number): string {
  if (points.length < 2) return '';
  
  const xStep = W / (points.length - 1);
  const minVal = Math.min(...points.map(p => p.value));
  const maxVal = Math.max(...points.map(p => p.value));
  const range = maxVal - minVal || 1;
  
  const coords = points.map((p, i) => ({
    x: i * xStep,
    y: H * 0.8 - ((p.value - minVal) / range) * H * 0.6,
  }));
  
  let d = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const cp1x = coords[i-1].x + xStep / 3;
    const cp2x = coords[i].x - xStep / 3;
    d += ` C ${cp1x},${coords[i-1].y} ${cp2x},${coords[i].y} ${coords[i].x},${coords[i].y}`;
  }
  return d;
}

const HISTORY_LEN = 60;

export function MasterPulse({ totalWhaleVolume, inflowScore, liquidationTotal, activeSatoshiAlerts }: Props) {
  const { rate, isConnected } = useMempoolStream(true);
  const [history, setHistory] = useState<PulseDataPoint[]>([]);
  const [pulseValue, setPulseValue] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 600, H = 100;

  useEffect(() => {
    // Composite signal computation
    const computeSignal = () => {
      // Normalize each component (0-100)
      const whaleSignal = Math.min(100, totalWhaleVolume / 50); // 5000 BTC = 100
      const liquidSignal = Math.min(100, liquidationTotal / 10_000_000); // 10M USD = 100
      const satoshiSignal = Math.min(100, activeSatoshiAlerts * 25); // 4 alerts = max
      const inflowSignal = Math.abs(inflowScore);
      const ethMempoolSignal = Math.min(100, rate * 3); // Realtime TPS from SSE stream
      
      const composite = (
        whaleSignal * 0.2 +
        liquidSignal * 0.2 +
        satoshiSignal * 0.1 +
        inflowSignal * 0.1 +
        ethMempoolSignal * 0.4 // 40% weight on actual mainnet activity
      );

      const spike = composite > 70 || activeSatoshiAlerts > 0 || rate > 30;
      
      const newPoint: PulseDataPoint = {
        time: Date.now(),
        value: composite,
        spike,
      };
      
      setPulseValue(composite);
      setHistory(prev => [...prev.slice(-HISTORY_LEN + 1), newPoint]);
    };

    computeSignal();
    const interval = setInterval(computeSignal, 1000);
    return () => clearInterval(interval);
  }, [totalWhaleVolume, inflowScore, liquidationTotal, activeSatoshiAlerts, rate]);

  const isAlert = pulseValue > 70;
  const isWarning = pulseValue > 40 && pulseValue <= 70;
  const pulseColor = isAlert ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
  
  const ekgPath = generateEkgPath(history, W, H);
  
  const label = !isConnected ? 'ESTABLISHING WSS CONNECTION...'
              : isAlert ? ` CRITICAL ACTIVITY (${rate} TPS)` 
              : isWarning ? `️ ELEVATED NETWORK (${rate} TPS)`
              : ` STABLE NETWORK (${rate} TPS)`;

  return (
    <div className={`w-full rounded-3xl overflow-hidden border transition-all duration-500 ${
      isAlert ? 'bg-[#0d0303] border-red-900/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]'
      : isWarning ? 'bg-[#0a0702] border-amber-900/30'
      : 'bg-[#020f07] border-emerald-900/20'
    }`}>
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `${pulseColor}15`, border: `1px solid ${pulseColor}30` }}>
            <Brain className="w-5 h-5" style={{ color: pulseColor }} />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">Master AI Pulse</h3>
            <p className="text-white/30 text-xs font-mono">Composite analytics signal</p>
          </div>
        </div>
        
        <motion.div
          animate={{ scale: isAlert ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isAlert ? Infinity : 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
          style={{ borderColor: `${pulseColor}40`, background: `${pulseColor}10`, color: pulseColor }}
        >
          <Activity className="w-3 h-3" />
          <span className="text-xs font-black">{label}</span>
        </motion.div>
      </div>

      {/* EKG Chart */}
      <div className="relative px-6 pt-4">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '80px' }}>
          {/* Grid */}
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1={0} y1={H * f} x2={W} y2={H * f} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          
          {/* Glow effect under path */}
          {ekgPath && (
            <>
              <path d={ekgPath} fill="none" stroke={pulseColor} strokeWidth="8" opacity="0.05" />
              <path d={ekgPath} fill="none" stroke={pulseColor} strokeWidth="3" opacity="0.15" />
              <path d={ekgPath} fill="none" stroke={pulseColor} strokeWidth="1.5" opacity="0.9" strokeLinecap="round" />
            </>
          )}

          {/* Spike markers */}
          {history.slice(-HISTORY_LEN).map((pt, i, arr) => {
            if (!pt.spike) return null;
            const x = (i / (arr.length - 1)) * W;
            return (
              <g key={i}>
                <line x1={x} y1={0} x2={x} y2={H} stroke={pulseColor} strokeWidth="1" opacity="0.2" strokeDasharray="3,3" />
                <circle cx={x} cy={H * 0.2} r="3" fill={pulseColor} opacity="0.8">
                  <animate attributeName="opacity" from="0.8" to="0" dur="2s" fill="freeze" />
                </circle>
              </g>
            );
          })}
          
          {/* Scrolling cursor */}
          <motion.g
            animate={{ x: [W, 0] }}
            transition={{ duration: HISTORY_LEN, repeat: Infinity, ease: 'linear' }}
          >
            <line
              x1={0} y1={0} x2={0} y2={H}
              stroke={pulseColor}
              strokeWidth="1"
              opacity="0.4"
            />
          </motion.g>
        </svg>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-0 border-t border-white/5 mt-4">
        {[
          {
            label: 'Whale Volume',
            value: `${totalWhaleVolume.toFixed(0)} BTC`,
            icon: <TrendingUp className="w-4 h-4" />
          },
          {
            label: 'Flow Signal',
            value: `${inflowScore > 0 ? '+' : ''}${inflowScore.toFixed(0)}`,
            icon: inflowScore > 0 ? <TrendingDown className="w-4 h-4 text-red-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />
          },
          {
            label: 'Liquidations',
            value: liquidationTotal >= 1_000_000 ? `$${(liquidationTotal / 1_000_000).toFixed(1)}M` : `$${(liquidationTotal / 1000).toFixed(0)}K`,
            icon: <Activity className="w-4 h-4" />
          },
          {
            label: 'Satoshi Alerts',
            value: activeSatoshiAlerts.toString(),
            icon: <Brain className="w-4 h-4" />
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex flex-col items-center justify-center gap-1 p-4 border-r border-white/5 last:border-r-0">
            <div style={{ color: pulseColor }} className="opacity-60">{icon}</div>
            <p className="text-white font-black text-sm">{value}</p>
            <p className="text-white/20 text-[9px] font-mono uppercase text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

