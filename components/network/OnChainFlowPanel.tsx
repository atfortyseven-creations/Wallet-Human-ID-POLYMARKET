"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bitcoin, Database, TrendingUp, Activity, Coins, BarChart2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface OnChainData {
  txCountLast30d: number | null;
  avgTxValueLastMonth: number | null;
  mempoolTxCount: number | null;
  mempoolVsize: number | null;
  mempoolTotalFees: number | null;
  maxSupply: number;
  circulatingSupply: number;
  miningRewardBTC: number;
  hashrateHistory: { time: number; hashrate: number }[];
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  color: string;
  delay?: number;
}

function KPICard({ icon, label, value, sub, color, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 p-6 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-5 group-hover:opacity-10 transition-opacity"
          style={{ background: color }} />
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
            {icon}
          </div>
        </div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-2">{label}</div>
        <div className="text-2xl font-black font-mono text-white tracking-tight">{value}</div>
        {sub && <div className="text-[9px] text-white/20 font-mono uppercase tracking-widest mt-1">{sub}</div>}
      </Card>
    </motion.div>
  );
}

export function OnChainFlowPanel() {
  const { data, isLoading } = useQuery<OnChainData>({
    queryKey: ['network', 'analytics', 'onchain'],
    queryFn: async () => {
      const res = await fetch('/api/network/v1/analytics/on-chain');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 300_000, // 5 min
  });

  const supplyPercent = data
    ? ((data.circulatingSupply / data.maxSupply) * 100).toFixed(2)
    : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3">
        <div className="text-[10px] text-white/40 font-mono uppercase mb-1">
          {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div className="text-lg font-black font-mono text-indigo-400">
          {payload[0].value} EH/s
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          icon={<Bitcoin size={18} style={{ color: '#f97316' }} />}
          label="Circulating Supply"
          value={isLoading ? '' : safeToLocaleString(data?.circulatingSupply ?? 0)}
          sub={`${supplyPercent ?? ''}% of 21M cap`}
          color="#f97316"
          delay={0}
        />
        <KPICard
          icon={<Coins size={18} style={{ color: '#eab308' }} />}
          label="Block Reward"
          value={isLoading ? '' : `${data?.miningRewardBTC ?? ''} BTC`}
          sub="Post-4th halving (2024)"
          color="#eab308"
          delay={0.05}
        />
        <KPICard
          icon={<Activity size={18} style={{ color: '#10b981' }} />}
          label="Mempool Txs"
          value={isLoading ? '' : safeToLocaleString(data?.mempoolTxCount ?? 0)}
          sub="Pending confirmation"
          color="#10b981"
          delay={0.1}
        />
        <KPICard
          icon={<Database size={18} style={{ color: '#8b5cf6' }} />}
          label="Mempool vSize"
          value={isLoading ? '' : `${safeToFixed((data?.mempoolVsize ?? 0) / 1e6, 2)} MB`}
          sub="Unconfirmed vbytes"
          color="#8b5cf6"
          delay={0.15}
        />
        <KPICard
          icon={<TrendingUp size={18} style={{ color: '#06b6d4' }} />}
          label="Mempool Fees"
          value={isLoading ? '' : `${safeToFixed((data?.mempoolTotalFees ?? 0) / 1e8, 4)} BTC`}
          sub="Pending fee pool"
          color="#06b6d4"
          delay={0.2}
        />
        <KPICard
          icon={<BarChart2 size={18} style={{ color: '#ec4899' }} />}
          label="Tx Count (30d)"
          value={isLoading ? '' : safeToLocaleString(data?.txCountLast30d ?? 0)}
          sub="Monthly on-chain volume"
          color="#ec4899"
          delay={0.25}
        />
      </div>

      {/* Supply utilization bar */}
      <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
            <Bitcoin size={12} className="text-orange-400" />
            Bitcoin Supply Issuance
          </div>
          <span className="text-[10px] font-mono text-orange-400">{supplyPercent ?? ''}% issued</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${supplyPercent ?? 0}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            style={{ boxShadow: '0 0 20px rgba(251,146,60,0.4)' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-white/20 uppercase tracking-wider">
          <span>0 BTC</span>
          <span>~{safeToLocaleString(data?.circulatingSupply ?? 19850000)} mined</span>
          <span>21,000,000 BTC cap</span>
        </div>
      </Card>

      {/* Hashrate sparkline */}
      {data?.hashrateHistory && data.hashrateHistory.length > 0 && (
        <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 p-6">
          <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Activity size={12} className="text-indigo-400" />
            Hashrate (3Y Trend)  EH/s
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hashrateHistory}>
                <defs>
                  <linearGradient id="hrGradOC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  tick={{ fill: '#444', fontSize: 9, fontFamily: 'monospace', fontWeight: 900 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#444', fontSize: 9, fontFamily: 'monospace', fontWeight: 900 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hashrate"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#hrGradOC)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1', stroke: '#000', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

