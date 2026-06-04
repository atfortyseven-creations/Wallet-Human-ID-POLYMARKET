import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';
import Link from 'next/link';

export const metadata = {
  title: 'Live Demo - Humanity Ledger',
  description: 'Try the Humanity Ledger application.',
};

const BG = "url('/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg')";

export default function DemoPage() {
  return (
    <div
      className="min-h-screen flex flex-col text-black"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: BG,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'contain',
      }}
    >
      <SystemHeader />

      <main className="flex-1 w-full pt-28 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl w-full flex flex-col items-center">

          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-black/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Live Demo</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6 text-black">
            Try It Now.
          </h1>

          <p className="text-black/60 font-sans text-base leading-relaxed mb-12 max-w-lg">
            The best way to understand Humanity Ledger is to use it. Launch the application to explore the identity dashboard, portfolio tools, and end-to-end encrypted messaging.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-12 py-5 bg-black text-white font-black text-[13px] uppercase tracking-widest rounded-xl hover:bg-black/80 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
          >
            Open Application
          </Link>

          <p className="mt-6 text-[11px] text-black/30 font-mono uppercase tracking-widest">
            No installation required · Works in your browser
          </p>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
