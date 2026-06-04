'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, AlignLeft, X } from 'lucide-react';

export interface TocItem {
  id: string;
  label: string;
}

interface LegalDocLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  category: string;
  toc: TocItem[];
  backHref?: string;
  backLabel?: string;
}

export default function LegalDocLayout({
  children,
  title,
  subtitle,
  lastUpdated,
  category,
  toc,
  backHref = '/',
  backLabel = 'Back',
}: LegalDocLayoutProps) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Intersection Observer: track which section is in view ── */
  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -65% 0px', threshold: 0.01 }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  /* ── Smooth scroll with 72px offset for mobile sticky bar ── */
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const OFFSET = window.innerWidth < 1024 ? 72 : 24;
    const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setMobileOpen(false);
    setActiveId(id);
  }, []);

  /* ── Close mobile drawer on resize to desktop ── */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Prevent body scroll when mobile drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const activeLabel = toc.find((t) => t.id === activeId)?.label ?? 'Contents';

  return (
    <div className="min-h-screen bg-white text-black">

      {/* ═══════════════════════════════════════════════
          MOBILE STICKY TOC BAR  (hidden on lg+)
          Sits at top of viewport on mobile/tablet
      ═══════════════════════════════════════════════ */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-black/10 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-black/40 hover:text-black transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
          </Link>
          <div className="w-px h-4 bg-black/10" />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex-1 flex items-center justify-between gap-2 text-left"
            aria-expanded={mobileOpen}
            aria-label="Toggle table of contents"
          >
            <span className="flex items-center gap-2 min-w-0">
              <AlignLeft size={14} className="text-black/35 shrink-0" />
              <span className="text-[12px] font-medium text-black/60 truncate">{activeLabel}</span>
            </span>
            <ChevronDown
              size={14}
              className={`text-black/35 shrink-0 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MOBILE TOC DRAWER OVERLAY
      ═══════════════════════════════════════════════ */}
      {mobileOpen && (
        <>
          {/* backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          {/* drawer panel */}
          <div className="lg:hidden fixed top-[49px] left-0 right-0 z-40 bg-white border-b border-black/10 shadow-xl max-h-[60vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-black/30 mb-3">
                Contents
              </p>
              <nav className="flex flex-col gap-0.5">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`
                      text-left text-[14px] leading-snug py-2.5 px-3 rounded-lg transition-all duration-150
                      border-l-2
                      ${activeId === item.id
                        ? 'border-black text-black font-semibold bg-black/[0.04]'
                        : 'border-transparent text-black/50 font-normal'
                      }
                    `}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════
          PAGE HEADER
      ═══════════════════════════════════════════════ */}
      <div className="border-b border-black/8 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-10 pt-8 pb-10 sm:pt-12 sm:pb-14 md:pt-16 md:pb-20">
          {/* Back link — desktop only (mobile uses sticky bar) */}
          <Link
            href={backHref}
            className="hidden lg:inline-flex items-center gap-2 text-black/40 hover:text-black text-[11px] font-mono font-semibold uppercase tracking-[0.25em] transition-colors mb-8"
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            {backLabel}
          </Link>

          <div className="inline-block px-3 py-1 border border-black/15 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black/50 mb-4 mt-2 lg:mt-0">
            {category}
          </div>

          <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] font-black leading-[1.05] tracking-[-0.025em] text-black mb-4 max-w-3xl break-words">
            {title}
          </h1>

          {subtitle && (
            <p className="text-[15px] sm:text-base md:text-lg text-black/55 max-w-2xl leading-relaxed font-normal">
              {subtitle}
            </p>
          )}

          {lastUpdated && (
            <p className="mt-5 text-[11px] font-mono text-black/35 uppercase tracking-[0.2em]">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          BODY: desktop sidebar + main content
      ═══════════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-10 flex flex-col lg:flex-row lg:gap-14 xl:gap-20 py-10 sm:py-12 md:py-16">

        {/* ── Desktop sidebar TOC (hidden on mobile) ── */}
        <aside className="hidden lg:block lg:w-[200px] xl:w-[220px] shrink-0 sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-black/30 mb-4 px-1">
            Contents
          </p>
          <nav aria-label="Table of contents" className="flex flex-col gap-0.5">
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`
                  text-left block text-[12.5px] leading-snug py-2 px-3 rounded-md transition-all duration-150
                  border-l-2 w-full
                  ${activeId === item.id
                    ? 'border-black text-black font-semibold bg-black/[0.035]'
                    : 'border-transparent text-black/40 hover:text-black hover:border-black/20 font-normal'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main article content ── */}
        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <div className="border-t border-black/8 py-8 sm:py-10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-10 text-center">
          <p className="text-[11px] font-mono text-black/35 uppercase tracking-[0.2em]">
            Questions?{' '}
            <a
              href="mailto:humanityledger@gmail.com"
              className="text-black/55 hover:text-black transition-colors underline underline-offset-2 break-all"
            >
              humanityledger@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
