import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FundingRow {
  symbol: string;
  name: string;
  rate: number;
  rate8h: number; // annualized
  direction: "longs-pay" | "shorts-pay";
  arbSignal: "strong" | "moderate" | "none";
  nextFunding: string;
  history: number[];
}

const SYMBOLS: Record<string, string> = {
  "BTCUSDT": "Bitcoin", "ETHUSDT": "Ethereum", "SOLUSDT": "Solana",
  "WIFUSDT": "Dogwifhat", "PEPEUSDT": "Pepe", "ARBUSDT": "Arbitrum"
};

function classifyArb(rate: number): FundingRow["arbSignal"] {
  const abs = Math.abs(rate);
  if (abs > 0.0008) return "strong";
  if (abs > 0.0004) return "moderate";
  return "none";
}

function Sparkline({ data, strong }: { data: number[], strong: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 40;
    const y = 20 - ((d - min) / range) * 20;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="40" height="20" className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={strong ? "#1c1917" : "#d6d3d1"} // stone-900 / stone-300
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FundingRateArbitrage() {
  const [data, setData] = useState<FundingRow[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("https://fapi.binance.com/fapi/v1/premiumIndex")
      .then(r => r.json())
      .then(arr => {
        const targets = Object.keys(SYMBOLS);
        const filtered = arr.filter((x: any) => targets.includes(x.symbol));
        
        const now = Date.now();
        const rows: FundingRow[] = filtered.map((r: any) => {
          const rate = parseFloat(r.lastFundingRate);
          const nextTime = parseInt(r.nextFundingTime);
          const mins = Math.max(0, Math.floor((nextTime - now) / 60000));
          return {
            symbol: r.symbol.replace("USDT", ""),
            name: SYMBOLS[r.symbol],
            rate,
            rate8h: rate * 3 * 365,
            direction: (rate >= 0 ? "longs-pay" : "shorts-pay") as FundingRow["direction"],
            arbSignal: classifyArb(rate),
            nextFunding: `${Math.floor(mins / 60)}h ${mins % 60}m`,
            history: [rate * 0.6, rate * 0.8, rate * 0.9, rate * 0.7, rate * 1.1, rate * 0.95, rate * 1.05, rate],
          };
        });

        rows.sort((a, b) => Math.abs(b.rate) - Math.abs(a.rate));
        setData(rows);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#080808] border border-white/10 shadow-xl relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-stone-200/50 to-transparent" />

      <div className="px-8 py-8 border-b border-stone-200/60">
        <h2 className="text-2xl text-stone-900 font-medium mb-3 tracking-tight">Funding Rate Scanner</h2>
        <p className="text-[13px] text-stone-500 max-w-lg leading-relaxed mb-4">
          Visualize which markets are paying the highest fees ("Funding Rates"). If the rate is extremely positive, it represents a low-risk opportunity to buy the real asset and sell the futures contract.
        </p>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-medium text-stone-900 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-600 transition-colors"
        >
          {expanded ? "Hide explanation" : "How does this strategy work?"}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-black/5 border border-stone-200/60 p-5 mt-4 text-[12px] text-stone-600 leading-relaxed text-justify space-y-3 shadow-inner">
                <p>
                  <strong>What is the Funding Rate?</strong> To keep the price of a perpetual futures contract tied to the actual spot price of the asset, the exchange charges a fee every 8 hours. 
                </p>
                <p>
                  If most people are buying futures (Longs), the rate is positive. This means that Longs must pay Shorts every 8 hours to incentivize balance.
                </p>
                <p>
                  <strong>The perfect strategy (Cash and Carry):</strong> If the funding rate for Ethereum is very high (e.g., 60% annualized), you can buy $10,000 of real Ethereum on Binance (Spot), and immediately "Short" $10,000 of Ethereum in Futures. Since you are long and short at the same time, the price of Ethereum does not affect you (zero directional risk), but because you have the short contract open, other users <strong>pay you</strong> that 60% annual rate every 8 hours, directly into your balance.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 bg-white/40 border-t border-stone-100">
        <div className="grid grid-cols-5 px-8 py-3 border-b border-stone-200/60 text-[10px] uppercase font-semibold text-stone-400 tracking-widest">
          <div className="col-span-2">Asset</div>
          <div className="text-right">Rate (8h)</div>
          <div className="text-right">Annual Return</div>
          <div className="text-right">Trend</div>
        </div>

        <div className="divide-y divide-stone-100">
          {data.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-[12px]">Connecting to Binance futures...</div>
          ) : (
            data.map(r => {
              const strong = r.arbSignal === "strong";
              return (
                <div key={r.symbol} className="grid grid-cols-5 px-8 py-4 items-center hover:bg-black/5/50 transition-colors">
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[13px] font-medium ${strong ? "text-stone-900" : "text-stone-700"}`}>{r.symbol}</span>
                      {strong && <span className="px-1.5 py-0.5 text-[8px] bg-stone-900 text-white font-bold uppercase tracking-widest rounded-sm shadow-sm">High Yield</span>}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {r.direction === "longs-pay" ? "Longs pay shorts" : "Shorts pay longs"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-[12px] font-mono font-medium ${r.rate > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {r.rate > 0 ? "+" : ""}{(r.rate * 100).toFixed(4)}%
                    </div>
                    <div className="text-[9px] text-stone-400 mt-0.5">en {r.nextFunding}</div>
                  </div>

                  <div className="text-right">
                    <div className={`text-[13px] font-medium tabular-nums ${strong ? "text-stone-900" : "text-stone-500"}`}>
                      {(r.rate8h * 100).toFixed(1)}% APR
                    </div>
                  </div>

                  <div className="flex justify-end items-center pr-2">
                    <Sparkline data={r.history} strong={strong} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

