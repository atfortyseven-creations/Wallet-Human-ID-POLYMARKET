'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'whale-network-humanidfi-com', label: `Whale Network — humanidfi.com` },
  { id: '1-identification-of-the-parties-and-acceptance', label: `1. IDENTIFICATION OF THE PARTIES AND ACCEPTANCE` },
  { id: '2-description-of-services', label: `2. DESCRIPTION OF SERVICES` },
  { id: '3-the-qds-token', label: `3. THE $QDs TOKEN` },
  { id: '4-user-registration-and-account', label: `4. USER REGISTRATION AND ACCOUNT` },
  { id: '5-obligations-of-the-user', label: `5. OBLIGATIONS OF THE USER` },
  { id: '6-express-prohibitions', label: `6. EXPRESS PROHIBITIONS` },
  { id: '7-intellectual-property-rights', label: `7. INTELLECTUAL PROPERTY RIGHTS` },
  { id: '8-limitation-of-liability', label: `8. LIMITATION OF LIABILITY` },
  { id: '9-blockchain-technology-special-considerations', label: `9. BLOCKCHAIN TECHNOLOGY — SPECIAL CONSIDERATIONS` },
  { id: '10-restricted-jurisdictions', label: `10. RESTRICTED JURISDICTIONS` },
  { id: '11-amendments-to-the-terms', label: `11. AMENDMENTS TO THE TERMS` },
  { id: '12-duration-and-termination', label: `12. DURATION AND TERMINATION` },
  { id: '13-severability', label: `13. SEVERABILITY` },
  { id: '14-governing-law-and-jurisdiction', label: `14. GOVERNING LAW AND JURISDICTION` },
  { id: '15-contact-and-complaints', label: `15. CONTACT AND COMPLAINTS` }
];

export default function LegalPage() {
  return (
    <LegalDocLayout
      title="Terms of Service"
      subtitle="This policy sets forth the legal and compliance rules governing the Whale Network ecosystem."
      lastUpdated="June 2026"
      category="Legal"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="whale-network-humanidfi-com">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Whale Network — humanidfi.com
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">Humanity Ledger S.L.</h3>
            <p>
              <strong className="text-black font-semibold">Version:</strong> 2.0 (English) | <strong className="text-black font-semibold">Date:</strong> 6 June 2026 | <strong className="text-black font-semibold">Entry into Force:</strong> Upon publication on the website
            </p>
            <div className="bg-black/5 p-4 rounded-lg font-medium border-l-4 border-black">
              <strong>MANDATORY LEGAL WARNING (MiCA Art. 6):</strong> The acquisition of the $QDs token entails significant financial risks. It is possible to lose the entirety of the capital invested. The $QDs token is not covered by deposit guarantee schemes established pursuant to Directive 2014/49/EU. The $QDs token is not covered by investor compensation schemes established pursuant to Directive 97/9/EC. This crypto-asset has not been verified or approved by the Comisión Nacional del Mercado de Valores (CNMV) or any other competent authority of a Member State of the European Union. Please read this document and the Whitepaper in full before making any acquisition decision.
            </div>
          </div>
        </section>


        {/* 2 */}
        <section id="1-identification-of-the-parties-and-acceptance">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. IDENTIFICATION OF THE PARTIES AND ACCEPTANCE
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">1.1 Parties to the Agreement</h3>
            <p>
              This document governs the contractual relationship between:
            </p>
            <p>
              <strong className="text-black font-semibold">HUMANITY LEDGER S.L.</strong> (hereinafter "Humanity Ledger", "the Company" or "the Service Provider")
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Private Limited Liability Company (Sociedad de Responsabilidad Limitada) incorporated under Spanish law</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Tax Identification Number (NIF): [PENDING — upon completion of incorporation]</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Registered Office: [PENDING — Sagunto, Province of Valencia, Kingdom of Spain]</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Email: legal@humanidfi.com</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Website: https://humanidfi.com</span></li>
            </ul>
            <p>
              <strong className="text-black font-semibold">THE USER</strong> (hereinafter "the User" or "you")
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Any natural person aged 18 years or older, or any legal entity, that accesses, browses, or uses the services of Whale Network.</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">1.2 Acceptance</h3>
            <p>
              Access to the services of the Whale Network platform constitutes the User's <strong className="text-black font-semibold">express, informed, and unreserved acceptance</strong> of these Terms and Conditions, as well as of the Privacy Policy, the Cookie Policy, and the Legal Notice. If you do not agree with any of these documents, you must refrain from using the platform.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">1.3 Legal Capacity</h3>
            <p>
              By accepting these Terms, the User represents and warrants that:
            </p>
            <p>
              a) They are aged 18 years or older; b) They possess full legal capacity to enter into binding agreements; c) They are not subject to international economic sanctions (OFAC, European Union, or United Nations); d) They are not a citizen or resident of the United States of America; e) They are not domiciled in a jurisdiction where the use of crypto-asset services is legally prohibited; and f) They are acting on their own behalf and not on behalf of any undisclosed third party.
            </p>
          </div>
        </section>


        {/* 3 */}
        <section id="2-description-of-services">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. DESCRIPTION OF SERVICES
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">2.1 Whale Network — Digital Identity and Privacy Infrastructure Platform</h3>
            <p>
              Whale Network is a technological infrastructure protocol built on <strong className="text-black font-semibold">Aztec Network</strong> (a ZK-rollup Layer 2 blockchain network on Ethereum) that provides the following services:
            </p>
            <p>
              <strong className="text-black font-semibold">2.1.1 Private Premium Dashboard.</strong> A personalised control panel for the management of your digital assets and activity on the Aztec Network. All portfolio data is processed locally on the user's device through Aztec Network's Private Execution Environment (PXE). Humanity Ledger S.L. has no technical access to this data at any time.
            </p>
            <p>
              <strong className="text-black font-semibold">2.1.2 Whale Chat — End-to-End Encrypted Messaging.</strong> An inter-wallet messaging service with end-to-end encryption (E2EE). Cryptographic keys are derived from the user's private wallet. Humanity Ledger S.L. has no technical capacity to access the content of any communication.
            </p>
            <p>
              <strong className="text-black font-semibold">2.1.3 Claim Identity — Decentralised Digital Identities.</strong> A module for the creation and management of decentralised digital identities (DIDs), verified by means of zero-knowledge proofs (ZKPs). This service enables users to demonstrate identity attributes — such as age of majority, place of residence, or solvency — without disclosing the underlying personal data to any third party.
            </p>
            <p>
              <strong className="text-black font-semibold">2.1.4 Studio Provenance — Digital Product Passport.</strong> An authenticity and traceability registry for physical and digital assets. Enables the issuance of certificates of authenticity linked to on-chain records or non-fungible tokens (NFTs).
            </p>
            <p>
              <strong className="text-black font-semibold">2.1.5 Humanity Ledger Registry.</strong> A decentralised registry of verified identities and assets on the Whale Network. Functions as a directory of wallets holding accredited KYC credentials issued through the platform.
            </p>
            <p>
              <strong className="text-black font-semibold">2.1.6 Private Portfolio.</strong> A multi-chain asset balance and transaction history tracking tool, processed entirely on a local basis. No server operated by Humanity Ledger S.L. accesses the user's complete portfolio data.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">2.2 Service Availability</h3>
            <p>
              Humanity Ledger S.L. shall use all reasonable means to ensure the availability of the services but does not guarantee 100% uninterrupted availability. Interruptions may occur due to maintenance, technical failures, force majeure events, or disruptions in third-party networks (Aztec Network, Ethereum).
            </p>
          </div>
        </section>


        {/* 4 */}
        <section id="3-the-qds-token">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. THE $QDs TOKEN
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">3.1 Nature and Classification</h3>
            <p>
              The $QDs token (Quantum Digital Signature Token) is a <strong className="text-black font-semibold">utility token</strong> classified as a crypto-asset pursuant to Article 3(1)(5) of Regulation (EU) 2023/1114 (MiCA). It provides exclusively functional access to the premium services of Whale Network described in Clause 2.
            </p>
            <p>
              <strong className="text-black font-semibold">The $QDs token is NOT, under any circumstances:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>A financial instrument within the meaning of MiFID II (Directive 2014/65/EU);</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>A participation in the share capital of Humanity Ledger S.L.;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>An entitlement to dividends, profits, or distributions of earnings;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>An asset-referenced token (ART) or an electronic money token (EMT);</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>A guarantee of return or a safe investment;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>A bank deposit or any financial product protected by guarantee funds.</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">3.1 bis Exemption from CASP Status (MiCA Title V)</h3>
            <p>
              Humanity Ledger S.L. acts exclusively as the issuer of the $QDs token (within the scope of MiCA Title II) and as a software developer (operating a non-custodial protocol). <strong className="text-black font-semibold">Humanity Ledger S.L. is NOT a Crypto-Asset Service Provider (CASP)</strong> within the meaning of Title V of the MiCA Regulation.
            </p>
            <p>
              Pursuant to Recital 22 of MiCA, CASP obligations do not apply to services provided in a fully decentralised manner without intermediaries. As Whale Network is a ZK-rollup protocol over which users retain absolute, non-custodial control of their private keys, the Company does not provide custody services, does not execute orders on behalf of third parties, and does not manage crypto-asset portfolios.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">3.2 Technical Characteristics</h3>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Parameter</td>
                <td className="px-4 py-2 border-r border-black/10">Value</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Name</td>
                <td className="px-4 py-2 border-r border-black/10">Quantum Digital Signature Token</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Symbol</td>
                <td className="px-4 py-2 border-r border-black/10">QDs</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Maximum Supply</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>210,000,000 QDs — FIXED AND IMMUTABLE (Noir contract)</strong></td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Network</td>
                <td className="px-4 py-2 border-r border-black/10">Aztec Network (ZK-rollup L2 on Ethereum)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Standard</td>
                <td className="px-4 py-2 border-r border-black/10">Noir native token (Aztec Network) — not an ERC-20 token; no Ethereum L1 contract</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Token Generation Event (TGE)</td>
                <td className="px-4 py-2 border-r border-black/10">1 January 2027</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Contract Address</td>
                <td className="px-4 py-2 border-r border-black/10">[PENDING — post-mainnet deployment]</td>
              </tr>
            </tbody></table></div>
            <p>
              The maximum supply of 210,000,000 QDs is definitive and immutable by design of the Noir smart contract deployed on Aztec Network. There is no technical possibility of issuing additional tokens beyond this hard cap.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">3.3 How to Obtain $QDs</h3>
            <p>
              The $QDs tokens may be obtained through:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The initial public offering available at https://humanidfi.com from 1 January 2027;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Decentralised exchanges (DEXs) compatible with Aztec Network;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Centralised exchanges (CEXs) where $QDs is admitted to trading; or</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Ecosystem rewards (subject to satisfaction of the applicable programme requirements).</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">3.4 Use of $QDs to Access Services</h3>
            <p>
              $QDs holders may use their tokens to access the premium services of Whale Network in accordance with the access model in force from time to time, as published at https://humanidfi.com. The access model may evolve subject to prior notification to Users of at least 30 days.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">3.5 Right of Withdrawal (MiCA Art. 13)</h3>
            <p>
              <strong className="text-black font-semibold">If you are a consumer (natural person)</strong>, you have the right to withdraw from the acquisition of $QDs in the initial public offering of Humanity Ledger S.L. within <strong className="text-black font-semibold">14 calendar days</strong> from the date of acquisition, without the need for justification, provided that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The acquisition was made directly through humanidfi.com;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The price of the token has not fluctuated by more than 10% since the date of acquisition (in which case the right of withdrawal may not apply — please consult the applicable legislation and the Whitepaper); and</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>A written withdrawal request is sent to legal@humanidfi.com before the expiry of the period.</span></li>
            </ul>
            <p>
              The right of withdrawal does not apply to acquisitions made on secondary markets (DEX or CEX exchanges).
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">3.6 Risks Associated with the Token</h3>
            <p>
              The User expressly acknowledges and accepts that:
            </p>
            <p>
              a) The price of the $QDs token may fluctuate significantly and unpredictably; b) The price may fall to zero; c) There may be no liquid market for the sale of $QDs in the future; d) The acquisition of $QDs entails the risk of total loss of the capital invested; e) Past performance does not guarantee future results; f) The token may be adversely affected by changes in the regulatory environment; and g) There are technological risks inherent to blockchain networks and smart contracts.
            </p>
          </div>
        </section>


        {/* 5 */}
        <section id="4-user-registration-and-account">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. USER REGISTRATION AND ACCOUNT
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.1 Account Creation</h3>
            <p>
              To access the services of Whale Network, the User must: 1. Connect a wallet compatible with Aztec Network; 2. Accept these Terms and Conditions; and 3. Complete the identity verification process (KYC) when required by applicable AML regulations.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.2 Account Security</h3>
            <p>
              The User is solely responsible for the security of their wallet and private keys. Humanity Ledger S.L. will <strong className="text-black font-semibold">never</strong> request the User's private key, seed phrase, or any other wallet access credential.
            </p>
            <p>
              <strong className="text-black font-semibold">IMPORTANT:</strong> If you lose access to your wallet (private key or seed phrase), Humanity Ledger S.L. cannot recover your assets. Loss of private keys results in the irrecoverable loss of the $QDs tokens and any other assets associated with that wallet.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.3 Accuracy of Data</h3>
            <p>
              The User undertakes to provide truthful, current, and complete data during the registration and KYC process. The provision of false or misleading data may result in the immediate cancellation of the account and notification to the competent authorities where legally required.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.4 Deregistration</h3>
            <p>
              The User may request deregistration of their account at any time by sending a request to legal@humanidfi.com. Deregistration shall not affect the $QDs tokens held in the User's wallet, which shall remain under their control. However, the User will lose access to the premium services of the platform.
            </p>
          </div>
        </section>


        {/* 6 */}
        <section id="5-obligations-of-the-user">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. OBLIGATIONS OF THE USER
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The User undertakes to:
            </p>
            <p>
              a) Use the Whale Network services in a lawful manner and in accordance with these Terms; b) Complete the KYC process when required by applicable AML regulations; c) Provide the information required by the Travel Rule (FATF Recommendation 16) for transactions of €1,000 or more; d) Comply with their applicable tax obligations in their jurisdiction of residence, including the declaration of crypto-asset holdings and any resulting capital gains or losses; e) Acknowledge that, pursuant to the case-law of the Court of Justice of the European Union and the Spanish Directorate-General of Taxation (DGT), the acquisition of utility tokens conferring access to a future digital service may be subject to Value Added Tax (VAT) at the standard rate (currently 21% in Spain), and to provide accurate data for proper invoicing purposes where applicable; f) Refrain from using the platform for any unlawful activities; and g) Notify Humanity Ledger S.L. promptly of any unauthorised use of their account.
            </p>
          </div>
        </section>


        {/* 7 */}
        <section id="6-express-prohibitions">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. EXPRESS PROHIBITIONS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The following uses of Whale Network are <strong className="text-black font-semibold">absolutely prohibited</strong>:
            </p>
            <p>
              a) <strong className="text-black font-semibold">Money laundering or terrorist financing</strong> — activities criminalised under Law 10/2010 and the Spanish Criminal Code; b) <strong className="text-black font-semibold">Tax evasion or tax fraud</strong> of any kind; c) <strong className="text-black font-semibold">Circumvention of international sanctions</strong> — access to the platform by any person subject to OFAC, EU, or UN sanctions; d) <strong className="text-black font-semibold">Activities in prohibited jurisdictions</strong> — access from or to jurisdictions where crypto-asset services are legally prohibited, including the United States of America; e) <strong className="text-black font-semibold">Use by minors</strong> — use by persons under the age of 18 is strictly prohibited; f) <strong className="text-black font-semibold">Market manipulation</strong> — any activity designed to artificially manipulate the price of the $QDs token; g) <strong className="text-black font-semibold">Phishing or identity impersonation</strong> — impersonating Humanity Ledger S.L. or any other User; h) <strong className="text-black font-semibold">Cyberattacks</strong> — any attempt at unauthorised access, malicious code injection, DoS/DDoS attacks, or any other attack on the platform's infrastructure; and i) <strong className="text-black font-semibold">Activities contrary to public order</strong> — any activity that infringes public order, public morality, or good faith.
            </p>
            <p>
              Breach of any of these prohibitions may result in the immediate suspension or cancellation of the User's account, without prejudice to any civil or criminal legal actions that may be applicable.
            </p>
          </div>
        </section>


        {/* 8 */}
        <section id="7-intellectual-property-rights">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            7. INTELLECTUAL PROPERTY RIGHTS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">7.1 Ownership</h3>
            <p>
              All intellectual and industrial property rights in the Whale Network platform, including its design, source code, interfaces, logos, trade marks, texts, and any other content, are the property of Humanity Ledger S.L. or its licensors.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">7.2 Licence of Use</h3>
            <p>
              Humanity Ledger S.L. grants the User a <strong className="text-black font-semibold">non-exclusive, non-transferable, limited, and revocable</strong> licence to access and use the Whale Network services exclusively for lawful personal or professional purposes, in accordance with these Terms.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">7.3 Open-Source Components</h3>
            <p>
              The Humanity Ledger protocol maintains open-source repositories at https://github.com/humanityledger/Humanity-Ledger. Use of any code in those repositories is subject to the licence specified therein.
            </p>
          </div>
        </section>


        {/* 9 */}
        <section id="8-limitation-of-liability">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            8. LIMITATION OF LIABILITY
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">8.1 General Disclaimer</h3>
            <p>
              To the fullest extent permitted by applicable law, Humanity Ledger S.L. shall not be liable for:
            </p>
            <p>
              a) Losses or damages arising from the fluctuation or depreciation in value of the $QDs token; b) Losses or damages arising from failures or interruptions in the Aztec Network or Ethereum; c) Losses arising from the loss or theft of private keys or wallets; d) Damages arising from undetected vulnerabilities in smart contracts, even post-audit; e) Losses arising from the inability to execute transactions during periods of network congestion; f) Any indirect, special, incidental, consequential, or punitive damages of any nature; or g) Acts or omissions of third parties (service providers, exchanges, DeFi protocols).
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">8.2 Maximum Liability Cap</h3>
            <p>
              Without prejudice to the foregoing, in the event that Humanity Ledger S.L. is found liable for any damage, the Company's total maximum liability to the User shall not exceed the <strong className="text-black font-semibold">amount paid by the User to Humanity Ledger S.L. during the 12 months preceding the event giving rise to the damage</strong>.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">8.3 Consumer Protections</h3>
            <p>
              Nothing in this clause limits the rights conferred upon Users who qualify as consumers under Spanish consumer protection legislation, including Royal Legislative Decree 1/2007.
            </p>
          </div>
        </section>


        {/* 10 */}
        <section id="9-blockchain-technology-special-considerations">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            9. BLOCKCHAIN TECHNOLOGY — SPECIAL CONSIDERATIONS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The User acknowledges and accepts the following characteristics inherent to blockchain technology:
            </p>
            <p>
              a) <strong className="text-black font-semibold">Irreversibility:</strong> Transactions confirmed on the blockchain are permanent and irreversible. It is not possible to reverse, cancel, or modify a confirmed transaction.
            </p>
            <p>
              b) <strong className="text-black font-semibold">Immutability:</strong> Data recorded on-chain is immutable. The right to erasure under the GDPR cannot technically be applied to data recorded on the blockchain.
            </p>
            <p>
              c) <strong className="text-black font-semibold">Decentralisation:</strong> Aztec Network and Ethereum are decentralised networks. Humanity Ledger S.L. does not control those networks and cannot guarantee their uninterrupted operation.
            </p>
            <p>
              d) <strong className="text-black font-semibold">Risk of Network Forks:</strong> In the event of a fork of the Aztec Network or Ethereum, Humanity Ledger S.L. does not guarantee the compatibility of the $QDs token with any resulting version of the network.
            </p>
            <p>
              e) <strong className="text-black font-semibold">Selective Privacy:</strong> Transactions on Aztec Network are private by default from the general public, but may be audited by competent authorities acting under a lawful mandate by means of viewing keys, as required by law.
            </p>
          </div>
        </section>


        {/* 11 */}
        <section id="10-restricted-jurisdictions">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            10. RESTRICTED JURISDICTIONS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The services of Whale Network are not available to:
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Jurisdictions / Persons</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Excluded Country</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>United States of America</strong> (citizens and residents)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">OFAC Sanctions</td>
                <td className="px-4 py-2 border-r border-black/10">Persons or entities on OFAC (USA) sanctions lists</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">EU Sanctions</td>
                <td className="px-4 py-2 border-r border-black/10">Persons or entities on European Union sanctions lists</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">UN Sanctions</td>
                <td className="px-4 py-2 border-r border-black/10">Persons or entities on UN Security Council sanctions lists</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Prohibited Jurisdictions</td>
                <td className="px-4 py-2 border-r border-black/10">Any country where the use of crypto-asset services is legally prohibited</td>
              </tr>
            </tbody></table></div>
            <p>
              The User is solely responsible for determining whether they may lawfully use the Whale Network services in their jurisdiction of residence.
            </p>
          </div>
        </section>


        {/* 12 */}
        <section id="11-amendments-to-the-terms">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            11. AMENDMENTS TO THE TERMS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. may amend these Terms and Conditions. Material amendments shall be notified to registered Users at least <strong className="text-black font-semibold">30 calendar days in advance</strong> by email and/or by a prominent notice on the platform. Continued use of the services after the amended Terms enter into force shall constitute acceptance thereof. If the User does not accept the amendments, they may deregister in accordance with Clause 4.4.
            </p>
          </div>
        </section>


        {/* 13 */}
        <section id="12-duration-and-termination">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            12. DURATION AND TERMINATION
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">12.1 Duration</h3>
            <p>
              These Terms enter into force upon their publication on the Website and remain in force for an indefinite period, until amended or superseded by a subsequent version.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">12.2 Termination by the User</h3>
            <p>
              The User may cease using the services at any time by requesting deregistration of their account.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">12.3 Termination by Humanity Ledger S.L.</h3>
            <p>
              Humanity Ledger S.L. may suspend or cancel a User's access to the services, with or without prior notice, in the event of:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Breach of these Terms;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Illegal or suspicious activities;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>An order or requirement from a competent authority; or</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>A permanent cessation of the Company's activities.</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">12.4 Effects of Termination</h3>
            <p>
              Termination of the contractual relationship shall not affect the User's $QDs tokens held in their wallet, which shall remain under their exclusive control.
            </p>
          </div>
        </section>


        {/* 14 */}
        <section id="13-severability">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            13. SEVERABILITY
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              If any provision of these Terms is declared null, void, or unenforceable by a final judicial or administrative decision, that provision shall be deemed not to have been written, without affecting the validity and enforceability of the remaining provisions.
            </p>
          </div>
        </section>


        {/* 15 */}
        <section id="14-governing-law-and-jurisdiction">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            14. GOVERNING LAW AND JURISDICTION
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              These Terms and Conditions are governed by Spanish law, in particular Regulation (EU) 2023/1114 (MiCA), Royal Legislative Decree 1/2007, Law 34/2002 (LSSI-CE), and any other applicable regulations.
            </p>
            <p>
              For the resolution of any dispute arising from or related to these Terms, the parties hereby submit to the exclusive jurisdiction of the <strong className="text-black font-semibold">Courts and Tribunals of the city of Valencia (Spain)</strong>, waiving any other jurisdiction to which they may be entitled, without prejudice to the rights conferred upon Users by applicable consumer protection legislation in their place of residence.
            </p>
          </div>
        </section>


        {/* 16 */}
        <section id="15-contact-and-complaints">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            15. CONTACT AND COMPLAINTS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              For any queries, doubts, or complaints:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">General email:</strong> legal@humanidfi.com</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Response period:</strong> 30 business days from receipt</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">For the exercise of GDPR rights:</strong> legal@humanidfi.com</span></li>
            </ul>
            <p>
              <em>© 2026 Humanity Ledger S.L. — All Rights Reserved.</em> <em>Last Updated: 6 June 2026</em>
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
