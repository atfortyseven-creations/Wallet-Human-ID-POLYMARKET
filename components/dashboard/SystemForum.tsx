"use client";

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import { SystemFooter } from '@/components/landing/SystemFooter';
import { FooterPageIntro } from '@/components/landing/FooterPageIntro';
import { COMMUNITY_FORUM_INTRO } from '@/lib/content/footerPagesAztec';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Hash, ChevronRight, MessageSquare, Eye, ThumbsUp,
  Clock, TrendingUp, Flame, Star, Filter, Bell, Settings, Users,
  BarChart2, Shield, Zap, Globe, Code, Bug, Radio, Activity,
  X, ArrowRight, Bookmark, Share2, MoreHorizontal, Layers
} from 'lucide-react';
import Image from 'next/image';

// ─── Category Metadata ────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string; ring: string }> = {
  'whale-network':  { icon: <Activity size={14} />,     color: '#050505', bg: 'bg-black',        ring: 'ring-black/20' },
  'general':        { icon: <Globe size={14} />,         color: '#0088cc', bg: 'bg-[#0088cc]',   ring: 'ring-blue-200' },
  'applications':   { icon: <Layers size={14} />,        color: '#00C076', bg: 'bg-emerald-500', ring: 'ring-emerald-200' },
  'testnets':       { icon: <Radio size={14} />,         color: '#F59E0B', bg: 'bg-amber-500',   ring: 'ring-amber-200' },
  'noir':           { icon: <Shield size={14} />,        color: '#7C3AED', bg: 'bg-violet-600',  ring: 'ring-violet-200' },
  'site-feedback':  { icon: <Bug size={14} />,           color: '#64748B', bg: 'bg-slate-500',   ring: 'ring-slate-200' },
  'qds-connect':    { icon: <Zap size={14} />,           color: '#EC4899', bg: 'bg-pink-500',    ring: 'ring-pink-200' },
};

const FILTER_TABS = [
  { id: 'categories', label: 'Categories',  icon: <Hash size={13} /> },
  { id: 'latest',     label: 'Latest',      icon: <Clock size={13} /> },
  { id: 'new',        label: 'New',         icon: <Star size={13} /> },
  { id: 'unread',     label: 'Unread',      icon: <Eye size={13} /> },
  { id: 'top',        label: 'Top',         icon: <TrendingUp size={13} /> },
];

// ─── Search Modal ─────────────────────────────────────────────────────────────
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }  // BUG-08 FIX: min 2 chars
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/forum/topics?search=${encodeURIComponent(query.trim())}&limit=8`);
        const data = await r.json();
        if (Array.isArray(data)) setResults(data);  // BUG-04 FIX: guard Array
      } catch {} finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[8px] flex items-start justify-center pt-20 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[680px] bg-white backdrop-blur-3xl rounded-2xl shadow-2xl overflow-hidden border border-black/10"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search discussions, topics, categories…"
              className="flex-1 text-[15px] text-slate-900 placeholder-slate-400 outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            )}
            <button onClick={onClose} className="ml-1 text-slate-400 hover:text-slate-600 text-[11px] font-mono uppercase tracking-wider px-2 py-1 border border-black/10 rounded">
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Searching…</div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <p className="px-5 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Results</p>
                {results.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => { router.push(`/forum/t/${topic.id}`); onClose(); }}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-black/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 uppercase">
                      {topic.author?.walletAddress?.slice(2, 4) || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-slate-900 truncate">{topic.title}</p>
                      {topic.category && (
                        <p className="text-[12px] text-slate-400">{topic.category.name}</p>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="py-12 text-center">
                <p className="text-slate-500 text-[14px]">No results for <strong>"{query}"</strong></p>
                <p className="text-slate-400 text-[12px] mt-1">Try a different keyword or start a new topic.</p>
              </div>
            ) : (
              <div className="py-8 px-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-3">Quick Links</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Latest Topics', href: '/forum?filter=latest', icon: <Clock size={13} /> },
                    { label: 'Unread Discussions', href: '/forum?filter=unread', icon: <Eye size={13} /> },
                    { label: 'New Posts', href: '/forum?filter=new', icon: <Star size={13} /> },
                    { label: 'Top Topics', href: '/forum?filter=top', icon: <TrendingUp size={13} /> },
                  ].map(link => (
                    <Link key={link.label} href={link.href} onClick={onClose}
                      className="flex items-center gap-2 p-3 rounded-xl border border-black/5 hover:bg-black/5 transition-colors text-[13px] text-slate-600">
                      <span className="text-slate-400">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-3 border-t border-black/5 flex items-center gap-4 bg-black/[0.02]">
            <span className="text-[11px] text-slate-400 font-mono">@ to filter by author</span>
            <span className="text-[11px] text-slate-400 font-mono"># to filter by category</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Hamburger Menu ───────────────────────────────────────────────────────────
function HamburgerMenu({ categories, onClose }: { categories: any[]; onClose: () => void }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);  // BUG-09 FIX: onClose in dependency array

  const menuLinks = [
    { label: 'All Topics',    href: '/forum?filter=latest', icon: <MessageSquare size={16} /> },
    { label: 'My Posts',      href: '/forum/u/me',          icon: <Bookmark size={16} /> },
    { label: 'Users',         href: '/forum/users',         icon: <Users size={16} /> },
    { label: 'Guidelines',    href: '/forum/guidelines',    icon: <Shield size={16} /> },
    { label: 'Badges',        href: '/forum/badges',        icon: <Star size={16} /> },
    { label: 'Groups',        href: '/forum/groups',        icon: <BarChart2 size={16} /> },
    { label: 'Anniversaries', href: '/forum/anniversaries', icon: <Activity size={16} /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-[2px]"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[54px] right-4 w-[min(380px,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Main links grid */}
          <div className="p-4 grid grid-cols-2 gap-1">
            {menuLinks.map(link => (
              <Link key={link.label} href={link.href} onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors text-[13px] text-slate-700 font-medium">
                <span className="text-slate-400">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 pt-3 pb-1">
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Categories</p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map(cat => {
                const meta = CATEGORY_META[cat.slug] || { icon: <Hash size={14} />, color: '#64748B', bg: 'bg-slate-500', ring: 'ring-slate-200' };
                return (
                  <Link key={cat.id} href={`/forum/c/${cat.slug}`} onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[13px] text-slate-700 font-medium">
                    <span className={`w-3 h-3 rounded-sm ${meta.bg} shrink-0`} style={{ background: meta.color }} />
                    {cat.name}
                  </Link>
                );
              })}
              <Link href="/forum" onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[13px] text-slate-500 col-span-1">
                <Hash size={13} />
                All categories
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 pt-3 pb-3 mt-1">
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Tags</p>
            <div className="flex flex-wrap gap-2">
              {['noir', 'zk-proof', 'aztec', 'whale', 'defi', 'testnet', 'specs'].map(tag => (
                <Link key={tag} href={`/forum/tags/${tag}`} onClick={onClose}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] hover:bg-slate-200 transition-colors">
                  <Hash size={10} />
                  {tag}
                </Link>
              ))}
              <Link href="/forum/tags" onClick={onClose}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 text-[12px] hover:bg-slate-200 transition-colors">
                All tags
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-black/5/50">
            <Link href="/forum/new" onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 transition-colors">
              <Plus size={13} />
              New Topic
            </Link>
            <Link href="/forum/settings" onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 transition-colors">
              <Settings size={13} />
              Settings
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ cat, index }: { cat: any; index: number }) {
  const meta = CATEGORY_META[cat.slug] || { icon: <Hash size={14} />, color: '#64748B', bg: 'bg-slate-500', ring: 'ring-slate-200' };
  const latest = cat.topics?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/forum/c/${cat.slug}`}
        className="group flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ background: meta.color }}
            >
              {meta.icon}
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-slate-900 group-hover:text-slate-700 transition-colors leading-tight">
                {cat.name}
              </h3>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {cat._count?.topics ?? 0} topics
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ChevronRight size={14} className="text-slate-400" />
          </div>
        </div>

        {/* Description */}
        {cat.description && (
          <p className="text-[13px] text-slate-500 leading-relaxed flex-1 mb-4 line-clamp-2">
            {cat.description}
          </p>
        )}

        {/* Latest post */}
        {latest ? (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-1 font-bold">Latest</p>
            <p className="text-[12px] text-slate-500 truncate leading-snug">{latest.title}</p>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[12px] text-slate-300 italic">No topics yet — be the first!</p>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

// ─── Topic Row ────────────────────────────────────────────────────────────────
function TopicRow({ topic, mounted }: { topic: any; mounted: boolean }) {
  const meta = CATEGORY_META[topic.category?.slug] || { color: '#64748B', bg: 'bg-slate-400' };
  const rawDate = topic.updatedAt || topic.createdAt;
  // BUG-06 FIX: Guard against null/invalid dates that crash date-fns
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
  const activity = mounted && isValidDate
    ? formatDistanceToNowStrict(parsedDate!, { addSuffix: false })
        .replace(' minutes', 'm').replace(' minute', 'm')
        .replace(' hours', 'h').replace(' hour', 'h')
        .replace(' days', 'd').replace(' day', 'd')
        .replace(' months', 'mo').replace(' month', 'mo')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
    <Link
      href={`/forum/t/${topic.id}`}
      className="group flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-black/5 transition-colors px-3 -mx-3 rounded-xl gap-4"
    >
      {/* Left: avatar + info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 uppercase shadow-sm"
          style={{ background: meta.color }}>
          {topic.author?.walletAddress?.slice(2, 4) || '??'}
        </div>

        <div className="flex flex-col min-w-0 gap-1">
          <span className="font-medium text-[15px] text-slate-900 group-hover:text-slate-700 transition-colors truncate leading-tight">
            {topic.title}
          </span>
          <div className="flex items-center gap-2">
            {topic.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                {topic.category.name}
              </span>
            )}
            {topic.isPinned && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                <Star size={10} fill="currentColor" /> Pinned
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: stats */}
      <div className="flex items-center gap-5 shrink-0 text-slate-400">
        <div className="hidden sm:flex flex-col items-center min-w-[32px]">
          <span className="text-[14px] font-bold text-slate-700 leading-none">{topic._count?.posts || 0}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">rep</span>
        </div>
        <div className="hidden md:flex flex-col items-center min-w-[32px]">
          <span className="text-[14px] font-medium leading-none text-slate-700">{topic._count?.likes || topic.likeCount || 0}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">likes</span>
        </div>
        <div className="flex flex-col items-end min-w-[36px]">
          <span className="text-[13px] text-slate-400 leading-none">{activity}</span>
        </div>
      </div>
    </Link>
    </motion.div>
  );
}


// ─── Main Forum Content ───────────────────────────────────────────────────────
function ForumHomeContent() {
  const [topics, setTopics]         = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [isMounted, setIsMounted]   = useState(false);
  const [activeTab, setActiveTab]   = useState('categories');
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // Keyboard shortcut for search
    // BUG-07 FIX: Use separate handlers so keyboard events don't interfere with scroll passivity
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // BUG-02 FIX: loadData must NOT be in useCallback with activeTab as dep
  // and separately re-triggered by useEffect([loadData]).
  // That pattern causes 2 simultaneous fetches on every tab change.
  // Instead: a single useEffect with activeTab as direct dependency.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const filterParam = activeTab === 'categories' ? 'latest' : activeTab;
        const [topicsRes, catsRes] = await Promise.all([
          fetch(`/api/forum/topics?limit=40&filter=${filterParam}`),
          fetch('/api/forum/categories'),
        ]);
        const [topicsData, catsData] = await Promise.all([topicsRes.json(), catsRes.json()]);
        if (cancelled) return;
        // BUG-04 FIX: Always validate Array before setState
        if (Array.isArray(topicsData)) setTopics(topicsData);
        if (Array.isArray(catsData)) setCategories(catsData);
      } catch (e) {
        if (!cancelled) console.error('[Forum] loadData failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeTab]);


  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6] text-[#050505] w-full overflow-y-auto">

      {/* ── Top Master Bar (Forum Custom) ── */}
      <header className="sticky top-0 border-b border-black/[0.06] bg-white flex items-center justify-between px-6 z-40 shrink-0 transition-colors duration-300" style={{ minHeight: 'calc(56px + env(safe-area-inset-top, 0px))', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          {/* LEFT: Hamburger + Search */}
          <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className={`flex items-center justify-center w-9 h-9 rounded-full border border-black/10 transition-colors ${menuOpen ? 'bg-black text-white' : 'bg-transparent hover:bg-black/5 text-slate-500'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <button
                  onClick={() => setSearchOpen(true)}
                  className="group flex items-center gap-2.5 h-9 px-4 rounded-full border border-black/[0.08] bg-white hover:bg-black/[0.02] hover:border-black/20 transition-all duration-200 cursor-pointer shrink-0 shadow-sm"
              >
                  <Search size={14} className="text-[#AAAAAA] group-hover:text-[#555] transition-colors shrink-0" />
                  <span className="text-[12px] text-[#AAAAAA] group-hover:text-[#555] font-medium transition-colors hidden sm:block pr-2">Search</span>
                  <span className="hidden sm:flex items-center gap-1">
                      <kbd className="text-[10px] font-black font-mono text-[#AAAAAA] bg-black/[0.04] rounded px-1.5 py-0.5 leading-none">K</kbd>
                  </span>
              </button>
          </div>

          {/* CENTER: Links */}
          <div className="flex-1 flex justify-center mx-4 overflow-hidden">
             <div className="hidden lg:flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-full border border-black/5 shadow-inner">
                 <Link href="/dashboard" className="px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-black rounded-full transition-colors">DASHBOARD</Link>
                 <Link href="/chat" className="px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-black rounded-full transition-colors">WHALE CHAT</Link>
                 <Link href="/status" className="px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-black rounded-full transition-colors">STATUS</Link>
              </div>
          </div>

          {/* RIGHT: Profile */}
          <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/portfolio"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-black/10 text-slate-500 hover:bg-black/5 transition-colors"
              >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                 </svg>
              </Link>
          </div>
      </header>

      {/* ── Page Content ── */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col gap-8">

        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-[24px] md:text-[32px] font-black tracking-tight text-slate-900 leading-none mb-1 uppercase">
                  Whale Network Forum
                </h1>
                <p className="text-[13px] text-slate-500 font-medium max-w-xl leading-relaxed hidden sm:block">
                  Discuss protocol upgrades, Noir circuits, Aztec testnets, and QDs economics.
                </p>
              </div>
            </div>
            {/* Stats bar */}
            {!loading && (
              <div className="flex items-center gap-6 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[22px] font-black text-slate-900 tabular-nums leading-none">{topics.length}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Topics</span>
                </div>
                <div className="w-px h-5 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[22px] font-black text-slate-900 tabular-nums leading-none">
                    {topics.reduce((sum, t) => sum + (t._count?.posts || 0), 0)}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Replies</span>
                </div>
                <div className="w-px h-5 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[22px] font-black text-slate-900 tabular-nums leading-none">{categories.length}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Categories</span>
                </div>
                <div className="w-px h-5 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600">Live</span>
                </div>
              </div>
            )}
          </div>

          {/* Inline filter tab bar */}
          <div className="flex items-center gap-1 border-b border-black/8 pb-0">
            {FILTER_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    isActive
                      ? 'border-[#050505] text-[#050505]'
                      : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="opacity-80">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
            <div className="flex-1" />
            <Link
              href="/forum/new"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#050505] text-white text-[11px] font-bold hover:bg-black/80 transition-colors mb-1"
            >
              <Plus size={12} />
              New Topic
            </Link>
          </div>
        </div>

        <FooterPageIntro
          title="About this forum"
          sections={COMMUNITY_FORUM_INTRO}
          defaultOpen={false}
        />

        {/* ── CATEGORIES VIEW ── */}
        {activeTab === 'categories' && (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

            {/* Category Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400">All Categories</h2>
                <span className="text-[11px] text-slate-300 font-mono">{categories.length} categories</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categories.map((cat, i) => <CategoryCard key={cat.id} cat={cat} index={i} />)}
                </div>
              )}
            </div>

            {/* Right Panel: Latest Topics - BUG-05 FIX: sticky inside iOS scroll */}
            <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
              <div className="lg:sticky lg:top-[72px]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#0088cc]">
                  <h2 className="text-[13px] font-bold text-[#0088cc] uppercase tracking-wide flex items-center gap-2">
                    <Clock size={13} /> Latest
                  </h2>
                  <button onClick={() => setActiveTab('latest')} className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                    See all →
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-14 animate-pulse bg-black/5" />
                    ))
                  ) : topics.slice(0, 10).map(topic => (
                    <Link
                      key={topic.id}
                      href={`/forum/t/${topic.id}`}
                      className="group flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                        style={{ background: CATEGORY_META[topic.category?.slug]?.color || '#64748B' }}
                      >
                        {topic.author?.walletAddress?.slice(2, 4) || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 truncate transition-colors">
                          {topic.title}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-mono">{topic._count?.posts || 0}</span>
                    </Link>
                  ))}
                  {topics.length === 0 && !loading && (
                    <div className="py-10 text-center text-slate-400 text-[13px]">No topics yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TOPICS LIST VIEW ── */}
        {activeTab !== 'categories' && (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

            {/* Topics feed */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  {FILTER_TABS.find(t => t.id === activeTab)?.icon}
                  {FILTER_TABS.find(t => t.id === activeTab)?.label} Topics
                </h2>
                <Link href="/forum/new"
                  className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0088cc] text-white text-[11px] font-bold">
                  <Plus size={11} /> New
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 px-4 py-2 divide-y divide-slate-100">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_auto] gap-4 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-slate-300">
                  <span>Topic</span>
                  <span className="flex items-center gap-5 shrink-0">
                    <span className="w-8 text-center">Rep</span>
                    <span className="w-8 text-center hidden md:block">Likes</span>
                    <span className="w-9 text-right">Age</span>
                  </span>
                </div>

                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse bg-black/5 rounded-lg my-1" />
                  ))
                ) : topics.length === 0 ? (
                  <div className="py-20 flex flex-col items-center gap-4 text-center">
                    <MessageSquare size={32} className="text-slate-200" />
                    <p className="text-[14px] text-slate-400">No discussions here yet.</p>
                    <Link href="/forum/new"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0088cc] text-white text-[13px] font-bold hover:bg-[#0077b3] transition-colors">
                      <Plus size={14} />
                      Start a Discussion
                    </Link>
                  </div>
                ) : topics.map(topic => (
                  <TopicRow key={topic.id} topic={topic} mounted={isMounted} />
                ))}
              </div>
            </div>

            {/* Right sidebar: Categories quick-nav */}
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="sticky top-[72px]">
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-4">Categories</h2>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {categories.map((cat, i) => {
                    const meta = CATEGORY_META[cat.slug] || { color: '#64748B', icon: <Hash size={13} /> };
                    return (
                      <Link key={cat.id} href={`/forum/c/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-colors border-b border-slate-100 last:border-0 group">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: meta.color }} />
                        <span className="flex-1 text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                        <span className="text-[12px] font-mono text-slate-300">{cat._count?.topics ?? 0}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* New topic CTA */}
                <Link href="/forum/new"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0088cc] text-white text-[12px] font-bold hover:bg-[#0077b3] transition-colors shadow-sm">
                  <Plus size={14} />
                  Start a New Discussion
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {menuOpen && <HamburgerMenu categories={categories} onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

export default function ForumHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ForumHomeContent />
    </Suspense>
  );
}
