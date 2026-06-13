export default function ComplianceDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 selection:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-12 border-b border-zinc-900 pb-8">
          Compliance Documentation
        </h1>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          This document formally details the compliance architecture embedded within the network. Our protocol is designed from the ground up to intersect strict regulatory requirements with uncompromising cryptographic privacy. By utilizing the Aztec network, we ensure that compliance and confidentiality are not mutually exclusive but rather foundational pillars of the same ecosystem.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Regulatory Alignment via Zero-Knowledge
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The network actively leverages zero-knowledge succinct non-interactive arguments of knowledge to fulfill standard anti-money laundering and know-your-customer directives without exposing raw consumer data. Verification protocols are executed locally on the client layer, generating cryptographic proofs that assert the legitimacy of an identity or transaction. These proofs are then verified on-chain, satisfying regulatory oversight while keeping the underlying dataset entirely shielded from public ledgers.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Consequently, institutional participants can cryptographically verify that all counter-parties have met compliance thresholds prior to engagement. This creates a provably clean environment where privacy does not serve as a veil for illicit activity, but rather as a fundamental human right preserved mathematically.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Data Localization and Sovereign Storage
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          In strict adherence to international data protection regulations such as the General Data Protection Regulation and the California Consumer Privacy Act, the network mandates that sensitive identity components remain strictly under user custody. Our architecture does not persist personally identifiable information on centralized servers.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          State transitions regarding identity verification result solely in the issuance of encrypted credentials. The protocol only logs the cryptographic nullifier and the verification status on the testnet, guaranteeing that user data cannot be retroactively harvested or subpoenaed from our infrastructure, as we simply do not possess it.
        </p>
      </div>
    </div>
  );
}
