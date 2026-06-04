'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'introduction', label: '1. Introduction & Scope' },
  { id: 'controller', label: '2. Data Controller' },
  { id: 'data-collected', label: '3. Data We Collect' },
  { id: 'lawful-basis', label: '4. Lawful Basis for Processing' },
  { id: 'data-sharing', label: '5. Disclosures & Third-Party Sharing' },
  { id: 'retention', label: '6. Data Retention & Deletion' },
  { id: 'rights', label: '7. Your Legal Rights' },
  { id: 'cookies', label: '8. Cookies & Tracking' },
  { id: 'transfers', label: '9. International Data Transfers' },
  { id: 'automated', label: '10. Automated Decision-Making' },
  { id: 'third-party-links', label: '11. Third-Party Links' },
  { id: 'changes', label: '12. Changes to This Policy' },
  { id: 'contact', label: '13. Contact Information' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocLayout
      title="Privacy Policy"
      subtitle="This policy explains how Whale Alert Network collects, uses, and safeguards your personal data in compliance with GDPR, LOPDGDD, and international data protection standards."
      lastUpdated="May 25, 2026"
      category="Legal"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="introduction">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. Introduction and Scope
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Welcome to Whale Alert Network ("we," "our," "us," or the "Company"). We are unequivocally committed to protecting your privacy, maintaining your trust, and ensuring the security of your personal data. This comprehensive Privacy Policy explains in detail how we collect, use, disclose, transfer, and safeguard your information when you access our decentralised analytics platform, mobile applications, APIs, and any related services (collectively, the "Services").
            </p>
            <p>
              This policy has been drafted in strict compliance with the European Union General Data Protection Regulation (GDPR) 2016/679, the Spanish Organic Law 3/2018 on Data Protection and Guarantee of Digital Rights (LOPDGDD), the California Consumer Privacy Act (CCPA), and other applicable global data protection frameworks.
            </p>
            <p>
              By accessing or using our Services, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy. If you do not agree with our policies and practices, you must not use our Services.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section id="controller">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Identity of the Data Controller
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>For the purposes of the GDPR and applicable data protection laws, the Data Controller is:</p>
            <div className="border border-black/10 rounded-xl p-6 space-y-3 mt-2">
              {[
                ['Legal Entity', 'Whale Alert Network, S.L.'],
                ['Registered Office', 'Paseo de la Castellana, Madrid, 28046, Spain'],
                ['General Email', 'humanityledger@humanidfi.es'],
                ['Data Protection Officer (DPO)', 'humanityledger@humanidfi.es'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-0.5">{label}</p>
                  <p className="text-[15px] text-black">{value}</p>
                </div>
              ))}
            </div>
            <p>
              Our DPO is responsible for overseeing questions in relation to this privacy policy. If you have any questions, including requests to exercise your legal rights, please contact the DPO using the details set out above.
            </p>
          </div>
        </section>

        {/* 3 */}
        <section id="data-collected">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. Data We Collect
          </h2>
          <div className="space-y-6 text-[15px] leading-[1.75] text-black/70">
            <p>
              We adhere strictly to the principle of data minimisation. We only collect personal data that is adequate, relevant, and limited to what is necessary for the purposes for which it is processed.
            </p>

            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mb-3">3.1 Identity and Contact Data</h3>
              <ul className="space-y-2 pl-5">
                {[
                  ['Email address', 'Collected via our authentication provider when you create an account.'],
                  ['Public blockchain wallet addresses', 'Cryptographic public keys used to interact with decentralised networks.'],
                  ['Zero-Knowledge Proof identifiers', 'We utilise advanced cryptographic zero-knowledge proofs to verify that you are a unique human without ever knowing your real-world identity. This data is purely mathematical and fully anonymised.'],
                  ['Optional profile data', 'Usernames, display names, or avatars that you explicitly choose to provide.'],
                ].map(([title, desc]) => (
                  <li key={title as string} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                    <span><strong className="text-black font-semibold">{title}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mb-3">3.2 Biometric Authentication Data (Client-Side Only)</h3>
              <div className="bg-black text-white rounded-xl p-5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 mb-2">Critical Privacy Notice</p>
                <p className="text-[14px] leading-relaxed text-white/85">
                  When you opt to use biometric authentication (Touch ID, Face ID, Windows Hello), this data is processed <strong>exclusively on your local device</strong> utilising WebAuthn/FIDO2 protocols. <strong>We NEVER receive, store, transmit, or have access to your biometric templates or raw biometric data.</strong> Our servers only receive cryptographic signatures confirming successful local authentication.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mb-3">3.3 Financial and Transactional Data</h3>
              <ul className="space-y-2 pl-5">
                {[
                  ['Public ledger data', 'Wallet balances, transaction history, token transfers, and smart contract interactions fetched from public blockchains (e.g., Ethereum, Base, Polygon). This data is inherently public by the nature of decentralised networks.'],
                  ['Trading analytics', 'Aggregated trading performance metrics, risk preferences, and simulated trading orders within our platform.'],
                ].map(([title, desc]) => (
                  <li key={title as string} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                    <span><strong className="text-black font-semibold">{title}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mb-3">3.4 Technical and Device Data</h3>
              <ul className="space-y-2 pl-5">
                {[
                  ['Network information', 'IP addresses (anonymised where legally required), internet service provider details.'],
                  ['Device fingerprinting', 'Browser type and version, operating system, time zone, browser plug-in types.'],
                  ['Session data', 'Authentication logs, login timestamps, and security tokens.'],
                ].map(([title, desc]) => (
                  <li key={title as string} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                    <span><strong className="text-black font-semibold">{title}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mb-3">3.5 Behavioural and Usage Data</h3>
              <ul className="space-y-2 pl-5">
                {[
                  'Information about how you use our website, products, and services.',
                  'Pages visited, time spent on pages, clickstream data, and navigation paths.',
                  'Error logs, crash reports, and performance diagnostics.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4 */}
        <section id="lawful-basis">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. Lawful Basis for Processing (GDPR Article 6)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              {[
                {
                  title: 'A. Contractual Necessity',
                  desc: 'Processing necessary to provide our Services, create your account, render portfolio analytics, and provide customer support.',
                },
                {
                  title: 'B. Legitimate Interests',
                  desc: 'Detecting and preventing fraud, ensuring network security, analysing platform usage to improve UX, and defending against legal claims.',
                },
                {
                  title: 'C. Legal Obligation',
                  desc: 'Complying with AML directives, CTF laws, tax reporting requirements, and responding to binding court orders.',
                },
                {
                  title: 'D. Explicit Consent',
                  desc: 'Sending marketing newsletters, utilising non-essential tracking cookies, and enabling optional beta features.',
                },
              ].map(({ title, desc }) => (
                <div key={title} className="border border-black/10 rounded-xl p-5">
                  <h4 className="font-semibold text-black text-[14px] mb-2">{title}</h4>
                  <p className="text-[14px] leading-relaxed text-black/60">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5 */}
        <section id="data-sharing">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. Disclosures and Third-Party Sharing
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We do not sell, rent, or trade your personal data. We may share your data with strictly vetted third-party service providers who assist us in operating our platform, so long as those parties agree to keep this information confidential and comply with strict GDPR standards.
            </p>
            <div className="space-y-3 mt-2">
              {[
                {
                  title: 'Infrastructure & Hosting Partners',
                  desc: 'Provide secure cloud hosting, edge computing, and database storage. These providers are SOC 2 Type II certified and operate under strict Data Processing Agreements (DPAs).',
                },
                {
                  title: 'Authentication Providers',
                  desc: 'Manage secure user sign-in processes, session management, and multi-factor authentication routing.',
                },
                {
                  title: 'Blockchain RPC Nodes',
                  desc: 'Relay requests to public blockchain networks. We share public wallet addresses with these providers solely to fetch balances and broadcast signed transactions.',
                },
              ].map(({ title, desc }) => (
                <div key={title} className="border border-black/8 rounded-xl p-5">
                  <h4 className="font-semibold text-black text-[14px] mb-1">{title}</h4>
                  <p className="text-[14px] text-black/60 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 */}
        <section id="retention">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. Data Retention and Deletion Policies
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
            </p>
            <ul className="space-y-3 pl-5">
              {[
                ['Account Data', 'Retained for the lifetime of your account. Upon requesting account deletion, data is hard-deleted from our active databases within 30 days, and purged from secure backups within 90 days.'],
                ['Security and Access Logs', 'Retained for exactly 12 months to facilitate forensic analysis in the event of a security incident, then automatically purged.'],
                ['Legal Compliance Data', 'If required by law (e.g., tax records), certain minimal data may be retained for up to 5–10 years as mandated by relevant legislation.'],
              ].map(([title, desc]) => (
                <li key={title as string} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                  <span><strong className="text-black font-semibold">{title}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
            <div className="border border-black/15 rounded-xl p-5 mt-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-2">Blockchain Immutability Disclaimer</p>
              <p className="text-[14px] text-black/60 leading-relaxed">
                By the inherent design of decentralised blockchain networks, all transactions and associated public wallet addresses recorded on the blockchain are permanent and immutable. We do not control these networks and <strong className="text-black/80">cannot alter or delete data published to a public ledger</strong>. Your right to erasure applies only to data stored on our centralised servers.
              </p>
            </div>
          </div>
        </section>

        {/* 7 */}
        <section id="rights">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            7. Your Comprehensive Legal Rights
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>Under the GDPR and equivalent data protection laws, you possess the following rights regarding your personal data:</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {[
                ['Right to Access', 'Request a comprehensive copy of the personal data we hold about you.'],
                ['Right to Rectification', 'Request correction of any incomplete or inaccurate data we hold.'],
                ['Right to Erasure', 'Request deletion of personal data where there is no good reason for us to continue processing it.'],
                ['Right to Object', 'Object to processing where we are relying on a legitimate interest.'],
                ['Right to Restriction', 'Ask us to suspend the processing of your personal data in certain scenarios.'],
                ['Right to Portability', 'Request the transfer of your personal data to you or to a third party.'],
                ['Right to Withdraw Consent', 'Withdraw consent at any time where we are relying on consent to process your data.'],
                ['Right to Lodge a Complaint', 'File a formal complaint with your local supervisory authority.'],
              ].map(([title, desc]) => (
                <div key={title as string} className="border border-black/8 rounded-xl p-4">
                  <h4 className="font-semibold text-black text-[14px] mb-1">{title}</h4>
                  <p className="text-[13px] text-black/55 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8 */}
        <section id="cookies">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            8. Cookies and Tracking Technologies
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We use cookies and similar tracking technologies to enhance your experience, understand how our Services are used, and personalise content. Cookies are small text files placed on your device by our website.
            </p>
            <ul className="space-y-2 pl-5">
              {[
                ['Strictly necessary cookies', 'Required for the website to function. Cannot be disabled.'],
                ['Performance cookies', 'Help us understand how visitors interact with our website.'],
                ['Functional cookies', 'Enable personalised features and remember your preferences.'],
                ['Targeting cookies', 'Used to deliver relevant content. Only enabled with your explicit consent.'],
              ].map(([title, desc]) => (
                <li key={title as string} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                  <span><strong className="text-black font-semibold">{title}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
            <p>
              You can manage your cookie preferences through our Cookie Consent panel, which appears on your first visit to our platform.
            </p>
          </div>
        </section>

        {/* 9 */}
        <section id="transfers">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            9. International Data Transfers
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Given the global nature of decentralised finance, personal data we collect may be transferred to and stored at a destination outside the European Economic Area ("EEA"). Whenever we transfer personal data outside the EEA, we ensure adequate protection through at least one of the following safeguards:
            </p>
            <ul className="space-y-2 pl-5">
              {[
                'We will only transfer personal data to countries deemed to provide an adequate level of protection by the European Commission.',
                'Where we use certain service providers, we may use Standard Contractual Clauses approved by the European Commission.',
                'We implement robust technical measures, including advanced encryption at rest and in transit, to further protect transferred data.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 10 */}
        <section id="automated">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            10. Automated Decision-Making and Profiling
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We do not use your personal data for automated decision-making or profiling that produces legal effects or similarly significantly affects you, as defined under Article 22 of the GDPR. Our risk-management algorithms and blockchain analytics tools process publicly available transaction data and do not rely on your private personal identity to automatically restrict or deny services.
            </p>
          </div>
        </section>

        {/* 11 */}
        <section id="third-party-links">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            11. Third-Party Links and Services
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Our platform may include links to third-party websites, plug-ins, decentralised applications (dApps), and external APIs. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our platform, we strongly encourage you to read the privacy policy of every website you visit.
            </p>
          </div>
        </section>

        {/* 12 */}
        <section id="changes">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            12. Changes to This Privacy Policy
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We reserve the right to update or change our Privacy Policy at any time, and you should check this policy periodically. Your continued use of the Service after we post modifications to the Privacy Policy constitutes your acknowledgement of the modifications and your consent to abide by the modified policy.
            </p>
            <p>
              If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our website prior to the change becoming effective.
            </p>
          </div>
        </section>

        {/* 13 */}
        <section id="contact">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            13. Contact Information
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              If you have any questions about this Privacy Policy, our data practices, or wish to exercise your legal rights, please contact our Data Protection Officer:
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
