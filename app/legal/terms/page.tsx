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
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-6">
    <h4 className="font-bold text-amber-900 mb-2 text-sm uppercase tracking-wide">{title}</h4>
    <div className="text-amber-800 text-sm leading-relaxed">{children}</div>
  </div>
);

const ProhibitedItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3 py-2 border-b border-red-100 last:border-0">
    <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
    <span className="text-sm text-gray-700">{children}</span>
  </li>
);

export const metadata = {
  title: 'Terms of Service & Network Governance — Humanity Ledger',
  description: 'Comprehensive Terms of Service, Acceptable Use Policy, and Network Governance Agreement for the Humanity Ledger privacy protocol on Aztec L2.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white text-black py-20 px-6 border-b border-black/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-mono text-black/40 mb-6 tracking-widest uppercase">
            Legal Document · v3.2.0
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-none text-black">
            Terms of Service<br />& Network Governance
          </h1>
          <p className="text-black/50 text-lg max-w-2xl leading-relaxed">
            This Agreement governs your access to and use of the Humanity Ledger protocol, associated front-end interfaces, API services, and all related infrastructure. Please read this document in its entirety before interacting with the protocol.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-black/40 font-mono">
            <span>Effective Date: 18 August 2026</span>
            <span>Last Revised: 18 August 2026</span>
            <span>Jurisdiction: International</span>
            <span>Governing Law: England & Wales</span>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-gray-50 border-b border-gray-200 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Contents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
            {[
              ['1', 'Definitions & Interpretation'],
              ['2', 'Protocol Architecture & Nature'],
              ['3', 'Eligibility & Access'],
              ['4', 'Acceptable Use Policy'],
              ['5', 'Prohibited Activities'],
              ['6', 'Regulatory Compliance (MiCA, AML)'],
              ['7', 'Identity & Sybil Resistance'],
              ['8', 'Intellectual Property'],
              ['9', 'Cryptographic Risk Disclosures'],
              ['10', 'Limitation of Liability'],
              ['11', 'Indemnification'],
              ['12', 'Network Governance & Upgrades'],
              ['13', 'Data Protection Obligations'],
              ['14', 'Third-Party Services'],
              ['15', 'Dispute Resolution & Arbitration'],
              ['16', 'Force Majeure'],
              ['17', 'Severability & Waiver'],
              ['18', 'Governing Law & Jurisdiction'],
              ['19', 'Amendments & Notice'],
              ['20', 'Entire Agreement'],
            ].map(([num, title]) => (
              <a
                key={num}
                href={`#article-${num}`}
                className="text-sm text-gray-600 hover:text-black transition-colors py-0.5"
              >
                <span className="font-mono text-gray-400 mr-2">{num}.</span>{title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-16">

        <WarningBox title="Important Notice — Read Carefully">
          This Terms of Service Agreement (&quot;Agreement&quot;) is a legally binding contract between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and the Humanity Ledger Foundation (&quot;Foundation,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the Protocol, you represent that you have read, understood, and agree to be bound by all terms herein. If you do not agree, you must immediately cease using the Protocol. Your continued use constitutes ongoing acceptance of these terms.
        </WarningBox>

        <Article number="1" title="Definitions & Interpretation">
          <Clause id="def-protocol" title="1.1 Protocol">
            <p>&quot;Protocol&quot; refers to the Humanity Ledger decentralized software system, including but not limited to: the Aztec Layer 2 smart contracts deployed on the Ethereum blockchain; the Private Execution Environment (PXE) software; the Noir circuit programs; the Barretenberg proving backend; all associated open-source repositories; and the decentralized network of sequencers, provers, and validators operating the Protocol infrastructure.</p>
          </Clause>
          <Clause id="def-interface" title="1.2 Interface">
            <p>&quot;Interface&quot; refers to any front-end web application, mobile application, API endpoint, command-line tool, or other user-facing software component provided by the Foundation to interact with the Protocol, including humanidfi.com and all associated subdomains.</p>
          </Clause>
          <Clause id="def-cryptographic-assets" title="1.3 Cryptographic Assets">
            <p>&quot;Cryptographic Assets&quot; means any tokens, notes, commitments, digital assets, or cryptographic representations of value held in Aztec private notes or associated smart contract state, including but not limited to: shielded tokens, Quantum Dots (QD), and NFT representations of Studio Provenance records.</p>
          </Clause>
          <Clause id="def-pxe" title="1.4 PXE (Private Execution Environment)">
            <p>&quot;PXE&quot; refers to the sandboxed local runtime environment executed on the User&apos;s device that manages private key material, generates zero-knowledge proofs, decrypts Aztec notes, and constructs private transactions. The PXE executes locally on the User&apos;s hardware and does not transmit private key material to any remote server.</p>
          </Clause>
          <Clause id="def-zk-proof" title="1.5 Zero-Knowledge Proof">
            <p>&quot;Zero-Knowledge Proof&quot; or &quot;ZK Proof&quot; means any cryptographic proof generated by the Protocol&apos;s proving backend that attests to the validity of a state transition, identity assertion, or computation without revealing the underlying private inputs (the witness).</p>
          </Clause>
          <Clause id="def-note" title="1.6 Private Note">
            <p>&quot;Private Note&quot; means an encrypted UTXO-style state element stored in the Aztec note hash tree. Private Notes contain encrypted data accessible only to the holder of the corresponding decryption key.</p>
          </Clause>
          <Clause id="def-dao" title="1.7 Governance DAO">
            <p>&quot;Governance DAO&quot; means the decentralized autonomous organization that governs Protocol upgrades, parameter changes, and treasury management through on-chain token-weighted voting mechanisms.</p>
          </Clause>
          <Clause id="def-interpretation" title="1.8 Interpretation">
            <p>Unless the context otherwise requires: (a) references to statutes include all amendments thereto; (b) the singular includes the plural and vice versa; (c) &quot;including&quot; means &quot;including without limitation&quot;; (d) headings are for convenience only and shall not affect interpretation; (e) references to &quot;days&quot; mean calendar days unless specified as business days.</p>
          </Clause>
        </Article>

        <Article number="2" title="Protocol Architecture & Nature">
          <Clause id="arch-decentralized" title="2.1 Decentralized Nature">
            <p>The Protocol operates as a system of autonomous, immutable smart contracts deployed on the Ethereum blockchain and the Aztec Layer 2 network. No central entity — including the Foundation — controls the Protocol&apos;s core execution logic, sequencing order, or private state once the system is live. The Foundation may contribute code to open-source repositories and operate front-end interfaces, but it does not operate or control the decentralized infrastructure.</p>
          </Clause>
          <Clause id="arch-no-custody" title="2.2 Non-Custodial Architecture">
            <p>The Protocol is strictly non-custodial. At no time does the Foundation, any sequencer operator, any prover, or any third-party service provider take custody of, control, or hold Cryptographic Assets on behalf of Users. Private keys and encryption keys are generated on-device, stored locally, and never transmitted to any remote party. The Foundation has no ability to access, freeze, confiscate, or recover User assets under any circumstances, including pursuant to court order, regulatory compulsion, or emergency.</p>
          </Clause>
          <Clause id="arch-experimental" title="2.3 Experimental Technology Status">
            <p>The Protocol utilizes cutting-edge cryptographic research, including zero-knowledge proof systems based on the BN254 elliptic curve, the Honk/UltraPLONK arithmetization scheme, and the Noir domain-specific language. While these technologies have undergone rigorous academic peer review and multiple independent security audits, they represent the frontier of applied cryptography and may contain undiscovered vulnerabilities.</p>
          </Clause>
          <Clause id="arch-testnet" title="2.4 Testnet Operation">
            <p>As of the Effective Date, the Protocol operates on the Aztec Mainnet. Testnet operations are subject to higher instability, resets, and experimental parameter changes than mainnet. Testnet Cryptographic Assets have no monetary value. The Foundation makes no representations regarding the equivalence of testnet and mainnet behavior.</p>
          </Clause>
        </Article>

        <Article number="3" title="Eligibility & Access">
          <Clause id="elig-age" title="3.1 Age Requirement">
            <p>You must be at least 18 years of age, or the age of majority in your jurisdiction (whichever is higher), to use the Protocol. By accepting these Terms, you represent and warrant that you meet this requirement. If you are accessing the Protocol on behalf of a legal entity, you represent that you have authority to bind that entity.</p>
          </Clause>
          <Clause id="elig-jurisdiction" title="3.2 Jurisdictional Restrictions">
            <p>You represent that your use of the Protocol does not violate any law or regulation applicable to you. You must not use the Protocol if: (a) you are located in, or are a citizen or resident of, any jurisdiction subject to comprehensive economic sanctions, including but not limited to Cuba, Iran, North Korea, Syria, Russia (with respect to sanctioned sectors), Belarus, or the Crimea region; (b) you are listed on any sanctions list maintained by OFAC, the EU, the UN Security Council, or equivalent authorities; or (c) applicable law in your jurisdiction prohibits your participation in decentralized blockchain protocols.</p>
          </Clause>
          <Clause id="elig-compliance" title="3.3 Compliance Responsibility">
            <p>You are solely responsible for determining whether your use of the Protocol complies with applicable laws in your jurisdiction, including securities laws, money transmission laws, tax laws, and any other regulations. The Foundation does not provide legal advice and nothing in these Terms constitutes legal advice.</p>
          </Clause>
        </Article>

        <Article number="4" title="Acceptable Use Policy">
          <Clause id="aup-permitted" title="4.1 Permitted Uses">
            <p>Subject to these Terms, you may use the Protocol for: (a) sending and receiving encrypted messages via LedgerChat; (b) registering and transferring Studio Provenance records; (c) viewing and managing your Portfolio Terminal; (d) generating zero-knowledge proofs of identity, ownership, or computation; (e) participating in Protocol governance through the Governance DAO; (f) developing applications on top of the Protocol using the published SDK; and (g) any other use consistent with the Protocol&apos;s intended purpose as described in the technical documentation.</p>
          </Clause>
          <Clause id="aup-responsible" title="4.2 Responsible Use">
            <p>You agree to use the Protocol in a responsible manner that does not interfere with other Users&apos; access or enjoyment, compromise the Protocol&apos;s security, or create liability for the Foundation. You are responsible for maintaining the security of your private keys, seed phrases, and device access credentials. The Foundation is not responsible for losses arising from your failure to maintain key security.</p>
          </Clause>
        </Article>

        <Article number="5" title="Prohibited Activities">
          <p>You expressly agree not to engage in any of the following activities. Violation of this Article may result in termination of your access to the Interface and may expose you to civil and criminal liability:</p>
          <ul className="mt-4 border border-red-200 rounded-xl overflow-hidden">
            <ProhibitedItem>Using the Protocol to launder the proceeds of crime, terrorism financing, or any other unlawful financial activity, regardless of whether such activity is otherwise concealed by cryptographic privacy.</ProhibitedItem>
            <ProhibitedItem>Submitting transactions that violate OFAC sanctions, UN Security Council sanctions, EU restrictive measures, or equivalent applicable sanctions regimes.</ProhibitedItem>
            <ProhibitedItem>Attempting to compromise the cryptographic integrity of the Protocol, including attempts to produce invalid proofs, exploit nullifier tree collisions, or manipulate the sequencer&apos;s transaction ordering.</ProhibitedItem>
            <ProhibitedItem>Deploying Noir contracts that contain malicious logic, backdoors, exploits, or that are designed to steal funds from other Users.</ProhibitedItem>
            <ProhibitedItem>Conducting denial-of-service attacks, spam transaction flooding, or any other activity intended to degrade Protocol performance or availability.</ProhibitedItem>
            <ProhibitedItem>Circumventing, disabling, or attempting to bypass the Protocol&apos;s anti-Sybil mechanisms, identity verification circuits, or rate-limiting systems.</ProhibitedItem>
            <ProhibitedItem>Using the Protocol to transmit content that is illegal in the applicable jurisdiction, including child sexual abuse material, content facilitating violence, or material violating applicable intellectual property law.</ProhibitedItem>
            <ProhibitedItem>Reverse engineering, decompiling, or disassembling non-open-source components of the Interface or Protocol in a manner that violates applicable law.</ProhibitedItem>
            <ProhibitedItem>Creating, distributing, or using automated systems (bots, scrapers, crawlers) to interact with the Interface in a manner that places disproportionate load on Foundation infrastructure without prior written consent.</ProhibitedItem>
            <ProhibitedItem>Misrepresenting your identity, affiliation, or the nature of your interactions with the Protocol in a manner intended to deceive other Users or regulatory authorities.</ProhibitedItem>
          </ul>
        </Article>

        <Article number="6" title="Regulatory Compliance — MiCA, AML/CFT, FATF">
          <Clause id="reg-mica" title="6.1 Markets in Crypto-Assets (MiCA) — EU Regulation 2023/1114">
            <p>The Foundation is committed to compliance with the Markets in Crypto-Assets (MiCA) Regulation as applicable to its operations within the European Economic Area (EEA). MiCA entered into full application on 30 December 2024. With respect to the Protocol:</p>
            <p><strong>Asset Classification:</strong> Quantum Dots (QD), the Protocol&apos;s native utility token, is designed and operated as a utility token under MiCA Article 3(5) — a token that provides digital access to goods or services available on a DLT platform. QD is not designed to be, and the Foundation does not represent it to be, an asset-referenced token, an e-money token, or a financial instrument under MiFID II.</p>
            <p><strong>Whitepaper Obligation:</strong> A MiCA-compliant crypto-asset whitepaper has been prepared and published in accordance with MiCA Articles 19-21. The whitepaper is available at humanidfi.com/whitepaper and contains the disclosures mandated by MiCA Annex I.</p>
            <p><strong>Liability under MiCA:</strong> The Foundation accepts responsibility for the accuracy of the whitepaper contents. Any material changes to the Protocol that affect the whitepaper disclosures will be communicated via modified whitepaper publication with a minimum 20-day notice period, in accordance with MiCA Article 25.</p>
          </Clause>
          <Clause id="reg-aml" title="6.2 Anti-Money Laundering (AML) & Counter-Terrorism Financing (CTF)">
            <p>The Foundation operates in accordance with the FATF Recommendations for Virtual Asset Service Providers (VASPs) to the extent it constitutes a VASP under applicable law. The Protocol&apos;s privacy features are designed to be compatible with AML/CFT compliance through the following mechanisms:</p>
            <p><strong>Opt-In Compliance:</strong> The Protocol implements optional compliance modules allowing Users to voluntarily disclose transaction details to regulators or financial institutions. Privacy is the default; compliance is opt-in.</p>
            <p><strong>Selective Disclosure:</strong> Using zero-knowledge proofs, Users can prove compliance with AML requirements (e.g., source of funds, identity, sanctions status) without revealing all private financial details — enabling privacy-preserving compliance rather than all-or-nothing disclosure.</p>
            <p><strong>No Protocol-Level Censorship:</strong> The core Protocol smart contracts do not implement address blacklisting or transaction censorship. Regulated entities operating front-end interfaces or gateway services are responsible for their own AML/CFT compliance obligations.</p>
          </Clause>
          <Clause id="reg-travel" title="6.3 FATF Travel Rule">
            <p>The FATF Travel Rule requires VASPs to collect and transmit originator and beneficiary information for virtual asset transfers above specified thresholds. The Foundation acknowledges this requirement and has designed optional Travel Rule compliance modules for integration by regulated entities operating on top of the Protocol. The Protocol itself, as a decentralized smart contract system, does not independently collect or transmit such information.</p>
          </Clause>
        </Article>

        <Article number="7" title="Decentralized Identity & Sybil Resistance">
          <Clause id="id-mechanism" title="7.1 Identity Mechanism">
            <p>The Protocol employs zero-knowledge proof-based identity verification to establish uniqueness without revealing personal data. Your Sovereign Identity is derived deterministically from your Ethereum keypair and is represented as a cryptographic commitment on the Aztec network. By using the Protocol&apos;s identity features, you agree that your identity commitment is accurate and that you are the sole controller of the associated private keys.</p>
          </Clause>
          <Clause id="id-sybil" title="7.2 Anti-Sybil Obligations">
            <p>You agree not to: (a) attempt to register or operate multiple identities using the same underlying real-world identity; (b) sell, transfer, or license access to your identity credentials or private keys to third parties; (c) use automated tools to generate artificial identity proofs; or (d) engage in any activity designed to circumvent the Protocol&apos;s uniqueness guarantees. Violation of this clause may result in nullification of staked assets and permanent exclusion from identity-gated Protocol features.</p>
          </Clause>
          <Clause id="id-no-guarantee" title="7.3 No Guarantee of Identity Accuracy">
            <p>The Protocol verifies cryptographic properties of identity proofs but does not independently verify the real-world accuracy of any claimed attributes (nationality, age, profession) beyond what is attested by recognized credential issuers. The Foundation makes no representation regarding the accuracy of third-party attestations.</p>
          </Clause>
        </Article>

        <Article number="8" title="Intellectual Property">
          <Clause id="ip-foundation" title="8.1 Foundation Intellectual Property">
            <p>The Interface, including all visual design, user experience flows, proprietary configurations, and non-open-source software components, is the intellectual property of the Foundation, protected by copyright law, trade secret law, and other applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works of any proprietary Interface components without express written permission.</p>
          </Clause>
          <Clause id="ip-open-source" title="8.2 Open-Source Components">
            <p>The Protocol&apos;s core software — including Noir circuit code, smart contracts, SDK, and PXE implementation — is published under the MIT License. Your use of open-source components is governed by the applicable open-source license terms, which take precedence over these Terms with respect to such components. The MIT License text is included in each open-source repository.</p>
          </Clause>
          <Clause id="ip-user-content" title="8.3 User-Generated Content">
            <p>Content you create using the Protocol (Ledger Chat messages, Studio Provenance records, Forum posts) is encrypted and controlled by your private keys. The Foundation claims no intellectual property rights over your encrypted private content. For any public content you post (e.g., public Forum posts), you grant the Foundation a non-exclusive, royalty-free license to display, distribute, and store such content as necessary to operate the Interface.</p>
          </Clause>
        </Article>

        <Article number="9" title="Cryptographic Risk Disclosures">
          <p>YOU EXPRESSLY ACKNOWLEDGE AND ACCEPT THE FOLLOWING RISKS:</p>
          <Clause id="risk-key-loss" title="9.1 Irreversible Key Loss">
            <p>If you lose access to your private key, seed phrase, or the Ethereum wallet used to derive your Sovereign Identity, you will permanently lose access to your Cryptographic Assets held in Aztec private notes. There is no key recovery mechanism. The Foundation cannot recover your keys under any circumstances.</p>
          </Clause>
          <Clause id="risk-smart-contract" title="9.2 Smart Contract Vulnerabilities">
            <p>The Protocol&apos;s smart contracts may contain undiscovered vulnerabilities. Despite undergoing multiple third-party security audits, no software system can be guaranteed free of all defects. A critical vulnerability could result in partial or total loss of Cryptographic Assets.</p>
          </Clause>
          <Clause id="risk-zk-assumptions" title="9.3 Cryptographic Assumption Risk">
            <p>The security of the Protocol&apos;s zero-knowledge proof system rests on the hardness of the Discrete Logarithm Problem on the BN254 elliptic curve. Advances in cryptanalysis, including the development of sufficiently powerful quantum computers capable of running Shor&apos;s algorithm at scale, could theoretically compromise this assumption. The Foundation monitors cryptographic research and will initiate governance proposals to migrate to quantum-resistant primitives if such a risk materializes.</p>
          </Clause>
          <Clause id="risk-regulatory" title="9.4 Regulatory Risk">
            <p>The regulatory status of decentralized blockchain protocols and privacy-preserving technologies is uncertain and evolving. Regulatory actions in any jurisdiction could restrict or prohibit access to the Protocol, affect the value of Cryptographic Assets, or impose obligations on the Foundation that require changes to the Interface or Protocol.</p>
          </Clause>
          <Clause id="risk-sequencer" title="9.5 Sequencer Centralization Risk (Testnet)">
            <p>During the Alpha Testnet phase, the Aztec sequencer is operated by a limited set of entities, including Aztec Labs. A failure, attack, or censorship of the sequencer could temporarily prevent transaction processing. Users retain the ability to submit forced transactions directly to L1 contracts to bypass a non-functional sequencer.</p>
          </Clause>
        </Article>

        <Article number="10" title="Limitation of Liability">
          <Clause id="liability-disclaimer" title="10.1 &quot;As Is&quot; Disclaimer">
            <p>THE PROTOCOL AND INTERFACE ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO: WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, UNINTERRUPTED OPERATION, OR ACCURACY. THE FOUNDATION EXPRESSLY DISCLAIMS ALL SUCH WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.</p>
          </Clause>
          <Clause id="liability-cap" title="10.2 Liability Cap">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE AGGREGATE LIABILITY OF THE FOUNDATION, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, LICENSORS, AND AFFILIATES ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PROTOCOL SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT OF FEES (IF ANY) PAID BY YOU TO THE FOUNDATION IN THE 12 MONTHS PRECEDING THE CLAIM; OR (B) €100 (ONE HUNDRED EUROS).</p>
          </Clause>
          <Clause id="liability-consequential" title="10.3 Exclusion of Consequential Damages">
            <p>IN NO EVENT SHALL THE FOUNDATION BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA, LOSS OF CRYPTOGRAPHIC ASSETS, BUSINESS INTERRUPTION, LOSS OF GOODWILL, OR COST OF SUBSTITUTE GOODS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND EVEN IF A REMEDY FAILS OF ITS ESSENTIAL PURPOSE.</p>
          </Clause>
          <Clause id="liability-carve-out" title="10.4 Carve-Outs">
            <p>Nothing in this Agreement shall limit or exclude liability for: (a) death or personal injury caused by negligence; (b) fraud or fraudulent misrepresentation; (c) any liability that cannot be excluded or limited under applicable mandatory law.</p>
          </Clause>
        </Article>

        <Article number="11" title="Indemnification">
          <Clause id="indem-user" title="11.1 User Indemnification">
            <p>You agree to defend, indemnify, and hold harmless the Foundation and its directors, officers, employees, contractors, agents, licensors, service providers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, and fees (including reasonable attorneys&apos; fees) arising out of or relating to: (a) your violation of these Terms; (b) your use of the Protocol; (c) your violation of any applicable law or regulation; (d) your infringement of any third-party rights; or (e) any content you submit, post, or transmit through the Protocol.</p>
          </Clause>
          <Clause id="indem-procedure" title="11.2 Indemnification Procedure">
            <p>The Foundation will promptly notify you in writing of any claim for which indemnification is sought. You shall have the right to control the defense of such claim, provided that the Foundation may participate in the defense at its own expense and you may not settle any claim that imposes obligations or restrictions on the Foundation without the Foundation&apos;s prior written consent.</p>
          </Clause>
        </Article>

        <Article number="12" title="Network Governance & Protocol Upgrades">
          <Clause id="gov-dao" title="12.1 DAO Governance">
            <p>Material changes to the Protocol — including modifications to core smart contracts, circuit logic, fee parameters, and sequencer rules — are governed by the Governance DAO. Governance proposals require a quorum of token holders to vote, with a time-locked execution period allowing users to exit before changes take effect. You agree to be bound by the outcomes of valid governance processes.</p>
          </Clause>
          <Clause id="gov-timelock" title="12.2 Timelock Mechanism">
            <p>All governance-approved contract upgrades are subject to a mandatory timelock of a minimum 7 days between approval and execution. During this period, Users are notified of pending changes and may choose to withdraw assets from the Protocol if they disagree with the proposed change.</p>
          </Clause>
          <Clause id="gov-emergency" title="12.3 Emergency Security Council">
            <p>An elected Security Council of multi-sig signatories holds limited emergency powers to: (a) pause specific Protocol functions in response to critical vulnerability exploitation; (b) veto malicious governance proposals during the timelock period. The Security Council cannot upgrade contracts, confiscate funds, or permanently pause the Protocol without a full governance vote.</p>
          </Clause>
        </Article>

        <Article number="13" title="Data Protection Obligations">
          <Clause id="data-gdpr" title="13.1 GDPR Applicability">
            <p>To the extent the Foundation processes personal data of Users in the European Economic Area (EEA), it does so as a Data Controller within the meaning of GDPR Regulation (EU) 2016/679. The Foundation&apos;s Privacy Policy (available at humanidfi.com/legal/privacy) constitutes the Privacy Notice required by GDPR Articles 13-14 and is incorporated herein by reference.</p>
          </Clause>
          <Clause id="data-processing" title="13.2 Data Processed by the Foundation">
            <p>The Foundation processes the following categories of data: (a) Ethereum wallet addresses (pseudonymous identifiers); (b) SIWE session data (address, timestamp, domain); (c) anonymized usage analytics via privacy-preserving tools; (d) IP addresses (temporarily, for DDoS mitigation, 24-hour retention). The Foundation does not process: private keys, note contents, message contents, balance information, or identity attribute values — as these remain encrypted on-device and are never transmitted to Foundation servers.</p>
          </Clause>
          <Clause id="data-rights" title="13.3 User Rights under GDPR">
            <p>EEA Users have the following rights regarding personal data processed by the Foundation: (a) Right of Access (Art. 15); (b) Right to Rectification (Art. 16); (c) Right to Erasure (Art. 17); (d) Right to Restriction of Processing (Art. 18); (e) Right to Data Portability (Art. 20); (f) Right to Object (Art. 21). To exercise these rights, contact: dpo@HumanityLedger.pro. Response within 30 days as required by GDPR Art. 12(3).</p>
          </Clause>
        </Article>

        <Article number="14" title="Third-Party Services">
          <Clause id="third-party-links" title="14.1 Third-Party Integrations">
            <p>The Protocol integrates with third-party services including: the XMTP network (for message relay), the Ethereum blockchain (for L1 settlement), the Aztec Network (for L2 execution), WalletConnect (for wallet connections), and various public RPC providers. Your use of these third-party services is governed by their respective terms and privacy policies. The Foundation is not responsible for the availability, accuracy, or security of third-party services.</p>
          </Clause>
          <Clause id="third-party-no-endorsement" title="14.2 No Endorsement">
            <p>Any links to third-party websites or services on the Interface do not constitute an endorsement by the Foundation of such third parties or their content, products, or services. You access third-party services entirely at your own risk.</p>
          </Clause>
        </Article>

        <Article number="15" title="Dispute Resolution & Arbitration">
          <Clause id="dispute-informal" title="15.1 Informal Resolution">
            <p>Before initiating any formal legal proceedings, you agree to contact the Foundation at legal@HumanityLedger.pro and attempt to resolve the dispute informally for a period of 30 days. Many disputes can be resolved quickly through direct communication.</p>
          </Clause>
          <Clause id="dispute-arbitration" title="15.2 Binding Arbitration">
            <p>If informal resolution fails, any dispute, claim, or controversy arising out of or relating to these Terms or the Protocol shall be finally settled by binding arbitration administered by the International Chamber of Commerce (ICC) under its Rules of Arbitration. The arbitration shall be: (a) conducted by a sole arbitrator mutually agreed upon, or appointed by the ICC; (b) conducted in English; (c) seated in London, England; (d) confidential. The arbitrator&apos;s award shall be final and binding and may be entered in any court of competent jurisdiction.</p>
          </Clause>
          <Clause id="dispute-class-waiver" title="15.3 Class Action Waiver">
            <p>YOU WAIVE YOUR RIGHT TO PARTICIPATE IN CLASS ACTION LITIGATION OR CLASS-WIDE ARBITRATION. All disputes must be brought on an individual basis only. This waiver is not severable from the arbitration clause — if the class action waiver is found unenforceable, the arbitration clause shall not apply to class claims.</p>
          </Clause>
          <Clause id="dispute-exceptions" title="15.4 Arbitration Exceptions">
            <p>Notwithstanding the foregoing, either party may seek injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm pending arbitration resolution.</p>
          </Clause>
        </Article>

        <Article number="16" title="Force Majeure">
          <Clause id="fm-events" title="16.1 Force Majeure Events">
            <p>The Foundation shall not be liable for any delay or failure in performance resulting from causes beyond its reasonable control, including: (a) acts of God (earthquakes, floods, storms); (b) government actions, war, sanctions, or embargoes; (c) blockchain network outages, consensus failures, or Ethereum hard forks; (d) cyberattacks, DDoS attacks, or zero-day exploits against the Protocol or its infrastructure; (e) actions of third-party service providers (RPC providers, CDN operators); (f) pandemics or public health emergencies; (g) labor disputes or strikes affecting key service providers.</p>
          </Clause>
          <Clause id="fm-notice" title="16.2 Notice and Mitigation">
            <p>In the event of a Force Majeure Event, the Foundation will: (a) promptly notify Users via the official communication channels; (b) use commercially reasonable efforts to mitigate the impact and restore normal operations; and (c) keep Users informed of expected resolution timelines to the extent practicable.</p>
          </Clause>
        </Article>

        <Article number="17" title="Severability & Waiver">
          <Clause id="sev-severability" title="17.1 Severability">
            <p>If any provision of these Terms is found by an arbitrator or court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable, or severed from these Terms if modification is not possible. The remaining provisions shall continue in full force and effect. The invalidity of any clause shall not affect the validity of the remainder of these Terms.</p>
          </Clause>
          <Clause id="sev-waiver" title="17.2 Waiver">
            <p>No failure or delay by the Foundation in exercising any right, power, or remedy under these Terms shall operate as a waiver of that right, power, or remedy. No single or partial exercise of any right, power, or remedy shall preclude any other or further exercise thereof or the exercise of any other right, power, or remedy. No waiver by either party of any breach of these Terms shall be considered a waiver of any subsequent breach of the same or any other provision.</p>
          </Clause>
        </Article>

        <Article number="18" title="Governing Law & Jurisdiction">
          <Clause id="gov-law" title="18.1 Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions. This choice of law does not deprive Users of consumer protection rights that cannot be excluded under the mandatory law of the User&apos;s country of habitual residence.</p>
          </Clause>
          <Clause id="gov-jurisdiction" title="18.2 Jurisdiction">
            <p>Subject to the arbitration clause in Article 15, the courts of England and Wales shall have exclusive jurisdiction to resolve any dispute arising out of or in connection with these Terms that is not subject to arbitration.</p>
          </Clause>
        </Article>

        <Article number="19" title="Amendments & Notice">
          <Clause id="amend-procedure" title="19.1 Amendment Procedure">
            <p>The Foundation reserves the right to modify these Terms at any time. Material changes will be announced: (a) via a banner on the Interface; (b) via official communication channels (Telegram, Discord, Twitter/X); (c) via email to Users who have provided an email address. Non-material changes (e.g., typographical corrections, reorganization) may take effect immediately upon publication. Material changes take effect 30 days after notice, except for changes required by law which take effect immediately.</p>
          </Clause>
          <Clause id="amend-continued-use" title="19.2 Continued Use as Acceptance">
            <p>Your continued use of the Protocol after the effective date of any amendment constitutes acceptance of the modified Terms. If you do not agree to the modified Terms, you must cease using the Protocol before the effective date of the change.</p>
          </Clause>
        </Article>

        <Article number="20" title="Entire Agreement">
          <Clause id="entire-agreement" title="20.1 Complete Agreement">
            <p>These Terms, together with the Privacy Policy, Cookie Policy, and any other policies expressly incorporated by reference, constitute the entire agreement between you and the Foundation regarding your use of the Protocol and supersede all prior and contemporaneous agreements, understandings, negotiations, and communications, whether oral or written, relating to the subject matter hereof.</p>
          </Clause>
          <Clause id="entire-no-third-party" title="20.2 No Third-Party Beneficiaries">
            <p>These Terms do not create any third-party beneficiary rights. Only the parties to these Terms (you and the Foundation) have rights and obligations under this Agreement.</p>
          </Clause>
          <Clause id="entire-contact" title="20.3 Contact">
            <p>For legal inquiries: legal@HumanityLedger.pro | For data protection: dpo@HumanityLedger.pro | For security reports: security@HumanityLedger.pro</p>
          </Clause>
        </Article>

        <SectionDivider />
        <div className="bg-gray-50 rounded-2xl p-8 text-sm text-gray-500 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700 mb-1">Document Information</p>
              <p>Document Version: 3.2.0</p>
              <p>Effective Date: 18 August 2026</p>
              <p>Last Revised: 18 August 2026</p>
              <p>Next Scheduled Review: 18 February 2027</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">Legal Entity</p>
              <p>Humanity Ledger Foundation</p>
              <p>Governing Law: England & Wales</p>
              <p>Arbitration: ICC Rules, London</p>
              <p>Contact: legal@HumanityLedger.pro</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 pt-4 border-t border-gray-200">
            These Terms of Service are subject to change via DAO governance for Protocol-related provisions and by the Foundation for Interface-related provisions. Hash of current document: SHA-256:pending-notarization. All previous versions are archived in the public GitHub repository.
          </p>
        </div>

      </div>
    </div>
  );
}

