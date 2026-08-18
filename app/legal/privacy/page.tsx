import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-blue-50 py-16 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto bg-white p-10 sm:p-16 shadow-2xl rounded-3xl border border-blue-100">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-6 border-b-2 border-blue-100 pb-6 tracking-tight">
          Privacy Policy & Zero-Knowledge Data Architecture
        </h1>
        
        <div className="prose prose-lg prose-blue max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            At Humanity Ledger, we fundamentally believe that privacy is a human right. This document outlines how our protocol implements advanced cryptographic techniques to protect your data while complying with global regulatory frameworks such as the General Data Protection Regulation (GDPR).
          </p>

          <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-inner my-10">
            <h2 className="text-2xl font-bold text-blue-100 mb-4 mt-0">The Zero-Knowledge Privacy Paradigm</h2>
            <p className="text-blue-200 leading-relaxed mb-0">
              Unlike traditional web applications or transparent blockchains where every transaction and state change is publicly visible, the Humanity Ledger utilizes Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs). This means that while the integrity and validity of all network transitions are mathematically proven and publicly verifiable on Ethereum, the underlying data (who transacted, how much, and what was executed) remains entirely encrypted and private.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">1. Data Collection and GDPR Compliance</h2>
          <p>
            Under the GDPR, personal data must be processed lawfully, fairly, and transparently. We approach data processing uniquely: the protocol is designed to minimize, or entirely eliminate, the collection of personally identifiable information (PII).
          </p>
          <ul className="list-disc pl-6 space-y-4 text-gray-700">
            <li><strong>Data Controller vs. Protocol:</strong> The decentralized protocol itself is not a data controller. It acts as an immutable state machine processing encrypted payloads. Any centralized gateways, API providers, or sequencers operating on top of the network may act as data controllers or processors depending on their implementation.</li>
            <li><strong>Right to Erasure (Right to be Forgotten):</strong> In a public blockchain, immutability directly conflicts with the right to erasure. However, through our zero-knowledge architecture, state data is stored in off-chain data availability layers, while only cryptographic commitments (hashes and proofs) are posted on-chain. If a user deletes their private keys or the decryption keys corresponding to their off-chain data, the cryptographic commitment becomes entirely unreadable, effectively fulfilling the right to erasure through cryptographic means.</li>
            <li><strong>Data Minimization:</strong> By utilizing verifiable credentials and zk-proofs, users can prove statements about their identity (e.g., "I am over 18", "I am a unique human") without revealing their actual date of birth, biometric data, or identity documents. The protocol only processes the proof, never the underlying PII.</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">2. Cryptographic Storage and Data Availability</h2>
          <p>
            State transitions within the Humanity Ledger are processed by the sequencer and subsequently proved by the decentralized prover network. During this process, user transaction data is encrypted locally on the user's device before being broadcast.
          </p>
          <p>
            The protocol ensures data availability through a highly secure Validium or Volition model, where users can choose whether their encrypted state data is published to a decentralized Data Availability (DA) layer (like Celestia or EigenDA) or posted directly to Ethereum L1 as calldata/blobs. In both scenarios, the data remains encrypted, and only the user holds the decryption keys.
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">3. Cookies, Telemetry, and Interface Analytics</h2>
          <p>
            While the protocol itself collects no telemetry, our front-end interfaces (such as humanity-ledger.app) may collect limited analytics to improve user experience.
          </p>
          <ul className="list-disc pl-6 space-y-4 text-gray-700">
            <li><strong>Local Storage:</strong> We heavily rely on local storage to maintain session states and store generated zk-proofs locally on your device. This data never leaves your browser unless explicitly authorized.</li>
            <li><strong>Anonymized Telemetry:</strong> We may use privacy-preserving analytics tools (such as Plausible Analytics) that do not track IP addresses or use persistent cookies, ensuring full compliance with the ePrivacy Directive and GDPR.</li>
            <li><strong>RPC Endpoints:</strong> When interacting with our default RPC endpoints, IP addresses may be temporarily logged for DDoS protection and rate limiting. We strongly encourage users to utilize privacy networks (like Tor or Nym) or run their own local light nodes for maximum privacy.</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">4. Contact Information and Data Protection Officer (DPO)</h2>
          <p>
            For inquiries related to privacy practices, data subject access requests (DSARs), or to contact our designated Data Protection Officer, please reach out through our official communication channels documented on our governance forums. Because the core protocol is a decentralized smart contract system, requests must be directed to specific service providers or front-end operators acting as data controllers.
          </p>

          <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
            Last Updated: August 2026. This policy reflects the architectural realities of the protocol as of mainnet iteration 4.0.
          </div>
        </div>
      </div>
    </div>
  );
}
