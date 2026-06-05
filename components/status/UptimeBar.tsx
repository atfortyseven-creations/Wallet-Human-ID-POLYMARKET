"use client";

import React, { useState } from 'react';


export interface UptimeDay {
  date: string;
  status: 'operational' | 'degraded' | 'outage';
  uptimePercentage: number;
  incidents?: number;
}

interface UptimeBarProps {
  serviceName: string;
  uptimePercentage: string;
  days: UptimeDay[];
}

export default function UptimeBar({ serviceName, uptimePercentage, days }: UptimeBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<{ day: UptimeDay, index: number } | null>(null);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-300 shadow-sm mb-4">
      {/* Header Row */}
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? <span className="font-mono text-[10px] font-black text-slate-400">[^]</span> : <span className="font-mono text-[10px] font-black text-slate-400">[v]</span>}
          <span className="font-semibold text-sm text-slate-800">{serviceName}</span>
        </div>
        <span className="text-sm font-medium text-slate-400">{uptimePercentage} uptime</span>
      </div>

      {/* Bar Row */}
      <div className="px-6 pb-5 pt-1 border-t border-slate-50 bg-black/5/30">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-2">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
        
        {/* The Segments */}
        <div className="flex items-center h-8 gap-[2px] relative w-full">
          {days.map((day, i) => {
            let bgColor = 'bg-black/80';
            if (day.status === 'degraded') bgColor = 'bg-black/40';
            if (day.status === 'outage') bgColor = 'bg-black/10';

            return (
              <div 
                key={i}
                className={`flex-1 h-full rounded-sm ${bgColor} opacity-90 hover:opacity-100 hover:scale-y-110 transition-all cursor-crosshair relative`}
                onMouseEnter={() => setHoveredDay({ day, index: i })}
                onMouseLeave={() => setHoveredDay(null)}
              />
            );
          })}

          {/* Tooltip */}
          {hoveredDay && (
            <div 
              className="absolute top-10 bg-white border border-slate-200 shadow-2xl rounded-lg w-64 z-20 pointer-events-none transform -translate-x-1/2"
              style={{ left: `${(hoveredDay.index / 90) * 100}%` }}
            >
              <div className={`px-4 py-3 rounded-t-lg border-b border-black/10 ${
                hoveredDay.day.status === 'outage' ? 'bg-black/10 text-black' :
                hoveredDay.day.status === 'degraded' ? 'bg-black/5 text-black' :
                'bg-black text-white'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {hoveredDay.day.status === 'outage' ? 'Major Outage' :
                   hoveredDay.day.status === 'degraded' ? 'Degraded Performance' :
                   'Operational'}
                </p>
                {hoveredDay.day.status !== 'operational' && (
                  <p className="text-[10px] mt-0.5 opacity-80">
                    {100 - hoveredDay.day.uptimePercentage}% downtime
                  </p>
                )}
              </div>
              <div className="px-4 py-3 bg-white rounded-b-lg">
                <p className="text-xs font-semibold text-slate-900">{hoveredDay.day.date}</p>
                {hoveredDay.day.status !== 'operational' && (
                  <div className="mt-3 text-xs text-slate-600">
                    <p className="font-medium mb-1 uppercase text-[10px] tracking-wider text-slate-400">Incidents</p>
                    <p>Elevated latency and service unavailable responses recorded.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 py-4 bg-white border-t border-slate-100 text-sm text-slate-600">
          <p>Detailed performance metrics for {serviceName} will be populated here.</p>
        </div>
      )}
    </div>
  );
}
