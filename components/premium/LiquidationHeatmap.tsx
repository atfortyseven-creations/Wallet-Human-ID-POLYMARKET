"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, RefreshCw, Info } from 'lucide-react';
import { useMarketStore } from '@/store/useMarketStore';
import { createChart, ColorType, IChartApi, ISeriesApi, Time, AreaSeries } from 'lightweight-charts';

const TIMEFRAME_MAP: Record<string, string> = {
  '1h': '1m',
  '4h': '5m',
  '24h': '15m',
  '7d': '1h',
};

async function fetchBinanceKlines(symbol: string, interval: string, limit = 200) {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const raw: any[][] = await res.json();
    if (!Array.isArray(raw)) return [];

    const klines = raw.map((k: any) => ({
      time: Math.floor(Number(k[0]) / 1000) as Time,
      value: parseFloat(k[4]), // close price
    }));

    // Ensure strict ascending chronology required by Lightweight-Charts to prevent React crashing
    return klines.filter((k, i, arr) => i === 0 || k.time > arr[i - 1].time);
  } catch (err) {
    return []; // Suppress all generic DOM exceptions
  }
}

export default function LiquidationHeatmap() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const seriesInstance = useRef<ISeriesApi<"Area"> | null>(null);
  
  const { currentPrice, bids, asks } = useMarketStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [liquidityThreshold, setLiquidityThreshold] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  // Initialize LightweightCharts
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const handleResize = () => {
      chartInstance.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: 'rgba(255,255,255,0.5)' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderVisible: false },
    });
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#B37FEB',
      topColor: 'rgba(179,127,235,0.4)',
      bottomColor: 'rgba(179,127,235,0.0)',
      lineWidth: 2,
    });
    chartInstance.current = chart;
    seriesInstance.current = areaSeries;
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, []);

  // REAL DATA: fetch Binance Klines on timeframe change or manual refresh
  useEffect(() => {
    if (!seriesInstance.current) return;
    const interval = TIMEFRAME_MAP[selectedTimeframe] || '15m';
    
    setIsRefreshing(true);
    fetchBinanceKlines('BTCUSDT', interval, 200)
      .then(klines => {
        seriesInstance.current?.setData(klines);
        setLastUpdateTime(new Date().toLocaleTimeString());
        setIsRefreshing(false);
      })
      .catch(err => {
        console.error('[Heatmap Klines] Binance fetch failed:', err);
        setIsRefreshing(false);
      });
  }, [selectedTimeframe]);

  // REAL DATA: append newest point from live WS price feed (do NOT replace full dataset)
  useEffect(() => {
    if (!seriesInstance.current || currentPrice === 0) return;
    const now = Math.floor(Date.now() / 1000) as Time;
    try {
      seriesInstance.current.update({ time: now, value: currentPrice });
    } catch {
      // Lightweight charts can throw if time is not strictly increasing  suppress silently.
    }
  }, [currentPrice]);

  const maxDepth = useMemo(() => {
    const topBidsVolume = bids.reduce((acc, curr) => acc + curr.amount, 0);
    const topAsksVolume = asks.reduce((acc, curr) => acc + curr.amount, 0);
    return Math.max(topBidsVolume, topAsksVolume, 1) / 1000;
  }, [bids, asks]);

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-premium p-4 rounded-3xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-white font-bold text-sm">
            BTC/USDT <span className="text-[10px] text-[#e0ff00] uppercase tracking-widest ml-2">Active WS</span>
          </div>
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 gap-1">
            {Object.keys(TIMEFRAME_MAP).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedTimeframe === tf ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-xs font-bold text-white/40 uppercase">Depth Threshold</span>
            <input
              type="range" min="0" max="5" step="0.1"
              value={liquidityThreshold}
              onChange={(e) => setLiquidityThreshold(parseFloat(e.target.value))}
              className="w-32 accent-purple-500"
            />
            <span className="text-xs font-black text-purple-400 min-w-[20px]">{liquidityThreshold}</span>
          </div>
          <button
            onClick={() => setSelectedTimeframe(t => t)} // re-trigger effect
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-purple-400' : 'text-white/40'} />
          </button>
          {lastUpdateTime && (
            <span className="text-[10px] font-mono text-white/30">Updated {lastUpdateTime}</span>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative glass-premium rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a051a]">
        <div className="flex">
          {/* Real-time Orderbook Depth Visualizer */}
          <div className="w-20 border-r border-white/5 flex flex-col justify-center items-center py-6 gap-2 bg-black/40 relative z-20">
            <div className="text-[10px] font-black text-purple-400 mb-2 uppercase tracking-tighter w-full text-center">Depth</div>
            <div className="flex-1 w-full flex flex-col justify-end items-center gap-[1px]">
              {asks.slice(0, 25).reverse().map((a, i) => (
                <div key={'a'+i} className="w-full flex justify-end" style={{ opacity: Math.min(1, (a.amount / 5) * liquidityThreshold) }}>
                  <div className="h-[2px] bg-red-500" style={{ width: `${Math.min(100, (a.amount / 2) * 100)}%` }} />
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-white w-full text-center py-2 bg-white/5">
              ${currentPrice.toFixed(0)}
            </div>
            <div className="flex-1 w-full flex flex-col justify-start items-center gap-[1px]">
              {bids.slice(0, 25).map((b, i) => (
                <div key={'b'+i} className="w-full flex justify-end" style={{ opacity: Math.min(1, (b.amount / 5) * liquidityThreshold) }}>
                  <div className="h-[2px] bg-green-500" style={{ width: `${Math.min(100, (b.amount / 2) * 100)}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex-1 relative min-h-[500px]" ref={chartContainerRef}>
            {currentPrice === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-30">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                <span className="text-xs font-black tracking-widest text-purple-400 uppercase">Awaiting Binance WebSocket...</span>
              </motion.div>
            )}
            <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-30 select-none pointer-events-none z-10">
              <span className="text-xs font-black tracking-widest text-purple-400 uppercase italic">Binance Klines · Active WS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-premium p-6 rounded-[2rem] border border-white/5 flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Info size={24} /></div>
          <div>
            <h4 className="font-bold mb-1">Active Binance Orderbook</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              Historical data from Binance Klines REST API. Active price appended from WebSocket stream. 0 mock data.
            </p>
          </div>
        </div>
        <div className="glass-premium p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Data Source</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-green-400">api.binance.com</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Depth Max Pool</span>
            <div className="font-mono text-xs font-bold text-purple-400 mt-1">{maxDepth.toFixed(2)}k BTC</div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .glass-premium { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}
