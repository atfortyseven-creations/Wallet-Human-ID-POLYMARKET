'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'statement-of-transparency', label: '1. Statement of Absolute Transparency' },
  { id: 'current-status-june-2026', label: '2. Current Status (As of June 2026)' },
  { id: 'pending-execution-grant', label: '3. Pending Execution & Grant Utilization' },
  { id: 'timeline-commitments', label: '4. Timeline & Hard Commitments' },
  { id: 'final-declaration', label: '5. Final Declaration to Aztec' }
];

export default function AztecGrantTransparencyPage() {
  return (
    <LegalDocLayout
      title="Aztec Grant Transparency & Current Status Report"
      subtitle="A completely transparent, mathematically precise assessment of the Whale Network's current development state and the required execution roadmap pending Aztec Grant approval. Prepared with maximum sincerity for the Aztec Network team."
      lastUpdated="6 June 2026"
      category="Transparency & Roadmap"
      toc={TOC}
      backHref="/legal/compliance"
      backLabel="Back to Compliance Portal"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="statement-of-transparency">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. Statement of Absolute Transparency
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. operates under a mandate of total sincerity. We recognize that building on the Aztec Network requires unparalleled cryptographic rigor and regulatory perfection. To establish total trust with the Aztec team, this document separates what has been definitively completed from what is mathematically and legally planned but requires capital execution.
            </p>
            <p>
              We do not overpromise or misrepresent our current status. We present exactly where we stand today, and exactly how the Aztec Grant will be utilized to achieve our 1 January 2027 Mainnet TGE.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section id="current-status-june-2026">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Current Status (As of June 2026)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              As of today, we have completely self-funded and executed the foundational architecture, UI/UX, and the entire European legal framework.
            </p>

            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">2.1. What is 100% Completed Today:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Frontend & System Architecture:</strong> The entire Next.js/React frontend (humanidfi.com), including the complex UI components, routing, and developer portal framework, is fully built and deployed to production on Railway.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>MiCA Regulatory Suite (25 Documents):</strong> We have drafted the complete legal infrastructure required to operate as a MiCA-compliant utility token issuer. This includes the Crypto-Asset White Paper (Annex I), CNMV Classification Justification, AML/CFT Prevention Manual, and all GDPR privacy policies.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Aztec Integration Architecture:</strong> The logical architecture for how our $QDs token interacts with Aztec is fully defined. We rely exclusively on Noir, the Aztec Private Execution Environment (PXE), and a dual-state model with a viewing-key escrow for AML compliance (Travel Rule). We have no Solidity L1 contracts.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Identity Verification Logic:</strong> The business logic mapping Sumsub biometric KYC tiers to the <code>mint_private_license</code> Noir circuit is strictly defined.</span></li>
            </ul>

            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">2.2. What We Do NOT Have Today (Honest Assessment):</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Compiled Noir Smart Contracts:</strong> While the logic is defined, the actual <code>.nr</code> code for the <code>mint_private_license</code> circuit and the native Aztec token contract has not been written or compiled. We require expert Noir engineering.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Formal S.L. Incorporation:</strong> Humanity Ledger S.L. is currently undergoing the CIRCE incorporation process. The €3,000 share capital and Notary execution are pending.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Security Audits:</strong> We have not initiated formal third-party cryptographic audits for our proposed ZK circuits.</span></li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section id="pending-execution-grant">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. Pending Execution & Grant Utilization
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The requested Aztec Grant will be strictly allocated to overcome our current technical and legal bottlenecks. We will allocate the capital with maximum precision across the following vectors:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-left">
                <tbody className="divide-y divide-black/10">
                  <tr>
                    <td className="px-4 py-3 border-r border-black/10 font-bold text-black bg-black/5 w-1/3">1. Noir Engineering (Q3 2026)</td>
                    <td className="px-4 py-3">Hiring a specialized Noir developer or cryptography firm to formally translate our defined compliance architecture into production-ready `.nr` circuits, specifically the <code>mint_private_license</code> KYC gating circuit and the <code>grant_viewing_key</code> function.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-r border-black/10 font-bold text-black bg-black/5">2. ZK Security Audit (Q4 2026)</td>
                    <td className="px-4 py-3">Engaging a Tier-1 auditing firm (e.g., Trail of Bits, Nethermind Security, or Aztec-recommended auditors) to rigorously test the Noir smart contracts prior to mainnet deployment.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-r border-black/10 font-bold text-black bg-black/5">3. Institutional Legal & Registration Fees</td>
                    <td className="px-4 py-3">Executing the formal Spanish Notary constitution of Humanity Ledger S.L., paying the CNMV electronic filing fees for the MiCA White Paper (November 2026), and finalizing the LEI and DTI identifier registrations.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-r border-black/10 font-bold text-black bg-black/5">4. Infrastructure & Gas Subsidy (Q1 2027)</td>
                    <td className="px-4 py-3">Subsidizing initial sequencer fees on the Aztec Network for early adopters undergoing the Sumsub KYC verification, ensuring a frictionless onboarding experience for the first 10,000 users.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4 */}
        <section id="timeline-commitments">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. Timeline & Hard Commitments
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              If the grant is provided, we commit to the following immutable execution timeline:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-black text-white rounded shrink-0">JULY 2026</span>
                <span>Complete formal constitution of Humanity Ledger S.L. and initiate Noir development for the KYC compliance circuits.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-black text-white rounded shrink-0">OCT 2026</span>
                <span>Finalize Noir smart contract development and submit code to Tier-1 auditors. Obtain iXBRL validation for the MiCA Whitepaper.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-black text-white rounded shrink-0">NOV 28, 2026</span>
                <span>Absolute deadline for submitting the 6-document MiCA Notification Package to the Spanish CNMV (20 business days pre-TGE).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-black text-white rounded shrink-0">JAN 1, 2027</span>
                <span><strong>Target TGE Date:</strong> Deployment of the $QDs token to Aztec Mainnet. Launch of the fully compliant Whale Network.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 5 */}
        <section id="final-declaration">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. Final Declaration to Aztec
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We are not asking for a grant to "explore" ideas. The front-end is built. The legal framework is exhaustively mapped. The compliance mechanisms to satisfy the highest European authorities (CNMV, SEPBLAC) are fully architected. 
            </p>
            <p>
              We require Aztec's backing specifically to fund the heavy cryptographic engineering and auditing required to bring this blueprint to life securely on the Aztec Network. We present this document so that Aztec knows exactly the calibre of seriousness, precision, and transparency we operate under.
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
