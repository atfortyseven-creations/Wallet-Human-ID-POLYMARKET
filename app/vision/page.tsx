import React from 'react';
import DocLayout from '@/components/layout/DocLayout';

export default function Vision() {
  return (
    <DocLayout title="Vision & Manifesto" category="Company" description="The philosophical and technical manifesto of Humanity Ledger — building the privacy-native digital society." lastUpdated="August 2026">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300">
        <h1 className="text-5xl font-extrabold mb-8 text-white tracking-tight">The Vision: Beyond the Present Ledger</h1>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">1. A New Paradigm for Human Interaction</h2>
          <p className="mb-4 text-lg leading-relaxed">
            The Humanity Ledger is not merely a financial instrument; it is the infrastructural bedrock for a post-scarcity digital society. By providing a truly private, censorship-resistant layer, we empower individuals to transact, communicate, and govern themselves autonomously. Our vision extends to creating a globally accessible state machine that respects human rights by default, embedding privacy at the protocol level.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            We foresee a future where cryptographic identities are fluid, composable, and entirely controlled by the end-user. Through the integration of zero-knowledge decentralized identifiers (zk-DIDs), users can prove statements about their identity (e.g., "over 18", "citizen of X") without revealing their underlying data. This paradigm shift eliminates the need for centralized data silos and mitigates the risk of mass surveillance.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">2. Ultimate Scalability: Trillones de Parametros</h2>
          <p className="mb-4 text-lg leading-relaxed">
            To support a global population, the network must handle an unprecedented load. Our theoretical models, validated through extensive simulation, project the ability to manage models and state channels scaling to <strong>trillones de parametros</strong>. This isn't just about transaction throughput; it's about the complexity of smart contracts, decentralized AI inferences, and massive-scale multi-party computations occurring seamlessly on-chain.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            Our commitment to <strong>maxima capacidad cuantica</strong> ensures that as computational power grows exponentially, the Ledger remains an immutable and secure anchor. The integration of lattice-based cryptography alongside traditional elliptic curves guarantees that our vision will withstand the test of time and technological upheaval.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">3. The Road Ahead</h2>
          <p className="mb-4 text-lg leading-relaxed">
            The roadmap is ambitious, encompassing cross-chain interoperability via trustless zk-bridges, native integration with decentralized storage networks, and the deployment of a fully homomorphic execution environment. We invite developers, cryptographers, and visionaries to join us in building this resilient framework for humanity.
          </p>
        </section>
      </div>
    </DocLayout>
  );
}
