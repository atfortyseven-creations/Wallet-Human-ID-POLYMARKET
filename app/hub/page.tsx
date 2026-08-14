import { Metadata } from 'next';
import { AppLauncherHub } from '@/components/hub/AppLauncherHub';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';

export const metadata: Metadata = {
  title: 'App Hub — Humanity Ledger',
  description: 'Launch your secure, zero-knowledge Mini-Apps.',
};

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <InstitutionalHeader hideNavigation={false} />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex-1 w-full">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">System Hub</h1>
          <p className="text-slate-500 mt-2 text-[15px]">Select a sovereign application to initialize within your private environment.</p>
        </div>
        <AppLauncherHub />
      </main>
    </div>
  );
}
