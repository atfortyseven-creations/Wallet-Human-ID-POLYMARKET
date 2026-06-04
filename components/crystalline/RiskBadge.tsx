import React from 'react';

export function RiskBadge({ level }: { level: string }) {
  const colors = {
    LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    CRITICAL: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  };

  const currentStyle = colors[level as keyof typeof colors] || colors.LOW;

  return (
    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${currentStyle}`}>
      {level || 'LOW'} RISK
    </div>
  );
}
