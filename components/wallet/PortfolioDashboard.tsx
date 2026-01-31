"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { getPortfolio, getPortfolioHistory, getPortfolioMetrics, exportPortfolioToCSV, type PortfolioSummary, type PortfolioHistory, type PortfolioMetrics } from '@/lib/wallet/portfolio';
import { getChainName } from '@/lib/wallet/chains';

interface PortfolioDashboardProps {
  walletAddress: string;
  chainIds?: number[];
}

export default function PortfolioDashboard({ walletAddress, chainIds }: PortfolioDashboardProps) {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<PortfolioHistory[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, [walletAddress, chainIds]);

  useEffect(() => {
    loadHistory();
  }, [period]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const [portfolioData, metricsData] = await Promise.all([
        getPortfolio(walletAddress, chainIds),
        getPortfolioMetrics(walletAddress),
      ]);
      
      setPortfolio(portfolioData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await getPortfolioHistory(walletAddress, period);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleExport = () => {
    if (!portfolio) return;
    
    const csv = exportPortfolioToCSV(portfolio);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !portfolio || !metrics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1F1F1F] border-t-transparent" />
      </div>
    );
  }

  const isPositive = portfolio.change24hPercent >= 0;

  return (
    <div className="space-y-6">
      {/* Header with total value */}
      <div className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm text-[#1F1F1F]/70 mb-1">Total Portfolio Value</h2>
            <div className="text-4xl font-black text-[#1F1F1F]">
              ${portfolio.totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={handleExport}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-all"
            title="Export to CSV"
          >
            <Download size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="font-bold">
              {isPositive ? '+' : ''}{portfolio.change24hPercent.toFixed(2)}%
            </span>
          </div>
          <div className="text-sm text-[#1F1F1F]/70">
            {isPositive ? '+' : ''}{portfolio.change24hUSD.toFixed(2)} USD (24h)
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[#1F1F1F]">Portfolio History</h3>
          
          <div className="flex gap-2">
            {(['24h', '7d', '30d', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  period === p
                    ? 'bg-[#1F1F1F] text-[#EAEADF]'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <PortfolioChart history={history} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="24h Change" value={`${metrics.change24h >= 0 ? '+' : ''}${metrics.change24h.toFixed(2)}%`} isPositive={metrics.change24h >= 0} />
        <MetricCard label="7d Change" value={`${metrics.change7d >= 0 ? '+' : ''}${metrics.change7d.toFixed(2)}%`} isPositive={metrics.change7d >= 0} />
        <MetricCard label="30d Change" value={`${metrics.change30d >= 0 ? '+' : ''}${metrics.change30d.toFixed(2)}%`} isPositive={metrics.change30d >= 0} />
        <MetricCard label="Avg Daily" value={`${metrics.averageDailyChange >= 0 ? '+' : ''}${metrics.averageDailyChange.toFixed(2)}%`} isPositive={metrics.averageDailyChange >= 0} />
      </div>

      {/* Top Assets */}
      <div className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="font-black text-[#1F1F1F] mb-4">Assets Breakdown</h3>
        
        <div className="space-y-2">
          {portfolio.assets.slice(0, 10).map((asset, index) => (
            <AssetRow key={`${asset.chainId}-${asset.tokenAddress}-${index}`} asset={asset} />
          ))}
        </div>

        {portfolio.assets.length > 10 && (
          <div className="text-center mt-4 text-sm text-[#1F1F1F]/70">
            +{portfolio.assets.length - 10} more assets
          </div>
        )}
      </div>

      {/* Chain Distribution */}
      <div className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="font-black text-[#1F1F1F] mb-4">Chain Distribution</h3>
        
        <div className="space-y-3">
          {Object.entries(portfolio.chainBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([chainId, value]) => {
              const percentage = (value / portfolio.totalValueUSD) * 100;
              
              return (
                <div key={chainId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#1F1F1F]">{getChainName(parseInt(chainId))}</span>
                    <span className="text-sm text-[#1F1F1F]/70">${value.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-[#1F1F1F]"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, isPositive }: { label: string; value: string; isPositive: boolean }) {
  return (
    <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1F1F1F]/10">
      <div className="text-xs text-[#1F1F1F]/70 mb-1">{label}</div>
      <div className={`text-xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {value}
      </div>
    </div>
  );
}

// Asset Row Component
function AssetRow({ asset }: { asset: any }) {
  const isPositive = (asset.change24h || 0) >= 0;
  
  return (
    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-[#1F1F1F] rounded-full flex items-center justify-center">
          <span className="text-[#EAEADF] font-bold text-sm">{asset.symbol[0]}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#1F1F1F] truncate">{asset.symbol}</div>
          <div className="text-xs text-[#1F1F1F]/70 truncate">{getChainName(asset.chainId)}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-[#1F1F1F]">${asset.valueUSD.toFixed(2)}</div>
        <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{asset.change24h?.toFixed(2)}%
        </div>
      </div>

      <div className="text-sm text-[#1F1F1F]/70 ml-4 w-16 text-right">
        {asset.percentage.toFixed(1)}%
      </div>
    </div>
  );
}

// Simple chart component using SVG
function PortfolioChart({ history }: { history: PortfolioHistory[] }) {
  if (history.length === 0) return null;

  const values = history.map(h => h.totalValueUSD);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const width = 800;
  const height = 200;
  const padding = 20;

  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((h.totalValueUSD - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const isPositive = values[values.length - 1] >= values[0];

  return (
    <div className="w-full h-48 relative">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padding - ratio * (height - 2 * padding);
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#1F1F1F"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fill */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={isPositive ? '#10b981' : '#ef4444'}
          fillOpacity="0.1"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
