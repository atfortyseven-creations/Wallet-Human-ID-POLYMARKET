"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

interface OIDataPoint {
  timestamp: number;
  dateLabel: string;
  openInterest: number;       // Binance OI (USD)
  openInterestBybit: number;  // Bybit OI (USD)
  openInterestTotal: number;  // Combined
  btcPrice: number;           // REAL per-day close price from klines
  openInterestEur: number;
  btcPriceEur: number;
}

const EXCHANGES = [
  { id: "binance", name: "Binance", color: "#f59e0b", icon: "" },
  { id: "bybit", name: "Bybit", color: "#8b5cf6", icon: "" },
  { id: "okx", name: "OKX", color: "#06b6d4", icon: "" },
  { id: "bitget", name: "Bitget", color: "#10b981", icon: "" },
  { id: "dydx", name: "dYdX", color: "#f97316", icon: "" },
];

type Currency = "EUR" | "USD";

function formatAxisValue(value: number, currency: Currency): string {
  const symbol = currency === "EUR" ? "" : "$";
  if (value >= 1e9) return symbol + (value / 1e9).toFixed(1) + "B";
  if (value >= 1e6) return symbol + (value / 1e6).toFixed(0) + "M";
  return symbol + value.toFixed(0);
}

const CustomTooltip = ({
  active, payload, label, currency
}: {
  active?: boolean; payload?: any[]; label?: string; currency: Currency;
}) => {
  if (!active || !payload?.length) return null;
  const sym = currency === "EUR" ? "" : "$";

  return (
    <div className="bg-[var(--aztec-ink)]/95 backdrop-blur-xl border border-[var(--aztec-parchment)]/10 rounded-2xl p-4 shadow-2xl min-w-[220px]">
      <p className="text-[10px] font-mono text-slate-400 mb-3 uppercase tracking-widest">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-[10px] font-mono text-[var(--aztec-parchment)]/60">{entry.name}</span>
          </div>
          <span className="text-[10px] font-black text-[var(--aztec-parchment)] font-mono">
            {entry.name === "BTC Price"
              ? sym + Number(entry.value).toLocaleString()
              : sym + (Number(entry.value) / 1e9).toFixed(2) + "B"
            }
          </span>
        </div>
      ))}
    </div>
  );
};

export function ExchangeBTCOpenInterest() {
  const [data, setData] = useState<OIDataPoint[]>([]);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eurRate, setEurRate] = useState(0.92);
  const [currentStats, setCurrentStats] = useState<{
    totalOI: number; binanceOI: number; bybitOI: number; btcPrice: number; change24h: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // Use standard AbortController for iOS 15 compatibility
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch("/api/vip/oi-history", {
        signal: ctrl.signal,
      });
      clearTimeout(tid);

      if (!res.ok) {
        setError("OI history data unavailable. Retrying...");
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (!json.data || json.data.length === 0) {
        setError("No OI data returned from exchange.");
        setLoading(false);
        return;
      }

      const rate = json.eurRate ?? 0.92;
      setEurRate(rate);

      const points: OIDataPoint[] = json.data.map((item: any) => ({
        timestamp: item.timestamp,
        dateLabel: item.dateLabel,
        openInterest: item.openInterestBinance,
        openInterestBybit: item.openInterestBybit,
        openInterestTotal: item.openInterestTotal,
        // REAL per-day BTC closing price  not the same value repeated
        btcPrice: item.btcClose,
        openInterestEur: item.openInterestTotal * rate,
        btcPriceEur: item.btcClose * rate,
      }));

      setData(points);
      const last = points[points.length - 1];
      setCurrentStats({
        totalOI: last?.openInterestTotal ?? 0,
        binanceOI: last?.openInterest ?? 0,
        bybitOI: (last as any)?.openInterestBybit ?? 0,
        btcPrice: json.currentBtcPrice ?? last?.btcPrice ?? 0,
        change24h: json.change24h ?? 0,
      });
    } catch (e) {
      console.error("[OI Chart] fetch error", e);
      // No Math.random() fallback  show error state
      if (data.length === 0) setError("OI data temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [data.length]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sym = currency === "EUR" ? "" : "$";
  const oiKey = currency === "EUR" ? "openInterestEur" : "openInterest";
  const priceKey = currency === "EUR" ? "btcPriceEur" : "btcPrice";
  const totalOI = currentStats ? (currency === "EUR" ? currentStats.totalOI * eurRate : currentStats.totalOI) : 0;
  const btcP = currentStats ? (currency === "EUR" ? currentStats.btcPrice * eurRate : currentStats.btcPrice) : 0;

  return (
    <div className="bg-[var(--aztec-parchment)] border border-[var(--aztec-ink)]/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-[var(--aztec-ink)]/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 pt-7 pb-5">
        <div>
          <h2 className="text-lg font-black text-[var(--aztec-ink)] tracking-tight flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--aztec-orchid)]" />
            Exchange BTC Open Interest
            <span className="text-[var(--aztec-ink)]/30 font-light text-sm ml-1">({currency})</span>
          </h2>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
            Total OI across major exchanges · 90d history
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center gap-1 p-1 bg-black/5 border border-slate-100 rounded-xl">
            {(["EUR", "USD"] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  currency === c
                    ? "bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] shadow-sm"
                    : "text-[var(--aztec-ink)]/40 hover:text-[var(--aztec-ink)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-100 hover:border-slate-300 transition-all group"
          >
            <RefreshCw size={13} className="text-slate-400 group-hover:text-slate-700 group-hover:rotate-180 transition-all duration-500" />
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      {currentStats && (
        <div className="grid grid-cols-3 gap-px mx-8 mb-6 rounded-2xl overflow-hidden border border-slate-100">
          {[
            {
              label: "Total Open Interest",
              value: totalOI >= 1e9
                ? sym + (totalOI / 1e9).toFixed(2) + "B"
                : sym + (totalOI / 1e6).toFixed(0) + "M",
              accent: "text-violet-600",
            },
            {
              label: "BTC Price",
              value: sym + btcP.toLocaleString("en", { maximumFractionDigits: 0 }),
              accent: "text-amber-600",
            },
            {
              label: "24h Change",
              value: (currentStats.change24h >= 0 ? "+" : "") + currentStats.change24h.toFixed(2) + "%",
              accent: currentStats.change24h >= 0 ? "text-emerald-600" : "text-rose-600",
            },
          ].map((stat, i) => (
            <div key={i} className="bg-black/5 p-4 text-center">
              <div className={`text-base font-black font-mono ${stat.accent}`}>{stat.value}</div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Loading OI data</span>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="oiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(data.length / 8)}
              />
              <YAxis
                yAxisId="oi"
                orientation="left"
                tickFormatter={(v: number) => formatAxisValue(v, currency)}
                tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={60}
                domain={[(dataMin: number) => Math.max(0, dataMin * 0.93), (dataMax: number) => dataMax * 1.05]}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                tickFormatter={(v: number) => (currency === "EUR" ? "" : "$") + (v / 1000).toFixed(0) + "K"}
                tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={55}
                domain={[(dataMin: number) => Math.max(0, dataMin * 0.93), (dataMax: number) => dataMax * 1.05]}
              />
              <Tooltip
                content={<CustomTooltip currency={currency} />}
                cursor={{ stroke: "rgba(139,92,246,0.2)", strokeWidth: 1 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingTop: 12, color: "#94a3b8" }}
                formatter={(value) => <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 9 }}>{value}</span>}
              />
              <Area
                yAxisId="oi"
                type="monotone"
                dataKey={oiKey}
                name="Open Interest"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#oiGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey={priceKey}
                name="BTC Price"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Exchange Breakdown  Real Binance + Bybit OI */}
      <div className="mx-8 mb-7 p-4 bg-black/5 border border-slate-100 rounded-2xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Exchange Breakdown</p>
        {currentStats ? (
          <div className="space-y-2">
            {[
              { name: 'Binance', color: '#f59e0b', value: currency === 'EUR' ? currentStats.binanceOI * eurRate : currentStats.binanceOI },
              { name: 'Bybit',   color: '#8b5cf6', value: currency === 'EUR' ? currentStats.bybitOI * eurRate : currentStats.bybitOI },
            ].map(ex => {
              const total = (currency === 'EUR' ? currentStats.totalOI * eurRate : currentStats.totalOI) || 1;
              const pct = Math.round((ex.value / total) * 100);
              const sym = currency === 'EUR' ? '' : '$';
              const label = ex.value >= 1e9 ? sym + (ex.value / 1e9).toFixed(2) + 'B' : sym + (ex.value / 1e6).toFixed(0) + 'M';
              return (
                <div key={ex.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: ex.color }} />
                      <span className="text-[10px] font-mono font-bold text-slate-600">{ex.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-slate-700">{label} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-200">
                    <div className="h-1 rounded-full transition-all duration-700" style={{ background: ex.color, width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {currentStats.bybitOI === 0 && (
              <p className="text-[9px] text-slate-300 mt-1">Bybit data loading...</p>
            )}
          </div>
        ) : (
          <p className="text-[9px] text-slate-300">Loading exchange breakdown...</p>
        )}
      </div>
    </div>
  );
}
