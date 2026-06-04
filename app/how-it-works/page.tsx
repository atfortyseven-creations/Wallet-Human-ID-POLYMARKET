import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'How It Works - Humanity Ledger',
  description: 'The technology behind secure, private identity verification.',
};

const BG = "url('/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg')";

export default function HowItWorksPage() {
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
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Technology</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-16 text-black">
            How It <br className="hidden md:block" />
            <span className="text-black/40">Works.</span>
          </h1>

          <div className="space-y-16">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-black text-xl shadow-md">1</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-black">Account Creation</h3>
                <p className="text-black/60 font-sans text-base leading-relaxed">
                  When you sign up, the system generates a secure wallet directly on your device. Your private keys never leave your device. A unique decentralized identifier is registered on the network.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-black text-xl shadow-md">2</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-black">Privacy-Preserving Proofs</h3>
                <p className="text-black/60 font-sans text-base leading-relaxed">
                  When you need to prove a claim — such as "I am over 18" or "I am an accredited investor" — the system generates a cryptographic proof on your device. This proof confirms the claim is true without exposing the underlying data.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-black text-xl shadow-md">3</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-black">On-Chain Verification</h3>
                <p className="text-black/60 font-sans text-base leading-relaxed">
                  Smart contracts on Humanity Ledger verify the proof. Network consensus confirms its validity, allowing third-party services to accept your credentials instantly and without intermediaries.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-black text-xl shadow-md">4</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-black">Encrypted Peer-to-Peer Messaging</h3>
                <p className="text-black/60 font-sans text-base leading-relaxed">
                  Using your established identity, the platform enables secure, peer-to-peer encrypted communications. Only the intended recipient can read the messages — not us, not anyone else.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
