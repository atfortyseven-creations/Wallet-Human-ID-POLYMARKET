"use client";

import React, { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';

interface TelemetryEvent {
  id: string;
  action: string;
  createdAt: string;
  metadata?: any;
}

export function ForumRadar() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch('/api/forum/telemetry/live');
        const data = await res.json();
        if (data.success && data.events) {
          setEvents(data.events);
        }
      } catch (e) {
        console.error("Radar fetch failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRadar();
    const interval = setInterval(fetchRadar, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[180px] border border-white/10 bg-black/20 flex flex-col justify-center items-center p-4">
        <div className="text-[10px] font-mono text-[#00f2ea] uppercase tracking-widest animate-pulse">
          INITIALIZING RADAR...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-white/10 bg-black/20 p-4 flex flex-col relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f2ea]/50 to-transparent opacity-50" />
      
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <span className="text-[10px] font-aztec-h2 uppercase tracking-[0.2em] text-[#00f2ea]">
          LIVE SURVEILLANCE
        </span>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ea] animate-pulse" />
           <span className="text-[9px] font-mono uppercase text-white/40 tracking-widest">SYS_ONLINE</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 h-[140px] overflow-y-auto custom-scrollbar pr-2">
        {events.length === 0 ? (
           <div className="text-[9px] font-mono text-white/30 uppercase">NO RECENT TELEMETRY DETECTED</div>
        ) : (
          events.map((ev, i) => (
            <div key={ev.id} className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0" style={{ opacity: Math.max(1 - i * 0.1, 0.3) }}>
              <span className="text-[9px] font-mono text-white/30 whitespace-nowrap pt-0.5">
                {formatDistanceToNowStrict(new Date(ev.createdAt))} ago
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#00f2ea] uppercase tracking-wider">
                  [{ev.action}]
                </span>
                {ev.metadata?.simulated && (
                  <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest mt-0.5">
                    GHOST_SIGNAL_DETECTED
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
