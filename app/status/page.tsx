"use client";

import React, { useEffect, useState, useCallback } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

// TYPES
type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'loading';

interface ServiceResult {
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  httpCode: number | null;
  checkedAt: string;
  accessible?: boolean;
}

interface HealthData {
  ok: boolean;
  overallStatus: 'operational' | 'degraded' | 'outage';
  avgLatencyMs: number;
  checkedAt: string;
  services: ServiceResult[];
}

// STATUS HELPERS
const STATUS_CONFIG = {
  operational: {
    label: 'Operational',
    color: 'bg-black',
    text: 'text-black',
    bg: 'bg-black/5',
    border: 'border-black/10',
    icon: ({ className }: { className?: string }) => <span className={`font-mono font-black ${className || ''}`}>[UNLCK]</span>,
  },
  degraded: {
    label: 'Degraded',
    color: 'bg-black/40',
    text: 'text-black/60',
    bg: 'bg-black/5',
    border: 'border-black/10',
    icon: ({ className }: { className?: string }) => <span className={`font-mono font-black ${className || ''}`}>[LCK]</span>,
  },
  outage: {
    label: 'Outage',
    color: 'bg-black/70',
    text: 'text-black/70',
    bg: 'bg-black/5',
    border: 'border-black/10',
    icon: ({ className }: { className?: string }) => <span className={`font-mono font-black ${className || ''}`}>[LCK]</span>,
  },
  loading: {
    label: 'Checking...',
    color: 'bg-black/10',
    text: 'text-black/40',
    bg: 'bg-black/5',
    border: 'border-black/5',
    icon: ({ className }: { className?: string }) => <span className={`font-mono font-black ${className || ''}`}>[LCK]</span>,
  },
} as const;

function StatusDot({ status }: { status: ServiceStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="relative flex h-3 w-3 shrink-0">
      {status === 'operational' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.color} opacity-30`} />
      )}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.color}`} />
    </span>
  );
}

function LatencyBadge({ ms }: { ms: number }) {
  return <span className="font-mono text-xs font-bold text-black/70">{ms}ms</span>;
}

import StatusNavbar from '@/components/status/StatusNavbar';

// Component icon + color mapping  all neutral monochrome
const COMPONENT_META: Record<string, { icon: any; accent: string; gradient: string }> = {
  'Dashboard':  { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[DASH]</span>, accent: 'text-black/70', gradient: 'from-white to-white' },
  'Whale Chat': { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[MSG]</span>,   accent: 'text-black/70', gradient: 'from-white to-white' },
  'Portfolio':  { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[PRTF]</span>,       accent: 'text-black/70', gradient: 'from-white to-white' },
  'News':       { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[NWS]</span>,       accent: 'text-black/70', gradient: 'from-white to-white' },
  'Academy':    { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[EDU]</span>,   accent: 'text-black/70', gradient: 'from-white to-white' },
  'Forum':      { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[PPL]</span>,           accent: 'text-black/70', gradient: 'from-white to-white' },
  'Careers':    { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[AWD]</span>,           accent: 'text-black/70', gradient: 'from-white to-white' },
  'QDs':        { icon: ({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[QD]</span>,            accent: 'text-black/70', gradient: 'from-white to-white' },
};

// MAIN PAGE
export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status/health', { cache: 'no-store' });
      const json: HealthData = await res.json();
      setHealth(json);
      setLastChecked(new Date().toLocaleTimeString('en-US', { hour12: false }));
      setCountdown(30);
    } catch {
      // keep previous data visible on transient errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(tick);
  }, [lastChecked]);

  const overall: ServiceStatus = loading && !health ? 'loading' : (health?.overallStatus ?? 'loading');
  const overallCfg = STATUS_CONFIG[overall];
  const OverallIcon = overallCfg.icon;

  return (
    <div className="min-h-screen bg-white text-black font-sans relative overflow-y-auto selection:bg-black/10">
      <StatusNavbar />
      <main className="w-full max-w-[800px] mx-auto px-6 pt-32 pb-24 flex flex-col gap-10 relative z-10 items-center">

        {/* Header Text */}
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center gap-3 px-6 py-2 border border-black/10 rounded-full mb-8">
                <span className="font-mono text-[10px] font-black text-black">[SRV]</span>
                <span className="text-xs uppercase tracking-widest font-bold text-black/60">System Status</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-4">
                Service Overview
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base text-black/60 leading-relaxed">
                Real-time monitoring of our services and platform components. Information is strictly live and automatically updates every 30 seconds.
            </motion.p>
        </div>

        {/* OVERALL STATUS HERO */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="w-full">
          <div className={`w-full bg-white border border-black/10 p-10 flex flex-col items-center text-center gap-6 transition-all duration-700`}>
            <div className={`p-6 rounded-full border border-black/10 flex items-center justify-center mb-2`}>
              <OverallIcon className={`${overallCfg.text} text-4xl`} />
            </div>
            
            <div>
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-black text-balance leading-tight`}>
                {overall === 'operational'
                  ? 'Humanity Ledger nodes operational.'
                  : overall === 'degraded'
                  ? 'Degraded Performance'
                  : overall === 'outage'
                  ? 'Service Outage Detected'
                  : 'Checking Services...'}
              </h1>
              <p className="text-sm font-mono text-black/50 mt-3 font-semibold">
                {health?.avgLatencyMs != null
                  ? `Average Network Latency: ${health.avgLatencyMs}ms`
                  : 'Connecting to servers...'}
              </p>
            </div>

            <div className="w-full h-px bg-black/5 my-4" />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest font-bold text-black/40">Last Update</p>
                <p className="text-base font-mono font-bold text-black mt-1">{lastChecked ?? 'Pending'}</p>
                <p className="text-xs text-black/60 font-mono mt-1 font-bold">Refreshing in {countdown}s</p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-black hover:bg-black/80 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                <span className={`font-mono text-[10px] font-black ${loading ? 'animate-spin inline-block' : ''}`}>[RST]</span>
                {loading ? 'Updating' : 'Refresh Now'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* LIVE METRICS SUMMARY */}
        {health && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {[
              {
                label: 'Online',
                value: `${health.services.filter(s => s.status === 'operational').length}/${health.services.length}`,
                good: health.services.every(s => s.status === 'operational'),
                icon: "[ACT]"
              },
              {
                label: 'Latency',
                value: `${health.avgLatencyMs}ms`,
                good: health.avgLatencyMs < 1000,
                icon: "[WIFI]"
              },
              {
                label: 'Issues',
                value: String(health.services.filter(s => s.status === 'degraded').length),
                good: health.services.filter(s => s.status === 'degraded').length === 0,
                icon: "[!]"
              },
              {
                label: 'Outages',
                value: String(health.services.filter(s => s.status === 'outage').length),
                good: health.services.filter(s => s.status === 'outage').length === 0,
                icon: "[SEC_!]"
              },
            ].map((m, i) => (
              <div key={m.label} className="bg-white border border-black/10 p-6 flex flex-col items-center justify-center text-center gap-3 transition-all hover:bg-black/[0.02]">
                <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-[10px] font-black text-black/50">{m.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-black/50">{m.label}</span>
                </div>
                <span className="text-3xl font-extrabold tracking-tight text-black">
                  {m.value}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* SERVICE CARDS */}
        <div className="flex flex-col gap-4 mt-6 w-full">
          <div className="flex items-center justify-center px-2 mb-4 gap-4">
            <div className="h-px bg-black/10 flex-1" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-black">Individual Components</h2>
            <div className="h-px bg-black/10 flex-1" />
          </div>

          <AnimatePresence>
            {loading && !health && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={`skeleton-${i}`} className="w-full h-24 bg-white border border-black/10 animate-pulse" />
                ))}
              </>
            )}

            {health?.services.map((svc, i) => {
              const cfg = STATUS_CONFIG[svc.status];
              const StatusIcon = cfg.icon;
              const meta = COMPONENT_META[svc.name];
              const ComponentIcon = meta?.icon ?? (({ className }: { className?: string }) => <span className={`font-mono text-xs font-black ${className || ''}`}>[SRV]</span>);
              const accentClass = meta?.accent ?? 'text-black';
              const gradientClass = meta?.gradient ?? 'from-white to-white';
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + (i * 0.06), ease: [0.16, 1, 0.3, 1] }}
                  key={svc.name}
                  className={`w-full bg-white border border-black/10 overflow-hidden hover:-translate-y-0.5 transition-all duration-300 group`}
                >
                  <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: icon + name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 border border-black/10 flex items-center justify-center shrink-0 transition-transform`}>
                        <ComponentIcon className={accentClass} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-[16px] tracking-tight text-black leading-tight">{svc.name}</p>
                        <p className="text-[11px] font-mono font-medium text-black/40 mt-0.5 truncate max-w-[220px]">{svc.url}</p>
                      </div>
                    </div>
                    {/* Right: latency + accessibility + status badge */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                      <div className="flex flex-col items-end">
                        <LatencyBadge ms={svc.latencyMs} />
                        <span className="text-[10px] text-black/30 font-mono uppercase tracking-wider mt-0.5">latency</span>
                      </div>
                      {svc.accessible === false && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-black/20 bg-white text-black/60">
                          <span className="font-mono text-[9px] font-black">[X]</span>
                          No access
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-3.5 py-2 border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                      >
                        <StatusIcon className="" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  {/* Subtle bottom bar colored by status */}
                  <div className={`h-[2px] w-full ${cfg.color} opacity-40`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col items-center justify-center pt-10 mt-10 gap-4 w-full border-t border-black/5">
          <div className="flex items-center justify-center gap-3 text-xs font-mono font-medium text-black/50 uppercase tracking-widest">
            <span className="font-mono text-[10px] font-black text-black/50">[TIME]</span>
            <span>UTC Timezone | Real-time connection active</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-black/30">
            Copyright {new Date().getFullYear()} Humanity Ledger
          </span>
        </div>

      </main>
    </div>
  );
}
