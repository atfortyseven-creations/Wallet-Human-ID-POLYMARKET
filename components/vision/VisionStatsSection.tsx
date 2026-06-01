'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

interface PlatformStats {
  totalUsers: number;
  newUsersLast30d: number;
  whaleChatUsers: number;
  whaleChatConversations: number;
  registryTotal: number;
}

const STAT_CARDS = [
  {
    id: 'totalUsers',
    label: 'Registry Users',
    sublabel: 'Verified on-chain identities',
    accent: '#000000',
  },
  {
    id: 'whaleChatUsers',
    label: 'Whale Chat Users',
    sublabel: 'Wallets with encrypted conversations',
    accent: '#222222',
  },
  {
    id: 'whaleChatConversations',
    label: 'Encrypted Threads',
    sublabel: 'Total E2EE contact pairs created',
    accent: '#444444',
  },
  {
    id: 'newUsersLast30d',
    label: 'New (30 Days)',
    sublabel: 'Accounts registered this month',
    accent: '#000000',
  },
];

function AnimatedNumber({
  target,
  duration = 1600,
}: {
  target: number;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const animate = useCallback(
    (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [target, duration]
  );

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, target]);

  return <>{value.toLocaleString('en-US')}</>;
}

export function VisionStatsSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/stats/platform')
      .then((r) => r.json())
      .then((d: PlatformStats) => {
        if (mounted) { setStats(d); setLoading(false); }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const getVal = (id: string): number => (!stats ? 0 : (stats as Record<string, number>)[id] ?? 0);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white border-t border-black/8 py-20 px-6 md:px-16"
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Section Header ── */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-[2rem] font-black uppercase tracking-tighter text-black leading-tight">
            Platform Statistics
          </h2>
          <p className="text-[13px] text-black/40 mt-2">
            Live data from the Humanity Ledger ecosystem — updated in real time.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => {
            const val = getVal(card.id);
            return (
              <div
                key={card.id}
                className="group relative border border-black/8 rounded-2xl p-6 bg-white hover:border-black/18 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: card.accent }}
                />
                <div className="font-mono text-[1.75rem] md:text-[2.25rem] font-black text-black tabular-nums leading-none mt-2">
                  {loading ? (
                    <div className="w-14 h-7 bg-black/6 rounded-md animate-pulse" />
                  ) : visible ? (
                    <AnimatedNumber target={val} />
                  ) : (
                    <span className="text-black/20">—</span>
                  )}
                </div>
                <div className="mt-4 space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-black/65">
                    {card.label}
                  </p>
                  <p className="text-[9px] text-black/30 leading-relaxed">
                    {card.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer row ── */}
        <div className="mt-6 flex flex-wrap gap-8 items-center border-t border-black/5 pt-5">
          {[
            { id: 'registryTotal', label: 'Total Registry Entries' },
            { id: 'whaleChatConversations', label: 'Encrypted Threads' },
            { id: 'newUsersLast30d', label: 'New (30 Days)' },
          ].map((item, idx) => (
            <div key={item.id} className="flex items-center gap-4">
              {idx > 0 && <div className="w-px h-7 bg-black/10 hidden md:block" />}
              <div>
                <p className="font-mono text-base font-black text-black tabular-nums">
                  {visible && stats
                    ? <AnimatedNumber target={getVal(item.id)} />
                    : <span className="text-black/20">—</span>
                  }
                </p>
                <p className="text-[8px] uppercase font-black tracking-widest text-black/30 mt-0.5">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
          <div className="ml-auto">
            <span className="text-[8px] font-mono text-black/20 uppercase tracking-wider">
              Source: Humanity Ledger Live DB
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
