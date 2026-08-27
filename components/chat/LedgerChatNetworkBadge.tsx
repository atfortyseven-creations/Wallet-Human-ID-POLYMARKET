"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wifi, WifiOff, BatteryLow, Globe, Clock, RefreshCw } from 'lucide-react';

// ─── Network Quality Types ───────────────────────────────────────────────────
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

interface NetworkInfo {
  quality: ConnectionQuality;
  latencyMs: number | null;
  downlink: number | null; // Mbps
  effectiveType: string | null;
  isOnline: boolean;
  rtt: number | null;
}

// ─── Network Status Hook ─────────────────────────────────────────────────────
export function useNetworkStatus(): NetworkInfo {
  const [info, setInfo] = useState<NetworkInfo>({
    quality: 'good',
    latencyMs: null,
    downlink: null,
    effectiveType: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    rtt: null,
  });

  const measureLatency = useCallback(async (): Promise<number | null> => {
    try {
      const start = performance.now();
      await fetch('/api/ping', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      return Math.round(performance.now() - start);
    } catch {
      return null;
    }
  }, []);

  const updateNetworkInfo = useCallback(async () => {
    const isOnline = navigator.onLine;

    if (!isOnline) {
      setInfo(prev => ({ ...prev, isOnline: false, quality: 'offline' }));
      return;
    }

    const conn = (navigator as any).connection;
    const effectiveType: string | null = conn?.effectiveType ?? null;
    const downlink: number | null = conn?.downlink ?? null;
    const rtt: number | null = conn?.rtt ?? null;

    const latencyMs = await measureLatency();

    let quality: ConnectionQuality = 'good';

    if (!isOnline) {
      quality = 'offline';
    } else if (effectiveType === '4g' && (latencyMs === null || latencyMs < 100)) {
      quality = 'excellent';
    } else if (effectiveType === '4g' || (latencyMs !== null && latencyMs < 200)) {
      quality = 'good';
    } else if (effectiveType === '3g' || (latencyMs !== null && latencyMs < 500)) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    setInfo({ quality, latencyMs, downlink, effectiveType, isOnline, rtt });
  }, [measureLatency]);

  useEffect(() => {
    updateNetworkInfo();

    const handleOnline = () => updateNetworkInfo();
    const handleOffline = () =>
      setInfo(prev => ({ ...prev, isOnline: false, quality: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener('change', updateNetworkInfo);

    const interval = setInterval(updateNetworkInfo, 30_000); // poll every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) conn.removeEventListener('change', updateNetworkInfo);
      clearInterval(interval);
    };
  }, [updateNetworkInfo]);

  return info;
}

// ─── Network Quality Badge ───────────────────────────────────────────────────
interface NetworkQualityBadgeProps {
  showDetails?: boolean;
}

const QUALITY_COLORS: Record<ConnectionQuality, string> = {
  excellent: '#30d158',
  good: '#30d158',
  fair: '#ff9500',
  poor: '#ff3b30',
  offline: '#636366',
};

const QUALITY_LABELS: Record<ConnectionQuality, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  offline: 'Offline',
};

export function NetworkQualityBadge({ showDetails = false }: NetworkQualityBadgeProps) {
  const network = useNetworkStatus();
  const [showPanel, setShowPanel] = useState(false);

  const color = QUALITY_COLORS[network.quality];
  const label = QUALITY_LABELS[network.quality];

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(s => !s)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
      >
        {network.isOnline ? (
          <Wifi size={12} style={{ color }} />
        ) : (
          <WifiOff size={12} className="text-black/40" />
        )}
        <span className="text-[11px] font-black uppercase tracking-wide" style={{ color }}>
          {label}
        </span>
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-xl p-4 w-64 z-50"
          >
            <h3 className="text-[11px] font-black uppercase tracking-widest text-black/40 mb-3">Network Status</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black/70">Quality</span>
                <span className="text-[12px] font-black" style={{ color }}>{label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black/70">Latency</span>
                <span className="text-[12px] font-mono font-bold text-black">
                  {network.latencyMs !== null ? `${network.latencyMs}ms` : '—'}
                </span>
              </div>
              {network.downlink !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-black/70">Downlink</span>
                  <span className="text-[12px] font-mono font-bold text-black">{network.downlink} Mbps</span>
                </div>
              )}
              {network.effectiveType && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-black/70">Type</span>
                  <span className="text-[12px] font-mono font-bold text-black uppercase">{network.effectiveType}</span>
                </div>
              )}
            </div>

            {/* Quality bar */}
            <div className="mt-3 h-2 bg-black/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                animate={{
                  width: network.quality === 'excellent' ? '100%'
                    : network.quality === 'good' ? '75%'
                    : network.quality === 'fair' ? '50%'
                    : network.quality === 'poor' ? '25%' : '0%'
                }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {!network.isOnline && (
              <div className="mt-3 p-2 bg-red-50 rounded-xl flex items-center gap-2">
                <WifiOff size={14} className="text-red-500 shrink-0" />
                <p className="text-[11px] font-bold text-red-600">
                  You're offline. Messages will be queued.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
