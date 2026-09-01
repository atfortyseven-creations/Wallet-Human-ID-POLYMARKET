"use client";
import { useState, useEffect } from 'react';

const MAINNET_LAUNCH_DATE = new Date('2027-01-15T00:00:00Z'); // Update before launch

export function MainnetLaunchBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dismissed, setDismissed] = useState(true); // hidden by default

  useEffect(() => {
    // Only show if we haven't launched yet
    const now = new Date();
    if (now >= MAINNET_LAUNCH_DATE) return;
    
    const wasDismissed = localStorage.getItem('mainnet_banner_dismissed') === '1';
    if (!wasDismissed) setDismissed(false);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      const now = new Date();
      const diff = MAINNET_LAUNCH_DATE.getTime() - now.getTime();
      if (diff <= 0) { setDismissed(true); clearInterval(timer); return; }
      
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 text-sm font-mono">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-white/60">Mainnet</span>
      <span className="font-black">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
      <button onClick={() => { setDismissed(true); localStorage.setItem('mainnet_banner_dismissed', '1'); }}
        className="text-white/30 hover:text-white text-xs ml-2">✕</button>
    </div>
  );
}
