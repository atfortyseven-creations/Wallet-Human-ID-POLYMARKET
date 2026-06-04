"use client";

/**
 * 
 * InstitutionalQuantChart  Epicentro 3: Quant Terminal
 * 
 * Native lightweight-charts (TradingView engine) integrated with
 * the Zustand whale event store for real-time volume visualization.
 *
 * Architecture decisions:
 * - NO React re-renders on data updates: reads store directly inside
 *   a setInterval loop and calls chart API imperatively.
 * - GPU Canvas renderer (lightweight-charts)  zero DOM overhead.
 * - Hardware-accelerated dark mode institutional palette.
 * 
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickData,
  HistogramData,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { useVIPStore } from '@/lib/vip-store';

//  Palette 
const PALETTE = {
  bg:            '#020202',
  text:          '#666666',
  grid:          'rgba(255,255,255,0.04)',
  crosshair:     '#D4AF37',
  borderScale:   'rgba(255,255,255,0.08)',
  upColor:       '#00C076',
  downColor:     '#FF3B30',
  volUp:         'rgba(0,192,118,0.28)',
  volDown:       'rgba(255,59,48,0.28)',
  accentGold:    '#D4AF37',
};

//  Time helpers 
const toDay  = (t: number) => Math.floor(t / 86400) * 86400 as Time;
const toHour = (t: number) => Math.floor(t / 3600)  * 3600  as Time;

type Resolution = '1H' | '4H' | '1D';
const RES_SECONDS: Record<Resolution, number> = { '1H': 3600, '4H': 14400, '1D': 86400 };
const RES_BARS:    Record<Resolution, number> = { '1H': 72,   '4H': 60,    '1D': 120  };

//  Candle builder 
/**
 * Builds OHLCV bars from the raw whale event feed kept in the Zustand store.
 * Each "close" is the aggregate USD volume in that bar's window.
 * This is not financial price data  it is a *volume-flow proxy chart*
 * used for visual pattern recognition of whale activity, not trading signals.
 */
function buildBarsFromStore(resolution: Resolution): {
  candles: CandlestickData[];
  volumes: HistogramData[];
} {
  const events  = useVIPStore.getState().whaleEvents ?? [];
  const interval = RES_SECONDS[resolution];
  const maxBars  = RES_BARS[resolution];

  // Collect the bucket map: timestamp  total usd volume
  const buckets = new Map<number, number[]>();
  const nowSec  = Math.floor(Date.now() / 1000);

  // Seed with empty buckets so chart always has a baseline history
  for (let i = maxBars - 1; i >= 0; i--) {
    const t = Math.floor((nowSec - i * interval) / interval) * interval;
    if (!buckets.has(t)) buckets.set(t, []);
  }

  // Inject real event volumes using EXACT field names from WhaleEvent interface:
  // ev.usdNum = parsed numeric USD, ev.ts = unix seconds timestamp
  events.forEach((ev: any) => {
    const evTime = typeof ev.ts === 'number' ? ev.ts : Math.floor(Date.now() / 1000);
    const bucket = Math.floor(evTime / interval) * interval;
    const usd    = typeof ev.usdNum === 'number' ? ev.usdNum : 0;
    if (usd > 0 && nowSec - bucket < maxBars * interval) {
      const arr = buckets.get(bucket) ?? [];
      arr.push(usd);
      buckets.set(bucket, arr);
    }
  });

  // Convert buckets  OHLCV
  const sorted = [...buckets.entries()].sort(([a], [b]) => a - b).slice(-maxBars);

  // Map net flow to a "price" proxy for visual pattern recognition
  let lastClose = 0; // Starting baseline at 0 for real net-flow attribution
  const candles: CandlestickData[] = [];
  const volumes: HistogramData[]   = [];

  sorted.forEach(([ts, vals]) => {
    // Separate Buy and Sell volume accurately using event signatures
    // (In This implementation we're using usdNum total but we can refine to net-flow buy/sell)
    // Actually, I'll use the events in the bucket to determine net direction
    const bucketEvents = events.filter((ev: any) => {
      const et = typeof ev.ts === 'number' ? ev.ts : 0;
      return Math.floor(et / interval) * interval === ts;
    });

    const buyVol  = bucketEvents.filter((e: any) => e.action === 'BUY'  || e.action === 'COMPRA').reduce((s, e: any) => s + (e.usdNum || 0), 0);
    const sellVol = bucketEvents.filter((e: any) => e.action === 'SELL' || e.action === 'VENTA').reduce((s, e: any) => s + (e.usdNum || 0), 0);
    const netFlow = buyVol - sellVol;
    const totalVol = buyVol + sellVol;

    const open  = lastClose;
    const close = lastClose + netFlow;
    const high  = Math.max(open, close);
    const low   = Math.min(open, close);
    lastClose   = close;

    const isUp = close >= open;
    candles.push({ time: ts as Time, open, high, low, close });
    volumes.push({ time: ts as Time, value: totalVol || 0, color: isUp ? PALETTE.volUp : PALETTE.volDown });
  });

  return { candles, volumes };
}

//  Main Component 
export function InstitutionalQuantChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const candleRef    = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef    = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [resolution, setResolution] = useState<Resolution>('4H');
  const [lastUpdate,  setLastUpdate]  = useState<string>('');
  const [evCount,    setEvCount]    = useState(0);

  //  Initialize chart (once, on mount) 
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: PALETTE.bg },
        textColor:  PALETTE.text,
        fontFamily: "'Roboto Mono', 'Inter', monospace",
        fontSize:   10,
      },
      grid: {
        vertLines: { color: PALETTE.grid },
        horzLines: { color: PALETTE.grid },
      },
      width:  containerRef.current.clientWidth,
      height: 480,
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: PALETTE.crosshair, style: 3, labelBackgroundColor: PALETTE.accentGold },
        horzLine: { width: 1, color: PALETTE.crosshair, style: 3, labelBackgroundColor: PALETTE.accentGold },
      },
      rightPriceScale: {
        borderColor: PALETTE.borderScale,
        scaleMargins: { top: 0.08, bottom: 0.30 },
      },
      timeScale: {
        borderColor:    PALETTE.borderScale,
        timeVisible:    true,
        secondsVisible: false,
        tickMarkFormatter: (time: any) => {
          const d = new Date(time * 1000);
          return d.getUTCHours() === 0
            ? `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
            : `${String(d.getUTCHours()).padStart(2, '0')}:00`;
        },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale:  { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor:       PALETTE.upColor,
      downColor:     PALETTE.downColor,
      borderVisible: false,
      wickUpColor:   PALETTE.upColor,
      wickDownColor: PALETTE.downColor,
    });

    const volume = chart.addSeries(HistogramSeries, {
      color:        PALETTE.accentGold,
      priceFormat:  { type: 'volume' },
      priceScaleId: 'vol',
    });
    chart.priceScale('vol').applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    chartRef.current   = chart;
    candleRef.current  = candle;
    volumeRef.current  = volume;

    // Resize observer  GPU compositor remap on panel size change
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        chart.applyOptions({ width: e.contentRect.width });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current  = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  //  Active data injection loop 
  const injectData = useCallback(() => {
    if (!candleRef.current || !volumeRef.current) return;
    const { candles, volumes } = buildBarsFromStore(resolution);
    if (!candles.length) return;

    candleRef.current.setData(candles);
    volumeRef.current.setData(volumes);
    chartRef.current?.timeScale().scrollToRealTime();

    setLastUpdate(new Date().toLocaleTimeString());
    setEvCount(useVIPStore.getState().whaleEvents?.length ?? 0);
  }, [resolution]);

  // Inject on mount + whenever resolution changes
  useEffect(() => {
    injectData();
  }, [injectData]);

  // Refresh every 8 seconds to capture new whale events without re-mounting
  useEffect(() => {
    const id = setInterval(injectData, 8_000);
    return () => clearInterval(id);
  }, [injectData]);

  //  Render 
  return (
    <div className="w-full flex flex-col gap-4 text-white">

      {/*  Terminal Header  */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#888888]">
            WHALE FLOW TERMINAL
          </h2>
          <p className="text-[9px] font-mono text-[#444444] uppercase tracking-wider">
            Volume-proxy chart · {evCount} events in store · Last update: {lastUpdate}
          </p>
        </div>

        {/* Resolution buttons */}
        <div className="flex items-center gap-2">
          {(['1H', '4H', '1D'] as Resolution[]).map(r => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${
                resolution === r
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-white/5 text-[#888888] hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {r}
            </button>
          ))}
          {/* Active pulse */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      {/*  Chart Canvas  */}
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden border border-white/8 shadow-2xl"
        style={{ minHeight: 480 }}
      />

      {/*  Legend strip  */}
      <div className="flex items-center justify-between text-[8.5px] font-mono text-[#444444] uppercase tracking-widest px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#00C076] inline-block rounded" />
            Buy Flow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#FF3B30] inline-block rounded" />
            Sell Flow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2 bg-[#D4AF37]/40 inline-block rounded" />
            Volume Bars
          </span>
        </div>
        <span>WHALE ALERT NETWORK · INSTITUTIONAL ENGINE</span>
      </div>
    </div>
  );
}
