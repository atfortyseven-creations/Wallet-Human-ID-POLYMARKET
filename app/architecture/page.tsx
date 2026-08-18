import React from 'react';
import DocLayout from '@/components/layout/DocLayout';

export default function Architecture() {
  return (
    <DocLayout title="System Architecture Protocol" category="Technical" description="A formal technical specification of the Humanity Ledger infrastructure, detailing cryptographic primitives, state transitions, and privacy-preserving consensus mechanisms." lastUpdated="August 2026">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300">
        <h1 className="text-5xl font-extrabold mb-8 text-white tracking-tight">System Architecture: The Quantum-Resistant L2 Paradigm</h1>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">1. Architectural Overview and The Rollup Mechanism</h2>
          <p className="mb-4 text-lg leading-relaxed">
            The Humanity Ledger implements a highly advanced zk-Rollup architecture inspired by Aztec L2 primitives, integrating ultra-dense zero-knowledge proof circuits that scale natively to millions of transactions per second. Our architecture heavily leverages private state transitions represented by an encrypted UTXO (Unspent Transaction Output) model, operating seamlessly alongside a public account-based model.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            At the core of the execution environment lies the Noir-based virtual machine, engineered for verifiable computation. Every transaction is bundled into a rollup block, and the execution trace is proven via an ultra-fast SNARK protocol (e.g., Plonk or Honk). This ensures computational integrity without sacrificing data privacy, encapsulating our primary directive of achieving <strong>maxima capacidad cuantica</strong> against both classical and quantum adversarial vectors.
          </p>
          
          <div className="bg-slate-800 p-6 rounded-lg my-8 shadow-inner border border-slate-700">
            <h3 className="text-xl font-mono text-emerald-400 mb-4">State Transition Function</h3>
            <code className="text-sm text-pink-300">
              State_new = Π(State_old, Tx_batch) ⊕ Hash(ZK_Proof)
            </code>
            <p className="mt-4 text-sm text-slate-400">
              Where the ZK_Proof is verified against a master verification key instantiated on Ethereum L1. The polynomial commitments are aggregated using a heavily optimized multi-scalar multiplication algorithm.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">2. Cryptographic Primitives and UTXO Trees</h2>
          <p className="mb-4 text-lg leading-relaxed">
            The architecture utilizes an append-only Merkle tree structure for state management, specifically employing pedersen hashes for node commitments. Each UTXO contains an encrypted payload, an owner's public key, and a nullifier to prevent double-spending. When a transaction is submitted, the sender provides a valid zero-knowledge proof demonstrating knowledge of the private key associated with the UTXO, and dynamically computes the corresponding nullifier to be inserted into the Nullifier Tree.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            To accommodate the sheer volume of data, our prover network distributes polynomial evaluation across thousands of heterogeneous nodes. We deploy a unified proving system that scales dynamically. The system is designed to evaluate matrices with <strong>trillones de parametros</strong>, ensuring that the constraint system remains fully optimized even under massive adversarial load. This capability effectively future-proofs the network against large-scale brute-force de-anonymization attempts.
          </p>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">3. The Sequencer and Prover Interaction</h2>
          <p className="mb-4 text-lg leading-relaxed">
            Our sequencer protocol enforces decentralized block production without centralizing transaction ordering. Sequencers collect user intents, filter out invalid transactions using light-client SNARK verification, and aggregate them into a block proposal. Provers then compete in a decentralized marketplace to generate the validity proof for the proposed block. The economic mechanism aligns incentives, penalizing malicious sequencers while rewarding the fastest provers.
          </p>
        </section>
      </div>
    </DocLayout>
  );
}
