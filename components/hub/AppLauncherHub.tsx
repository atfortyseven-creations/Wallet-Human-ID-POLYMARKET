'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAccount, useBalance, useEnsName, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, MessageSquare, ShieldCheck, TrendingUp,
  Globe, BookOpen, Package, Fingerprint,
  LogOut, ChevronRight, Coins, Vote,
} from 'lucide-react';

// ─── App definitions ─────────────────────────────────────────────────────────

const APPS: {
  id: string;
  label: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
  colSpan: string;
}[] = [
  {
    id: 'terminal',
    label: 'Dashboard',
    desc: 'Portfolio, Markets & Identity',
    href: '/terminal',
    icon: LayoutDashboard,
    bg: '#0A0A0A',
    fg: '#FFFFFF',
    colSpan: 'col-span-1 sm:col-span-2',
  },
  {
    id: 'chat',
    label: 'LedgerChat',
    desc: 'E2E encrypted messaging',
    href: '/chat',
    icon: MessageSquare,
    bg: '#1C7AFF',
    fg: '#FFFFFF',
    colSpan: 'col-span-1',
  },
  {
    id: 'markets',
    label: 'Markets',
    desc: 'Live DeFi intelligence',
    href: '/terminal?tab=markets',
    icon: TrendingUp,
    bg: '#F5F5F7',
    fg: '#0A0A0A',
    colSpan: 'col-span-1',
  },
  {
    id: 'studio',
    label: 'Studio',
    desc: 'Asset provenance & NFTs',
    href: '/studio/provenance',
    icon: Package,
    bg: '#7C3AED',
    fg: '#FFFFFF',
    colSpan: 'col-span-1',
  },
  {
    id: 'governance',
    label: 'Governance',
    desc: 'Vote on proposals',
    href: '/terminal?tab=governance',
    icon: Vote,
    bg: '#F5F5F7',
    fg: '#0A0A0A',
    colSpan: 'col-span-1',
  },
  {
    id: 'identity',
    label: 'Identity',
    desc: 'ZK sovereign credential',
    href: '/terminal?tab=gold',
    icon: Fingerprint,
    bg: '#0A0A0A',
    fg: '#FFFFFF',
    colSpan: 'col-span-1',
  },
  {
    id: 'network',
    label: 'Network',
    desc: 'Global node map',
    href: '/terminal?tab=map',
    icon: Globe,
    bg: '#F5F5F7',
    fg: '#0A0A0A',
    colSpan: 'col-span-1',
  },
  {
    id: 'academy',
    label: 'Academy',
    desc: 'Learn cryptography',
    href: '/academy',
    icon: BookOpen,
    bg: '#F5F5F7',
    fg: '#0A0A0A',
    colSpan: 'col-span-1',
  },
  {
    id: 'registry',
    label: 'Registry',
    desc: 'Asset passport explorer',
    href: '/registry',
    icon: ShieldCheck,
    bg: '#F5F5F7',
    fg: '#0A0A0A',
    colSpan: 'col-span-1',
  },
  {
    id: 'token',
    label: 'QDS Token',
    desc: 'Stake · Vote · Earn',
    href: '/qds',
    icon: Coins,
    bg: '#F59E0B',
    fg: '#FFFFFF',
    colSpan: 'col-span-1 sm:col-span-2',
  },
];

// ─── App Card ────────────────────────────────────────────────────────────────

function AppCard({ app, index }: { app: typeof APPS[0]; index: number }) {
  const Icon: LucideIcon = app.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={app.colSpan}
    >
      <Link href={app.href} className="block h-full">
        <div
          className="relative h-full rounded-[24px] p-5 flex flex-col justify-between overflow-hidden
            cursor-pointer select-none transition-all duration-200
            hover:scale-[1.025] active:scale-[0.97] hover:shadow-xl shadow-sm"
          style={{ backgroundColor: app.bg, minHeight: '120px' }}
        >
          {/* Icon bubble */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: app.fg === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' }}
          >
            <Icon size={20} strokeWidth={1.8} color={app.fg} />
          </div>

          {/* Label */}
          <div className="mt-auto pt-5">
            <p className="font-semibold text-[15px] leading-tight" style={{ color: app.fg }}>
              {app.label}
            </p>
            <p className="text-[12px] mt-0.5 font-medium" style={{ color: app.fg, opacity: 0.55 }}>
              {app.desc}
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={14}
            className="absolute bottom-5 right-5"
            style={{ color: app.fg, opacity: 0.25 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Identity Panel ───────────────────────────────────────────────────────────

function IdentityPanel() {
  const { address, connector, chainId } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ens } = useEnsName({ address, chainId: 1 });
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const short = address ? `${address.slice(0, 6)}···${address.slice(-4)}` : null;
  const bal = balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : null;

  if (!address) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 bg-white rounded-[24px] border border-black/[0.06] p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Clock */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/30 mb-1">Session Active</p>
          <p className="font-mono text-[28px] font-bold text-black tracking-tight tabular-nums leading-none">{time}</p>
          <p className="font-mono text-[11px] text-black/30 mt-1">{date}</p>
        </div>

        {/* Wallet info */}
        <div className="text-right flex-shrink-0">
          <div className="inline-flex items-center gap-2 bg-black/[0.04] rounded-full px-4 py-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[12px] font-bold text-black">{short}</span>
          </div>
          {ens && <p className="font-mono text-[11px] text-black/40 mb-1">{ens}</p>}
          {bal && <p className="font-mono text-[11px] text-black/35">{bal}</p>}
          {connector?.name && (
            <p className="font-mono text-[10px] text-black/25 mt-1">{connector.name}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center gap-2.5">
        <Link
          href="/terminal"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-[12px] font-bold tracking-wide hover:bg-black/80 transition-all active:scale-95"
        >
          <LayoutDashboard size={13} />
          Open Dashboard
        </Link>
        <button
          onClick={() => {
            disconnect();
            try { localStorage.setItem('__disconnected__', '1'); sessionStorage.setItem('__disconnected__', '1'); } catch {}
            router.push('/');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-black/40 text-[12px] font-bold tracking-wide hover:text-red-500 hover:border-red-200 transition-all active:scale-95"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function AppLauncherHub() {
  return (
    <div>
      <IdentityPanel />

      {/* Section label */}
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/25 mb-4 px-1">
        Applications
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {APPS.map((app, i) => (
          <AppCard key={app.id} app={app} index={i} />
        ))}
      </div>
    </div>
  );
}
