import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'Use Cases - Humanity Ledger',
  description: 'Real-world applications of the Humanity Ledger identity protocol.',
};

const BG = "url('/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg')";

export default function UseCasesPage() {
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
        <div className="max-w-4xl w-full">

          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-black/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Applications</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-16 text-black">
            Real-World <br className="hidden md:block" />
            <span className="text-black/40">Use Cases.</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-black/10 rounded-2xl bg-white/80 flex flex-col gap-4 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-wider text-black">Financial Services &amp; DeFi</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                Streamline identity checks and compliance without storing personal data. Users prove their identity and accreditation status on-chain instantly, enabling frictionless onboarding for exchanges, lending platforms, and institutional trading services.
              </p>
            </div>

            <div className="p-8 border border-black/10 rounded-2xl bg-white/80 flex flex-col gap-4 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-wider text-black">E-Commerce &amp; Retail</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                Prevent fraud and fake accounts with verifiable human credentials. Ensure one account per user for ticketing, limited-edition product drops, and high-value purchases.
              </p>
            </div>

            <div className="p-8 border border-black/10 rounded-2xl bg-white/80 flex flex-col gap-4 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-wider text-black">Healthcare &amp; Telecom</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                Allow patients and customers to authenticate securely across networks without repeatedly exposing sensitive credentials. Ideal for telemedicine and cross-border services.
              </p>
            </div>

            <div className="p-8 border border-black/10 rounded-2xl bg-white/80 flex flex-col gap-4 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-wider text-black">DAOs &amp; Governance</h3>
              <p className="text-black/60 font-sans text-sm leading-relaxed">
                Implement true "One Person, One Vote" systems. By verifying unique individuals, DAOs can move beyond token-weighted voting to genuinely democratic, fraud-resistant governance.
              </p>
            </div>
          </div>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
