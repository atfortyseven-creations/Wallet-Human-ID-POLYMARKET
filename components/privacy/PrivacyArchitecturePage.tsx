'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ATOM_PNGTREE } from '@/lib/constants/systemAssets';
import { PRIVACY_ARCHITECTURE_SECTIONS, PRIVACY_TOC } from '@/lib/content/privacyArchitecture';


export function PrivacyArchitecturePage() {
  const [activeId, setActiveId] = useState<string>(PRIVACY_TOC[0]?.id ?? 'overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const ids = PRIVACY_TOC.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0.1 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">Loading…</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-[#050505] font-sans flex flex-col lg:flex-row">
      {/* Sidebar TOC */}
      <aside className="lg:w-[280px] xl:w-[300px] shrink-0 border-b lg:border-b-0 lg:border-r border-black/8 bg-white z-40 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="px-6 py-8 lg:py-10">
          <Link
            href="/"
            className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-[#2a1b4d]/60 hover:text-[#2a1b4d] transition-colors"
          >
            Humanity Ledger
          </Link>
          <p className="mt-6 font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/35">
            Architecture guide
          </p>
          <nav className="mt-4 flex flex-col gap-1" aria-label="Table of contents">
            {PRIVACY_TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`px-3 py-2.5 text-[13px] font-medium leading-snug transition-colors border-l-2 ${
                  activeId === item.id
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-[#050505]/50 hover:text-[#050505] hover:border-black/20'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 pt-6 border-t border-black/8 space-y-2">
            <Link
              href="/legal/privacy"
              className="block font-mono text-[9px] uppercase tracking-widest text-[#050505]/40 hover:text-[#050505]/70"
            >
              Legal privacy policy →
            </Link>
            <Link
              href="/whitepaper"
              className="block font-mono text-[9px] uppercase tracking-widest text-[#050505]/40 hover:text-[#050505]/70"
            >
              Whitepaper →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[800px] mx-auto px-6 py-12 md:py-16 lg:py-20">
          <header className="mb-14 border-b border-black/8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start gap-8 mb-8">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-[#2a1b4d]/60 mb-3">
                  Privacy & architecture
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-tight text-[#050505] leading-[1.08] mb-4">
                  How Humanity Ledger works
                </h1>
                <p className="text-lg text-[#050505]/55 leading-relaxed font-light max-w-xl">
                  A plain-language map of wallets, sessions, encrypted chat, cross-device QR linking, and
                  Aztec private state—so you know what runs where.
                </p>
              </div>
            </div>
            <p className="text-[13px] text-[#050505]/40 leading-relaxed">
              Built on{' '}
              <a href="https://aztec.network" className="underline hover:text-[#050505]/65">
                Aztec
              </a>
              ,{' '}
              <a href="https://noir-lang.org" className="underline hover:text-[#050505]/65">
                Noir
              </a>
              , and{' '}
              <a href="https://xmtp.org" className="underline hover:text-[#050505]/65">
                XMTP
              </a>
              . Last updated for the current app codebase.
            </p>
          </header>

          <div className="space-y-16 md:space-y-20">
            {PRIVACY_ARCHITECTURE_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl md:text-[1.65rem] font-black tracking-tight text-[#050505] mb-5">
                  {section.title}
                </h2>
                <div className="space-y-4 text-[15px] md:text-base text-[#050505]/70 leading-relaxed">
                  {section.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-5 space-y-3 list-none pl-0">
                    {section.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[14px] md:text-[15px] text-[#050505]/65 leading-relaxed"
                      >
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2a1b4d] shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}



                {section.callout && (
                  <div className="mt-8 p-6 md:p-8 border-l-2 border-black bg-white">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-black/50 mb-2">
                      {section.callout.title}
                    </p>
                    <p className="text-[14px] text-[#050505]/65 leading-relaxed mb-4">{section.callout.body}</p>
                    {section.callout.href && section.callout.hrefLabel && (
                      <Link
                        href={section.callout.href}
                        className="inline-flex font-mono text-[10px] font-black uppercase tracking-widest text-[#2a1b4d] hover:text-black transition-colors"
                      >
                        {section.callout.hrefLabel} →
                      </Link>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>

          <footer className="mt-20 pt-10 border-t border-black/8">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#050505]/35">
              © {new Date().getFullYear()} Humanity Ledger · Architecture guide
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href="/manifesto"
                className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/45 hover:text-[#050505]/70"
              >
                Manifesto
              </Link>
              <Link
                href="/security"
                className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/45 hover:text-[#050505]/70"
              >
                Security
              </Link>
              <Link
                href="/connect"
                className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/45 hover:text-[#050505]/70"
              >
                Connect wallet
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
