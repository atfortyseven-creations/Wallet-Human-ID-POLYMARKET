import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'FAQ - Humanity Ledger',
  description: 'Frequently asked questions about Humanity Ledger.',
};

const BG = "url('/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg')";

export default function FAQPage() {
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

      <main className="flex-1 w-full pt-28 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-3xl w-full">

          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-black/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Common Questions</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-16 text-black">
            Frequently Asked <br className="hidden md:block" />
            <span className="text-black/40">Questions.</span>
          </h1>

          <div className="space-y-0 divide-y divide-black/10">
            <div className="py-10 first:pt-0">
              <h3 className="text-lg font-black uppercase tracking-wider text-black mb-3">Is my personal data stored on the blockchain?</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                No. Humanity Ledger never stores your personal information on a public network. Only cryptographic proofs and decentralized identifiers are anchored on-chain — your real data stays on your device.
              </p>
            </div>

            <div className="py-10">
              <h3 className="text-lg font-black uppercase tracking-wider text-black mb-3">What happens if I lose my device?</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                Your identity is protected by a Secret Recovery Phrase. If you lose your device, you can restore your complete account and all your credentials on a new device using this phrase.
              </p>
            </div>

            <div className="py-10">
              <h3 className="text-lg font-black uppercase tracking-wider text-black mb-3">Can Humanity Ledger read my messages?</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                No. All communications are secured with end-to-end encryption. The decryption keys are held exclusively on your device — we cannot access your messages under any circumstances.
              </p>
            </div>

            <div className="py-10">
              <h3 className="text-lg font-black uppercase tracking-wider text-black mb-3">Is the system GDPR and CCPA compliant?</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                Yes. Because all personal data is stored on your device and only privacy-preserving proofs are shared externally, the system is inherently aligned with strict data protection regulations worldwide.
              </p>
            </div>

            <div className="py-10">
              <h3 className="text-lg font-black uppercase tracking-wider text-black mb-3">Is there a fee to create an account?</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                Creating an account is free. The cryptographic signatures required to set up your account do not consume any gas fees — they are off-chain operations.
              </p>
            </div>
          </div>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
