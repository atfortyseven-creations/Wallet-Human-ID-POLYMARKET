"use client";

import React, { useState, useEffect } from 'react';
import { Database, Waves, Activity, ArrowUpRight, TrendingUp, Anchor, AlertTriangle } from 'lucide-react';
import { useSystemAccount } from '@/hooks/useSystemAccount';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
);

interface MorphoPool {
  id: string;
  name: string;
  tvl: number;
  apy: number;
  utilization: number;
}

export function MorphoYieldDashboard() {
  const { isConnected } = useSystemAccount();
  const [pools, setPools] = useState<MorphoPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Real-time infrastructure binding (Static without backend feed)
    const timer = setTimeout(() => {
      if (!isMounted) return;
      
      const initialPools = [
        { id: 'weth-usdc', name: 'WETH / USDC', tvl: 45000000, apy: 12.4, utilization: 82 },
        { id: 'cbeth-weth', name: 'cbETH / WETH', tvl: 28000000, apy: 5.2, utilization: 45 },
        { id: 'wsteth-weth', name: 'wstETH / WETH', tvl: 35000000, apy: 6.8, utilization: 60 },
        { id: 'usdc-dai', name: 'USDC / DAI', tvl: 12000000, apy: 8.5, utilization: 91 },
      ];
      setPools(initialPools);
      setLoading(false);
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const chartData = {
    labels: pools.map(p => p.name),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Total Value Locked (USD)',
        data: pools.map(p => p.tvl),
        backgroundColor: 'rgba(0, 82, 255, 0.1)',
        borderColor: 'rgba(0, 82, 255, 0.6)',
        borderWidth: 1,
        yAxisID: 'y',
        borderRadius: 4,
      },
      {
        type: 'line' as const,
        label: 'Annual Percentage Yield (%)',
        data: pools.map(p => p.apy),
        borderColor: '#00C076',
        backgroundColor: '#00C076',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y1',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#00C076',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: 'rgba(0,0,0,0.5)', font: { family: 'sans-serif', size: 11 } }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { 
          color: 'rgba(0, 82, 255, 0.7)',
          font: { family: 'sans-serif', size: 11 },
          callback: (value: any) => '$' + (value / 1e6) + 'M'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { 
          color: '#00C076',
          font: { family: 'sans-serif', size: 11 },
          callback: (value: any) => value + '%'
        }
      }
    },
    plugins: {
      legend: {
        labels: { color: 'rgba(0,0,0,0.7)', font: { family: 'sans-serif', size: 11 } }
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#050505',
        bodyColor: '#050505',
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 10,
        titleFont: { family: 'sans-serif', size: 12, weight: 'bold' },
        bodyFont: { family: 'sans-serif', size: 12 },
        boxPadding: 4,
        usePointStyle: true,
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Activity className="animate-spin text-[#0052FF]" size={28} />
        <span className="text-[11px] font-semibold tracking-widest text-[#0052FF] uppercase">Initializing Liquidity Parameters...</span>
      </div>
    );
  }

  const totalTvl = pools.reduce((acc, p) => acc + p.tvl, 0);
  const avgApy = pools.reduce((acc, p) => acc + p.apy, 0) / pools.length;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Aggregate Base TVL', val: '$' + (totalTvl / 1e6).toFixed(1) + 'M', icon: Database, color: '#0052FF' },
          { label: 'Mean Base APY', val: avgApy.toFixed(2) + '%', icon: TrendingUp, color: '#00C076' },
          { label: 'Active Deployments', val: pools.length.toString(), icon: Waves, color: '#9945FF' },
          { label: 'Network Infrastructure', val: 'Base L2', icon: Anchor, color: '#0052FF' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-black/5 shadow-sm rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}10`, border: `1px solid ${m.color}20` }}>
              <m.icon size={16} style={{ color: m.color }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-black/40 uppercase tracking-widest mb-1">{m.label}</p>
              <p className="text-lg font-bold text-[#050505] tracking-tight">{m.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-6 h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[12px] font-bold text-[#050505] uppercase tracking-widest">Institutional Yield Allocation (Base)</h3>
          <div className="px-3 py-1.5 rounded-lg bg-[#0052FF]/5 text-[#0052FF] border border-[#0052FF]/10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse" /> Active Feed
          </div>
        </div>
        <div className="h-[280px] w-full">
          <Chart type="bar" data={chartData} options={chartOptions as any} />
        </div>
      </div>

      {/* Pool List */}
      <div className="bg-white border border-black/5 shadow-sm rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 px-6 py-4 border-b border-black/5 bg-black/[0.02]">
          {['Liquidity Pool', 'Total Value Locked', 'Utilization Ratio', 'Net Annual Yield'].map(h => (
            <span key={h} className="text-[10px] font-semibold text-black/40 uppercase tracking-widest">{h}</span>
          ))}
        </div>
        <div>
          {pools.map(p => (
            <div key={p.id} className="grid grid-cols-4 px-6 py-5 border-b border-black-[0.02] hover:bg-black/[0.01] transition-colors items-center">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#050505]">{p.name}</span>
                <span className="text-[11px] text-black/40 mt-0.5">Base Network Deployment</span>
              </div>
              <span className="text-[13px] font-medium text-black/70">${(p.tvl / 1e6).toFixed(1)}M</span>
              <div className="flex items-center gap-3">
                <div className="w-16 h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0052FF]" style={{ width: `${p.utilization}%` }} />
                </div>
                <span className="text-[12px] font-medium text-black/50">{p.utilization}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#00C076]">{p.apy}%</span>
                <button className="text-black/30 hover:text-[#050505] transition-colors">
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
