import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto bg-white p-10 sm:p-16 shadow-2xl rounded-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 border-b-2 border-gray-100 pb-6 tracking-tight">
          Terms of Service and Network Governance
        </h1>
        <div className="prose prose-lg prose-indigo max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Welcome to the Humanity Ledger Network. By interacting with the network, its smart contracts, indexing nodes, or front-end interfaces, you explicitly agree to the following terms, which constitute a legally binding agreement.
          </p>
          
          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">1. Introduction and Protocol Architecture</h2>
          <p>
            The Humanity Ledger operates as a decentralized, zero-knowledge rollup infrastructure utilizing advanced cryptographic primitives to scale Ethereum while maintaining privacy. These terms govern the usage of the protocol, the sequencer network, the prover network, and associated decentralized autonomous organization (DAO) governance structures.
            The protocol functions as an autonomous system of smart contracts deployed on the Ethereum blockchain and associated Layer-2 environments. No central entity operates or controls the underlying protocol.
          </p>
          <p>
            By submitting transactions to the sequencer or directly to the L1 contracts, you acknowledge the inherent risks associated with cryptographic systems, distributed ledger technology, and zero-knowledge proofs.
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">2. Regulatory Compliance & MiCA Framework</h2>
          <p>
            The Humanity Ledger is designed with rigorous adherence to global regulatory standards, including the Markets in Crypto-Assets (MiCA) regulation within the European Union. Under MiCA, the network's utility tokens and cryptographic primitives are structured to ensure transparency, consumer protection, and market integrity.
          </p>
          <ul className="list-disc pl-6 space-y-4 text-gray-700">
            <li><strong>Asset Referencing and Utility:</strong> The native tokens of the protocol serve strictly as utility mechanisms for network security, transaction fees, and governance. They do not constitute financial instruments or securities under MiCA classifications.</li>
            <li><strong>Issuer Obligations:</strong> As a decentralized protocol, there is no central issuer. However, core contributing entities adhere to MiCA’s transparency guidelines, providing comprehensive whitepapers, risk disclosures, and governance frameworks.</li>
            <li><strong>Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF):</strong> While the network utilizes zero-knowledge proofs to preserve user privacy, the design accommodates opt-in compliance mechanisms. Users interacting with centralized gateways or regulated endpoints must comply with applicable AML/CTF regulations. Our decentralized sequencer architecture ensures that no censorship occurs at the protocol level, but off-chain entities interfacing with the protocol must perform their own regulatory compliance.</li>
            <li><strong>Consumer Protection:</strong> Smart contract audits, formal verification of zero-knowledge circuits, and transparent governance proposals form the bedrock of our commitment to consumer protection, aligning with MiCA’s mandates for operational resilience and security.</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">3. Decentralized Identity and Sybil Resistance</h2>
          <p>
            The network employs a novel mechanism for decentralized identity verification, leveraging zk-SNARKs to prove uniqueness without revealing personal data. You agree not to circumvent these Sybil-resistance mechanisms. Any attempt to generate multiple identities, exploit the uniqueness checks, or compromise the proof generation process will result in immediate slashing of staked assets and potential network-level exclusion via governance consensus.
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">4. Risk Disclosures and Liability Limitations</h2>
          <p>
            Cryptographic systems are experimental and subject to failure. By using Humanity Ledger, you acknowledge that you are interacting with complex software that may contain undiscovered vulnerabilities.
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
            <h3 className="text-xl font-bold text-red-800 mb-2">Assumption of Risk</h3>
            <p className="text-red-700">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PROTOCOL IS PROVIDED "AS IS" AND "AS AVAILABLE". THERE ARE NO WARRANTIES, EXPRESS OR IMPLIED. CORE CONTRIBUTORS, NODE OPERATORS, AND GOVERNANCE PARTICIPANTS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR CRYPTOGRAPHIC ASSETS, ARISING OUT OF OR IN CONNECTION WITH THE USE OR INABILITY TO USE THE PROTOCOL.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">5. Governance and Upgradability</h2>
          <p>
            The Humanity Ledger is governed by a decentralized autonomous organization (DAO). Protocol upgrades, including modifications to the zero-knowledge circuits, sequencer rules, and contract logic, are executed via on-chain governance proposals. You agree to be bound by the outcomes of these governance processes.
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6">6. Dispute Resolution</h2>
          <p>
            Any disputes arising from your use of the Humanity Ledger network, front-end interfaces, or related services shall be resolved through binding arbitration, rather than in court, except that you may assert claims in small claims court if your claims qualify. The arbitration will be conducted confidentially by a single arbitrator in accordance with the rules of the International Chamber of Commerce (ICC).
          </p>

          <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
            Last Updated: August 2026. These terms are subject to change via DAO governance.
          </div>
        </div>
      </div>
    </div>
  );
}
