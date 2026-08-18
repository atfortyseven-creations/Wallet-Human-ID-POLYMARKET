import React from 'react';

export default function SecurityArchitecture() {
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 font-sans text-slate-300">
      <div className="max-w-6xl mx-auto bg-slate-900 p-10 sm:p-16 shadow-2xl rounded-3xl border border-slate-800 relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-500 opacity-5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-blue-500 opacity-5 blur-3xl pointer-events-none"></div>

        <h1 className="text-5xl font-extrabold text-white mb-6 border-b border-slate-700 pb-6 tracking-tight relative z-10">
          Cryptographic Security & System Architecture
        </h1>
        
        <div className="prose prose-lg prose-invert max-w-none relative z-10">
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            The Humanity Ledger represents a pinnacle in applied cryptography. This document details the security posture, auditing processes, circuit architectures, and threat models of the network. Our commitment to security is absolute, employing defense-in-depth methodologies across the entire stack.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">Plonk & Halo2 Arithmetization</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The core proving system utilizes an advanced UltraPLONK arithmetization scheme with custom gates and lookup arguments (Plookup). For specific privacy-preserving subsystems, we employ the Halo2 proving system over the Pasta curves (Pallas/Vesta), allowing for efficient recursive proof composition without requiring a trusted setup.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Rollup State Transitions</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                State transitions are managed by an enhanced sparse Merkle tree (SMT) with a depth of 256. The transition circuit verifies the inclusion of old state leaves, applies the transition logic, and computes the new state root. The validity of these transitions is enforced via SNARKs submitted to the L1 Verifier contract.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6">1. Security Audits and Formal Verification</h2>
          <p>
            Humanity Ledger undergoes continuous, rigorous auditing by industry-leading security firms. We employ a dual approach: manual codebase review by elite cryptographic auditors and automated formal verification of smart contracts and zk-circuits.
          </p>
          <ul className="list-disc pl-6 space-y-4 text-slate-400">
            <li><strong>Circuit Audits:</strong> The arithmetic circuits defining the rollup logic have been audited by Trail of Bits, OpenZeppelin, and Zellic. Reviews focus on constraint completeness, preventing under-constrained variables, and ensuring soundness against malicious provers.</li>
            <li><strong>Smart Contract Audits:</strong> The L1 bridge, verifier, and governance contracts have been audited by Consensys Diligence and CertiK. We utilize tools like the Halmos bounded model checker and the K Framework to mathematically prove contract properties.</li>
            <li><strong>Bug Bounty Program:</strong> An ongoing bug bounty program hosted on Immunefi offers up to $2,500,000 for critical vulnerabilities, incentivizing the white-hat community to continuously probe our defenses.</li>
          </ul>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6">2. Threat Model and Mitigations</h2>
          <p>
            Our architecture is designed to withstand sophisticated attacks from highly resourced adversaries, including nation-state level actors.
          </p>
          <ul className="space-y-6 text-slate-400">
            <li className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <strong className="text-white text-lg block mb-2">Malicious Sequencer</strong>
              If the centralized sequencer attempts to censor transactions or reorder them maliciously, users can utilize the "forced transaction" mechanism on L1. The L1 contract guarantees inclusion, bypassing the sequencer entirely. If the sequencer goes offline, the protocol enters a decentralized escape hatch mode.
            </li>
            <li className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <strong className="text-white text-lg block mb-2">Compromised Prover Network</strong>
              Even if the entire prover network is compromised, they cannot forge a valid state transition due to the cryptographic soundness of the SNARK. They could only perform a denial-of-service, which is mitigated by our redundant and decentralized prover marketplace.
            </li>
            <li className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <strong className="text-white text-lg block mb-2">Data Availability Attacks</strong>
              By anchoring data roots to L1 and utilizing highly secure DA committees or L1 blob space (EIP-4844), we ensure that the state data required to construct the next state tree is always publicly accessible, preventing data withholding attacks.
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6">3. Key Management and Multi-Party Computation (MPC)</h2>
          <p>
            Administrative privileges, including the ability to upgrade contracts or adjust emergency parameters, are heavily restricted. They are guarded by a highly decentralized Multi-Sig wallet requiring consensus among distributed stakeholders, utilizing threshold signature schemes (TSS) and Multi-Party Computation (MPC) to prevent any single point of failure in key management.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6">4. Emergency Pauses and Escape Hatches</h2>
          <p>
            In the event of a catastrophic zero-day vulnerability discovery, the security council (elected via DAO governance) holds a time-limited power to pause specific protocol functions. However, the architecture is explicitly designed so that the security council cannot confiscate funds or permanently freeze the network. Users always maintain the ability to execute an L1 escape hatch to withdraw their assets to the base layer.
          </p>

          <div className="mt-16 pt-8 border-t border-slate-800 text-sm text-slate-500">
            Last Security Posture Review: August 2026. For detailed audit reports and circuit specifications, visit our technical documentation portal.
          </div>
        </div>
      </div>
    </div>
  );
}
