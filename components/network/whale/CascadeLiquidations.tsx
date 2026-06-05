"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, TrendingDown, TrendingUp, Zap } from 'lucide-react';

interface LiquidationPoint {
  time: number;
  longLiquidations: number;
  shortLiquidations: number;
  total: number;
  isSynthetic?: boolean;
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface SparkProps { value: number; max: number; isLong: boolean; }
function Spark({ value, max, isLong }: SparkProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <motion.div
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ height: `${Math.max(4, pct)}%` }}
      className={`w-full rounded-t-sm origin-bottom ${isLong ? 'bg-indigo-500' : 'bg-green-500'}`}
    />
  );
}

export function CascadeLiquidations() {
  const [data, setData] = useState<LiquidationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSpike, setLastSpike] = useState<LiquidationPoint | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/network/whale/liquidations');
        if (res.ok) {
          const json = await res.json();
          const points: LiquidationPoint[] = (json.liquidations || []).reverse();
          setData(points);
          
          // Find spike
          const maxTotal = Math.max(...points.map(p => p.total));
          const spike = points.find(p => p.total === maxTotal);
          if (spike && maxTotal > 100_000) setLastSpike(spike);
        }
      } catch (e) {}
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalLongs = data.reduce((s, p) => s + p.longLiquidations, 0);
  const totalShorts = data.reduce((s, p) => s + p.shortLiquidations, 0);
  const maxTotal = Math.max(...data.map(p => p.total), 1);
  const longDominance = totalLongs + totalShorts > 0 ? (totalLongs / (totalLongs + totalShorts)) * 100 : 50;

  return (
    <div className="w-full rounded-3xl bg-[#0e0502] border border-red-900/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">Cascade Liquidations</h3>
            <p className="text-white/30 text-xs font-mono">BTC  Perpetual Futures</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1 text-indigo-400"><span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" /> Longs {formatUSD(totalLongs)}</span>
          <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Shorts {formatUSD(totalShorts)}</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Dominance Bar */}
        <div>
          <div className="flex justify-between text-xs text-white/30 mb-1.5">
            <span>Longs liquidados</span>
            <span>Shorts liquidados</span>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden flex">
            <motion.div
              animate={{ width: `${longDominance}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-l-full"
            />
            <motion.div
              animate={{ width: `${100 - longDominance}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-l from-green-500 to-green-400 rounded-r-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/20 mt-1">
            <span>{longDominance.toFixed(0)}%</span>
            <span>{(100 - longDominance).toFixed(0)}%</span>
          </div>
        </div>

        {/* Waterfall Chart */}
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-red-400 to-transparent"
              />
            </div>
          </div>
        ) : (
          <div className="relative h-40">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} className="absolute w-full border-t border-white/3" style={{ bottom: `${pct}%` }} />
            ))}
            
            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-1">
              {data.slice(-24).map((point, i) => (
                <div key={i} className="flex-1 flex flex-col gap-0.5 items-center h-full justify-end">
                  <Spark value={point.longLiquidations} max={maxTotal} isLong={true} />
                  <Spark value={point.shortLiquidations} max={maxTotal} isLong={false} />
                  
                  {/* Spark explosion on high totals */}
                  {point.total === Math.max(...data.map(p => p.total)) && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute bottom-0 w-4 h-4 bg-yellow-400/20 rounded-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spike Alert */}
        <AnimatePresence>
          {lastSpike && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3"
            >
              <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">Pico de liquidaciones detectado</p>
                <p className="text-white/40 text-xs">{formatUSD(lastSpike.total)} en {new Date(lastSpike.time).toLocaleTimeString()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

