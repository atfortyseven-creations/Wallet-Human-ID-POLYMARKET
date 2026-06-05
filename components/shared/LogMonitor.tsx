"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity, Shield, Hash, Clock, AlertTriangle } from "lucide-react";

interface LogEntry {
  id: string;
  message: string;
  level: string;
  source: string;
  createdAt: string;
}

export function LogMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs?limit=40");
      if (res.ok) {
        const data = await res.json();
        setLogs(prev => {
          // Only update if data is fresh
          if (JSON.stringify(data) !== JSON.stringify(prev)) return data;
          return prev;
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      if (isActive) fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR": return "text-red-500 bg-red-500/10";
      case "WARN": return "text-amber-500 bg-amber-500/10";
      case "DEBUG": return "text-cyan-500 bg-cyan-500/10";
      default: return "text-emerald-500 bg-emerald-500/10";
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/95 text-white/90 font-mono text-[10px] overflow-hidden border border-white/5 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-[#00F2EA]" />
          <span className="font-black uppercase tracking-[0.2em] text-[10px]">System Telemetry</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{isActive ? 'Active' : 'Paused'}</span>
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-colors"
          >
            {isActive ? 'PAUSE' : 'RESUME'}
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex items-start gap-4 py-1.5 px-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-2 shrink-0">
                 <Clock size={10} className="text-white/20" />
                 <span className="text-white/30 text-[9px]">
                   {new Date(log.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                 </span>
              </div>
              
              <div className={`shrink-0 px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${getLevelColor(log.level)}`}>
                {log.level}
              </div>

              <div className="shrink-0 text-white/40 uppercase tracking-widest text-[9px] border-r border-white/10 pr-3 mr-1">
                {log.source}
              </div>

              <div className="flex-1 break-words font-medium leading-relaxed">
                {log.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 py-20">
            <Activity size={32} />
            <p className="uppercase tracking-[0.3em] font-black">Awaiting Stream Initialization...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-black flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <Shield size={10} className="text-emerald-500/50" />
              <span className="text-[9px] opacity-30">ENCRYPTED_HANDSHAKE:AES-256</span>
           </div>
           <div className="flex items-center gap-2">
              <Hash size={10} className="text-cyan-500/50" />
              <span className="text-[9px] opacity-30">COMMIT_SHA:sov_612</span>
           </div>
        </div>
        <div className="text-[9px] opacity-20 font-black italic">System OS v6.12.0u</div>
      </div>
    </div>
  );
}
