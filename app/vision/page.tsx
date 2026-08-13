import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';
import { VisionAboutSection } from '@/components/vision/VisionAboutSection';

export const metadata = {
  title: 'Our Vision, Humanity Ledger',
  description:
    'Humanity Ledger S.L. is building a secure, decentralised identity ecosystem for the next generation of financial infrastructure, powered by zero knowledge cryptography on Aztec Network.',
};

export default function VisionPage() {
  return (
    <div className="min-h-screen flex flex-col text-black bg-white">
      <SystemHeader />

      <main className="flex-1 w-full">

        {/* ── Hero / Vision Statement ───────────────────────────────────────── */}
        <section className="w-full pt-28 pb-16 px-6 md:px-16 flex flex-col items-center bg-white">
          <div className="max-w-4xl w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 bg-black/[0.03] mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                Our Vision
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-8 text-black">
              The Vision of{' '}
              <br className="hidden md:block" />
              <span className="text-black/30">Humanity Ledger.</span>
            </h1>

            <div className="space-y-5 text-black/65 font-sans text-base md:text-lg leading-relaxed max-w-2xl">
              <p>
                At <strong className="text-black font-black">Humanity Ledger S.L.</strong>, our
                primary goal is to build a secure and transparent identity layer for the Humanity Ledger platform, one that protects
                user data while ensuring full regulatory attestation. We believe that a credible
                digital identity is the foundation of a safer and more efficient financial
                ecosystem, not a barrier to it.
              </p>
              <p>
                To realise this, we have integrated directly with{' '}
                <strong className="text-black font-black">Aztec Network</strong>. By building on
                Aztec's zero knowledge privacy infrastructure, we guarantee that user data
                remains mathematically confidential. Proofs replace personal data. That is the standard we hold ourselves to.
              </p>
              <p>
                As an open source initiative, we are expanding our coverage of Layer-2 protocols continuously. Financial independence, in our view, demands transparent code and trustless systems, giving every user the power to monitor global
                markets privately and on their own terms.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <a
                href="mailto:press@humanidfi.com"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-black text-white font-black text-[11px] uppercase tracking-widest hover:bg-black/80 transition-all rounded-none"
              >
                Contact Press Office
              </a>
              <a
                href="/registry"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-black/15 text-black font-black text-[11px] uppercase tracking-widest hover:bg-black/[0.03] transition-all"
              >
                View Registry
              </a>
            </div>
          </div>
        </section>

        {/* ── About Us & Leadership ─────────────────────────────────────────── */}
        <div className="pb-24">
          <VisionAboutSection />
        </div>

      </main>

      <SystemFooter />
    </div>
  );
}
