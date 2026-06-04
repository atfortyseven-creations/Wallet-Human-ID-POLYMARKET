"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries, ColorType } from 'lightweight-charts';
import { TrendingUp, TrendingDown, Activity, Wifi } from 'lucide-react';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
interface TradingViewChartProps {
  symbol: string; // e.g., "ETHUSDT"
  days?: number; // Not strictly used for WS, but kept for interface compatibility
  height?: number;
  transfers?: Array<{
    timestamp: number;
    amount: number;
    type: 'BUY' | 'SELL' | 'TRANSFER';
    price?: number;
  }>;
}

interface PriceStats {
  current: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
}

export default function TradingViewChart({ symbol = "ETHUSDT", height = 400, transfers = [] }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial Data Load & Chart Setup
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#1F1F1F',
      },
      grid: {
        vertLines: { color: 'rgba(31, 31, 31, 0.05)' },
        horzLines: { color: 'rgba(31, 31, 31, 0.05)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(31, 31, 31, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(31, 31, 31, 0.1)',
      },
      crosshair: {
        mode: 1, // Magnet mode
      }
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = series;

    // 2. Fetch Initial History (REST API via Proxy)
    const loadHistory = async () => {
      const endpoints = [
        `/api/proxy/binance?symbol=${symbol.toUpperCase()}&interval=1m&limit=500`,
        `https://api1.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=500`,
        `https://api2.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=500`,
        `https://api3.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=500`
      ];

      setLoading(true);
      setError(null);

      for (const url of endpoints) {
        try {
          console.log(`[CHART-FETCH] Attempting: ${url}`);
          const res = await fetch(url);
          if (!res.ok) continue;
          
          const data = await res.json();
          if (data.error || !Array.isArray(data)) continue;

          const formattedData: CandlestickData[] = data.map((d: any) => ({
            time: (d[0] / 1000) as Time,
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
          }));

          series.setData(formattedData);
          
          // Add Markers if transfers exist
          if (transfers.length > 0) {
              const markers: any[] = transfers.map(tx => ({
                  time: (tx.timestamp / 1000) as Time,
                  position: tx.type === 'BUY' ? 'belowBar' : (tx.type === 'SELL' ? 'aboveBar' : 'inBar'),
                  color: tx.type === 'BUY' ? '#22c55e' : (tx.type === 'SELL' ? '#ef4444' : '#8b5cf6'),
                  shape: tx.type === 'BUY' ? 'arrowUp' : (tx.type === 'SELL' ? 'arrowDown' : 'circle'),
                  text: `${tx.type}  ${tx.amount.toLocaleString()}`,
                  size: 2
              })).filter(m => formattedData.some(d => d.time === m.time || Math.abs((d.time as number) - (m.time as number)) < 60));
              
              (series as any).setMarkers(markers);
          }

          const last = formattedData[formattedData.length - 1];
          const first = formattedData[0];
          setStats({
            current: last.close,
            change24h: last.close - first.close,
            changePercent: ((last.close - first.close) / first.close) * 100,
            high24h: Math.max(...formattedData.map(d => d.high)),
            low24h: Math.min(...formattedData.map(d => d.low))
          });

          chart.timeScale().setVisibleRange({
              from: (data[data.length - 100][0] / 1000) as Time,
              to: (data[data.length - 1][0] / 1000) as Time,
          });

          setLoading(false);
          return; // Success!
        } catch (err) {
          console.warn(`[CHART-ERROR] Failed ${url}:`, err);
        }
      }

      setError("Connection Refused. Try a VPN or check network.");
      setLoading(false);
    };

    loadHistory();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, height]);

  // WebSocket Connection (Real-time updates) with Polling Fallback
  useEffect(() => {
    let ws: WebSocket | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;
    let isWsActive = false;

    const startPolling = () => {
        if (pollingInterval) return;
        console.log("[CHART] Switching to HTTP Polling Mode");
        
        const fetchLatest = async () => {
            try {
                const res = await fetch(`/api/proxy/binance?symbol=${symbol.toUpperCase()}&interval=1m&limit=1`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const k = data[0];
                    const candle: CandlestickData = {
                        time: (k[0] / 1000) as Time,
                        open: parseFloat(k[1]),
                        high: parseFloat(k[2]),
                        low: parseFloat(k[3]),
                        close: parseFloat(k[4]),
                    };
                    
                    if (candlestickSeriesRef.current) {
                        candlestickSeriesRef.current.update(candle);
                    }
                    
                    setStats(prev => prev ? {
                        ...prev,
                        current: candle.close,
                    } : null);
                }
            } catch (e) {
                console.warn("[CHART-POLL] Failed", e);
            }
        };

        fetchLatest();
        pollingInterval = setInterval(fetchLatest, 5000); // Poll every 5s
    };

    try {
        if (!symbol) {
             console.log("[Legendary Chart] No symbol provided, skipping WS connection.");
             return;
        }

        const streams = [
            `${symbol.toLowerCase()}@kline_1m`,
            `${symbol.toLowerCase()}@aggTrade`
        ].join('/');

        const wsUrl = `wss://stream.binance.com/stream?streams=${streams}`;
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        // Track last candle to update it with trades
        let lastCandle: CandlestickData | null = null;

        ws.onopen = () => {
          setIsConnected(true);
          isWsActive = true;
          console.log("Connected to Binance Real-Time Stream");
        };

        ws.onmessage = (event) => {
          const payload = JSON.parse(event.data);
          const { stream, data } = payload;

          if (stream.includes('@kline')) {
            const k = data.k;
            const candle: CandlestickData = {
              time: (k.t / 1000) as Time,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
            };
            lastCandle = candle; // Sync authoritative state
            
            if (candlestickSeriesRef.current) {
              candlestickSeriesRef.current.update(candle);
            }

            // Update stats
            setStats(prev => prev ? {
                ...prev,
                current: parseFloat(k.c),
            } : null);
          }

          if (stream.includes('@aggTrade') && lastCandle) {
              const price = parseFloat(data.p);
              
              const updatedCandle = {
                  ...lastCandle,
                  close: price,
                  high: Math.max(lastCandle.high as number, price),
                  low: Math.min(lastCandle.low as number, price)
              };
              lastCandle = updatedCandle;

              if (candlestickSeriesRef.current) {
                  candlestickSeriesRef.current.update(updatedCandle);
              }
              
               setStats(prev => prev ? {
                ...prev,
                current: price,
            } : null);
          }
        };

        ws.onerror = (e) => {
          // [LEGENDARY] Silent Failover Protocol
          // We don't spam console.error for network glitches, we just switch to polling.
          console.warn("[Legendary Chart] Real-time stream unavailable, activating HTTP fallback protocol.");
          setIsConnected(false);
          isWsActive = false;
          // Trigger fallback
          startPolling();
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (isWsActive) {
             console.log("WS Closed, connection lost.");
          }
        };

    } catch (e) {
        console.error("WS Setup Failed:", e);
        startPolling();
    }

    return () => {
      if (ws) ws.close();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [symbol]);

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Price (Binance)"
            value={`$${safeToLocaleString(stats.current, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-[#ef4444]/40'}`} />}
          />
           <StatCard // Placeholder for 24h as we only stream Klines
            label="Approx 24h Change"
            value={`${stats.changePercent >= 0 ? '+' : ''}${safeToFixed(stats.changePercent, 2)}%`}
            icon={stats.changePercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            trend={stats.changePercent >= 0 ? 'up' : 'down'}
          />
           <StatCard
            label="High"
            value={`$${safeToLocaleString(stats.high24h, { minimumFractionDigits: 0 })}`}
            icon={<Activity size={16} />}
          />
           <StatCard
            label="Low"
            value={`$${safeToLocaleString(stats.low24h, { minimumFractionDigits: 0 })}`}
            icon={<Activity size={16} />}
          />
        </div>
      )}

      {/* Chart Container */}
      <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#1F1F1F]/10">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ef4444] border-t-transparent" />
          </div>
        )}

        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
                <p className="text-[#ef4444] font-bold">{error}</p>
            </div>
        )}
        
        <div ref={chartContainerRef} />
        
        {/* Connection Status Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-2 py-1 bg-white/80 rounded-md shadow-sm border border-gray-100">
            <Wifi size={14} className={isConnected ? "text-[#ef4444]" : "text-gray-400"} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {isConnected ? 'LIVE FEED' : 'CONNECTING...'}
            </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string; value: string; icon: React.ReactNode; trend?: 'up' | 'down' }) {
  return (
    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-[#1F1F1F]/10">
      <div className="flex items-center gap-2 mb-1 text-[#1F1F1F]/70">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className={`text-lg font-black ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-[#1F1F1F]'}`}>
        {value}
      </div>
    </div>
  );
}

