// components/terminal/RadarFeed.tsx
"use client";

import React, { useEffect } from 'react';
import { useWhaleFeed } from '@/hooks/useWhaleFeed';
import { useSniperStore } from '@/store/useSniperStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhaleStream } from '@/context/WhaleStreamContext';
import { Clock, Hash, Zap, Landmark, Activity } from 'lucide-react';

export default function RadarFeed() {
  const { unifiedWhaleFeed } = useWhaleFeed();
  const pushAlert = useSniperStore((state) => state.pushAlert);
  const alerts = useSniperStore((state) => state.alerts);
  const filters = useSniperStore((state) => state.filters);

  const { events: sseEvents, isConnected: sseConnected } = useWhaleStream();

  useEffect(() => {
    if (!unifiedWhaleFeed.length) return;
    const latest = unifiedWhaleFeed[0];
    pushAlert({
      id: latest.id || latest.hash,
      txHash: latest.hash,
      asset: latest.asset || 'N/A',
      amount: Number(latest.amount || 0),
      usdValue: Number(latest.usdValue || 0),
      from: latest.from || 'N/A',
      to: latest.to || 'N/A',
      chain: latest.chain || 'BASE',
      action: (latest.action === 'COMPRA' || latest.action === 'BUY') ? 'BUY' : latest.action === 'SELL' ? 'SELL' : 'TRANSFER',
      timestamp: latest.timestamp,
    } as any);
  }, [unifiedWhaleFeed, pushAlert]);

  useEffect(() => {
    if (!sseEvents.length) return;
    const latest = sseEvents[0];
    pushAlert({
      id: latest.id,
      txHash: latest.hash,
      asset: latest.asset,
      amount: Number(latest.amount || 0),
      usdValue: Number(latest.usdValue || 0),
      from: latest.from,
      to: latest.to,
      chain: latest.chain,
      action: 'TRANSFER',
      timestamp: latest.timestamp,
    } as any);
  }, [sseEvents, pushAlert]);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] font-mono">
      {/*  HEADER  */}
      <div className="grid grid-cols-[100px_1fr_120px_80px_60px] gap-4 px-4 py-2 text-[8px] font-black uppercase tracking-[0.3em] text-black/40 border-b border-black/10 shrink-0 items-center">
        <span className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-emerald-500' : 'bg-black/20'} animate-pulse`} />
          UTC_TIME
        </span>
        <span>SIGNATURE // PROTOCOL</span>
        <span className="text-right">VOLUME_USD</span>
        <span className="text-right">ASSET</span>
        <span className="text-right">ACT</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-[100px_1fr_120px_80px_60px] gap-4 px-4 py-3 border-b border-black/[0.05] hover:bg-black/[0.03] transition-colors items-center group cursor-crosshair"
            >
              {/* TIME */}
              <div className="flex flex-col">
                <span className="text-[10px] text-black/80 font-bold tracking-tighter">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false })}
                </span>
                <span className="text-[7px] text-black/40 uppercase tracking-widest">{alert.chain}</span>
              </div>

              {/* HASH / ROUTE */}
              <div className="flex flex-col overflow-hidden">
                 <span className="text-[9px] text-black truncate opacity-80 group-hover:opacity-100 transition-opacity">
                    {alert.txHash}
                 </span>
                 <div className="flex items-center gap-2 text-[7px] text-black/40 mt-1 uppercase tracking-widest">
                    <span>{alert.from?.slice(0,6)}</span>
                    <span></span>
                    <span>{alert.to?.slice(0,6)}</span>
                 </div>
              </div>

              {/* VOLUME USD */}
              <div className="text-right">
                <span className={`text-[10px] font-black tracking-tighter ${
                  alert.usdValue >= 1000000 ? 'text-emerald-600' : 'text-black/80'
                }`}>
                  ${(alert.usdValue / 1e3).toFixed(1)}K
                </span>
              </div>

              {/* ASSET */}
              <div className="text-right">
                 <span className="text-[9px] font-black text-black/60 uppercase tracking-widest">
                   {alert.asset}
                 </span>
              </div>

              {/* ACTION */}
              <div className="flex justify-end">
                 <span className={`text-[8px] font-black px-2 py-0.5 border rounded-md ${
                   alert.action === 'BUY' 
                     ? 'border-emerald-600/20 text-emerald-700 bg-emerald-50' 
                     : alert.action === 'SELL'
                     ? 'border-rose-500/20 text-rose-600 bg-rose-50'
                     : 'border-black/10 text-black/50 bg-black/5'
                 }`}>
                   {alert.action?.slice(0, 4)}
                 </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 text-black gap-4">
             <Activity size={24} className="animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-[0.5em]">Awaiting_Network_Synapse...</span>
          </div>
        )}
      </div>
    </div>
  );
}
