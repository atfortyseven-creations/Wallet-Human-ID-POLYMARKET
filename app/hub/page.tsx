import { Metadata } from 'next';
import { AppLauncherHub } from '@/components/hub/AppLauncherHub';

export const metadata: Metadata = {
  title: 'App Hub — Humanity Ledger',
  description: 'Your sovereign application launchpad.',
};

export const dynamic = 'force-dynamic';

export default function HubPage() {
  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] flex flex-col">
      {/* Minimal header */}
      <header
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between px-5 md:px-10"
        style={{ minHeight: '60px' }}
      >
        {/* HL wordmark */}
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <rect width="32" height="32" rx="8" fill="#0A0A0A" />
            <path d="M9 9V23M23 9V23M9 16H23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-mono text-[13px] font-black uppercase tracking-widest text-[#0A0A0A]">
            Humanity Ledger
          </span>
        </div>

        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-black/30">
          App Hub
        </span>

        <div className="w-[120px]" /> {/* balance spacer */}
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 py-8 max-w-5xl mx-auto w-full">
        <AppLauncherHub />
      </main>
    </div>
  );
}
