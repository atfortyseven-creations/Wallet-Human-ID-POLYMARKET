"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowDown, ArrowUp, Minus, TrendingUp, TrendingDown } from 'lucide-react';

interface FlowData {
  netFlowScore: number;     // -100 (outflow) to +100 (inflow)
  direction: 'INFLOW_DOMINANT' | 'OUTFLOW_DOMINANT' | 'NEUTRAL';
  sentiment: 'bearish' | 'bullish' | 'neutral';
  mempoolSizeMb: number;
  avgFeeSat: number;
  totalPendingTxs: number;
  historicalPoints: { time: number; inflow: number; outflow: number; blockHeight: number; }[];
  updatedAt: number;
  error?: string;
}

function CockpitNeedle({ score }: { score: number }) {
  // Map -100 to 100  -135° to 135°
  const angle = (score / 100) * 135;
  
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Outer ring */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
      
      {/* Arc segments */}
      {/* Outflow zone (left, green) */}
      <path d="M 20 100 A 80 80 0 0 1 65 27" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="8" strokeLinecap="round" />
      {/* Neutral zone (center, gray) */}
      <path d="M 65 27 A 80 80 0 0 1 135 27" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />  
      {/* Inflow zone (right, red) */}
      <path d="M 135 27 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="8" strokeLinecap="round" />
      
      {/* Labels */}
      <text x="18" y="118" fill="rgba(16,185,129,0.7)" fontSize="9" fontWeight="bold">OUT</text>
      <text x="100" y="30" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9">NEUTRAL</text>
      <text x="170" y="118" fill="rgba(239,68,68,0.7)" fontSize="9" fontWeight="bold">IN</text>
      
      {/* Tick marks */}
      {[-135, -90, -45, 0, 45, 90, 135].map((deg) => {
        const rad = (deg - 90) * Math.PI / 180;
        const x1 = 100 + 74 * Math.cos(rad);
        const y1 = 100 + 74 * Math.sin(rad);
        const x2 = 100 + 82 * Math.cos(rad);
        const y2 = 100 + 82 * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />;
      })}
      
      {/* Needle */}
      <motion.g
        animate={{ rotate: angle }}
        transition={{ type: 'spring', stiffness: 60, damping: 12 }}
        style={{ transformOrigin: '100px 100px' }}
      >
        <line x1="100" y1="100" x2="100" y2="30" stroke={
          score > 20 ? '#ef4444' : score < -20 ? '#10b981' : '#94a3b8'
        } strokeWidth="3" strokeLinecap="round" />
        <polygon points="100,28 97,40 103,40" fill={
          score > 20 ? '#ef4444' : score < -20 ? '#10b981' : '#94a3b8'
        } />
      </motion.g>
      
      {/* Center pivot */}
      <circle cx="100" cy="100" r="6" fill={score > 20 ? '#ef4444' : score < -20 ? '#10b981' : '#475569'} />
      
      {/* Center score */}
      <text x="100" y="148" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
        {score > 0 ? '+' : ''}{score.toFixed(0)}
      </text>
    </svg>
  );
}

export function InflowOutflowCockpit() {
  const [data, setData] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevScore, setPrevScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/network/whale/inflow-outflow');
        if (res.ok) {
          const json: FlowData = await res.json();
          if (!json.error) {
            setPrevScore(data?.netFlowScore ?? null);
            setData(json);
          }
        }
      } catch (e) {}
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const isInflow = data?.direction === 'INFLOW_DOMINANT';
  const isOutflow = data?.direction === 'OUTFLOW_DOMINANT';
  const score = data?.netFlowScore ?? 0;

  return (
    <div className={`w-full rounded-3xl border overflow-hidden transition-all duration-1000 ${
      isInflow ? 'bg-[#100505] border-red-900/30' :
      isOutflow ? 'bg-[#030d06] border-emerald-900/30' :
      'bg-[#070a0f] border-white/5'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isInflow ? 'bg-indigo-500/10 border-indigo-500/20' :
            isOutflow ? 'bg-emerald-500/10 border-emerald-500/20' :
            'bg-white/5 border-white/5'
          }`}>
            <Compass className={`w-5 h-5 ${isInflow ? 'text-red-400' : isOutflow ? 'text-emerald-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">Flow Cockpit</h3>
            <p className="text-white/30 text-xs font-mono">BTC Exchange Inflow / Outflow</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          isInflow ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' :
          isOutflow ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
          'border-white/10 bg-white/5 text-gray-400'
        }`}>
          {isInflow ? <TrendingDown className="w-3 h-3" /> : isOutflow ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span className="text-xs font-black uppercase tracking-wider">{data?.sentiment ?? 'neutral'}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Cockpit Gauge */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[180px] aspect-square">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                </div>
              ) : (
                <CockpitNeedle score={score} />
              )}
            </div>
            <div className="text-center mt-2">
              <p className={`text-2xl font-black ${isInflow ? 'text-red-400' : isOutflow ? 'text-emerald-400' : 'text-gray-400'}`}>
                {isInflow ? '️ SELL' : isOutflow ? ' ACCUMULATION' : ' NEUTRAL'}
              </p>
              <p className="text-white/20 text-xs mt-1">Net flow signal</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col justify-center gap-4">
            {[
              { label: 'Mempool Size', value: data ? `${data.mempoolSizeMb.toFixed(1)} MB` : '--', icon: '' },
              { label: 'Avg Fee', value: data ? `${(data.avgFeeSat / 1000).toFixed(0)} sat/kB` : '--', icon: '' },
              { label: 'Pending Txs', value: data ? data.totalPendingTxs.toLocaleString() : '--', icon: '' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <div>
                  <p className="text-white/20 text-[10px] font-mono uppercase">{label}</p>
                  <p className="text-white font-black">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical mini bars */}
        {data?.historicalPoints && data.historicalPoints.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-white/20 text-[10px] font-mono uppercase mb-2">Flow history  last 12 blocks</p>
            <div className="flex items-end gap-1 h-12">
              {data.historicalPoints.map((pt, i) => {
                const netFlow = pt.outflow - pt.inflow;
                const isOut = netFlow > 0;
                const h = Math.min(100, Math.abs(netFlow) / 1000);
                return (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ height: `${Math.max(8, h)}%` }}
                    className={`flex-1 rounded-sm origin-bottom ${isOut ? 'bg-emerald-500/50' : 'bg-indigo-500/50'}`}
                    title={`Block ${pt.blockHeight}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

