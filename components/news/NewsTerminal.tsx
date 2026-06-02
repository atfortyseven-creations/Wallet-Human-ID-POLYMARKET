"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useNewsStore, NewsArticle } from '@/lib/store/news-store';
import { useAccount } from 'wagmi';
import { CryptoCheckoutModal } from './CryptoCheckoutModal';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil((text ?? '').split(/\s+/).length / 220));
}

async function fetchEthEur(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur',
      { cache: 'no-store', signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ethereum?.eur ?? null;
  } catch {
    return null;
  }
}

export function NewsTerminal() {
  const { isNewsSubscribed, lastBackupDate, setLastBackupDate, archive, upsertDayArticles, getArchiveDates } = useNewsStore();
  const { address } = useAccount();
  const router = useRouter();

  const [tier,         setTier]         = useState<string>('FREE');
  const [articles,     setArticles]     = useState<NewsArticle[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState<NewsArticle | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shareOpen,    setShareOpen]    = useState(false);
  const [shareEmail,   setShareEmail]   = useState('');
  const [shareNote,    setShareNote]    = useState('');
  const [isSending,    setIsSending]    = useState(false);
  const [shareSent,    setShareSent]    = useState(false);
  const [ethEur,       setEthEur]       = useState<number | null>(null);
  const [showArchive,  setShowArchive]  = useState(false);
  const [marketTimes,  setMarketTimes]  = useState<{name: string, time: string, isOpen: boolean}[]>([]);

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang,  setCurrentLang]  = useState('ES');
  const [isTranslating,setIsTranslating]= useState(false);

  const LANGUAGES = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'FR', name: 'Français' },
    { code: 'DE', name: 'Deutsch' },
    { code: 'RU', name: 'Русский' },
    { code: 'ZH', name: '中文' },
    { code: 'BG', name: 'Български' },
    { code: 'PT', name: 'Português (BR)' }
  ];

  const tFullAnalysis = currentLang === 'ES' ? 'Leer Análisis Completo' :
                        currentLang === 'FR' ? 'Lire L\'analyse Complète' :
                        currentLang === 'DE' ? 'Vollständige Analyse Lesen' :
                        currentLang === 'RU' ? 'Читать Полный Анализ' :
                        currentLang === 'ZH' ? '阅读完整分析' :
                        currentLang === 'BG' ? 'Прочетете Пълния Анализ' :
                        currentLang === 'PT' ? 'Ler Análise Completa' :
                        'Read Full Analysis';

  const handleTranslate = async (code: string) => {
    setShowLangMenu(false);
    if (code === currentLang) return;
    setIsTranslating(true);
    // Simulated core translation delay
    await new Promise(r => setTimeout(r, 1200));
    setCurrentLang(code);
    setIsTranslating(false);
  };

  const rightRef = useRef<HTMLDivElement>(null);

  //  Market clocks 
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
      const f = (tz: string) => now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
      setMarketTimes([
        { name: 'NY',  time: f('America/New_York'), isOpen: !isWeekend && (utcHour >= 13 && utcHour < 20) },
        { name: 'LON', time: f('Europe/London'),    isOpen: !isWeekend && (utcHour >= 8  && utcHour < 16) },
        { name: 'TYO', time: f('Asia/Tokyo'),       isOpen: !isWeekend && (utcHour >= 0  && utcHour < 6)  },
      ]);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  //  Load data 
  useEffect(() => {
    fetchEthEur().then(setEthEur);

    fetch('/api/auth/session', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user?.tier) setTier(data.user.tier.split('_')[0].toUpperCase());
      })
      .catch(console.error);

    fetch('/api/news', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const items: NewsArticle[] = data.articles ?? [];
        setArticles(items);
        if (items.length > 0) {
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            setSelected(items[0]);
          }
          upsertDayArticles(todayKey(), items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [upsertDayArticles]);

  useEffect(() => {
    rightRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [selected?.id]);

  const handleDownload = useCallback(async () => {
    const today = todayKey();
    const blob = new Blob([JSON.stringify({ date: today, articles }, null, 2)], { type: 'application/json' });
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({ suggestedName: `${today}_Analytics.json`, types: [{ accept: { 'application/json': ['.json'] } }] });
        const writable = await handle.createWritable();
        await writable.write(blob); await writable.close();
        setLastBackupDate(today); return;
      } catch (e: any) { if (e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `${today}_Analytics.json` });
    a.click(); URL.revokeObjectURL(url);
    setLastBackupDate(today);
  }, [articles, setLastBackupDate]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !shareEmail) return;
    setIsSending(true);
    try {
      await fetch('/api/news/share', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTarget: shareEmail, articleId: selected.id, articleTitle: selected.title, messageNote: shareNote }),
      });
      setShareSent(true);
      setTimeout(() => { setShareOpen(false); setShareSent(false); setShareEmail(''); setShareNote(''); }, 2200);
    } finally { setIsSending(false); }
  };

  const openFullReport = () => {
    if (!selected) return;
    router.push(`/whalepost/full-report?id=${encodeURIComponent(selected.id)}`);
  };

  const hasAccess = tier === 'PRO' || tier === 'ELITE';
  
  const archiveDates = getArchiveDates();

  return (
    <>
      <div className="w-full h-full flex-1 relative flex flex-col min-h-0 font-sans bg-transparent text-slate-900 rounded-[2rem] overflow-hidden">
        <div className="flex flex-1 w-full h-full min-h-0 overflow-hidden">
          {/* LEFT PANEL */}
          <div
            className={`flex-col shrink-0 w-full md:w-[32%] md:min-w-[340px] lg:min-w-[380px] ${selected ? 'hidden md:flex' : 'flex'} border-r border-slate-200/60 bg-white backdrop-blur-xl overflow-y-auto`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-5 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
              <div className="flex items-center gap-4 flex-wrap">
                {marketTimes.map(t => (
                  <div key={t.name} className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-700">
                      {t.name} <span className="font-normal text-slate-400 ml-0.5">{t.time}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {hasAccess && (
                  <button onClick={handleDownload} title="Save Archives" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                    Save
                  </button>
                )}
                <button onClick={() => setShowArchive(v => !v)} title="Archive" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                  Archive
                </button>
              </div>
            </div>

            {showArchive && archiveDates.length > 0 && (
              <div className="border-b border-slate-200 bg-black/5">
                <p className="px-6 pt-5 pb-3 font-mono text-[9px] uppercase tracking-[0.25em] font-bold text-slate-400">Archive ({archiveDates.length})</p>
                {archiveDates.map(date => {
                  const count = archive[date]?.length ?? 0;
                  const isToday = date === todayKey();
                  return (
                    <button key={date} onClick={() => {
                        const dayArticles = archive[date];
                        if (dayArticles?.length) { setArticles(dayArticles); setSelected(dayArticles[0]); setShowArchive(false); }
                      }}
                      className="w-full text-left px-6 py-4 flex items-center justify-between border-b border-slate-100 hover:bg-slate-100 transition-colors">
                      <span className={`font-sans text-[13px] font-bold tracking-wide ${isToday ? 'text-slate-900' : 'text-slate-500'}`}>
                        {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {isToday && <span className="ml-2 font-mono text-[8px] px-1.5 py-0.5 bg-slate-900 text-white rounded-sm">TODAY</span>}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{count} Updates</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Article list */}
            <div className="flex flex-col py-2">
              {articles.slice(0, 50).map((art, idx) => {
                const isActive = selected?.id === art.id;
                return (
                  <button key={art.id} onClick={() => setSelected(art)}
                    className={`text-left w-full px-6 py-6 relative group transition-colors ${isActive ? 'bg-black/5' : 'bg-transparent hover:bg-black/5'}`}>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />}
                    {!isActive && <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-slate-100" />}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {formatShort(art.date)}
                      </span>
                      {art.source && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="font-mono text-[9px] uppercase tracking-widest truncate max-w-[120px] text-slate-400">{art.source}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className={`font-sans text-[16px] leading-[1.4] font-bold tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                      {art.title}
                    </h3>
                  </button>
                );
              })}
              {!loading && articles.length === 0 && (
                <div className="px-6 py-10 flex flex-col items-center text-center opacity-50 text-slate-900">
                  <p className="font-mono text-[10px] uppercase tracking-widest">No reports available.</p>
                </div>
              )}
              {loading && articles.length === 0 && (
                <div className="px-6 py-10 flex flex-col items-center justify-center opacity-50 text-slate-900 gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest">Loading Report...</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div ref={rightRef} className={`flex-1 overflow-y-auto ${selected ? 'flex' : 'hidden md:flex'} flex-col relative bg-white`}>
            <AnimatePresence mode="wait">
              {selected && (
                <motion.article key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  
                  {/* Top Bar */}
                  <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-12 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-5 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelected(null)} className="md:hidden px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        Back
                      </button>
                    </div>
                    <div className="flex items-center gap-6">
                      {ethEur && (
                        <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-slate-400 hidden sm:block">
                          ETH/EUR {ethEur.toLocaleString('en-US')}
                        </span>
                      )}
                      
                      <div className="relative">
                        <button 
                          onClick={() => setShowLangMenu(!showLangMenu)} 
                          className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
                        >
                          Translate <span className="opacity-50">({currentLang})</span>
                        </button>
                        <AnimatePresence>
                          {showLangMenu && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                              className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden min-w-[140px] z-50 flex flex-col"
                            >
                              {LANGUAGES.map(l => (
                                <button key={l.code} onClick={() => handleTranslate(l.code)} className={`text-left px-4 py-2.5 font-sans text-[12px] font-bold hover:bg-black/5 transition-colors ${currentLang === l.code ? 'text-slate-900 bg-black/5/50' : 'text-slate-500'}`}>
                                  {l.name}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {hasAccess && (
                        <button onClick={() => setShareOpen(true)} className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                          Share
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Header */}
                  <div className="px-6 md:px-12 pt-16 pb-12 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {selected.source}
                      </span>
                    </div>

                    <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-black tracking-tight text-slate-900 mb-8" style={{ textWrap: 'balance' as any }}>
                      {selected.title}
                    </h1>

                    <div className="flex items-center gap-5 pt-6 border-t border-slate-100">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {formatDate(selected.date)}
                      </div>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-200" />
                      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {estimateReadTime(selected.description ?? '')} min read
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className={`transition-all duration-700 relative ${isTranslating ? 'opacity-30 blur-md pointer-events-none scale-[0.98]' : 'opacity-100 blur-none scale-100'}`}>
                    {isTranslating && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center">
                         <div className="px-6 py-3 bg-slate-900 text-white rounded-xl shadow-2xl font-mono text-[10px] uppercase tracking-widest font-bold">
                            Translating...
                         </div>
                      </div>
                    )}
                    <div className="px-6 md:px-12 pb-8 max-w-4xl mx-auto relative">
                      <div className="prose prose-lg prose-slate max-w-none font-sans text-[16px] leading-[1.8] text-slate-600">
                        {selected.description ? selected.description.split(/\n\n+/).slice(0, 3).map((para, i) => {
                          const text = para.trim();
                          if (!text) return null;
                          if (text.startsWith('## ')) return <h2 key={i} className="font-sans text-xl font-bold mt-8 mb-4 tracking-tight text-slate-900">{text.replace(/^##\s+/, '')}</h2>;
                          return <p key={i} className={i === 0 ? "text-[18px] font-medium leading-[1.7] text-slate-700" : ""}>{text}</p>;
                        }) : <p className="text-slate-400 italic">Analysis unavailable.</p>}
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    </div>

                    {/* Call to Action */}
                    <div className="px-6 md:px-12 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-24 max-w-4xl mx-auto text-center relative z-10">
                      <button onClick={openFullReport} className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-xl shadow-lg hover:shadow-xl">
                        <span className="font-sans text-[12px] font-black uppercase tracking-[0.2em]">{tFullAnalysis}</span>
                      </button>
                      <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Comprehensive insights and breakdown.
                      </p>
                    </div>
                  </div>

                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <CryptoCheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      
      <AnimatePresence>
        {shareOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="w-full max-w-md bg-white border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden p-2">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900">Share Report</span>
                <button onClick={() => setShareOpen(false)} className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Close</button>
              </div>
              
              {shareSent ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900 font-bold"></div>
                  <h3 className="font-sans text-xl font-black text-slate-900 mb-2">Sent</h3>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">The report has been sent.</p>
                </div>
              ) : (
                <form onSubmit={handleShare} className="p-6">
                  <div className="mb-5">
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-3">Email Address</label>
                    <input type="email" required value={shareEmail} onChange={e => setShareEmail(e.target.value)} className="w-full px-5 py-4 bg-black/5 border border-slate-200/60 font-sans text-[14px] outline-none focus:border-slate-400 text-slate-900 transition-colors rounded-xl" placeholder="user@example.com" />
                  </div>
                  <div className="mb-8">
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-3">Note (Optional)</label>
                    <textarea value={shareNote} onChange={e => setShareNote(e.target.value)} rows={3} className="w-full px-5 py-4 bg-black/5 border border-slate-200/60 font-sans text-[14px] outline-none focus:border-slate-400 text-slate-900 transition-colors rounded-xl resize-none" placeholder="Provide context..." />
                  </div>
                  <button type="submit" disabled={isSending} className="w-full py-4 bg-slate-900 text-white font-sans text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-colors rounded-xl shadow-md">
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
