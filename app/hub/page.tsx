import { Metadata } from 'next';
import { AppLauncherHub } from '@/components/hub/AppLauncherHub';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'System Hub — Humanity Ledger',
  description: 'Launch your secure, zero-knowledge sovereign applications.',
};

export default function HubPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f6f7f9] flex flex-col">
      {/* Self-contained Hub Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between px-5 md:px-8" style={{ minHeight: '60px' }}>
        <Link
          href="/terminal"
          className="flex items-center gap-2 text-[#050505]/60 hover:text-[#050505] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-mono text-[10px] font-black uppercase tracking-widest">Dashboard</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#050505]">System Hub</span>
        </div>

        <div className="w-[80px]" />{/* spacer to balance the back button */}
      </header>

      <main className="flex-1 px-4 md:px-8 lg:px-12 py-8 md:py-12 max-w-6xl mx-auto w-full">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Applications</h1>
          <p className="text-slate-500 mt-1.5 text-[14px] md:text-[15px] leading-relaxed">
            Select a sovereign application to initialize within your private environment.
          </p>
        </div>
        <AppLauncherHub />
      </main>
    </div>
  );
}
