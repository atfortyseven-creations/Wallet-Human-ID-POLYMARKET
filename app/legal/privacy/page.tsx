import React from 'react';

const SectionDivider = () => (
  <div className="my-12 border-t border-gray-100" />
);

const Article = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
  <section className="mb-12" id={`article-${number}`}>
    <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">
      Article {number} — {title}
    </h2>
    <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
  </section>
);

const Clause = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <div className="mb-5" id={id}>
    <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="pl-4 border-l-2 border-gray-200 text-sm leading-7 text-gray-700 space-y-3">{children}</div>
  </div>
);

const WarningBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-6">
    <h4 className="font-bold text-blue-900 mb-2 text-sm uppercase tracking-wide">{title}</h4>
    <div className="text-blue-800 text-sm leading-relaxed">{children}</div>
  </div>
);

export const metadata = {
  title: 'Privacy Policy & Zero-Knowledge Architecture — Humanity Ledger',
  description: 'Comprehensive Privacy Policy, GDPR Compliance, and Cryptographic Data Minimization framework for the Humanity Ledger.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white text-black py-20 px-6 border-b border-black/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-mono text-black/40 mb-6 tracking-widest uppercase">
            Legal Document · v4.1.0
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-none text-black">
            Privacy Policy &<br />Zero Knowledge Architecture
          </h1>
          <p className="text-black/50 text-lg max-w-2xl leading-relaxed">
            This document outlines how Humanity Ledger implements advanced cryptographic techniques to protect your data while strictly complying with global regulatory frameworks, including the GDPR (EU) and CCPA/CPRA (California). Privacy is not a feature; it is an architectural invariant.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-black/40 font-mono">
            <span>Effective Date: 18 August 2026</span>
            <span>Data Controller: Humanity Ledger Foundation</span>
            <span>DPO Contact: dpo@humanityledger.com</span>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-slate-50 border-b border-slate-200 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Contents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
            {[
              ['1', 'Introduction & Scope'],
              ['2', 'Data Controller Identity'],
              ['3', 'Categories of Data Processed'],
              ['4', 'The Zero-Knowledge Privacy Paradigm'],
              ['5', 'GDPR Compliance & Lawful Basis'],
              ['6', 'Data Minimization via Cryptography'],
              ['7', 'Right to Erasure (Right to be Forgotten)'],
              ['8', 'Data Retention & Local Storage'],
              ['9', 'Sub-Processors & Third Parties'],
              ['10', 'CCPA/CPRA Specific Rights'],
              ['11', 'International Data Transfers'],
              ['12', 'Cookies & Tracking Technologies'],
              ['13', 'Data Subject Rights (DSAR)'],
              ['14', 'Security of Processing'],
              ['15', 'Automated Decision-Making'],
              ['16', 'Children\'s Privacy'],
              ['17', 'Changes to this Policy'],
              ['18', 'Contact Information'],
            ].map(([num, title]) => (
              <a
                key={num}
                href={`#article-${num}`}
                className="text-sm text-slate-600 hover:text-black transition-colors py-0.5"
              >
                <span className="font-mono text-slate-400 mr-2">{num}.</span>{title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-16">

        <WarningBox title="The Humanity Ledger Privacy Guarantee">
          Unlike traditional Web2 applications, Humanity Ledger does not collect your name, email, physical address, or phone number. We rely exclusively on cryptographic authentication (Sign-In with Ethereum). The vast majority of your data (balances, messages, identity attributes) is encrypted locally on your device and is mathematically inaccessible to us. We cannot share, sell, or disclose what we cannot read.
        </WarningBox>

        <Article number="1" title="Introduction & Scope">
          <Clause id="intro-scope" title="1.1 Scope of Application">
            <p>This Privacy Policy applies to all users accessing the humanidfi.com domain, utilizing the Humanity Ledger API, or interacting with the front-end interfaces provided by the Humanity Ledger Foundation (the "Interface"). It does not apply to the decentralized Aztec Network infrastructure, which operates autonomously via decentralized sequencers and provers, nor does it apply to third-party front-ends.</p>
          </Clause>
          <Clause id="intro-commitment" title="1.2 Commitment to Privacy">
            <p>We believe that financial and informational privacy is a fundamental human right. Our architecture implements Privacy by Design and Privacy by Default as mandated by Article 25 of the General Data Protection Regulation (GDPR).</p>
          </Clause>
        </Article>

        <Article number="2" title="Data Controller Identity">
          <Clause id="controller-identity" title="2.1 Identity and Contact Details">
            <p>For the purposes of the GDPR, the UK GDPR, and other applicable data protection laws, the Data Controller is the Humanity Ledger Foundation. You may contact our Data Protection Officer (DPO) at <strong>dpo@humanityledger.com</strong>.</p>
          </Clause>
        </Article>

        <Article number="3" title="Categories of Data Processed">
          <p>We intentionally limit data collection to the absolute minimum required to operate the Interface and protect against cyberattacks.</p>
          <Clause id="data-processed" title="3.1 Data We Process">
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Public Cryptographic Identifiers:</strong> Your Ethereum public address when you connect your wallet via Sign-In With Ethereum (SIWE).</li>
              <li><strong>Session Data:</strong> SIWE nonces, timestamps, and domain separation data to maintain your authentication session.</li>
              <li><strong>Technical Network Data:</strong> IP addresses (temporarily retained for 24 hours strictly for DDoS mitigation and rate-limiting at our Web Application Firewall layer), browser type, and operating system version.</li>
              <li><strong>Anonymized Telemetry:</strong> Aggregated, non-identifiable usage metrics (e.g., page views, feature adoption rates) using privacy-preserving, cookie-less analytics platforms.</li>
            </ul>
          </Clause>
          <Clause id="data-not-processed" title="3.2 Data We Do NOT Process">
            <p>Due to our client-side encryption and Zero-Knowledge architecture, we <strong>do not and cannot</strong> process or access:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-slate-600">
              <li>Your Aztec private keys, nullifier keys, or viewing keys.</li>
              <li>The contents of your Whale Chat messages.</li>
              <li>Your financial balances, token holdings, or transaction amounts.</li>
              <li>The specific recipients or senders of your transactions (protected by encrypted UTXO notes and nullifiers).</li>
              <li>Your real-world identity documents or personal attributes (unless explicitly provided via an opt-in compliance module).</li>
            </ul>
          </Clause>
        </Article>

        <Article number="4" title="The Zero-Knowledge Privacy Paradigm">
          <Clause id="zk-paradigm" title="4.1 Cryptographic Abstraction">
            <p>Traditional blockchains (e.g., Ethereum, Bitcoin) operate on a model of radical transparency where all state is public. Humanity Ledger utilizes Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs). When you execute a transaction, your Private Execution Environment (PXE) runs locally in your browser, generating a mathematical proof that the transaction is valid without revealing the inputs (the witness).</p>
          </Clause>
          <Clause id="zk-encryption" title="4.2 Client-Side Encryption">
            <p>All private state (notes) is encrypted using AES-256-GCM with your incoming viewing key before being submitted to the network. The Aztec sequencer and the Humanity Ledger indexing nodes see only opaque ciphertexts and cryptographic commitments. This ensures that even if our servers were compromised, the attacker would obtain no readable user data.</p>
          </Clause>
        </Article>

        <Article number="5" title="GDPR Compliance & Lawful Basis">
          <Clause id="lawful-basis" title="5.1 Lawful Basis for Processing (Article 6 GDPR)">
            <p>We rely on the following lawful bases for processing the limited data we collect:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Contractual Necessity (Art. 6(1)(b)):</strong> Processing your Ethereum address and SIWE session data is strictly necessary to provide the Interface services you request.</li>
              <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> Processing IP addresses temporarily is necessary for our legitimate interest in securing our infrastructure against DDoS attacks, Sybil attacks, and malicious scraping.</li>
              <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> We may process certain data if compelled by a lawful court order or to comply with applicable AML/CFT regulations (only applicable if you utilize our opt-in fiat gateways).</li>
            </ul>
          </Clause>
        </Article>

        <Article number="6" title="Data Minimization via Cryptography">
          <Clause id="data-min" title="6.1 Compliance with Article 5(1)(c)">
            <p>GDPR Article 5(1)(c) requires that personal data be adequate, relevant, and limited to what is necessary. We achieve radical data minimization through zk-proofs. For example, if a feature requires you to prove you are over 18, you submit a zero-knowledge proof of this fact. We verify the proof (True/False) without ever collecting or processing your date of birth.</p>
          </Clause>
        </Article>

        <Article number="7" title="Right to Erasure (Right to be Forgotten)">
          <Clause id="erasure-blockchain" title="7.1 The Blockchain Immutability Paradox">
            <p>Public blockchains are immutable, creating tension with the GDPR Right to Erasure (Article 17). Humanity Ledger resolves this through <strong>Cryptographic Erasure</strong>.</p>
          </Clause>
          <Clause id="erasure-crypto" title="7.2 Cryptographic Erasure">
            <p>Because your on-chain data consists entirely of encrypted ciphertexts, you can exercise your Right to be Forgotten by simply deleting your private keys. The French Data Protection Authority (CNIL) and the European Data Protection Board (EDPB) have recognized that destroying the decryption keys renders the ciphertext completely unrecoverable and anonymized. Once your keys are destroyed, the remaining on-chain data ceases to be "personal data" under the GDPR definition.</p>
          </Clause>
          <Clause id="erasure-offchain" title="7.3 Off-Chain Erasure">
            <p>For any off-chain data held directly by the Foundation (e.g., support tickets, opt-in email subscriptions, SIWE session logs), you may request immediate deletion by emailing dpo@humanityledger.com. We will execute the deletion within 72 hours.</p>
          </Clause>
        </Article>

        <Article number="8" title="Data Retention & Local Storage">
          <Clause id="retention" title="8.1 Server-Side Retention">
            <p>IP addresses in our WAF logs are purged automatically every 24 hours. SIWE session tokens expire after a maximum of 7 days and are subsequently deleted from our session databases.</p>
          </Clause>
          <Clause id="local-storage" title="8.2 Client-Side Storage (IndexedDB)">
            <p>The Interface makes extensive use of your browser's IndexedDB to store the Private Execution Environment (PXE) state, including decrypted notes, your address book, and your private settings. This data resides physically on your device. You are solely responsible for securing your device. You can clear this data at any time by clearing your browser data or using the "Clear Local State" function in the Interface settings.</p>
          </Clause>
        </Article>

        <Article number="9" title="Sub-Processors & Third Parties">
          <Clause id="sub-processors" title="9.1 Authorized Sub-Processors">
            <p>We engage strictly vetted sub-processors to provide infrastructure services. All sub-processors are bound by Data Processing Agreements (DPAs) meeting GDPR Article 28 requirements.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Cloudflare:</strong> DNS routing and DDoS mitigation (temporarily processes IP addresses).</li>
              <li><strong>Vercel / AWS:</strong> Interface hosting and serverless API execution.</li>
              <li><strong>XMTP Labs:</strong> Decentralized message relay network (processes opaque ciphertexts only).</li>
              <li><strong>Aztec Labs:</strong> Sequencer infrastructure during Alpha Testnet (processes ZK proofs and encrypted notes).</li>
            </ul>
          </Clause>
          <Clause id="no-sale" title="9.2 No Sale of Data">
            <p>We do not, have not, and never will sell your personal data to data brokers, advertising networks, or any third party.</p>
          </Clause>
        </Article>

        <Article number="10" title="CCPA/CPRA Specific Rights (California Residents)">
          <Clause id="ccpa-rights" title="10.1 California Consumer Privacy Act">
            <p>If you are a resident of California, you have specific rights regarding your personal information under the CCPA/CPRA:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Right to Know:</strong> You may request disclosure of the specific pieces of personal information we have collected about you.</li>
              <li><strong>Right to Delete:</strong> Subject to certain exceptions (such as data required to detect security incidents), you may request deletion of your data.</li>
              <li><strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share personal information for cross-context behavioral advertising. You do not need to opt-out because we do not engage in these practices.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not deny you services or provide a different level of quality if you exercise your privacy rights.</li>
            </ul>
            <p className="mt-2">To submit a CCPA request, contact dpo@humanityledger.com with the subject line "CCPA Request".</p>
          </Clause>
        </Article>

        <Article number="11" title="International Data Transfers">
          <Clause id="data-transfers" title="11.1 Cross-Border Processing">
            <p>The Foundation operates globally. Data processed by our sub-processors may be transferred outside the EEA. When such transfers occur, they are safeguarded by Standard Contractual Clauses (SCCs) approved by the European Commission, and supplementary technical measures (such as TLS 1.3 transit encryption and AES-256 at rest) are employed to ensure the data is protected to European standards.</p>
          </Clause>
        </Article>

        <Article number="12" title="Cookies & Tracking Technologies">
          <Clause id="cookies" title="12.1 Strictly Necessary Cookies">
            <p>We use a single, strictly necessary, HttpOnly, Secure, SameSite=Strict cookie to maintain your SIWE authentication session. Because this cookie is strictly necessary for the service you explicitly requested (logging in), it does not require prior consent under the ePrivacy Directive.</p>
          </Clause>
          <Clause id="no-tracking" title="12.2 No Marketing Cookies">
            <p>We do not use tracking cookies, tracking pixels, cross-site trackers, or any advertising technologies. Your activity on Humanity Ledger is not shared with Google, Meta, or any advertising syndicate.</p>
          </Clause>
        </Article>

        <Article number="13" title="Data Subject Access Requests (DSAR)">
          <Clause id="dsar" title="13.1 Exercising Your Rights">
            <p>You have the right to request a copy of all personal data we hold about you. To execute a DSAR, email dpo@humanityledger.com. Because we do not link Ethereum addresses to real-world identities, you must cryptographically sign a message with your Ethereum wallet to prove ownership of the address before we can release any session data associated with it. We will respond within 30 days free of charge.</p>
          </Clause>
        </Article>

        <Article number="14" title="Security of Processing">
          <Clause id="security" title="14.1 Technical and Organizational Measures">
            <p>In accordance with GDPR Article 32, we implement state-of-the-art security measures:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>All API communication is secured via strict TLS 1.3 (HSTS enforced).</li>
              <li>Subresource Integrity (SRI) hashes ensure JavaScript bundles cannot be tampered with by CDNs.</li>
              <li>Content Security Policy (CSP) headers aggressively restrict external script execution to prevent XSS.</li>
              <li>The PXE Settings Engine uses PBKDF2 with 100,000 iterations to derive AES keys for local IndexedDB encryption.</li>
            </ul>
          </Clause>
        </Article>

        <Article number="15" title="Automated Decision-Making">
          <Clause id="automated" title="15.1 No Profiling">
            <p>We do not engage in automated decision-making or profiling that produces legal effects concerning you (Article 22 GDPR). The execution of smart contracts is deterministic and based entirely on cryptographic logic, not on behavioral profiling.</p>
          </Clause>
        </Article>

        <Article number="16" title="Children's Privacy">
          <Clause id="children" title="16.1 Age Restriction">
            <p>The Interface is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected data from a child, we will take immediate steps to delete it.</p>
          </Clause>
        </Article>

        <Article number="17" title="Changes to this Policy">
          <Clause id="changes" title="17.1 Notification of Changes">
            <p>We may update this Privacy Policy to reflect architectural changes or regulatory updates. Material changes will be communicated via a prominent banner on the Interface and within our governance forums at least 14 days before taking effect. The "Effective Date" at the top of this document will be updated accordingly.</p>
          </Clause>
        </Article>

        <Article number="18" title="Contact Information">
          <Clause id="contact" title="18.1 Direct Inquiries">
            <p>For any questions, concerns, or legal inquiries regarding this Privacy Policy or our data practices, please contact our Data Protection Officer:</p>
            <p className="mt-2 font-mono bg-slate-100 p-3 rounded text-slate-800">
              Email: dpo@humanityledger.com<br/>
              PGP Fingerprint: 4F92 B7A1 99E0 D3C2 11A8 55F4 C7B3 89D1<br/>
              Entity: Humanity Ledger Foundation
            </p>
          </Clause>
        </Article>

        <SectionDivider />
        <div className="bg-slate-50 rounded-2xl p-8 text-sm text-slate-500 space-y-3">
          <p className="font-semibold text-slate-700">Formal Acknowledgment</p>
          <p>
            By connecting your wallet and interacting with the Humanity Ledger Interface, you acknowledge that you have read, understood, and accept this Privacy Policy and the underlying Zero-Knowledge architecture constraints.
          </p>
          <p className="text-xs text-slate-400 pt-4 border-t border-slate-200 mt-4">
            Document Version: 4.1.0 | Classification: Public Legal Document | Jurisdiction: International
          </p>
        </div>

      </div>
    </div>
  );
}
