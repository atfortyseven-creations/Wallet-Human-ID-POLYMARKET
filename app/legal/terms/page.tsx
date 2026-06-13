export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 selection:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-12 border-b border-zinc-900 pb-8">
          Terms and Conditions
        </h1>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          This document establishes the binding cryptographic and legal agreement between the user and the network infrastructure. By initiating a session, bridging assets, or executing a state transition within our zero-knowledge environment, you explicitly acknowledge and accept the operational parameters delineated below. The architecture of this network operates strictly on decentralized validation, meaning that certain actions are irreversible by design.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Article 1: Cryptographic Sovereignty
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The network functions as a non-custodial cryptographic layer. Users retain absolute mathematical sovereignty over their private keys, viewing keys, and generated zero-knowledge proofs. The infrastructure providers possess no technical capacity to freeze, seize, or arbitrarily modify the state of a user's shielded assets or encrypted identity credentials. The responsibility for key management and operational security rests entirely upon the user.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Any loss of access credentials will result in a permanent inability to recover shielded state data. The network architecture categorically prohibits backdoor access, recovery phrases stored in plaintext, or administrative overrides. Users are expected to employ institutional-grade security hygiene when interacting with the client-side cryptographic environment.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Article 2: Network Integrity and Acceptable Use
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          While the network guarantees default privacy for all participants via the Aztec infrastructure, this privacy must not be construed as authorization to engage in illicit, fraudulent, or legally prohibited activities. The platform employs advanced cryptographic nullifiers and compliance proofs designed to deter malicious actors while preserving the confidentiality of legitimate institutional flow.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The network reserves the right to upgrade the protocol parameters, deploy advanced smart contract logic to the testnet, or implement network-wide security patches as required to maintain optimal system health. Continued use of the infrastructure following any protocol upgrade constitutes absolute acceptance of the revised architectural mechanics and any associated systemic changes.
        </p>
      </div>
    </div>
  );
}
