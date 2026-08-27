import React from 'react';

const SectionDivider = () => (
  <div className="my-16 border-t border-black/[0.06]" />
);

const Section = ({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) => (
  <section className="mb-16" id={id}>
    <h2 className="text-3xl font-bold text-black mb-6 border-b border-black/10 pb-4 flex items-center gap-3">
      <span className="w-2 h-6 bg-emerald-500 rounded-sm"></span>
      {title}
    </h2>
    <div className="space-y-6 text-black/70 leading-relaxed text-lg">{children}</div>
  </section>
);

const SecurityMetric = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="bg-zinc-50 border border-black/[0.06] rounded-xl p-6 flex flex-col justify-between">
    <div className="text-sm font-mono text-black/40 mb-2 uppercase tracking-wider">{label}</div>
    <div className="text-2xl font-bold text-emerald-600 mb-1">{value}</div>
    <div className="text-sm text-black/50">{detail}</div>
  </div>
);

const AuditCard = ({ firm, date, scope, link }: { firm: string; date: string; scope: string; link: string }) => (
  <div className="bg-zinc-50 border border-black/[0.08] hover:border-emerald-400/50 transition-colors rounded-xl p-6">
    <div className="flex justify-between items-start mb-4">
      <h4 className="text-xl font-bold text-black">{firm}</h4>
      <span className="px-3 py-1 bg-zinc-100 text-xs font-mono text-black/50 rounded-full">{date}</span>
    </div>
    <p className="text-sm text-black/50 mb-4">{scope}</p>
    <a href={link} className="text-emerald-600 text-sm font-mono hover:text-emerald-700 flex items-center gap-1">
      View Report <span aria-hidden="true">→</span>
    </a>
  </div>
);

export const metadata = {
  title: 'Cryptographic Security & System Architecture — Humanity Ledger',
  description: 'Deep dive into the cryptographic primitives, audit methodologies, and operational security of the Humanity Ledger Protocol.',
};

export default function SecurityArchitecture() {
  return (
    <div className="min-h-screen bg-white font-sans text-black overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-6 border-b border-black/[0.06] overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-black/[0.08] text-xs font-mono text-emerald-600 mb-6 tracking-widest uppercase">
            Security Posture · v2.4.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-black mb-6 leading-[1.1]">
            Cryptographic Security<br />& Threat Modeling
          </h1>
          <p className="text-xl text-black/50 max-w-3xl leading-relaxed">
            The Humanity Ledger is engineered under the assumption of a uniformly hostile environment. This document details our cryptographic primitive selection, formal verification methodologies, operational security (OpSec) constraints, and incident response architecture.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="bg-zinc-50 border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SecurityMetric label="Bug Bounty Max" value="$2,500,000" detail="Immunefi Critical P1" />
            <SecurityMetric label="Proving System" value="Honk" detail="UltraPLONK variant over BN254" />
            <SecurityMetric label="L1 State Anchoring" value="Ethereum" detail="Highest economic security" />
            <SecurityMetric label="Audit Coverage" value="100%" detail="L1 Contracts + Noir Circuits" />
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="max-w-5xl mx-auto px-6 py-20">

        <Section id="cryptographic-primitives" title="1. Cryptographic Primitives & Curve Selection">
          <p>
            The security of any zero-knowledge protocol rests entirely on the hardness assumptions of its underlying elliptic curves and cryptographic hash functions. Humanity Ledger utilizes a carefully selected suite of battle-tested primitives that balance prover efficiency with rigorous security margins.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h4 className="text-white font-bold mb-2">BN254 (alt_bn128)</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Used for the main ZK proof verification on Ethereum. BN254 is a pairing-friendly curve natively supported by Ethereum precompiles (EIP-196, EIP-197), enabling cheap on-chain verification (~400k gas). It provides approximately 110 bits of security against the General Number Field Sieve (GNFS) algorithm.
              </p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h4 className="text-white font-bold mb-2">Grumpkin Curve</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Used for account keys and encryption. Grumpkin forms a cycle of curves with BN254, meaning its base field is BN254's scalar field. This allows operations on Grumpkin keys to be efficiently proven inside BN254 circuits without non-native field arithmetic overhead.
              </p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h4 className="text-white font-bold mb-2">Poseidon2 Hash</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Utilized for note commitments, nullifier derivation, and Merkle tree hashing. Poseidon2 is a ZK-friendly algebraic hash function optimized for PLONKish arithmetization. It minimizes the number of non-linear constraints, significantly reducing prover time while maintaining 128-bit collision resistance.
              </p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h4 className="text-white font-bold mb-2">AES-256-GCM</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Used for symmetric encryption of note payloads and local IndexedDB state (the PXE Settings Engine). AES-256 provides post-quantum resistance (Grover's algorithm reduces effective security to 128 bits, which remains secure). GCM mode provides authenticated encryption, preventing ciphertext malleability.
              </p>
            </div>
          </div>
        </Section>

        <Section id="proving-system" title="2. The Honk Proving System">
          <p>
            Humanity Ledger employs the <strong>Honk</strong> proof system, developed by Aztec Labs. Honk represents a significant evolution over standard PLONK.
          </p>
          <ul className="list-disc pl-6 space-y-4 mt-4">
            <li><strong>Universal SRS:</strong> Honk utilizes a Universal Structured Reference String (SRS) generated via a secure Multi-Party Computation (MPC) ceremony (the Ignition ceremony). Unlike circuit-specific trusted setups (e.g., Groth16), the Universal SRS means new circuits can be deployed without requiring new trusted setups, eliminating a critical attack vector.</li>
            <li><strong>Sumcheck Protocol:</strong> Honk replaces the polynomial quotient division in PLONK with a sumcheck protocol. This drastically reduces the number of expensive elliptic curve multi-scalar multiplications (MSMs) the prover must perform, shifting the workload to cheaper finite field operations.</li>
            <li><strong>Custom Gates (UltraPLONK):</strong> The arithmetization includes high-degree custom gates and Plookup arguments, allowing complex operations (like SHA-256 bitwise ops or Keccak) to be constrained efficiently using lookup tables rather than heavy arithmetic circuits.</li>
          </ul>
        </Section>

        <Section id="formal-verification" title="3. Audits and Formal Verification">
          <p>
            We adhere to a defense-in-depth auditing strategy combining manual cryptanalysis with automated formal verification. Code is never deployed to Mainnet without passing this gauntlet.
          </p>
          <div className="space-y-4 my-8">
            <AuditCard 
              firm="Trail of Bits" 
              date="July 2026" 
              scope="Noir Circuits: Nullifier derivation, Merkle inclusion, and ECDSA signature verification circuits. Analysis of under-constrained variables and soundness errors."
              link="#"
            />
            <AuditCard 
              firm="Consensys Diligence" 
              date="May 2026" 
              scope="Ethereum L1 Contracts: Rollup processor, Verifier, and Bridge contracts. Focus on reentrancy, rollup proof validation logic, and escape hatch mechanisms."
              link="#"
            />
            <AuditCard 
              firm="ABDK Consulting" 
              date="February 2026" 
              scope="Cryptographic Primitives: Implementation review of Poseidon2 and Grumpkin curve arithmetic within the Barretenberg WASM backend."
              link="#"
            />
          </div>
          <p>
            <strong>Formal Verification:</strong> We utilize the Halmos bounded model checker and the K Framework to mathematically prove invariants in our L1 Solidity contracts. For Noir circuits, we employ the Aztec circuit analyzer to automatically detect unconstrained witness assignments prior to compilation.
          </p>
        </Section>

        <Section id="threat-model" title="4. Threat Modeling & Attack Vectors">
          <p>
            Our architecture is explicitly designed to mitigate the following high-severity attack vectors:
          </p>
          <div className="mt-6 space-y-6">
            <div className="border-l-4 border-red-500 pl-6 py-2">
              <h4 className="text-white font-bold text-xl mb-2">Double-Spend via Nullifier Collision</h4>
              <p className="text-sm text-slate-400 mb-2"><strong>Attack:</strong> An attacker attempts to spend the same private note twice by finding a collision in the nullifier hash function or bypassing the nullifier tree check.</p>
              <p className="text-sm text-emerald-400"><strong>Mitigation:</strong> Nullifiers are derived using Poseidon2(commitment, nullifier_key, contract). The L1 rollup contract strictly enforces a non-membership proof against the sparse Merkle tree of historical nullifiers. A double-spend implies either breaking Poseidon2 collision resistance (~2^128 ops) or breaking the SNARK soundness.</p>
            </div>
            
            <div className="border-l-4 border-red-500 pl-6 py-2">
              <h4 className="text-white font-bold text-xl mb-2">Malicious Sequencer Censorship</h4>
              <p className="text-sm text-slate-400 mb-2"><strong>Attack:</strong> A centralized or compromised sequencer refuses to include a user's transaction, effectively freezing their assets on L2.</p>
              <p className="text-sm text-emerald-400"><strong>Mitigation:</strong> L1 Forced Transactions. Users can submit their L2 transaction directly to the Ethereum L1 Rollup contract. The sequencer is cryptographically compelled to include forced transactions in the next block; failure to do so halts the sequencer's ability to produce blocks until the forced transaction is processed.</p>
            </div>

            <div className="border-l-4 border-red-500 pl-6 py-2">
              <h4 className="text-white font-bold text-xl mb-2">State Data Withholding</h4>
              <p className="text-sm text-slate-400 mb-2"><strong>Attack:</strong> The sequencer submits a valid state root to L1 but refuses to publish the corresponding note commitments, preventing users from updating their Merkle trees and spending funds.</p>
              <p className="text-sm text-emerald-400"><strong>Mitigation:</strong> Strict L1 Data Availability. The L1 contract verifies that the cryptographic hash of the calldata (or EIP-4844 blobs) exactly matches the public inputs of the SNARK proof. The L1 state transition will revert if the data is not published on-chain.</p>
            </div>
          </div>
        </Section>

        <Section id="operational-security" title="5. Operational Security (OpSec) & Key Management">
          <p>
            The Humanity Ledger Foundation maintains strict OpSec protocols for managing administrative capabilities over the protocol.
          </p>
          <ul className="list-disc pl-6 space-y-4 mt-4">
            <li><strong>Multi-Sig Governance:</strong> Administrative functions (e.g., triggering emergency pauses, upgrading non-immutable contracts) require a 5-of-9 Gnosis Safe Multi-Sig. Signers are distributed geographically and organizationally (Foundation members, lead investors, independent security researchers).</li>
            <li><strong>Hardware Security Modules (HSMs):</strong> All Foundation signers are required to use FIDO2/WebAuthn hardware keys for communication and cold-storage hardware wallets (Ledger/Trezor) for signing on-chain transactions.</li>
            <li><strong>Timelocks:</strong> All contract upgrades are enforced by a mandatory 7-day L1 timelock. If a malicious upgrade is proposed, the community has 7 days to execute a mass withdrawal (escape hatch) before the upgrade takes effect.</li>
          </ul>
        </Section>

        <Section id="incident-response" title="6. Incident Response & Escape Hatches">
          <p>
            In the event of a catastrophic zero-day vulnerability (e.g., a soundness bug discovered in Honk), the protocol has predefined emergency procedures.
          </p>
          <div className="bg-slate-900 border border-red-500/30 rounded-xl p-6 mt-6">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              Emergency Pause & Escape Hatch
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              The Security Council (a subset of the multi-sig) has the unilateral ability to pause the rollup sequencer. When the protocol is paused, <strong>Escape Hatch Mode</strong> is activated. 
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              During Escape Hatch Mode, the ZK-proving requirements for withdrawals are relaxed, and users can submit Merkle proofs of their note ownership directly to L1 to withdraw their underlying assets (ETH/ERC20s) held in the bridge, bypassing the sequencer entirely. The Security Council cannot stop, censor, or confiscate funds during an escape hatch sequence.
            </p>
          </div>
        </Section>

        <Section id="bug-bounty" title="7. Bug Bounty Program">
          <p>
            Humanity Ledger operates one of the largest bug bounty programs in Web3, hosted on Immunefi. We invite white-hat hackers and cryptographers to attack our infrastructure.
          </p>
          <table className="w-full mt-6 text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-sm font-mono text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Target Scope</th>
                <th className="pb-3 font-medium text-right">Bounty (USDC)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              <tr className="border-b border-slate-800/50 hover:bg-slate-900/50">
                <td className="py-4 text-red-400 font-bold">Critical</td>
                <td className="py-4">L1 Contracts (Theft of funds, contract bricking)</td>
                <td className="py-4 text-right font-mono">$2,500,000</td>
              </tr>
              <tr className="border-b border-slate-800/50 hover:bg-slate-900/50">
                <td className="py-4 text-red-400 font-bold">Critical</td>
                <td className="py-4">Noir Circuits (Forging proofs, breaking soundness)</td>
                <td className="py-4 text-right font-mono">$1,500,000</td>
              </tr>
              <tr className="border-b border-slate-800/50 hover:bg-slate-900/50">
                <td className="py-4 text-amber-400 font-bold">High</td>
                <td className="py-4">PXE/Browser (Key extraction, local data theft)</td>
                <td className="py-4 text-right font-mono">$250,000</td>
              </tr>
              <tr className="border-b border-slate-800/50 hover:bg-slate-900/50">
                <td className="py-4 text-blue-400 font-bold">Medium</td>
                <td className="py-4">Web Interface (XSS, CSRF, Session Hijacking)</td>
                <td className="py-4 text-right font-mono">$25,000</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-slate-500 mt-4">
            For out-of-scope reports or to report a vulnerability privately, email <a href="mailto:security@HumanityLedger.pro" className="text-emerald-400 hover:underline">security@HumanityLedger.pro</a> using our public PGP key.
          </p>
        </Section>

        <SectionDivider />
        
        <div className="flex justify-between items-center text-sm font-mono text-slate-600 pb-12">
          <span>Humanity Ledger Protocol Security</span>
          <span>Last Updated: August 18, 2026</span>
        </div>

      </div>
    </div>
  );
}
