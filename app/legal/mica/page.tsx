import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MiCA Compliance | Humanity Ledger',
  description: 'Humanity Ledger compliance under EU Markets in Crypto-Assets Regulation (MiCA).',
};

export default function MicaPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-black/40 mb-3">Legal</p>
          <h1 className="text-[40px] font-black tracking-tight leading-tight mb-4">MiCA Compliance</h1>
          <p className="text-[14px] text-black/50">Last updated: August 2026 · Regulation (EU) 2023/1114</p>
        </div>
        <div className="space-y-10 text-[15px] text-black/70 leading-relaxed">
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">1. Regulatory Status</h2>
            <p>
              Humanity Ledger S.L. is in the process of incorporation. We operate as a
              technology infrastructure provider and currently do not offer regulated
              crypto-asset services requiring CASP authorisation under Regulation
              (EU) 2023/1114 (MiCA).
            </p>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">2. Non-Custodial Architecture</h2>
            <p>
              All cryptographic keys are generated and stored exclusively on the user&apos;s
              device. Humanity Ledger has no access to private keys, cannot initiate
              transactions on behalf of users, and does not hold or control crypto-assets.
            </p>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">3. AML / CFT</h2>
            <p>
              We maintain internal policies to prevent misuse of our infrastructure and
              cooperate with relevant authorities in accordance with applicable law.
              As a non-custodial technology provider, direct CASP-level AML obligations
              under MiCA do not currently apply.
            </p>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">4. Testnet Operation</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="text-amber-900 font-semibold text-[13px] mb-1">⚠️ Alpha Testnet Only</p>
              <p className="text-amber-800 text-[13px]">
                Currently deployed exclusively on Aztec Alpha Testnet. No real economic
                value is transacted. This compliance statement will be updated prior to
                any mainnet deployment.
              </p>
            </div>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">5. Contact</h2>
            <p>
              For regulatory enquiries:{' '}
              <a href="mailto:legal@humanidfi.com" className="underline underline-offset-2 hover:text-black transition-colors">
                legal@humanidfi.com
              </a>
            </p>
          </section>
        </div>
        <div className="mt-16 pt-8 border-t border-black/10 text-[12px] text-black/40">
          <p>© 2026 Humanity Ledger S.L. (In process of incorporation) · All rights reserved</p>
          <p className="mt-1">Regulation (EU) 2023/1114 · GDPR (EU) 2016/679</p>
        </div>
      </div>
    </main>
  );
}
