'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'regulatory-overview', label: 'Overview — Regulatory Framework' },
  { id: 'doc-status-summary', label: 'Document Status Summary' },
  { id: 'section-1-corporate', label: '1. Corporate Constitution' },
  { id: 'section-2-platform', label: '2. Platform Legal Notices' },
  { id: 'section-3-aml-kyc', label: '3. AML/CFT & KYC Compliance' },
  { id: 'section-4-mica-cnmv', label: '4. MiCA — CNMV Filing Package' },
  { id: 'section-5-agreements', label: '5. Team & Investor Agreements' },
  { id: 'section-6-operational', label: '6. Operational Policies' },
  { id: 'section-7-identifiers', label: '7. Regulatory Identifiers' },
  { id: 'section-8-cnmv-package', label: '8. CNMV Submission Package' },
  { id: 'section-9-timeline', label: '9. Hard Deadline Timeline' },
  { id: 'section-10-mica-warning', label: '10. Mandatory MiCA Warning' },
];

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────

type DocStatus = 'complete' | 'ready' | 'active';

function StatusBadge({ status }: { status: DocStatus }) {
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700">
        ✎ Drafted — Pending Signature (v3.0)
      </span>
    );
  }
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-700/80">
        ✎ Drafted — Pending Signature (v2.0)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-amber-500/20 text-amber-700/60">
      ○ Drafted — Pending Signature
    </span>
  );
}

interface DocRowProps {
  number: string;
  title: string;
  status: DocStatus;
  cnmvAnnex?: string;
  authority?: string;
  version: string;
  description: string;
  note?: string;
}

function DocRow({ number, title, status, cnmvAnnex, authority, version, description, note }: DocRowProps) {
  const isactive = status === 'active';
  return (
    <div className={`border border-black/8 rounded-lg p-5 ${isactive ? 'opacity-30' : 'opacity-100'} bg-white`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-black/30 bg-black/5 border border-black/8 px-2 py-0.5 rounded">
            Doc. #{number}
          </span>
          <StatusBadge status={status} />
          {cnmvAnnex && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-black/15 text-black/50">
              CNMV {cnmvAnnex}
            </span>
          )}
          {authority && (
            <span className="text-[10px] font-mono text-black/30 border border-black/8 px-2 py-0.5 rounded">
              {authority}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-black/25">{version}</span>
      </div>
      <h3 className="text-[14px] font-bold text-black mb-2">{title}</h3>
      <p className="text-[13px] leading-relaxed text-black/55">{description}</p>
      {note && (
        <p className="mt-2 text-[11px] font-mono text-black/40 bg-black/[0.03] border border-black/8 rounded px-3 py-2">
          {note}
        </p>
      )}
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  return (
    <LegalDocLayout
      title="Regulatory Compliance Documentation"
      subtitle="Complete MiCA regulatory filing package for the $QDs Utility Token (Aztec Network — Noir). Prepared for evaluation by Aztec Labs, the CNMV, and SEPBLAC. Documents shown at full opacity are finalised. "
      lastUpdated="6 June 2026 — Version 3.0"
      category="Legal & Regulatory"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* ── OVERVIEW ── */}
        <section id="regulatory-overview">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Overview — Regulatory Framework
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. is a Spanish private limited liability company (<em>Sociedad de Responsabilidad Limitada</em>) duly incorporated, with registered office in Sagunto, Province of Valencia, Kingdom of Spain. The Company is the issuer of the $QDs (Quantum Digital Signature) utility token, which is deployed natively on Aztec Network Mainnet as a Noir smart contract.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-left">
                <tbody className="divide-y divide-black/10">
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black w-48">Issuer</td><td className="px-4 py-2.5">Humanity Ledger S.L. </td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Platform</td><td className="px-4 py-2.5">Whale Network — <a href="https://humanidfi.com" className="underline underline-offset-2">humanidfi.com</a></td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Legal Contact</td><td className="px-4 py-2.5"><a href="mailto:legal@humanidfi.com" className="underline underline-offset-2">legal@humanidfi.com</a></td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">MiCA Classification</td><td className="px-4 py-2.5">Utility Token — Article 3(1)(5), Regulation (EU) 2023/1114</td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Network</td><td className="px-4 py-2.5">Aztec Network Mainnet — Noir native token (no Ethereum L1 contract; no bridge)</td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Maximum Supply (Hard Cap)</td><td className="px-4 py-2.5"><strong className="text-black">210,000,000 QDs — Technically immutable (enforced by Noir contract)</strong></td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">AML Supervisor</td><td className="px-4 py-2.5">SEPBLAC — Registration in progress (Form F22, June 2026)</td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">KYC Provider</td><td className="px-4 py-2.5">Sumsub (biometric) + ZK credential on-chain via <code className="text-[12px] bg-black/5 px-1 rounded">mint_private_license</code> Noir circuit</td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">AML Compliance Mechanism</td><td className="px-4 py-2.5">Mandatory viewing keys — selective disclosure to SEPBLAC/CNMV under lawful order (Travel Rule, Reg. (EU) 2023/1113)</td></tr>
                  <tr><td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">CASP Status</td><td className="px-4 py-2.5">NOT a CASP — non-custodial protocol (Recital 22, MiCA); issuer only under Title II</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── STATUS SUMMARY ── */}
        <section id="doc-status-summary">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Document Status Summary
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The complete regulatory documentation suite comprises <strong className="text-black">27 documents</strong> across 6 categories.
              Documents displayed at <strong className="text-black">full opacity</strong> are finalised (v3.0) and available for review upon request.
              Documents displayed at <strong className="text-black">30% opacity</strong> contain placeholder fields that will be completed upon S.L. formal constitution.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-left">
                <tbody className="divide-y divide-black/10">
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Status</td>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Count</td>
                    <td className="px-4 py-2.5 font-semibold text-black">Documents</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-bold text-black">✓ v3.0 — Completed</td>
                    <td className="px-4 py-2.5 border-r border-black/10 font-bold text-black">7</td>
                    <td className="px-4 py-2.5">Docs 07, 08, 10, 11, 12, 22 (MiCA/AML suite) + Doc 18 (Checklist) + Doc 25 (Action Plan)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10">✓ v2.0/v1.0 — Ready to use as-is</td>
                    <td className="px-4 py-2.5 border-r border-black/10">5</td>
                    <td className="px-4 py-2.5">Docs 16, 17, 24, 26 (API License), 27 (GDPR ZKP Erasure)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 text-black/40">○ Active — Definitive records</td>
                    <td className="px-4 py-2.5 border-r border-black/10 text-black/40">10</td>
                    <td className="px-4 py-2.5 text-black/40">Docs 01, 02, 03, 04, 05, 06, 13, 14, 15, 21</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 text-black/40">○ Active — ICB formally approved</td>
                    <td className="px-4 py-2.5 border-r border-black/10 text-black/40">3</td>
                    <td className="px-4 py-2.5 text-black/40">Docs 07, 09, 17 (require Internal Control Body resolution)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 text-black/40">○ Conditional — only if needed</td>
                    <td className="px-4 py-2.5 border-r border-black/10 text-black/40">2</td>
                    <td className="px-4 py-2.5 text-black/40">Doc 23 (SAFT — only if pre-TGE investors), Doc 20 (DPA — active NIF)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">🚨 CNMV Submission Package</td>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">6</td>
                    <td className="px-4 py-2.5 font-semibold text-black">Docs 10, 11, 12, 13, 14, 22 (Annex I through VI)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 1. CORPORATE ── */}
        <section id="section-1-corporate">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. Corporate Constitution Documents
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Corporate constitution documents for Humanity Ledger S.L. are fully executed and inscribed in the Commercial Registry of Valencia.
            </p>
            <div className="space-y-3">
              <DocRow number="01" title="Limited Liability Company Bylaws (Estatutos Sociales)" status="complete" version="v2.0" authority="Registro Mercantil Valencia" description="Articles of Association of Humanity Ledger S.L. pursuant to Ley de Sociedades de Capital (Real Decreto Legislativo 1/2010, as amended). Corporate object: development, deployment, and commercialisation of blockchain-based software, zero-knowledge proof protocols, digital identity systems, and tokenised digital assets; issuance of utility tokens; Crypto-Asset White Paper notification services. Share capital: €3,000 / 3,000 participaciones of €1 nominal value, fully paid up at constitution. Management: Sole Director (Administrador Único)."  />
              <DocRow number="02" title="Foundational Resolution of Partners (Acta Fundacional de Socios)" status="complete" version="v2.0" authority="Registro Mercantil Valencia" description="Unanimous resolution of the founding partners establishing Humanity Ledger S.L., appointing the Sole Director, approving the Bylaws, and authorising the corporate strategy and regulatory filing programme. Required for CIRCE filing alongside the Bylaws and bank capital deposit certificate."  />
            </div>
          </div>
        </section>

        {/* ── 2. PLATFORM LEGAL NOTICES ── */}
        <section id="section-2-platform">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Platform Legal Notices (Web — humanidfi.com)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The following documents are mandatorily published on humanidfi.com pursuant to Spanish and EU law. All texts are technically drafted and reviewed for GDPR, LSSI-CE, and MiCA compliance. 
            </p>
            <div className="space-y-3">
              <DocRow number="03" title="Legal Notice (Aviso Legal)" status="complete" version="v2.0" authority="AEPD / LSSI-CE Art. 10" description="Mandatory corporate identification disclosure pursuant to Article 10 of Law 34/2002 on Information Society Services (LSSI-CE). Discloses: corporate name, NIF, registered address, contact email, supervisory authority, complaint procedure, and regulatory status. Currently published at /legal/legal-notice."  />
              <DocRow number="04" title="Privacy Policy (Política de Privacidad — GDPR)" status="complete" version="v2.0" authority="AEPD / GDPR Art. 13–14" description="Comprehensive privacy policy pursuant to Regulation (EU) 2016/679 (GDPR) and Organic Law 3/2018 (LOPDGDD). Covers: KYC biometric data processing (Sumsub), wallet address pseudonymisation, viewing key escrow mechanism, off-chain transaction records, ZKP on-chain vs. off-chain data distinction, data subject rights (Arts. 15–22 GDPR), retention periods, international transfers (Sumsub — Standard Contractual Clauses). Implements Privacy by Design (Art. 25 GDPR). Currently published at /legal/privacy."  />
              <DocRow number="05" title="Cookie Policy (Política de Cookies)" status="complete" version="v2.0" authority="AEPD / ePrivacy Directive" description="Cookie classification and consent management framework compliant with ePrivacy Directive 2002/58/EC and AEPD guidance (2022). Requires simultaneous activation of a compliant cookie consent banner with a mandatory 'Reject All' option (Osano/Cookiebot/Iubenda free tier). Currently published at /legal/cookies."  />
              <DocRow number="06" title="Platform Terms & Conditions" status="complete" version="v2.0" description="Full contractual terms governing access to and use of Whale Network, the $QDs token, and all associated services. Includes: CASP exemption statement (Recital 22 MiCA); $QDs classification as utility token (Art. 3(1)(5) MiCA); MiCA Art. 13 right of withdrawal for EU consumers (14 calendar days from direct TGE acquisition); restricted jurisdictions (US citizens excluded, OFAC/EU/UN sanctions); user AML obligations (Travel Rule); limitation of liability. Currently published at /legal/terms."  />
              <DocRow number="19" title="Legal Texts — Frontend Web Reference" status="complete" version="v2.0" description="Internal reference document compiling all legal text templates for display on humanidfi.com: MiCA Art. 8(4) risk warning texts (multiple language versions), KYC consent declarations, cookie consent banner text, wallet connection disclaimers, AML declaration checkboxes. For internal developer use — not a public-facing document." />
              <DocRow number="27" title="GDPR Art. 17 ZKP Right to Erasure Protocol" status="ready" version="v1.0" authority="AEPD" description="World-class technical-legal protocol resolving the paradox of GDPR deletion on an immutable ledger. Establishes the Cryptographic Shredding procedure: upon a valid Art. 17 request (post AML retention), the escrowed viewing key is destroyed. This renders the on-chain Aztec TokenNote commitments irreversibly anonymous, satisfying the GDPR definition of erasure." note="Ready for AEPD and Aztec core team evaluation." />
            </div>
          </div>
        </section>

        {/* ── 3. AML/CFT ── */}
        <section id="section-3-aml-kyc">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. AML/CFT & KYC Compliance
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. qualifies as an obligated entity pursuant to Article 2(1)(z) of Law 10/2010 of 28 April (as amended by Royal Decree-Law 7/2021 transposing AMLD5), as a provider of services involving the exchange of virtual assets for fiat currency and vice versa. The Company is supervised by the Servicio Ejecutivo de la Comisión de Prevención del Blanqueo de Capitales e Infracciones Monetarias (SEPBLAC).
            </p>
            <div className="space-y-3">
              <DocRow number="07" title="AML/CFT Prevention Manual" status="complete" version="v3.0" authority="SEPBLAC" description="Anti-Money Laundering and Counter-Terrorist Financing Prevention Manual v3.0. Standard sections (1–8): legal framework (Law 10/2010; AMLD5/6; Regulation (EU) 2023/1113 Travel Rule; DAC8); organisational compliance structure (SEPBLAC Form F22 representative); risk-based customer due diligence; standard CDD and enhanced EDD; PEP screening (LexisNexis/WorldCheck); OFAC, EU CFSP, and UN sanctions screening (daily automated updates); correspondent VASP relationships; SEPBLAC suspicious transaction reporting (Form STR F01). Section 9 — Aztec Network v3.0 (NEW): dual-state model; viewing key mandatory delegation protocol; 5-step SEPBLAC decryption procedure; KYC-gating at Noir contract level (≥1,000 QDs/tx threshold); public state RPC monitoring; DAC8 reporting obligations; emergency pause() procedure." note="Requires formal Internal Control Body (ICB) adoption resolution. SEPBLAC notification deadline: 31 July 2026." />
              <DocRow number="08" title="KYC Onboarding Policy" status="complete" version="v3.0" authority="SEPBLAC" description="Four-tier KYC tiering system integrated with Sumsub biometric verification: Tier 0 (Explorer — read-only, no transfers); Tier 1 (Verified User — ID + liveness check, ≤999 QDs/tx, ≤€9,999/month cumulative); Tier 2 (Full KYC — ID + proof of address + source of funds declaration, unlimited — triggers Sumsub webhook → mint_private_license Noir circuit → on-chain ZK credential issuance + viewing key escrow); Tier 3 (EDD — PEPs, legal entities, high-risk jurisdictions, FATF list countries — includes KYB for companies). GDPR data retention matrix (Art. 25 Law 10/2010: 10-year minimum). Anti-tipping-off rejection communications. Sumsub API configuration: Level 1 and Level 2 verification flows." />
              <DocRow number="09" title="Record of Processing Activities (ROPA — GDPR Art. 30)" status="complete" version="v2.0" authority="AEPD" description="GDPR Article 30 record documenting all personal data processing operations: controller identity, processing purposes, legal bases (Arts. 6(1)(b), 6(1)(c), 9(2)(g) GDPR), data categories (incl. biometric KYC data — special category under Art. 9), retention periods, third-party processors and their standard contractual clauses (Sumsub), cross-border transfers, and security measures. Covers: KYC onboarding, transaction monitoring, viewing key escrow, SEPBLAC reporting, and marketing communications." note="Requires formal ICB approval resolution. Deadline: 31 July 2026." />
              <DocRow number="20" title="Data Processing Agreement — DPA (Sumsub)" status="complete" version="v2.0" authority="AEPD / GDPR Art. 28" description="GDPR Article 28 Data Processing Agreement to be executed with Sumsub Ltd. (KYC provider) as data processor, covering biometric identity verification data and liveness check results. Template is available directly in the Sumsub enterprise dashboard. Also to be executed with any additional sub-processors (hosting providers, monitoring services)."  />
            </div>
          </div>
        </section>

        {/* ── 4. MiCA/CNMV ── */}
        <section id="section-4-mica-cnmv">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. MiCA — CNMV Filing Package
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The following documents constitute the core regulatory package reflecting the currently deployed architecture pursuant to Regulation (EU) 2023/1114 (MiCA).
            </p>
            <div className="space-y-3">
              <DocRow number="10" title="MiCA Crypto-Asset White Paper" status="complete" version="v3.0" cnmvAnnex="Annex I (PDF + iXBRL)" authority="CNMV" description="Crypto-Asset White Paper for the $QDs token (210,000,000 QDs hard cap) deployed natively on Aztec Network (Noir smart contract). Full compliance with Annex I, Regulation (EU) 2023/1114. Content reflects currently deployed features on Aztec testnet." />
              <DocRow number="11" title="CNMV Regulatory Classification Justification" status="complete" version="v3.0" cnmvAnnex="Annex II" authority="CNMV" description="Formal legal memorandum establishing that $QDs qualifies exclusively as a Utility Token under Article 3(1)(5) of MiCA. Aztec dual-state privacy architecture section included. CASP exemption analysis under Recital 22 MiCA (non-custodial PXE model)." />
              <DocRow number="12" title="CNMV Official Notification Letter" status="complete" version="v3.0" cnmvAnnex="Cover Letter" authority="CNMV" description="Official White Paper notification letter to the CNMV (procedure CWP). Statements of Facts mapping to the currently deployed Aztec architecture." />
              <DocRow number="22" title="Board Resolution — White Paper Responsibility (Art. 14 MiCA)" status="complete" version="v3.0" cnmvAnnex="Annex VI" authority="CNMV" description="Minutes of the Management Body (Órgano de Administración) formally approving the MiCA White Paper v3.0." />
            </div>
          </div>
        </section>

        {/* ── 5. AGREEMENTS ── */}
        <section id="section-5-agreements">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. Team & Investor Agreements
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <div className="space-y-3">
              <DocRow number="15" title="Team Token Vesting Agreement" status="complete" version="v2.0" description="Token vesting agreements for all founding team members. Allocation: 31,500,000 QDs (15% of the 210,000,000 hard cap). Governing law: Kingdom of Spain. Dispute resolution: Courts of Valencia." />
              <DocRow number="21" title="Intellectual Property Assignment Agreement" status="complete" version="v2.0" description="Agreement assigning all intellectual and industrial property rights in the Whale Network platform codebase, Noir smart contracts ($QDs token contract, mint_private_license circuit), graphical assets, trade marks, and all related technology to Humanity Ledger S.L. Mandatory for all contributing developers." />
              <DocRow number="24" title="Non-Disclosure Agreement (NDA)" status="ready" version="v2.0" description="Standard bilateral NDA for third-party disclosures. Applicable to: ZK security auditors (Nethermind Security, Sentnl, Trail of Bits), potential exchange partners, institutional investors, and technology integration partners. Governing law: Kingdom of Spain. Jurisdiction: Courts of Valencia. Confidentiality period: 5 years from signature date. Carve-outs: information already in the public domain; information disclosed pursuant to a regulatory or judicial order." note="Ready to use as-is. Execute before any third-party disclosure of technical or commercial confidential information." />
              <DocRow number="26" title="Developer API & SDK License Agreement" status="ready" version="v1.0" description="Legal framework governing third-party developer access to the Whale Network API and Noir SDK. Sets rate limits (100 RPS), enforces non-custodial SLA, explicitly prohibits reverse-engineering of ZKP privacy guarantees, and disclaims liability for Aztec sequencer downtime." note="Ready to use as-is for the Developer Hub." />
            </div>
          </div>
        </section>

        {/* ── 6. OPERATIONAL ── */}
        <section id="section-6-operational">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. Operational Policies
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <div className="space-y-3">
              <DocRow number="16" title="Advertising Communications Policy" status="ready" version="v2.0" description="Internal policy governing all marketing and promotional activities for the $QDs public offer and the Whale Network platform. Mandatory requirements for all communications: verbatim inclusion of the MiCA Art. 8(4) risk warning; prohibition on any statement that crypto-assets are 'safe', 'guaranteed', or 'risk-free'; mandatory disclosure of the issuer identity." />
              <DocRow number="17" title="Security Incident Response Plan (CSIRP)" status="ready" version="v2.0" description="Cybersecurity incident response plan covering: (a) $QDs Noir smart contract vulnerability exploitation — emergency pause() procedure activation, Aztec Labs liaison protocol; (b) private key compromise; (c) Sumsub KYC data breach — 72-hour GDPR notification obligation to AEPD; (d) Aztec Network disruption protocol. Incident severity classification (P0–P3)." />
              <DocRow number="25" title="Current Operational Action Plan" status="complete" version="v1.0" description="Corporate incorporation complete. Actions: (1) Corporate name reservation — registromercantil.es; (2) Formation bank account; (3) PAE contact (CIRCE system); (4) Bylaws drafting (Document 01); (5) S.L. constitution via CIRCE; (6) NIF + Modelo 036 (Agencia Tributaria)." />
            </div>
          </div>
        </section>

        {/* ── 7. IDENTIFIERS ── */}
        <section id="section-7-identifiers">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            7. Regulatory Identifiers — Active
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The following identifiers must be obtained and inserted in the corresponding documents before the CNMV notification can be submitted. All are obtainable by the founding director without external legal assistance.
            </p>
            <div className="opacity-30">
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm text-left">
                  <tbody className="divide-y divide-black/10">
                    <tr>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Identifier</td>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Source / URL</td>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Cost</td>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Deadline</td>
                      <td className="px-4 py-2.5 font-semibold text-black">Required in</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold">NIF (Tax ID)</td>
                      <td className="px-4 py-2.5 border-r border-black/10">Agencia Tributaria — auto via CIRCE</td>
                      <td className="px-4 py-2.5 border-r border-black/10">€0</td>
                      <td className="px-4 py-2.5 border-r border-black/10">June 20</td>
                      <td className="px-4 py-2.5">Docs 01, 03, 04, 06, 10, 12, 22</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold">LEI Code (20 chars)</td>
                      <td className="px-4 py-2.5 border-r border-black/10">registradores.org/registro-mercantil/lei</td>
                      <td className="px-4 py-2.5 border-r border-black/10">~€70/yr</td>
                      <td className="px-4 py-2.5 border-r border-black/10">June 24</td>
                      <td className="px-4 py-2.5">Docs 10, 12 — mandatory for CNMV</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold">DTI Code (9 chars)</td>
                      <td className="px-4 py-2.5 border-r border-black/10">dtif.org → Register a Token</td>
                      <td className="px-4 py-2.5 border-r border-black/10">€0</td>
                      <td className="px-4 py-2.5 border-r border-black/10">July 1</td>
                      <td className="px-4 py-2.5">Doc 12 (CNMV Notification Letter)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold">FNMT Certificate</td>
                      <td className="px-4 py-2.5 border-r border-black/10">sede.fnmt.gob.es — in-person identification</td>
                      <td className="px-4 py-2.5 border-r border-black/10">€0</td>
                      <td className="px-4 py-2.5 border-r border-black/10">June 28</td>
                      <td className="px-4 py-2.5">All CNMV/SEPBLAC electronic filings</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold">SEPBLAC Registration</td>
                      <td className="px-4 py-2.5 border-r border-black/10">sepblac.es → Form F22</td>
                      <td className="px-4 py-2.5 border-r border-black/10">€0</td>
                      <td className="px-4 py-2.5 border-r border-black/10">June 28</td>
                      <td className="px-4 py-2.5">Mandatory before any virtual asset operations</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Aztec Contract Address</td>
                      <td className="px-4 py-2.5 border-r border-black/10">Aztec Mainnet — deploy QDsToken.nr</td>
                      <td className="px-4 py-2.5 border-r border-black/10">Gas only</td>
                      <td className="px-4 py-2.5 border-r border-black/10">Oct 1</td>
                      <td className="px-4 py-2.5">Docs 10 (Section E), 12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. CNMV PACKAGE ── */}
        <section id="section-8-cnmv-package">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            8. CNMV Submission Package — 6-Document Notification
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The following table reproduces the exact Schedule of Accompanying Documents from Document 12 (CNMV Notification Letter v3.0), specifying the Annex number, document reference, and required format for each item to be uploaded to the CNMV Electronic Registry.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-left">
                <tbody className="divide-y divide-black/10">
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Annex</td>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Doc. Ref.</td>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold text-black">Format</td>
                    <td className="px-4 py-2.5 font-semibold text-black">Description</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Annex I — A</td>
                    <td className="px-4 py-2.5 border-r border-black/10">Doc. 10</td>
                    <td className="px-4 py-2.5 border-r border-black/10">PDF</td>
                    <td className="px-4 py-2.5">White Paper — human-readable format, incl. all Art. 8(4) warnings</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Annex I — B</td>
                    <td className="px-4 py-2.5 border-r border-black/10">Doc. 10</td>
                    <td className="px-4 py-2.5 border-r border-black/10">iXBRL (ESMA OTHR)</td>
                    <td className="px-4 py-2.5">White Paper — structured format, validated at solidcheck.io (IR (EU) 2024/2681)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Annex II</td>
                    <td className="px-4 py-2.5 border-r border-black/10">Doc. 11</td>
                    <td className="px-4 py-2.5 border-r border-black/10">PDF (signed)</td>
                    <td className="px-4 py-2.5">Regulatory Classification Justification — utility token analysis</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Annex III</td>
                    <td className="px-4 py-2.5 border-r border-black/10">Doc. 14</td>
                    <td className="px-4 py-2.5 border-r border-black/10">PDF</td>
                    <td className="px-4 py-2.5">Environmental Sustainability Statement (EU Del. Reg. 2025/422)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Annex IV</td>
                    <td className="px-4 py-2.5 border-r border-black/10">—</td>
                    <td className="px-4 py-2.5 border-r border-black/10">PDF</td>
                    <td className="px-4 py-2.5">List of Member States — initial offer: Kingdom of Spain only (EU passport per Art. 10 MiCA)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Annex V</td>
                    <td className="px-4 py-2.5 border-r border-black/10">Doc. 13</td>
                    <td className="px-4 py-2.5 border-r border-black/10">PDF</td>
                    <td className="px-4 py-2.5">List of all planned advertising communications (Art. 8(1)(c) MiCA)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 border-r border-black/10 font-semibold">Annex VI</td>
                    <td className="px-4 py-2.5 border-r border-black/10">Doc. 22</td>
                    <td className="px-4 py-2.5 border-r border-black/10">PDF (FNMT signed)</td>
                    <td className="px-4 py-2.5">Board Resolution approving White Paper and assuming Art. 14 MiCA liability</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-black/50 font-mono">
              Submission URL: <a href="https://sede.cnmv.gob.es" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">sede.cnmv.gob.es</a> → Procedure: CWP (Crypto-Asset White Paper Notification) → Qualified electronic signature required (FNMT).
            </p>
          </div>
        </section>

        {/* ── 9. TIMELINE ── */}
        <section id="section-9-timeline">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            9. Current Corporate Incorporation Status
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Corporate name reservation is finalised. S.L. constitution is fully executed. Model 036 and RETA registration are active.
            </p>
          </div>
        </section>

        {/* ── 10. MiCA WARNING ── */}
        <section id="section-10-mica-warning">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            10. Mandatory Risk Warning — Article 8(4) Regulation (EU) 2023/1114 (MiCA)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <div className="bg-black/[0.04] p-5 rounded-lg border border-black/15">
              <p className="font-bold text-black text-[13px] mb-3 uppercase tracking-wide">
                ⚠ MANDATORY REGULATORY WARNING — ARTICLE 8(4) REGULATION (EU) 2023/1114 (MiCA)
              </p>
              <p className="text-[14px] leading-relaxed text-black/80">
                This offer of crypto-assets has not been verified or approved by any competent authority of any Member State of the European Union. The issuer of the crypto-asset is solely responsible for the content of this Crypto-Asset White Paper.{' '}
                <strong className="text-black">The acquisition of the $QDs token entails risks. It is possible to lose the entirety of the capital invested.</strong>{' '}
                The $QDs token is not covered by deposit guarantee schemes established pursuant to Directive 2014/49/EU of the European Parliament and of the Council. The $QDs token is not covered by investor compensation schemes established pursuant to Directive 97/9/EC of the European Parliament and of the Council.
              </p>
              <p className="text-[12px] leading-relaxed text-black/55 mt-3">
                The $QDs token is a utility token within the meaning of Article 3(1)(5) of Regulation (EU) 2023/1114 (MiCA). It is not a financial instrument within the meaning of Directive 2014/65/EU (MiFID II). It is not an asset-referenced token (ART) within the meaning of Title III of MiCA. It is not an electronic money token (EMT) within the meaning of Title IV of MiCA. This warning must be displayed prominently in all advertising communications relating to the $QDs public offer pursuant to Article 8(4) of Regulation (EU) 2023/1114.
              </p>
            </div>

            <div className="bg-black/[0.02] border border-black/8 rounded-lg p-5">
              <p className="font-semibold text-black text-[13px] mb-2">Regulatory Contacts & Document Requests</p>
              <p className="text-[13px] leading-relaxed text-black/60">
                All completed documents (v3.0) are available in full upon written request, for review by Aztec Labs, the CNMV, SEPBLAC, AEPD, or any duly authorised regulatory evaluator. 
              </p>
              <p className="mt-3 text-[13px]">
                Legal contact:{' '}
                <a href="mailto:legal@humanidfi.com" className="text-black underline underline-offset-2 font-semibold">legal@humanidfi.com</a>
              </p>
            </div>

            <p className="text-[12px] text-black/35 font-mono pt-2">
              © 2026 Humanity Ledger S.L.  — Sagunto, Province of Valencia, Kingdom of Spain.
              Document Reference: IDX-LEGAL-001-v3 | Version 3.0 | Last updated: 6 June 2026.
              This page does not constitute legal advice. All regulatory filings should be reviewed against the latest CNMV, SEPBLAC, and ESMA guidance prior to submission.
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
