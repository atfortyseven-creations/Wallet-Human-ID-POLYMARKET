'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'overview', label: '1. Regulatory Overview' },
  { id: 'global-framework', label: '2. Global Compliance Framework' },
  { id: 'aml', label: '3. AML & KYC Standards' },
  { id: 'data-protection', label: '4. Data Protection Compliance' },
  { id: 'sanctions', label: '5. Sanctions Screening' },
  { id: 'securities', label: '6. Securities Laws' },
  { id: 'audits', label: '7. Audits & Certifications' },
  { id: 'consumer', label: '8. Consumer Protection' },
  { id: 'reporting', label: '9. Regulatory Reporting' },
  { id: 'contact', label: '10. Compliance Contact' },
];

export default function RegulatoryCompliancePage() {
  return (
    <LegalDocLayout
      title="Regulatory Compliance"
      subtitle="An overview of the comprehensive regulatory and legal compliance framework governing the Whale Alert Network platform globally."
      lastUpdated="May 25, 2026"
      category="Legal & Security"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="overview">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. Regulatory Overview
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Whale Alert Network is built with regulatory compliance as a core architectural consideration, not merely a legal obligation. In the rapidly evolving landscape of decentralised finance, we proactively engage with regulatory developments across all major jurisdictions to ensure our platform and services consistently meet the highest standards of legal and ethical conduct.
            </p>
            <p>
              Our Compliance team monitors regulatory changes across the EU, UK, USA, and international frameworks on a continuous basis. We maintain direct dialogue with regulatory bodies and consult with leading specialist legal counsel to ensure we remain ahead of developments in digital assets, cryptographic identity, and data protection law.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section id="global-framework">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Global Compliance Framework
          </h2>
          <div className="space-y-3 text-[15px] leading-[1.75]">
            {[
              {
                label: 'EU Markets in Crypto-Assets (MiCA)',
                text: 'We actively monitor and align our operations with Regulation (EU) 2023/1114, ensuring our token-related activities, stablecoin interactions, and crypto-asset service offerings meet MiCA requirements.',
              },
              {
                label: 'EU AI Act',
                text: 'Any AI-powered features within our platform are built in compliance with EU Regulation 2024/1689 on Artificial Intelligence, including transparency requirements and human oversight obligations.',
              },
              {
                label: 'UK Financial Conduct Authority (FCA)',
                text: 'We monitor FCA guidance on cryptoasset promotions and financial services regulations applicable to blockchain analytics and trading information services.',
              },
              {
                label: 'FATF Recommendations',
                text: 'We align with the Financial Action Task Force (FATF) recommendations on virtual assets and virtual asset service providers (VASPs), including the "Travel Rule" for fund transfer information.',
              },
              {
                label: 'US FinCEN & SEC',
                text: 'Our US operations are monitored to ensure compliance with FinCEN requirements and SEC guidance applicable to cryptocurrency exchanges, analytics platforms, and information service providers.',
              },
            ].map(({ label, text }) => (
              <div key={label} className="border border-black/8 rounded-xl p-5">
                <h3 className="font-semibold text-black text-[14px] mb-2">{label}</h3>
                <p className="text-[14px] text-black/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 */}
        <section id="aml">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. Anti-Money Laundering (AML) and Know Your Customer (KYC) Standards
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In compliance with the European Union Anti-Money Laundering Directives (AMLD6) and equivalent international standards, Whale Alert Network maintains rigorous AML and KYC policies.
            </p>
            <p>
              Where applicable to specific services, we implement identity verification through government-issued documentation review, biometric liveness checks, and real-time screening against global PEP (Politically Exposed Persons), Adverse Media, and sanctions databases.
            </p>
            <p>
              Our core identity verification leverages zero-knowledge cryptographic proofs designed to confirm user uniqueness without storing biometric templates or documents on our servers. This innovative approach balances stringent AML compliance with our foundational privacy-first principles.
            </p>
            <ul className="space-y-2 pl-5 mt-2">
              {[
                'Continuous transaction monitoring to detect suspicious activity patterns.',
                'Automated reporting to financial intelligence units (FIUs) as required by applicable law.',
                'Regular training of all relevant personnel on AML obligations and red-flag indicators.',
                'Annual review and update of our AML/KYC policies by qualified legal counsel.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4 */}
        <section id="data-protection">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. Data Protection Compliance
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Our data protection practices are built upon full compliance with the following frameworks:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {[
                ['GDPR (EU) 2016/679', 'Full compliance with all data subject rights, lawful basis requirements, and data processing standards.'],
                ['LOPDGDD (Spain)', 'Compliance with the Spanish Organic Law 3/2018 on Data Protection and Digital Rights.'],
                ['UK GDPR', 'Equivalent standards applied for users based in the United Kingdom.'],
                ['CCPA (California)', 'Compliance with California Consumer Privacy Act opt-out and access rights.'],
              ].map(([label, desc]) => (
                <div key={label as string} className="border border-black/8 rounded-xl p-4">
                  <h4 className="font-semibold text-black text-[14px] mb-1">{label}</h4>
                  <p className="text-[13px] text-black/55 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p>
              For detailed information on how we process your personal data, please refer to our{' '}
              <a href="/legal/privacy" className="text-black underline underline-offset-2 hover:text-black/60 transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>

        {/* 5 */}
        <section id="sanctions">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. Sanctions Screening and Restricted Jurisdictions
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Whale Alert Network maintains a real-time sanctions screening programme covering all major international sanction lists, including:
            </p>
            <ul className="space-y-2 pl-5">
              {[
                'EU Consolidated Sanctions List',
                'OFAC Specially Designated Nationals (SDN) List — United States',
                'HM Treasury UK Sanctions List',
                'UN Security Council Consolidated Sanctions List',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Access to our Services is blocked or restricted in jurisdictions subject to comprehensive international trade sanctions, or where applicable local law prohibits the provision of such services. These restrictions are enforced automatically at the application layer.
            </p>
          </div>
        </section>

        {/* 6 */}
        <section id="securities">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. Securities Laws and Token Classification
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We are acutely aware of the ongoing global regulatory discourse regarding the classification of digital assets as securities under applicable laws. Whale Alert Network does not issue, market, or facilitate the trading of tokens classified as securities under any applicable jurisdiction.
            </p>
            <p>
              Our blockchain analytics services provide informational data derived from public ledgers. We do not constitute a regulated investment firm, broker-dealer, or collective investment undertaking. Our services do not constitute investment advice.
            </p>
          </div>
        </section>

        {/* 7 */}
        <section id="audits">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            7. Audits and Certifications
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We subject our infrastructure and operations to rigorous annual third-party audits to verify the effectiveness of our compliance and security controls.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-2">
              {[
                { label: 'SOC 2 Type II', desc: 'Annual audit of security, availability, and confidentiality controls.' },
                { label: 'ISO 27001', desc: 'Information Security Management System certification.' },
                { label: 'Smart Contract Audits', desc: 'Pre-deployment audits by tier-1 blockchain security firms.' },
                { label: 'Noir Circuit Audits', desc: 'Independent security review of our custom Aztec Noir zero-knowledge circuits prior to testnet and mainnet deployment.' },
              ].map(({ label, desc }) => (
                <div key={label} className="border border-black/10 rounded-xl p-5 text-center">
                  <p className="font-black text-black text-[15px] mb-2">{label}</p>
                  <p className="text-[13px] text-black/50 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8 */}
        <section id="consumer">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            8. Consumer Protection Commitments
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We uphold the highest standards of consumer protection in all our interactions. Our commitments include:
            </p>
            <ul className="space-y-2 pl-5">
              {[
                'Clear, fair, and non-misleading disclosure of all service features, limitations, and associated risks.',
                'Transparent, accessible complaints resolution procedures with clear timelines and escalation paths.',
                'Strict prohibition on dark patterns, manipulative design, or coercive commercial practices.',
                'Full accessibility of all users\' rights under applicable consumer protection laws.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9 */}
        <section id="reporting">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            9. Regulatory Reporting Obligations
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Where mandated by applicable law, Whale Alert Network fulfils its legal reporting obligations to relevant financial intelligence units and regulatory authorities. Our reporting procedures are designed to be timely, accurate, and fully auditable.
            </p>
            <p>
              We cooperate fully with lawful court orders, regulatory investigations, and legally binding information requests from competent authorities, while rigorously challenging any requests that we believe to be disproportionate or unlawful.
            </p>
          </div>
        </section>

        {/* 10 */}
        <section id="contact">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            10. Compliance Contact
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              For all compliance, regulatory, and legal enquiries, please contact our Compliance team directly. We are committed to responding to all enquiries in a timely and substantive manner.
            </p>
            <div className="border border-black/10 rounded-xl p-5 sm:p-6 space-y-4 mt-2">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Email</p>
                <a href="mailto:humanityledger@gmail.com" className="text-black text-[15px] underline underline-offset-2 hover:text-black/60 transition-colors break-all">
                  humanityledger@gmail.com
                </a>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Telegram</p>
                <a href="https://t.me/humanityledger" target="_blank" rel="noopener noreferrer" className="text-black text-[15px] underline underline-offset-2 hover:text-black/60 transition-colors">
                  @humanityledger
                </a>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">LinkedIn — Founder</p>
                <a href="https://www.linkedin.com/in/stefan-antonio-cirisanu-40116140b/" target="_blank" rel="noopener noreferrer" className="text-black text-[14px] underline underline-offset-2 hover:text-black/60 transition-colors break-all">
                  Stefan Antonio Cirisanu
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
