import React from 'react';
import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { WHITEPAPER_SECTIONS } from '@/lib/content/footerPagesAztec';
import Link from 'next/link';

export default function WhitepaperPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · Technical Whitepaper"
      title="Humanity Ledger: Privacy-Native Social State"
      subtitle="How we combine shielded notes, Noir circuits, and Ethereum settlement so people can interact with proof—not permanent public exposure."
      sections={WHITEPAPER_SECTIONS}
    >
      <div className="p-8 rounded-2xl border border-black/10 bg-black/[0.02]">
        <h3 className="text-lg font-black text-[#050505] mb-2">Build with the stack</h3>
        <p className="text-[14px] text-[#050505]/60 mb-6 leading-relaxed">
          Review circuits, run the sandbox, and integrate via the Developer Hub.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/developer"
            className="inline-flex px-6 py-3 rounded-xl bg-[#050505] text-white font-mono text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-colors"
          >
            Developer Hub
          </Link>
          <Link
            href="/manifesto"
            className="inline-flex px-6 py-3 rounded-xl border border-black/15 font-mono text-[10px] font-black uppercase tracking-widest hover:bg-black/[0.03] transition-colors"
          >
            Privacy Manifesto
          </Link>
        </div>
      </div>
    </AztecDocPage>
  );
}
