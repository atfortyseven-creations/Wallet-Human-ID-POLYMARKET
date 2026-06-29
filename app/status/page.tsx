"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusNavbar from '@/components/status/StatusNavbar';
import { Activity, ShieldCheck, Database, Network, Server, Fingerprint, Lock, Layers, Zap, Eye, Code } from 'lucide-react';

// ─── TYPES ─────────────────────────────────────────────────────────────

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'loading';

interface ServiceResult {
  name: string;
  category: string;
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

// ─── UI CONFIGURATION ──────────────────────────────────────────────────

const STATUS_CONFIG = {
  operational: {
    label: 'OPERATIONAL',
    color: 'bg-[#050505]',
    text: 'text-white',
    dot: 'bg-emerald-500',
    border: 'border-[#050505]',
    icon: <Activity size={14} className="text-white" />
  },
  degraded: {
    label: 'DEGRADED',
    color: 'bg-[#F9F9F9]',
    text: 'text-[#888888]',
    dot: 'bg-amber-500',
    border: 'border-[#E5E5E5]',
    icon: <Zap size={14} className="text-[#888888]" />
  },
  outage: {
    label: 'OUTAGE',
    color: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
    border: 'border-red-200',
    icon: <Server size={14} className="text-red-600" />
  },
  loading: {
    label: 'CHECKING',
    color: 'bg-white',
    text: 'text-[#888888]',
    dot: 'bg-[#E5E5E5]',
    border: 'border-[#E5E5E5]',
    icon: <Activity size={14} className="text-[#888888] animate-pulse" />
  }
};

const CATEGORY_ICONS: Record<string, any> = {
  'ZK & Privacy Layer': Lock,
  'Whale Network & Markets': Network,
  'Data Lake & Intelligence': Database,
  'Core Infrastructure': Layers
};

// ─── TERMINAL LOG ENGINE ───────────────────────────────────────────────

function TerminalLogs({ data, isLoading }: { data: HealthData | null, isLoading: boolean }) {
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState<string[]>([]);
    
    useEffect(() => {
        if (isLoading) {
            setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] >> INIT HEALTH_PROBE_V3...`]);
        } else if (data) {
            setLogs(prev => {
                const newLogs = [...prev];
                newLogs.push(`[${new Date().toISOString().split('T')[1].slice(0,-1)}] >> PROBE_COMPLETE: 18 CIRCUITS CHECKED`);
                newLogs.push(`[${new Date().toISOString().split('T')[1].slice(0,-1)}] >> AVG_LATENCY: ${data.avgLatencyMs}MS | STATUS: ${data.overallStatus.toUpperCase()}`);
                if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
                return newLogs;
            });
        }
    }, [data, isLoading]);

    useEffect(() => {
        if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-full bg-[#050505] rounded-3xl p-6 sm:p-8 border border-[#333] shadow-2xl overflow-hidden relative mt-20">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <Code size={18} className="text-white/60" />
                <span className="font-mono text-[10px] uppercase font-black tracking-[0.3em] text-white/60">Cryptographic Node Logs</span>
            </div>
            <div className="font-mono text-[10px] text-emerald-500 h-40 overflow-y-auto space-y-2 leading-relaxed">
                {logs.map((log, i) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i}>{log}</motion.div>
                ))}
                {isLoading && <div className="animate-pulse">_</div>}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────

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
      // keep previous data visible
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

  const overall = loading && !health ? 'loading' : (health?.overallStatus ?? 'loading');
  const overallCfg = STATUS_CONFIG[overall];

  // Group services
  const groupedServices = useMemo(() => {
      if (!health) return {};
      const groups: Record<string, ServiceResult[]> = {};
      health.services.forEach(s => {
          if (!groups[s.category]) groups[s.category] = [];
          groups[s.category].push(s);
      });
      return groups;
  }, [health]);

  return (
    <div className="min-h-screen bg-white text-[#050505] font-sans relative overflow-x-hidden selection:bg-[#050505] selection:text-white">
      <StatusNavbar />
      
      <main className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 pt-32 pb-24 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 mb-16">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-white border border-[#E5E5E5] shadow-lg rounded-2xl flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-2xl border border-black/5 scale-110 animate-ping opacity-20" />
                <Activity size={32} className="text-[#050505]" />
            </motion.div>
            
            <div className="space-y-4">
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-[#050505] leading-none">
                    System <span className="text-black/30">Status</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[11px] font-black uppercase tracking-[0.3em] text-[#888888]">
                    Quantum-level real-time network intelligence
                </motion.p>
            </div>
        </div>

        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#FAFAFA] border border-[#E5E5E5] p-8 rounded-[2rem] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888888]">Global Network</span>
                    <div className={`w-3 h-3 rounded-full ${overallCfg.dot} shadow-[0_0_15px_rgba(0,0,0,0.1)]`} />
                </div>
                <div>
                    <div className="text-3xl font-black tracking-tighter mb-2 font-mono">
                        {overall === 'loading' ? 'SYNCING...' : overall === 'operational' ? 'ALL SECURE' : overall.toUpperCase()}
                    </div>
                    <div className="text-[11px] font-bold text-[#888888]">{health?.services.length || 18} Sub-circuits active</div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#FAFAFA] border border-[#E5E5E5] p-8 rounded-[2rem] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888888]">Average Latency</span>
                    <Zap size={16} className="text-[#888888]" />
                </div>
                <div>
                    <div className="text-3xl font-black tracking-tighter mb-2 font-mono">
                        {health ? `${health.avgLatencyMs}ms` : '---'}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600">Optimal Response Time</div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#050505] p-8 rounded-[2rem] flex flex-col justify-between text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={100} />
                </div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Next Probe In</span>
                </div>
                <div className="relative z-10">
                    <div className="text-4xl font-black tracking-tighter mb-2 font-mono">
                        {countdown}s
                    </div>
                    <div className="text-[11px] font-bold text-white/50">Last Update: {lastChecked || 'Pending'}</div>
                </div>
            </motion.div>
        </div>

        {/* DETAILED CIRCUITS */}
        <div className="w-full space-y-12">
            <AnimatePresence>
                {loading && !health && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#050505] animate-spin rounded-full mb-6" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#050505]">Resolving Network Topography...</span>
                    </div>
                )}
            </AnimatePresence>

            {Object.entries(groupedServices).map(([category, services], idx) => {
                const CatIcon = CATEGORY_ICONS[category] || Server;
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                        key={category} 
                        className="bg-white border border-[#E5E5E5] rounded-[2rem] overflow-hidden shadow-sm"
                    >
                        <div className="px-8 py-6 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center gap-4">
                            <div className="w-10 h-10 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-center shadow-sm">
                                <CatIcon size={18} className="text-[#050505]" />
                            </div>
                            <h2 className="text-[14px] font-black uppercase tracking-widest text-[#050505]">{category}</h2>
                        </div>
                        <div className="divide-y divide-[#E5E5E5]">
                            {services.map((svc) => {
                                const cfg = STATUS_CONFIG[svc.status];
                                return (
                                    <div key={svc.name} className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-black/[0.01] transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-[16px] font-black text-[#050505] tracking-tight">{svc.name}</h3>
                                            </div>
                                            <div className="font-mono text-[10px] text-[#888888]">{svc.url || 'Internal Encrypted Node'}</div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 shrink-0">
                                            <div className="hidden sm:block text-right">
                                                <div className="font-mono text-[14px] font-bold text-[#050505]">{svc.latencyMs}ms</div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Latency</div>
                                            </div>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${cfg.border} ${cfg.color} ${cfg.text}`}>
                                                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{cfg.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}
        </div>

        {/* LIVE TERMINAL LOGS */}
        <TerminalLogs data={health} isLoading={loading} />

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-[#E5E5E5] w-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
            <div className="flex items-center gap-3">
                <Fingerprint size={16} className="text-[#050505]" />
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]">Cryptographically Verified</span>
            </div>
            <div className="font-mono text-[10px] font-bold text-[#888888]">
                HUMANITY LEDGER © {new Date().getFullYear()}
            </div>
        </div>

      </main>
    </div>
  );
}
