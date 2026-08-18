import React from 'react';
import { Metadata } from 'next';
import DocLayout from '@/components/layout/DocLayout';

export const metadata: Metadata = {
  title: 'Vision & Manifesto | Humanity Ledger',
  description: 'The philosophical and technological manifesto of Humanity Ledger — building the privacy-native digital society.',
};

export default function VisionPage() {
  return (
    <DocLayout 
      title="Vision & Manifesto" 
      category="Company" 
      description="The foundational philosophy of the Humanity Ledger: Securing human rights, informational sovereignty, and financial privacy through applied cryptography." 
      lastUpdated="August 2026"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300 font-serif leading-relaxed">
        
        <h1 className="text-5xl md:text-6xl font-black mb-12 text-white tracking-tight font-sans text-center">
          The Humanity Ledger <br/>
          <span className="text-cyan-400">Manifesto</span>
        </h1>
        
        <div className="text-xl text-slate-400 mb-16 leading-relaxed italic border-l-4 border-cyan-500 pl-6 py-2">
          "Privacy is not secrecy. A private matter is something one doesn't want the whole world to know, but a secret matter is something one doesn't want anybody to know. Privacy is the power to selectively reveal oneself to the world." <br/>— Eric Hughes, A Cypherpunk's Manifesto (1993)
        </div>

        {/* 1. THE PROBLEM */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white font-sans uppercase tracking-widest">I. The Transparent Dystopia</h2>
          <p className="mb-6">
            The invention of blockchain technology promised emancipation from centralized intermediaries. It delivered on that promise, but at a severe cost: radical transparency. The first generation of blockchains created a panopticon where every transaction, balance, and interaction is permanently etched into a public ledger, accessible to anyone with an internet connection.
          </p>
          <p className="mb-6">
            This transparency is incompatible with the basic requirements of human dignity, enterprise operations, and democratic freedom. In a transparent digital economy, salaries are public, supply chains are exposed to competitors, and individuals are permanently profiled based on their financial histories. We cannot build a sovereign digital society on an architecture that strips citizens of their privacy.
          </p>
        </section>

        {/* 2. THE SOLUTION */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white font-sans uppercase tracking-widest">II. The Zero-Knowledge Paradigm</h2>
          <p className="mb-6">
            The Humanity Ledger is our answer to the transparent dystopia. By leveraging Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs), we have decoupled <em>verification</em> from <em>disclosure</em>. 
          </p>
          <p className="mb-6">
            On the Humanity Ledger, state transitions are computed locally and privately. The network validates the <em>mathematical correctness</em> of these transitions without ever observing the underlying data. This represents a monumental leap in computer science: the ability to reach global consensus on a state machine without anyone actually seeing the state.
          </p>
        </section>

        {/* 3. SCALABILITY & PARAMETERS */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white font-sans uppercase tracking-widest">III. Infinite Horizons (Trillones de Parámetros)</h2>
          <p className="mb-6">
            Privacy alone is insufficient if it remains a luxury afforded only to those who can pay exorbitant cryptographic computation fees. The network must scale.
          </p>
          <p className="mb-6">
            Through recursive proof composition—where proofs attest to the validity of other proofs in a massive tree structure—we compress the computational complexity of millions of transactions into a single constant-size proof verified on Ethereum. This architecture is designed to handle constraint matrices evaluating to <strong>trillones de parametros</strong>. As hardware acceleration (GPUs/ASICs) for ZK-proving advances, the throughput of the Humanity Ledger scales logarithmically, ensuring that privacy-preserving finance becomes cheaper, faster, and universally accessible.
          </p>
        </section>

        {/* 4. QUANTUM RESISTANCE */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white font-sans uppercase tracking-widest">IV. Maxima Capacidad Cuántica</h2>
          <p className="mb-6">
            We are building infrastructure intended to outlast its creators. The looming advent of cryptographically relevant quantum computers threatens to break the elliptic curve cryptography that secures today's internet. The Humanity Ledger is architected with <strong>maxima capacidad cuantica</strong> (maximum quantum capacity) in mind. Our roadmap includes a deterministic transition path to lattice-based post-quantum cryptography, ensuring that the encrypted data committed to the ledger today cannot be decrypted by the quantum adversaries of tomorrow.
          </p>
        </section>

        {/* 5. CONCLUSION */}
        <section className="mb-16 border-t border-slate-700 pt-12">
          <h2 className="text-2xl font-bold mb-6 text-white font-sans uppercase tracking-widest">V. The Sovereign Future</h2>
          <p className="mb-6">
            The Humanity Ledger is more than a Layer 2 network; it is a declaration of independence for digital citizens. We envision a world where identity is self-sovereign, where transactions are confidential, and where technology serves as a bulwark against mass surveillance rather than its primary instrument.
          </p>
          <p className="mb-6 font-bold text-cyan-400">
            Privacy is a human right. We have written the code to guarantee it.
          </p>
          
          <div className="mt-16 text-center font-sans text-slate-500">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center opacity-80 mb-6">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
            </div>
            <p className="tracking-widest uppercase text-xs">Humanity Ledger Foundation</p>
            <p className="text-xs mt-1">Establishing the Privacy-Native Society</p>
          </div>
        </section>

      </div>
    </DocLayout>
  );
}
