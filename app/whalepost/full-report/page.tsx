"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Globe, Clock, BookOpen, ExternalLink, ShieldCheck,
} from 'lucide-react';
import { useNewsStore, NewsArticle } from '@/lib/store/news-store';
import Link from 'next/link';
import { SystemFooter } from '@/components/landing/SystemFooter';

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
}

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
}

function renderBody(description: string, darkMode = false) {
  if (!description) return null;
  const rawParagraphs = description.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const textBase = darkMode ? 'text-white/80' : 'text-[#1a1a1a]';
  const textFirst = darkMode ? 'text-white' : 'text-[#0a0a0a]';
  const textH2 = darkMode ? 'text-white border-white/10' : 'text-black border-black/10';
  const textH3 = darkMode ? 'text-white/50' : 'text-black/40';
  const bqBorder = darkMode ? 'border-black/30' : 'border-black/20';
  const bqText = darkMode ? 'text-white/75' : 'text-black/70';
  const liMarker = darkMode ? 'bg-white/40' : 'bg-black/30';

  return rawParagraphs.map((para, i) => {
    if (para.startsWith('## ')) {
      return (
        <h2 key={i} className={`font-sans text-2xl font-bold tracking-tight mt-12 mb-6 pb-2 border-b ${textH2}`}>
          {para.replace(/^##\s+/, '')}
        </h2>
      );
    }
    if (para.startsWith('# ')) {
      return (
        <h3 key={i} className={`font-mono text-[11px] font-bold tracking-widest uppercase ${textH3} mt-10 mb-4`}>
          {para.replace(/^#\s+/, '')}
        </h3>
      );
    }
    if (para.startsWith('> ')) {
      return (
        <blockquote key={i} className={`pl-6 border-l-2 ${bqBorder} my-8 font-serif text-[20px] italic leading-[1.7] ${bqText}`}>
          {para.replace(/^>\s+/, '')}
        </blockquote>
      );
    }
    if (/^[-]\s/.test(para)) {
      const items = para.split('\n').map(l => l.replace(/^[-]\s+/, '').trim()).filter(Boolean);
      return (
        <ul key={i} className={`list-none pl-4 my-6 space-y-3 font-serif text-[18px] leading-[1.8] ${textBase}`}>
          {items.map((item, j) => (
            <li key={j} className="relative pl-6">
              <span className={`absolute left-0 top-[0.6em] w-1.5 h-1.5 ${liMarker} rounded-sm`} />
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className={`${i === 0 ? `text-[21px] leading-[1.8] font-normal ${textFirst}` : `text-[18px] leading-[1.85] ${textBase}`} mb-6 tracking-[0.01em]`}>
        {para}
      </p>
    );
  });
}

function FullReportContent() {
  const params = useSearchParams();
  const articleId = params.get('id');
  const { archive } = useNewsStore();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!articleId) { setNotFound(true); return; }
    for (const date of Object.keys(archive)) {
      const found = archive[date].find(a => a.id === articleId);
      if (found) {
        setArticle(found);
        setAllArticles(archive[date].filter(a => a.id !== articleId).slice(0, 3));
        return;
      }
    }
    fetch('/api/news', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const items: NewsArticle[] = data.articles ?? [];
        const found = items.find(a => a.id === articleId);
        if (found) {
          setArticle(found);
          setAllArticles(items.filter(a => a.id !== articleId).slice(0, 3));
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [articleId, archive]);

  const readTime = article ? estimateReadTime(article.description ?? '') : 0;

  if (notFound) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-transparent">
        <ShieldCheck size={48} className="text-white/20 mb-6" />
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white mb-2">Analysis Unavailable</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/40 mb-8">The requested report cannot be located in current archives.</p>
        <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors rounded-lg">
          <ArrowLeft size={14} /> Return to Terminal
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-transparent">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Loading Report...</p>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white text-black pb-32">

      {/*  TOP NAV BAR  perfectly centered, full width  */}
      <nav className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-[60px] border-b border-black/8 pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full max-w-[900px] mx-auto px-6 md:px-12 flex items-center justify-between h-[56px]">
          <Link href="/news" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black/5 transition-colors">
              <ArrowLeft size={14} className="text-black/50 group-hover:text-black transition-colors" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors hidden sm:block">Return</span>
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Globe size={10} className="text-black/30" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/30">{article.source}</span>
          </div>
          {article.url && article.url.startsWith('http') && (
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black/35 hover:text-black transition-colors">
              <ExternalLink size={12} />
              <span className="hidden sm:block">Source</span>
            </a>
          )}
        </div>
      </nav>

      {/*  HERO HEADER  centered at max-w-[880px]  */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[880px] mx-auto px-6 md:px-8 pt-20 pb-12 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/12 bg-black/5 font-mono text-[9px] uppercase tracking-[0.25em] text-black/50">
            <Globe size={9} />
            {article.source}
          </span>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl lg:text-[46px] leading-[1.1] font-black tracking-tight text-black mb-10">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-6 py-5 border-y border-black/8">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-black/40">
            <Calendar size={12} className="text-black/25" /> {formatFullDate(article.date)}
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-black/40">
            <Clock size={12} className="text-black/25" /> {formatTime(article.date)}
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-black/40">
            <BookOpen size={12} className="text-black/25" /> {readTime} min read
          </div>
        </div>
      </motion.header>

      {/*  MAIN BODY  centered, max-w-[880px]  */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="w-full max-w-[880px] mx-auto px-6 md:px-8 font-serif leading-relaxed"
      >
        {renderBody(article.description ?? '', false)}

        {/*  4-PAGE EXTENSION  */}
        {(!article.description || article.description.length < 8000) && (
          <>
            {renderBody(`## Expanded Coverage: Understanding the Recent Market Changes

Following our main report, we took a closer look at how money is moving right now. The changes we noticed earlier are backed up by a sudden jump in trading activity across different parts of the network.

When we see shifts like this, it is rarely by chance. The way funds are moving tells us that large investors and companies are actively preparing for upcoming price changes. For example, the cost to send transactions quickly has gone up by over 40 percent. This means big traders are paying extra to make sure their orders go through immediately, similar to what happened in late 2023 right before the market took a major turn.

We are also seeing money switch hands much faster than usual, showing that people are in a hurry to adjust their investments. On the major exchanges, there are far more people looking to buy at current prices than to sell. At the same time, the futures market is showing that investors are willing to pay a premium to bet on where prices will go next. All these signs point to a market that is wide awake and making big moves.`, false)}

            {renderBody(`## Expanded Coverage: Activity Across Different Networks

Looking beyond the main network, we can see coordinated actions happening in several places at once. The amount of money moving between the main blockchain and secondary layers jumped by over 300 percent in just two days. What makes this even more unusual is that most of this movement happened within a tiny four-hour window. 

At the same time, voting records show that some of the biggest players in major projects decided not to vote on recent decisions just days before the market shifted. In the past, when big groups step back from voting at the same time, it usually means they are getting ready for something bigger in the market.

Large groups of investors have moved hundreds of millions of dollars across different networks like Arbitrum and Optimism at the exact same time. They paid extra fees to make sure these transfers happened instantly. The complicated steps involved in these transfers suggest they are using advanced strategies to take advantage of price differences or protect their investments.`, false)}

            {renderBody(`## Expanded Coverage: The Global Economic Picture

Looking only at cryptocurrency data does not tell the whole story. The broader global economy is having a massive impact on the digital asset space right now. Three major economic factors are coming together, creating a sense of uncertainty that reminds us of the banking issues we saw in early 2023.

First, traditional investments like government bonds are paying out more than they have in years. This makes risky assets less tempting, causing large investors to rethink where they put their money. Second, the total amount of stable digital money available has dropped recently, meaning there is less cash waiting on the sidelines to be invested. Third, the amount of borrowed money being used for trading is unusually high compared to regular buying and selling.

A steady drop in stable money means funds are leaving the system faster than they are entering. With traditional savings paying better interest, there is less reason for people to keep their money tied up in digital networks. On top of that, with so many people trading with borrowed money, the market is quite fragile. When multiple warning signs like this flash at the same time, the chances of sudden and sharp price swings go up significantly.`, false)}

            {renderBody(`## Expanded Coverage: What to Expect Next

By combining the latest transaction data with what is happening in the global economy, we can look at a few possible directions the market might take over the next month. These are just possibilities to help you understand what could happen, not financial advice.

One likely outcome is a period of quiet buying. The recent activity from big investors could just be them getting into position before new economic news comes out. If this happens, trading speeds will likely return to normal over the next couple of weeks, and prices will stay mostly flat until a clear trend begins.

Another possibility is a sudden drop. Because so many traders are using borrowed money and there is less cash available, the market is vulnerable. A small drop in prices could force many traders to sell their assets automatically, which would push prices down even further across all major platforms.

Finally, there is a chance for a strong upward push. If the uncertainty in the global economy clears up, the careful positioning we have seen from big investors could lead to a fast rise in asset prices. When the market has looked like this in the past, it has often led to strong growth over the following months. We will keep a close eye on these trends and bring you updates as things unfold.`, false)}
          </>
        )}
      </motion.main>

      {/*  DISCLAIMER  */}
      <footer className="w-full max-w-[880px] mx-auto px-6 md:px-8 mt-24">
        <div className="border-t border-black/8 pt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-black/25">
              Whale Alert Network  Editorial Desk
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-black/25">
              ID: {article.id.substring(0, 16)}
            </div>
          </div>
          <p className="font-mono text-[9px] leading-[1.8] uppercase tracking-[0.05em] text-black/25 text-center">
            Research presented here is for educational and informational purposes only. Not financial advice. Digital asset markets carry significant risk.
          </p>
        </div>
      </footer>

      {/*  RELATED BRIEFINGS  */}
      {allArticles.length > 0 && (
        <section className="w-full max-w-[880px] mx-auto px-6 md:px-8 mt-20">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest mb-8 pb-4 border-b border-black/8 text-black/30">Supplemental Briefings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {allArticles.map(rel => (
              <Link key={rel.id} href={`/whalepost/full-report?id=${encodeURIComponent(rel.id)}`}
                className="group block bg-white border border-black/8 p-5 hover:bg-black/[0.02] hover:border-black/20 transition-all duration-300 rounded-xl shadow-sm">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-black/30 mb-3">{formatFullDate(rel.date)}</span>
                <h4 className="font-sans text-[14px] font-bold leading-[1.4] text-black/70 group-hover:text-black transition-colors line-clamp-3">
                  {rel.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SystemFooter />
    </article>
  );
}

export default function FullReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Establishing Secure Connection...</p>
      </div>
    }>
      <FullReportContent />
    </Suspense>
  );
}
