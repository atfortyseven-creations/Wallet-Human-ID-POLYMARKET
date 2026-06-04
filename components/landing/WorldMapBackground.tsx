"use client";

import { useEffect, useState, useCallback } from "react";
import { SystemGlobe3D } from "./SystemGlobe3D";

//  Wrapper positioning the 3D Globe as a background layer 
export function WorldMapBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ opacity: 0.9, display: 'block' }}>
      <SystemGlobe3D />
    </div>
  );
}

//  BTC Transfer Legend  Real on-chain data via /api/network/whale-flows 
interface WhaleFlow {
  txid:          string;
  fromCity:      string;
  toCity:        string;
  fromEntity:    string;
  toEntity:      string;
  btc:           string;
  type:          string;
  latencyMs:     number;
  confirmations: string;
  confirmed:     boolean;
}

// Fallback static structure displayed while API loads
const SKELETON = Array.from({ length: 5 }, (_, i) => ({
  txid:          `skel-${i}`,
  fromCity:      '',
  toCity:        '',
  fromEntity:    '',
  toEntity:      '',
  btc:           '',
  type:          '',
  latencyMs:     0,
  confirmations: '',
  confirmed:     false,
  loading:       true,
}));

export function BtcTransferLegend() {
  const [flows, setFlows]     = useState<(WhaleFlow & { loading?: boolean })[]>(SKELETON);
  const [error, setError]     = useState(false);
  const [tick, setTick]       = useState(0);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchFlows = useCallback(async () => {
    // Don't refetch more than once per 60s
    if (Date.now() - lastFetch < 58_000) return;
    try {
      const res = await fetch('/api/network/whale-flows', { cache: 'no-store' });
      const data = await res.json();
      if (data.flows && data.flows.length > 0) {
        setFlows(data.flows.map((f: WhaleFlow) => ({ ...f, loading: false })));
        setLastFetch(Date.now());
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  }, [lastFetch]);

  useEffect(() => {
    fetchFlows();
    // Animated dot ticker (visual only)
    const ticker = setInterval(() => setTick(v => v + 1), 3000);
    // Refresh data every 65s
    const refresher = setInterval(fetchFlows, 65_000);
    return () => {
      clearInterval(ticker);
      clearInterval(refresher);
    };
  }, [fetchFlows]);

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto mt-4 px-4">
      {/* Route rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {flows.map((r, i) => (
          <div
            key={r.txid}
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border transition-all ${
              r.loading ? 'animate-pulse border-black/5' : 'border-black/[0.07] hover:border-black/20'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Animated transfer arc */}
              <svg width="20" height="12" viewBox="0 0 20 12" className="shrink-0">
                <path
                  d="M1 10 Q10 0 19 10"
                  stroke="#555555"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                <circle cx="1" cy="10" r="2" fill="#555555" />
                <circle cx="19" cy="10" r="2" fill="#555555" />
                {!r.loading && (
                  <circle
                    cx={1 + (i * 4 + tick * 2) % 18}
                    cy={10 - Math.sin(((i * 4 + tick * 2) % 18) / 18 * Math.PI) * 8}
                    r="1.5"
                    fill="#050505"
                  />
                )}
              </svg>
              {r.loading ? (
                <span className="h-3 w-28 bg-black/5 rounded" />
              ) : (
                <span className="text-[10px] font-black text-black/70 truncate uppercase tracking-widest">
                  {r.fromCity} <span className="opacity-40"></span> {r.toCity}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              {r.loading ? (
                <>
                  <span className="h-3 w-16 bg-black/5 rounded mb-1" />
                  <span className="h-2 w-20 bg-black/5 rounded" />
                </>
              ) : (
                <>
                  <span className="text-[10px] font-black font-mono text-[#050505]">
                    {r.btc} BTC
                  </span>
                  <span className="text-[8px] font-mono text-black/40 uppercase">
                    {r.type}  {r.latencyMs > 0 ? `${r.latencyMs}min` : 'live'}  {r.confirmations}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Context panel */}
      <div className="mt-3 px-5 py-4 rounded-2xl bg-white border border-black/[0.07] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
              Active BTC Institutional Flows
            </span>
            {!error && !flows[0]?.loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
            )}
          </div>
          <p className="text-[11px] text-black/60 leading-relaxed font-medium max-w-lg">
            {error
              ? 'Connecting to mempool.space  on-chain data loading.'
              : 'Real-time institutional BTC transfers fetched from mempool.space. Addresses mapped to known exchange wallets.'
            }
          </p>
        </div>

        {/* Active stats */}
        <div className="flex gap-4 shrink-0 bg-black/[0.03] p-3 rounded-xl border border-black/[0.05]">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider mb-1">Source</span>
            <span className="text-xs font-mono font-black text-[#050505]">mempool.space</span>
          </div>
          <div className="w-[1px] bg-black/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider mb-1">Refresh</span>
            <span className="text-xs font-mono font-black text-[#050505]">60s</span>
          </div>
          <div className="w-[1px] bg-black/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider mb-1">Min. Size</span>
            <span className="text-xs font-mono font-black text-[#050505]">1 BTC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
