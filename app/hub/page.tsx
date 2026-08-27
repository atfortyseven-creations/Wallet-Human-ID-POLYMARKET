import { Metadata } from 'next';
import { AppLauncherHub } from '@/components/hub/AppLauncherHub';
import { HLLogo } from '@/components/shared/HLLogo';

export const metadata: Metadata = {
  title: 'App Hub — Humanity Ledger',
  description: 'Your sovereign application launchpad.',
};

export const dynamic = 'force-dynamic';

export default function HubPage() {
  return (
    <div className="h-full bg-[#F6F7F9] flex flex-col overflow-hidden">
      {/* Minimal header */}
      <header
        className="shrink-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between px-5 md:px-10"
        style={{ minHeight: '60px', paddingTop: 'max(12px, env(safe-area-inset-top, 12px))', paddingBottom: '12px' }}
      >
        {/* HL wordmark */}
        <HLLogo variant="full" theme="dark" size={28} />

        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-black/30">
          App Hub
        </span>

        <div className="w-[120px]" /> {/* balance spacer */}
      </header>

      {/* Content — scrolls within its own bounded area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 sm:px-6 md:px-10 lg:px-16 py-8">
        <div className="max-w-5xl mx-auto w-full">
          <AppLauncherHub />
        </div>
      </main>
    </div>
  );
}
