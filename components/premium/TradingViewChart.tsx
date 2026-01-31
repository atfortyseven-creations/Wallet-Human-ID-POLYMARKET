"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  days?: number;
  height?: number;
}

interface PriceStats {
  current: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
}

export default function TradingViewChart({ symbol, days = 7, height = 400 }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#1F1F1F',
      },
      grid: {
        vertLines: { color: 'rgba(31, 31, 31, 0.05)' },
        horzLines: { color: 'rgba(31, 31, 31, 0.05)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(31, 31, 31, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(31, 31, 31, 0.1)',
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Fetch data
    fetchPriceData();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, days]);

  const fetchPriceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/prices/historical?symbol=${symbol}&days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        throw new Error('No price data available');
      }

      // Transform data for TradingView
      const chartData: CandlestickData[] = data.data.map((point: any) => ({
        time: Math.floor(point.timestamp / 1000) as Time,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }));

      // Set data to chart
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(chartData);
      }

      // Calculate stats
      const firstPoint = data.data[0];
      const lastPoint = data.data[data.data.length - 1];
      const change24h = lastPoint.close - firstPoint.close;
      const changePercent = (change24h / firstPoint.close) * 100;
      const high24h = Math.max(...data.data.map((p: any) => p.high));
      const low24h = Math.min(...data.data.map((p: any) => p.low));

      setStats({
        current: data.currentPrice || lastPoint.close,
        change24h,
        changePercent,
        high24h,
        low24h,
      });

      setLoading(false);
    } catch (err) {
      console.error('Chart fetch error:', err);
      setError('Failed to load chart data');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      {stats && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Current Price"
            value={`$${stats.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<Activity size={16} />}
          />
          <StatCard
            label="24h Change"
            value={`${stats.changePercent >= 0 ? '+' : ''}${stats.changePercent.toFixed(2)}%`}
            subValue={`$${Math.abs(stats.change24h).toFixed(2)}`}
            icon={stats.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            trend={stats.change24h >= 0 ? 'up' : 'down'}
          />
          <StatCard
            label="24h High"
            value={`$${stats.high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUp size={16} />}
          />
          <StatCard
            label="24h Low"
            value={`$${stats.low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingDown size={16} />}
          />
        </div>
      )}

      {/* Chart Container */}
      <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#1F1F1F]/10">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-2xl z-10">
            <div className="text-center">
              <p className="text-red-600 font-bold">{error}</p>
              <button
                onClick={fetchPriceData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={chartContainerRef} />
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between text-xs text-[#1F1F1F]/70">
        <span>Symbol: {symbol}</span>
        <span>Timeframe: {days}D</span>
        <span>Powered by CoinGecko</span>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  subValue, 
  icon, 
  trend 
}: { 
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-[#1F1F1F]/10">
      <div className="flex items-center gap-2 mb-1 text-[#1F1F1F]/70">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className={`text-lg font-black ${
        trend === 'up' ? 'text-green-600' : 
        trend === 'down' ? 'text-red-600' : 
        'text-[#1F1F1F]'
      }`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-[#1F1F1F]/50 mt-0.5">{subValue}</div>
      )}
    </div>
  );
}
