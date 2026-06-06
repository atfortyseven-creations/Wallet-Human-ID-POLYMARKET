'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'introduction', label: '1. Introduction to Aztec Integration' },
  { id: 'dual-state-privacy', label: '2. Dual-State Privacy Architecture' },
  { id: 'viewing-keys-aml', label: '3. Viewing Keys & AML Compliance' },
  { id: 'kyc-gating-noir', label: '4. KYC Gating via Noir Circuits' },
  { id: 'pxe-non-custodial', label: '5. PXE & Non-Custodial CASP Exemption' },
  { id: 'regulatory-conclusion', label: '6. Regulatory Conclusion' }
];

export default function AztecArchitecturePage() {
  return (
    <LegalDocLayout
      title="Aztec Network Technical Compliance Architecture"
      subtitle="Detailed technical-legal specification of the $QDs token and Whale Network integration on Aztec Mainnet. This document outlines how zero-knowledge proofs (ZKPs), the Private Execution Environment (PXE), and native Noir smart contracts enable absolute financial privacy while guaranteeing full AML/CFT and MiCA regulatory compliance."
      lastUpdated="6 June 2026 — Version 1.0"
      category="Technical & Regulatory Architecture"
      toc={TOC}
      backHref="/legal/compliance"
      backLabel="Back to Compliance Portal"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="introduction">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. Introduction to Aztec Integration
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. has architected the Whale Network and the $QDs utility token exclusively for the <strong className="text-black font-semibold">Aztec Network</strong>, a decentralised zero-knowledge rollup (ZK-Rollup) settling on Ethereum L1. By leveraging Aztec's native privacy-preserving execution capabilities, Whale Network resolves the fundamental paradox of Web3 regulation: achieving absolute consumer financial privacy without becoming a haven for illicit finance.
            </p>
            <p>
              Unlike legacy Layer 1 networks (which expose all transaction graphs to public surveillance) or traditional "privacy coins" (which lack selective disclosure mechanisms and face widespread regulatory bans), the Aztec Network integration allows Humanity Ledger S.L. to enforce <strong className="text-black font-semibold">programmable compliance</strong> directly within the Noir smart contract logic.
            </p>
            <div className="bg-black/5 p-4 rounded-lg font-medium border-l-4 border-black">
              <strong>Architectural Note:</strong> There is no Solidity L1 bridge contract for the $QDs token. The token is a native Noir contract residing exclusively within the Aztec L2 state tree. The total supply hard cap is mathematically enforced at 210,000,000 QDs.
            </div>
          </div>
        </section>

        {/* 2 */}
        <section id="dual-state-privacy">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Dual-State Privacy Architecture
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Aztec operates a unique <strong>dual-state model</strong>, separating public state (visible to all network nodes) from private state (encrypted note commitments).
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Public State:</strong> Used exclusively for aggregate data, such as total $QDs supply issuance and global compliance registry roots.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Private State:</strong> User balances and transfers are represented as encrypted <code>TokenNote</code> UTXOs in the private state tree. A transfer destroys input notes and creates output notes via a zero-knowledge proof, revealing zero information about the sender, receiver, or amount to the public network sequencer.</span></li>
            </ul>
            <p>
              This architecture ensures compliance with the <strong>General Data Protection Regulation (GDPR)</strong> privacy-by-design mandate (Article 25), as on-chain transaction histories are inherently protected against unauthorized third-party mass surveillance and blockchain heuristics.
            </p>
          </div>
        </section>

        {/* 3 */}
        <section id="viewing-keys-aml">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. Viewing Keys & AML Compliance (Travel Rule)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              To comply with Spanish AML legislation (Law 10/2010) and the EU Transfer of Funds Regulation (Travel Rule — EU 2023/1113), the absolute privacy provided by the Aztec network must be paired with selective disclosure capabilities for competent authorities.
            </p>
            <p>
              Whale Network implements a <strong>Viewing Key Escrow Mechanism</strong>:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>During the mandatory KYC onboarding phase, the user's wallet generates a cryptographic viewing key pair.</li>
              <li>The user securely delegates the <code>viewing_public_key</code> to Humanity Ledger S.L.'s internal compliance module.</li>
              <li>Transactions executed by the user remain completely private on the global public ledger. However, the designated Compliance Officer, utilizing the escrowed viewing key, retains the technical capacity to decrypt the specific user's transaction graph.</li>
              <li>This decryption capability is <strong>strictly locked</strong> and legally reserved for responding to duly substantiated orders from SEPBLAC, the CNMV, the AEPD, or a competent judicial authority.</li>
            </ol>
            <p>
              This satisfies the fundamental requirement of AML oversight—auditability by competent authorities—without compromising the privacy of the network at large.
            </p>
          </div>
        </section>

        {/* 4 */}
        <section id="kyc-gating-noir">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. KYC Gating via Noir Circuits
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Unlike standard tokens where compliance logic is applied off-chain at the application UI layer, the $QDs token embeds compliance at the protocol consensus layer using custom Noir circuits.
            </p>
            <p>
              The system utilizes a <code>mint_private_license</code> Noir circuit. When a user completes biometric identity verification via our specialist provider (Sumsub), an off-chain oracle attestation is generated. The user submits this attestation alongside a zero-knowledge proof to mint an on-chain, non-transferable KYC credential (represented as a private note in the Aztec state tree).
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Threshold Enforcement:</strong> The Noir <code>transfer()</code> function evaluates the transaction amount. If the transfer exceeds the regulatory threshold (e.g., 1,000 QDs), the circuit strictly requires the sender to prove ownership of a valid KYC credential note.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Atomic Rejection:</strong> If the proof fails, the transaction cannot be generated or validated by the Aztec sequencer. Protocol-level anonymity for high-value transfers is mathematically impossible.</span></li>
            </ul>
          </div>
        </section>

        {/* 5 */}
        <section id="pxe-non-custodial">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. PXE & Non-Custodial CASP Exemption
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              A fundamental tenet of the Aztec Network is the <strong>Private Execution Environment (PXE)</strong>. All zero-knowledge proofs required to execute transactions or update private state are generated <em>locally on the user's own device</em>.
            </p>
            <p>
              Because the user's device holds the private decryption and spending keys, and generates the cryptographic proofs locally, Humanity Ledger S.L. acts strictly as a software provider and protocol designer. We do not hold, control, or have technical access to the user's digital assets or private keys at any time.
            </p>
            <div className="bg-black/5 p-4 rounded-lg font-medium border-l-4 border-black">
              <strong>MiCA Recital 22 Exemption:</strong> Due to this strict non-custodial architecture powered by the PXE, Humanity Ledger S.L. does not provide the service of "safekeeping and administration of crypto-assets on behalf of clients" and is therefore exempt from the stringent custody requirements applicable to Crypto-Asset Service Providers (CASPs) under Title V of MiCA.
            </div>
          </div>
        </section>

        {/* 6 */}
        <section id="regulatory-conclusion">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. Regulatory Conclusion
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The synergy between the Aztec Network's Noir-based ZK-Rollup architecture and Humanity Ledger S.L.'s legal framework produces a compliance standard previously thought impossible in decentralized finance. By combining client-side proof generation, escrowed viewing keys, and protocol-level KYC gating, the Whale Network provides users with uncompromising data sovereignty while guaranteeing regulators absolute protection against money laundering and illicit finance.
            </p>
            <p>
              This document forms part of the regulatory submission package prepared for Aztec Labs and the Comisión Nacional del Mercado de Valores (CNMV).
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
