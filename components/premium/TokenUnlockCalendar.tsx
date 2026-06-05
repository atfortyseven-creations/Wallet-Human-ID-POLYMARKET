"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface UnlockEvent {
  id: string;
  token: string;
  symbol: string;
  date: Date;
  amountTokens: number;
  amountUsd: number;
  pctCirculating: number;
  category: "team" | "investor" | "ecosystem" | "foundation";
  sellPressure: "critical" | "high" | "medium" | "low";
  notes: string;
  color: string;
}

function buildUnlocks(): UnlockEvent[] {
  const now = new Date();
  const d = (days: number) => new Date(now.getTime() + days * 86_400_000);

  const events: UnlockEvent[] = [
    {
      id: "arb-1", token: "Arbitrum", symbol: "ARB", date: d(4),
      amountTokens: 92_500_000, amountUsd: 111_000_000,
      pctCirculating: 3.2, category: "investor" as const, sellPressure: "critical" as const,
      notes: "Series B unlock for early investors. Historically, Arbitrum has seen 8% drops during major unlock weeks.",
      color: "#1c1917", // stone-900 instead of bright blue
    },
    {
      id: "op-1", token: "Optimism", symbol: "OP", date: d(9),
      amountTokens: 24_160_000, amountUsd: 38_400_000,
      pctCirculating: 1.1, category: "ecosystem" as const, sellPressure: "medium" as const,
      notes: "Retroactive Public Goods Funding (RetroPGF) round. Recipients of these rounds typically hold the token, so sell pressure is moderate.",
      color: "#57534e", // stone-600
    },
    {
      id: "eigen-1", token: "EigenLayer", symbol: "EIGEN", date: d(12),
      amountTokens: 67_000_000, amountUsd: 201_000_000,
      pctCirculating: 8.7, category: "investor" as const, sellPressure: "critical" as const,
      notes: "First major unlock for post-launch venture capital. Represents 8.7% of total circulating supply. Extreme caution advised.",
      color: "#1c1917",
    },
    {
      id: "sui-1", token: "Sui", symbol: "SUI", date: d(18),
      amountTokens: 150_000_000, amountUsd: 525_000_000,
      pctCirculating: 5.1, category: "team" as const, sellPressure: "high" as const,
      notes: "Monthly release for the Mysten Labs team. Usually sees a 3-5% drop in the 2 days leading up to the event.",
      color: "#78716c", // stone-500
    },
    {
      id: "ondo-1", token: "Ondo Finance", symbol: "ONDO", date: d(22),
      amountTokens: 1_941_000_000, amountUsd: 2_329_200_000,
      pctCirculating: 19.4, category: "investor" as const, sellPressure: "critical" as const,
      notes: "Largest unlock of the quarter. 19.4% of supply will enter the market simultaneously for multiple investment funds.",
      color: "#1c1917",
    },
    {
      id: "apt-1", token: "Aptos", symbol: "APT", date: d(25),
      amountTokens: 11_314_000, amountUsd: 90_512_000,
      pctCirculating: 1.6, category: "foundation" as const, sellPressure: "medium" as const,
      notes: "Foundation operational allocation. Typically used for developer grants and not directly sold on the spot market.",
      color: "#a8a29e", // stone-400
    },
    {
      id: "tia-1", token: "Celestia", symbol: "TIA", date: d(31),
      amountTokens: 175_000_000, amountUsd: 892_500_000,
      pctCirculating: 17.6, category: "investor" as const, sellPressure: "critical" as const,
      notes: "Unlocking 4 main funds simultaneously. TIA has a history of severe drops (-20%) during unlock weeks.",
      color: "#1c1917",
    },
    {
      id: "ena-1", token: "Ethena", symbol: "ENA", date: d(38),
      amountTokens: 350_000_000, amountUsd: 315_000_000,
      pctCirculating: 4.1, category: "ecosystem" as const, sellPressure: "high" as const,
      notes: "Ecosystem incentive fund for staking reward payments (sENA). Moderate-to-high sell pressure.",
      color: "#57534e",
    },
    {
      id: "pendle-1", token: "Pendle", symbol: "PENDLE", date: d(45),
      amountTokens: 18_000_000, amountUsd: 90_000_000,
      pctCirculating: 2.8, category: "team" as const, sellPressure: "medium" as const,
      notes: "Year 2 team unlock. Pendle has strong demand from yield farmers, which usually absorbs these sales.",
      color: "#78716c",
    },
    {
      id: "hype-1", token: "Hyperliquid", symbol: "HYPE", date: d(52),
      amountTokens: 50_000_000, amountUsd: 1_500_000_000,
      pctCirculating: 5.0, category: "team" as const, sellPressure: "high" as const,
      notes: "First post-airdrop team unlock. $1.5B nominal value. The ultimate liquidity test for the HYPE order book.",
      color: "#292524", // stone-800
    },
  ];
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const PRESSURE_CFG = {
  critical: { label: "CRITICAL",  txt: "text-rose-700", bg: "bg-rose-50 border-rose-200", bar: "bg-rose-600" },
  high:     { label: "HIGH",      txt: "text-amber-700", bg: "bg-amber-50 border-amber-200", bar: "bg-amber-600" },
  medium:   { label: "MEDIUM",    txt: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", bar: "bg-yellow-600" },
  low:      { label: "LOW",       txt: "text-stone-600", bg: "bg-stone-100 border-stone-200", bar: "bg-stone-500" },
};

const CAT_CFG = {
  investor:   { label: "Investors (VC)" },
  team:       { label: "Core Team" },
  ecosystem:  { label: "Core Ecosystem" },
  foundation: { label: "DAO Foundation" },
};

function CountdownBadge({ date }: { date: Date }) {
  const [ms, setMs] = useState(date.getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setMs(date.getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [date]);
  if (ms <= 0) return <span className="text-[10px] font-mono text-stone-500 font-bold">UNLOCKED</span>;
  const days = Math.floor(ms / 86_400_000);
  const hrs  = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1_000);
  if (days > 0) return <span className="text-[11px] font-mono text-stone-600">{days}d {hrs}h</span>;
  return (
    <span className="text-[11px] font-mono text-rose-600 font-bold">
      {hrs.toString().padStart(2,"0")}:{mins.toString().padStart(2,"0")}:{secs.toString().padStart(2,"0")}
    </span>
  );
}

function formatUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export function TokenUnlockCalendar() {
  const [unlocks] = useState(() => buildUnlocks());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "high">("all");

  const filtered = unlocks.filter(u => {
    if (filter === "all") return true;
    if (filter === "critical") return u.sellPressure === "critical";
    return u.sellPressure === "critical" || u.sellPressure === "high";
  });

  const nextCritical = unlocks.find(u => u.sellPressure === "critical");
  const totalUnlockUsd = filtered.reduce((s, u) => s + u.amountUsd, 0);

  return (
    <div className="w-full bg-[#080808] border border-white/10 shadow-xl relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-stone-200/50 to-transparent" />

      {/* Header */}
      <div className="px-8 py-8 border-b border-stone-200/60">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl text-stone-900 font-medium mb-3 tracking-tight">Token Unlock Calendar</h2>
            <p className="text-[13px] text-stone-500 max-w-2xl leading-relaxed">
              A large part of the supply of newly created cryptocurrencies is "locked" for early investors and teams. This table shows the exact dates when massive amounts of tokens will be released for sale. Releases that exceed normal daily volume generate high sell pressure.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end pt-2">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Amount to unlock (60d)</div>
              <div className="text-3xl font-mono text-stone-800 tabular-nums">{formatUsd(totalUnlockUsd)}</div>
            </div>
            {nextCritical && (
              <div className="mt-2 text-right">
                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Next critical event ({nextCritical.symbol})</div>
                <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 inline-block shadow-sm">
                  <CountdownBadge date={nextCritical.date} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-3 mt-8">
          {(["all", "high", "critical"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-[10px] uppercase font-semibold tracking-widest border transition-colors shadow-sm ${
                filter === f
                  ? "border-stone-400/80 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-500 hover:bg-black/5"
              }`}
            >
              {f === "all" ? "All Events" : f === "high" ? "High or Critical Impact" : "Critical Only"}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-medium text-stone-400">{filtered.length} events listed</span>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 px-8 py-4 border-b border-stone-200/60 bg-white/40 text-[10px] uppercase font-semibold text-stone-400 tracking-widest sticky top-0 z-10">
        <div className="col-span-2">Token</div>
        <div className="col-span-2">Exact Date</div>
        <div className="col-span-2 text-right">Initial Value</div>
        <div className="col-span-1 text-right">% Floating</div>
        <div className="col-span-2 text-center">Recipient</div>
        <div className="col-span-2 text-center">Estimated Impact</div>
        <div className="col-span-1 text-right">Time</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-stone-100 bg-white/10">
        {filtered.map(u => {
          const isExpanded = expanded === u.id;
          const pressure = PRESSURE_CFG[u.sellPressure];
          const cat = CAT_CFG[u.category];
          const daysOut = Math.ceil((u.date.getTime() - Date.now()) / 86_400_000);

          return (
            <div key={u.id} className={u.sellPressure === "critical" ? "bg-black/5/50" : ""}>
              <button
                onClick={() => setExpanded(isExpanded ? null : u.id)}
                className="w-full grid grid-cols-12 px-8 py-5 hover:bg-stone-100/50 transition-colors items-center text-left"
              >
                {/* Token */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: u.color }} />
                  <div>
                    <div className="text-[13px] font-medium text-stone-900">{u.symbol}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{u.token}</div>
                  </div>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <div className="text-[12px] font-mono font-medium text-stone-700">
                    {u.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {daysOut <= 0 ? "Today" : `in ${daysOut} days`}
                  </div>
                </div>

                {/* Amount */}
                <div className="col-span-2 text-right">
                  <div className="text-[12px] font-mono font-medium text-stone-900">{formatUsd(u.amountUsd)}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {(u.amountTokens / 1_000_000).toFixed(1)}M {u.symbol}
                  </div>
                </div>

                {/* % */}
                <div className="col-span-1 text-right">
                  <div className={`text-[12px] font-mono font-medium ${u.pctCirculating > 5 ? "text-rose-700" : "text-stone-500"}`}>
                    {u.pctCirculating.toFixed(1)}%
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 flex justify-center">
                  <span className="text-[11px] text-stone-500">{cat.label}</span>
                </div>

                {/* Sell Pressure */}
                <div className="col-span-2 flex justify-center">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm shadow-sm ${pressure.bg} ${pressure.txt}`}>
                    {pressure.label}
                  </span>
                </div>

                {/* Countdown */}
                <div className="col-span-1 text-right flex flex-col items-end gap-1">
                  <CountdownBadge date={u.date} />
                  {isExpanded ? <ChevronUp className="w-3 h-3 text-stone-400 mt-1" /> : <ChevronDown className="w-3 h-3 text-stone-400 mt-1" />}
                </div>
              </button>

              {/* Expanded analysis */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="bg-white border border-stone-200/80 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Analyst Note</span>
                        </div>
                        <p className="text-[12px] text-stone-600 leading-relaxed text-justify">{u.notes}</p>
                      </div>

                      <div className="bg-white border border-stone-200/80 p-5 shadow-sm">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-4">Risk Factor Breakdown</div>
                        <div className="space-y-3">
                          {[
                            { label: "Supply Shock", val: u.pctCirculating > 5 ? 90 : u.pctCirculating * 18 },
                            { label: "Receiver History", val: u.category === "investor" ? 80 : u.category === "team" ? 60 : 35 },
                            { label: "Liquidity Gap to Absorb", val: u.amountUsd > 1e9 ? 85 : u.amountUsd > 1e8 ? 55 : 30 },
                          ].map(({ label, val }) => (
                            <div key={label}>
                              <div className="flex justify-between text-[10px] text-stone-500 mb-1.5">
                                <span>{label}</span><span className="font-mono">{val.toFixed(0)}/100</span>
                              </div>
                              <div className="h-1 bg-stone-100 overflow-hidden w-full">
                                <motion.div
                                  className={`h-full ${pressure.bar}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${val}%` }}
                                  transition={{ delay: 0.1, duration: 0.5 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

    </div>
  );
}

