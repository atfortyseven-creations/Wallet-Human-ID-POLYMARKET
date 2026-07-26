'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'statement-of-alignment', label: '1. Statement of Alignment with Aztec' },
  { id: 'current-status-june-2026', label: '2. Current Status (As of July 2026)' },
  { id: 'grant-utilization', label: '3. Grant Utilization for Scaling' },
  { id: 'final-declaration', label: '4. Final Declaration to Aztec' }
];

export default function AztecGrantTransparencyPage() {
  return (
    <LegalDocLayout
      title="Aztec Grant Alignment & Scaling Report"
      subtitle="A transparent breakdown of Humanity Ledger S.L.'s commitments, grant allocations, and milestone deliverables for the Aztec Network grant."
      lastUpdated="26 July 2026"
      category="Transparency & Scaling"
      toc={TOC}
      backHref="/legal/compliance"
      backLabel="Back to Attestation Portal"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="statement-of-alignment">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. Statement of Alignment with Aztec
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. operates under a mandate of total technical honesty. We recognize that building on the Aztec Network requires unparalleled cryptographic rigor and regulatory perfection. Our architecture is 100% native to Aztec, utilizing Noir for all attestation and token operations, completely eliminating Ethereum L1 dependencies.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section id="current-status-june-2026">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Current Status (As of July 2026)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We have self-funded and executed the foundational architecture, UI/UX, and the exhaustive European legal framework required for a MiCA-compliant Utility Token on a privacy network.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Frontend & System Architecture:</strong> The Next.js/React frontend (humanidfi.com), including the complex UI components and developer portal framework, is fully built and deployed to production.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>MiCA Regulatory Suite (25 Documents):</strong> We have drafted the complete legal infrastructure required to operate as a MiCA-compliant utility token issuer. This includes the Crypto Asset White Paper (Annex I), CNMV Classification Justification, and AML/CFT Prevention Manual. These documents are currently in the formal process of being signed.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Aztec Integration Architecture:</strong> The logical architecture for how our $QDs token interacts with Aztec is fully defined. We rely exclusively on Noir, the Aztec Private Execution Environment (PXE), and a dual-state model with a viewing-key escrow for AML attestation (Travel Rule).</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong>Identity Verification Logic:</strong> The business logic mapping Sumsub biometric KYC tiers to the <code>mint_private_license</code> Noir circuit is strictly defined.</span></li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section id="grant-utilization">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. Grant Utilization for Scaling
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The requested Aztec Grant will be strictly allocated to scale our infrastructure and undergo maximum-security audits prior to public availability. We will allocate the capital across the following vectors:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-left">
                <tbody className="divide-y divide-black/10">
                  <tr>
                    <td className="px-4 py-3 border-r border-black/10 font-bold text-black bg-black/5 w-1/3">1. ZK Security Audit</td>
                    <td className="px-4 py-3">Engaging a Tier-1 auditing firm to rigorously test our Noir smart contracts prior to large-scale mainnet onboarding.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-r border-black/10 font-bold text-black bg-black/5">2. Sequencer Infrastructure Subsidy</td>
                    <td className="px-4 py-3">Subsidizing initial sequencer fees on the Aztec Network for early adopters undergoing the Sumsub KYC verification, ensuring a frictionless onboarding experience for the first 10,000 users.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-r border-black/10 font-bold text-black bg-black/5">3. Open Source Noir Tooling</td>
                    <td className="px-4 py-3">Contributing our attestation-focused Noir circuit templates (Travel Rule attestation, biometric gating) back to the Aztec developer community as open source primitives.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4 */}
        <section id="final-declaration">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. Final Declaration to Aztec
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We are building the definitive bridge between extreme cypherpunk privacy (Aztec) and strict sovereign attestation (MiCA). We require Aztec's backing specifically to fund the heavy security auditing and infrastructure scaling required to bring this blueprint to life securely on the Aztec Network.
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
