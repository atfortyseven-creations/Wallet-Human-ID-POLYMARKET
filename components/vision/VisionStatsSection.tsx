'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

interface PlatformStats {
  totalUsers: number;
  newUsersLast30d: number;
  whaleChatUsers: number;
  whaleChatConversations: number;
  registryTotal: number;
  growthByMonth: { month: string; users: number; chatUsers: number }[];
}

const STAT_CARDS = [
  {
    id: 'totalUsers',
    label: 'Registry Users',
    sublabel: 'Verified on-chain identities',
    accent: '#000000',
    bar: 'bg-black',
  },
  {
    id: 'whaleChatUsers',
    label: 'Whale Chat Users',
    sublabel: 'Wallets with encrypted conversations',
    accent: '#222222',
    bar: 'bg-black/80',
  },
  {
    id: 'whaleChatConversations',
    label: 'Encrypted Threads',
    sublabel: 'Total E2EE contact pairs created',
    accent: '#444444',
    bar: 'bg-black/60',
  },
  {
    id: 'newUsersLast30d',
    label: 'New (30 Days)',
    sublabel: 'Accounts registered this month',
    accent: '#000000',
    bar: 'bg-black',
  },
];

// Fixed bar heights for skeleton so SSR matches client render (no Math.random in render)
const SKELETON_HEIGHTS = [45, 80, 60, 95, 55, 75];

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
      const eased = 1 - Math.pow(1 - progress, 4); // Quartic ease-out
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

function BarChart({
  data,
}: {
  data: { month: string; users: number; chatUsers: number }[];
}) {
  const maxVal = Math.max(...data.flatMap((d) => [d.users, d.chatUsers]), 1);
  const BAR_MAX_H = 140;

  return (
    <div className="w-full select-none flex flex-col items-center justify-center py-4">
      {/* Bars container */}
      <div
        className="flex items-end justify-center gap-4 md:gap-8 px-4 w-full max-w-2xl"
        style={{ height: BAR_MAX_H + 30 }}
      >
        {data.map((d, i) => {
          const uH = d.users > 0 ? Math.max((d.users / maxVal) * BAR_MAX_H, 4) : 0;
          const cH = d.chatUsers > 0 ? Math.max((d.chatUsers / maxVal) * BAR_MAX_H, 4) : 0;
          return (
            <div
              key={i}
              className="flex flex-col items-center group relative"
              style={{ height: BAR_MAX_H + 30, width: '40px' }}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] font-mono px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 flex flex-col items-center gap-0.5 shadow-lg">
                <span>R: {d.users.toLocaleString()}</span>
                <span className="text-white/60">C: {d.chatUsers.toLocaleString()}</span>
              </div>

              {/* Bar group */}
              <div
                className="flex-1 flex items-end gap-1 w-full justify-center"
                style={{ paddingBottom: 0 }}
              >
                {/* Registry bar */}
                <div
                  className="rounded-t-[2px] transition-all duration-500 ease-out"
                  style={{
                    height: uH,
                    width: '12px',
                    background: '#000000',
                  }}
                />
                {/* Chat bar */}
                <div
                  className="rounded-t-[2px] transition-all duration-500 ease-out"
                  style={{
                    height: cH,
                    width: '12px',
                    background: '#000000',
                    opacity: 0.2,
                  }}
                />
              </div>
              {/* Month label */}
              <span className="mt-3 text-[9px] font-black uppercase tracking-widest text-black/40 block text-center leading-none">
                {d.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Y-axis Legend / Grid lines (cosmetic) */}
      <div className="mt-8 flex items-center justify-center gap-8 w-full max-w-md border-t border-black/5 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-[1px] bg-black" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black">Registry Volume</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-[1px] bg-black opacity-20" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black">Encrypted Chats</span>
        </div>
      </div>
    </div>
  );
}

// Builds the last 6 month labels deterministically (no random, SSR-safe)
function buildFallbackMonths(): { month: string; users: number; chatUsers: number }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      month: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      users: 0,
      chatUsers: 0,
    };
  });
}

export function VisionStatsSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Fetch real stats
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

  // Intersection Observer — trigger number animation on scroll into view
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
  const fallback = buildFallbackMonths();
  const chartData = stats?.growthByMonth?.length ? stats.growthByMonth : fallback;

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white border-t border-black/8 py-20 px-6 md:px-16"
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/10 bg-black/[0.025] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-black/45">
              Live Platform Data · Zero Simulation
            </span>
          </div>

          <h2 className="text-2xl md:text-[2rem] font-black uppercase tracking-tighter text-black leading-tight">
            Real Activity.{' '}
            <span className="text-black/30">Verified On-Chain.</span>
          </h2>
          <p className="mt-3 text-[13px] text-black/45 max-w-xl leading-relaxed font-sans">
            Every figure is pulled directly from our live production database — real wallets,
            real conversations, real registrations. No mock data, ever.
          </p>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {STAT_CARDS.map((card) => {
            const val = getVal(card.id);
            return (
              <div
                key={card.id}
                className="group relative border border-black/8 rounded-2xl p-5 bg-white hover:border-black/18 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden"
              >
                {/* Accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-all duration-500 group-hover:opacity-100 opacity-60"
                  style={{ background: card.accent }}
                />

                {/* Number */}
                <div className="font-mono text-[1.75rem] md:text-[2rem] font-black text-black tabular-nums leading-none mt-2">
                  {loading ? (
                    <div className="w-14 h-7 bg-black/6 rounded-md animate-pulse" />
                  ) : visible ? (
                    <AnimatedNumber target={val} />
                  ) : (
                    <span className="text-black/20">—</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 space-y-0.5">
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

        {/* ── Growth Chart ───────────────────────────────────────────────── */}
        <div className="border border-black/8 rounded-2xl bg-white overflow-hidden">
          {/* Chart header */}
          <div className="px-6 md:px-8 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-black/5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/25 mb-1">
                Growth Chart · Last 6 Months
              </p>
              <p className="text-base font-black uppercase tracking-tighter text-black">
                Platform Adoption Velocity
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 border border-black/8 rounded-full shrink-0">
              <span className="w-1 h-1 rounded-full bg-black animate-pulse" />
              <span className="text-[8px] font-mono uppercase tracking-widest text-black/35">Live</span>
            </div>
          </div>

          {/* Chart body */}
          <div className="px-6 md:px-8 py-6">
            {loading ? (
              /* Skeleton bars — fixed heights, no Math.random */
              <div className="flex items-end gap-2 px-1" style={{ height: 160 }}>
                {SKELETON_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-black/[0.05] rounded-t-sm animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            ) : (
              <BarChart data={chartData} />
            )}
          </div>

          {/* Footer stats row */}
          <div className="px-6 md:px-8 py-5 border-t border-black/5 bg-black/[0.012] flex flex-wrap gap-8 items-center">
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

      </div>
    </section>
  );
}
