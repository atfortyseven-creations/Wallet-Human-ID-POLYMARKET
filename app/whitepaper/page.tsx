import React from 'react';
import DocLayout from '@/components/layout/DocLayout';

export default function Whitepaper() {
  return (
    <DocLayout title="Protocol Whitepaper" category="Technical" description="The formal cryptographic thesis behind Humanity Ledger — zero-knowledge proofs, UTXO model, and Aztec L2 architecture." lastUpdated="August 2026">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300">
        <h1 className="text-5xl font-extrabold mb-8 text-white tracking-tight">Humanity Ledger Whitepaper: Cryptographic Horizons</h1>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Abstract</h2>
          <p className="mb-4 text-lg leading-relaxed">
            This document outlines the theoretical foundations and implementation details of the Humanity Ledger, a decentralized, privacy-preserving Layer 2 protocol. By intertwining zero-knowledge proofs with homomorphic encryption, we present a system that guarantees absolute financial and informational sovereignty. Our protocol transcends traditional scaling limits, operating natively on advanced elliptic curves and offering unparalleled throughput.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">1. Mathematical Foundations</h2>
          <p className="mb-4 text-lg leading-relaxed">
            Our protocol relies on the hardness of the Discrete Logarithm Problem (DLP) over specific pairing-friendly curves, specifically the BN254 and BLS12-381 curves. A zero-knowledge proof system requires setting up a structured reference string (SRS) which is generated via an MPC (Multi-Party Computation) trusted setup. In our Honk-based iteration, we utilize sumcheck protocols to reduce the verifier's workload to a logarithmic scale relative to the circuit size.
          </p>
          <div className="bg-slate-900 p-6 rounded-lg my-8 shadow-inner border border-purple-500/30">
            <h3 className="text-xl font-mono text-yellow-400 mb-4">Polynomial Commitment Scheme (KZG)</h3>
            <p className="text-md text-slate-300 mb-2">
              Given a polynomial P(x) of degree d, a prover computes the commitment:
            </p>
            <code className="text-sm text-green-300 block mb-4">
              C = [P(s)]_1 = Σ (p_i * [s^i]_1)
            </code>
            <p className="text-md text-slate-300">
              The verifier can check the evaluation P(z) = y using the pairing equation:
            </p>
            <code className="text-sm text-green-300 block mt-2">
              e(C - [y]_1, [1]_2) == e(π, [s]_2 - [z]_2)
            </code>
          </div>
          <p className="mb-4 text-lg leading-relaxed">
            These fundamental primitives ensure that no individual transaction leaks information regarding the sender, receiver, or amount. Furthermore, the protocol incorporates post-quantum signatures for transaction authorization, striving for <strong>maxima capacidad cuantica</strong> to protect assets decades into the future.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">2. Neural Consensus and Network Topology</h2>
          <p className="mb-4 text-lg leading-relaxed">
            Beyond standard BFT consensus, the network incorporates an AI-driven predictive routing layer. This layer continuously evaluates network latency and node reliability. The state validation matrices are massive, occasionally surpassing <strong>trillones de parametros</strong>, ensuring robust data availability and real-time state synchronization across all light clients.
          </p>
        </section>
      </div>
    </DocLayout>
  );
}
