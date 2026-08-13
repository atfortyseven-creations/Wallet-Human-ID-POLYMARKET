'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'table-of-contents', label: `TABLE OF CONTENTS` },
  { id: '1-data-controller', label: `1. DATA CONTROLLER` },
  { id: '2-definitions', label: `2. DEFINITIONS` },
  { id: '3-scope-of-application', label: `3. SCOPE OF APPLICATION` },
  { id: '4-data-we-process-and-purposes-of-processing', label: `4. DATA WE PROCESS AND PURPOSES OF PROCESSING` },
  { id: '5-retention-periods', label: `5. RETENTION PERIODS` },
  { id: '6-recipients-and-data-processors', label: `6. RECIPIENTS AND DATA PROCESSORS` },
  { id: '7-international-transfers-of-personal-data', label: `7. INTERNATIONAL TRANSFERS OF PERSONAL DATA` },
  { id: '8-data-subject-rights', label: `8. DATA SUBJECT RIGHTS` },
  { id: '9-special-section-blockchain-data-and-immutability', label: `9. SPECIAL SECTION: BLOCKCHAIN DATA AND IMMUTABILITY` },
  { id: '10-special-section-zero knowledge-proofs-and-privacy-by-design', label: `10. SPECIAL SECTION: ZERO-KNOWLEDGE PROOFS AND PRIVACY BY DESIGN` },
  { id: '11-data-security', label: `11. DATA SECURITY` },
  { id: '12-cookies-and-tracking-technologies', label: `12. COOKIES AND TRACKING TECHNOLOGIES` },
  { id: '13-automated-decision-making-and-profiling', label: `13. AUTOMATED DECISION-MAKING AND PROFILING` },
  { id: '14-data-protection-officer-dpo', label: `14. DATA PROTECTION OFFICER (DPO)` },
  { id: '15-complaints-to-the-supervisory-authority', label: `15. COMPLAINTS TO THE SUPERVISORY AUTHORITY` },
  { id: '16-updates-to-this-privacy-policy', label: `16. UPDATES TO THIS PRIVACY POLICY` },
  { id: '17-contact', label: `17. CONTACT` }
];

export default function LegalPage() {
  return (
    <LegalDocLayout
      title="Privacy Policy"
      subtitle="This policy sets forth the legal and attestation rules governing the Humanity Ledger ecosystem."
      lastUpdated="26 July 2026"
      category="Legal"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* CYPHERPUNK MANIFESTO / ABSOLUTE PRIVACY GUARANTEE */}
        <div className="p-6 bg-black text-white font-mono text-sm border border-black shadow-2xl rounded-xl">
          <p className="font-bold text-emerald-400 uppercase tracking-widest mb-2">Absolute Privacy Guarantee</p>
          <p>
            Humanity Ledger is structurally incapable of collecting user state. Data is sealed via SNARKs before reaching any network layer. Privacy is not a feature; it is an unalienable cryptographic right.
          </p>
        </div>

        {/* 1 */}
        <section id="table-of-contents">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            TABLE OF CONTENTS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              1. <a href="#1-data-controller" className="text-black underline underline-offset-2">Data Controller</a> 2. <a href="#2-definitions" className="text-black underline underline-offset-2">Definitions</a> 3. <a href="#3-scope-of-application" className="text-black underline underline-offset-2">Scope of Application</a> 4. <a href="#4-data-we-process-and-purposes-of-processing" className="text-black underline underline-offset-2">Data We Process and Purposes of Processing</a>
            </p>
            <ul className="space-y-2 pl-5">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>4.1 Registration and User Account Data</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>4.2 KYC/AML Data (Identity Verification and Anti-Money Laundering)</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>4.3 Blockchain Transaction Data</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>4.4 Technical and Browsing Data</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>4.5 Tax Data for DAC8 Reporting</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>4.6 Support and Complaints Management Data</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>4.7 Commercial Communications and Marketing</span></li>
            </ul>
            <p>
              5. <a href="#5-retention-periods" className="text-black underline underline-offset-2">Retention Periods</a> 6. <a href="#6-recipients-and-data-processors" className="text-black underline underline-offset-2">Recipients and Data Processors</a> 7. <a href="#7-international-transfers-of-personal-data" className="text-black underline underline-offset-2">International Transfers of Personal Data</a> 8. <a href="#8-data-subject-rights" className="text-black underline underline-offset-2">Data Subject Rights</a> 9. <a href="#9-special-section-blockchain-data-and-immutability" className="text-black underline underline-offset-2">Special Section: Blockchain Data and Immutability</a> 10. <a href="#10-special-section-zero knowledge-proofs-and-privacy-by-design" className="text-black underline underline-offset-2">Special Section: Zero Knowledge Proofs and Privacy by Design</a> 11. <a href="#11-data-security" className="text-black underline underline-offset-2">Data Security</a> 12. <a href="#12-cookies-and-tracking-technologies" className="text-black underline underline-offset-2">Cookies and Tracking Technologies</a> 13. <a href="#13-automated-decision-making-and-profiling" className="text-black underline underline-offset-2">Automated Decision-Making and Profiling</a> 14. <a href="#14-data-protection-officer-dpo" className="text-black underline underline-offset-2">Data Protection Officer (DPO)</a> 15. <a href="#15-complaints-to-the-supervisory-authority" className="text-black underline underline-offset-2">Complaints to the Supervisory Authority</a> 16. <a href="#16-updates-to-this-privacy-policy" className="text-black underline underline-offset-2">Updates to this Privacy Policy</a> 17. <a href="#17-contact" className="text-black underline underline-offset-2">Contact</a>
            </p>
          </div>
        </section>


        {/* 2 */}
        <section id="1-data-controller">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. DATA CONTROLLER
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In accordance with Article 13 of the GDPR, we hereby inform you that the Data Controller for the processing of your personal data is:
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Field</td>
                <td className="px-4 py-2 border-r border-black/10">Details</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Corporate Name</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Humanity Ledger S.L.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Legal Form</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Sociedad de Responsabilidad Limitada (Private Limited Liability Company), in process of incorporation</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Tax Identification Number (NIF)</strong></td>
                <td className="px-4 py-2 border-r border-black/10">[PENDING, NIF pending registration]</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Registered Office</strong></td>
                <td className="px-4 py-2 border-r border-black/10">[PENDING, exact address in Sagunto, Province of Valencia, Kingdom of Spain]</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Contact Email</strong></td>
                <td className="px-4 py-2 border-r border-black/10">legal@humanidfi.com</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Website</strong></td>
                <td className="px-4 py-2 border-r border-black/10">https://humanidfi.com</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Platform</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Humanity Ledger</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Token</strong></td>
                <td className="px-4 py-2 border-r border-black/10">$QDs (Quantum Digital Signature Token)</td>
              </tr>
            </tbody></table></div>
            <p>
              Humanity Ledger S.L. acts as the <strong className="text-black font-semibold">data controller</strong> with respect to the personal data that you provide to us or that we generate as a result of your use of the Humanity Ledger platform, subject to the specific technical qualifications described in Sections 9 and 10 of this document in relation to data processed in decentralised environments.
            </p>
          </div>
        </section>


        {/* 3 */}
        <section id="2-definitions">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. DEFINITIONS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              For the purposes of this Privacy Policy, and in accordance with Article 4 of the GDPR, the following terms shall have the meanings assigned to them below:
            </p>
            <p>
              <strong className="text-black font-semibold">2.1. "Personal Data":</strong> Any information relating to an identified or identifiable natural person (the "data subject"); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that natural person.
            </p>
            <p>
              <strong className="text-black font-semibold">2.2. "Processing":</strong> Any operation or set of operations which is performed on personal data or sets of personal data, whether or not by automated means, such as collection, recording, organisation, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure, or destruction.
            </p>
            <p>
              <strong className="text-black font-semibold">2.3. "Data Controller":</strong> The natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the processing of personal data; in the present case, Humanity Ledger S.L.
            </p>
            <p>
              <strong className="text-black font-semibold">2.4. "Data Processor":</strong> A natural or legal person, public authority, agency, or other body which processes personal data on behalf of the data controller.
            </p>
            <p>
              <strong className="text-black font-semibold">2.5. "Data Subject":</strong> The User of the Humanity Ledger platform whose personal data is subject to processing.
            </p>
            <p>
              <strong className="text-black font-semibold">2.6. "Consent":</strong> Any freely given, specific, informed, and unambiguous indication of the data subject's wishes by which they, through a statement or a clear affirmative action, signify agreement to the processing of personal data relating to them.
            </p>
            <p>
              <strong className="text-black font-semibold">2.7. "Zero Knowledge Proof (ZKP)":</strong> A cryptographic protocol that allows one party (the prover) to demonstrate to another (the verifier) that they know a value or that a certain assertion is true, without conveying any information beyond the truth of the assertion itself.
            </p>
            <p>
              <strong className="text-black font-semibold">2.8. "Private Execution Environment (PXE)":</strong> Aztec Network's private local execution environment, which generates ZK proofs locally on the user's device without transmitting the underlying data to any external server.
            </p>
            <p>
              <strong className="text-black font-semibold">2.9. "Blockchain":</strong> A distributed, immutable ledger of cryptographically linked transactions structured in blocks. In the context of this Policy, this refers to Aztec Network (a ZK-rollup Layer 2 on Ethereum) and Ethereum Mainnet.
            </p>
            <p>
              <strong className="text-black font-semibold">2.10. "Decentralised Identifier (DID)":</strong> A decentralised identifier compliant with the W3C DID Core 1.0 standard, which allows the user to control their digital identity without reliance on a centralised authority.
            </p>
            <p>
              <strong className="text-black font-semibold">2.11. "Viewing Key":</strong> A cryptographic key that allows an authorised recipient, in particular, regulatory authorities, to inspect encrypted transactions on the Aztec Network blockchain, without compromising the general privacy of the user vis-à-vis unauthorised third parties.
            </p>
          </div>
        </section>


        {/* 4 */}
        <section id="3-scope-of-application">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. SCOPE OF APPLICATION
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              <strong className="text-black font-semibold">3.1.</strong> This Privacy Policy applies to all personal data processed by Humanity Ledger S.L. in connection with access to and use of the Humanity Ledger platform, available at https://humanidfi.com, as well as the following services integrated into that platform:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Private Dashboard:</strong> User control panel with portfolio and activity information.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Whale Chat:</strong> End-to-end encrypted (E2EE) messaging system powered by the Extensible Message Transport Protocol (XMTP). Messages are not routed through or stored on the Aztec PXE.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Claim Identity:</strong> Service for the issuance and management of decentralised digital identities (DIDs) with ZKP verification.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Studio Provenance:</strong> Authorship and provenance registry for digital assets.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Humanity Ledger Registry:</strong> Public registry of verified identities and assets.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Private Portfolio:</strong> Portfolio asset tracking tool with enhanced privacy features.</span></li>
            </ul>
            <p>
              <strong className="text-black font-semibold">3.2.</strong> This Policy does not apply to third-party websites that you may access through links on our platform. Humanity Ledger S.L. accepts no responsibility for the privacy practices of such third parties, and we strongly encourage you to consult their respective privacy policies.
            </p>
            <p>
              <strong className="text-black font-semibold">3.3.</strong> The Humanity Ledger platform is intended for persons aged <strong className="text-black font-semibold">18 years or older</strong>. We do not knowingly collect personal data from minors. If you become aware that a minor has provided us with personal data without parental consent, please notify us at legal@humanidfi.com so that we may proceed with its immediate deletion.
            </p>
          </div>
        </section>


        {/* 5 */}
        <section id="4-data-we-process-and-purposes-of-processing">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. DATA WE PROCESS AND PURPOSES OF PROCESSING
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In accordance with the transparency principle established in Article 5(1)(a) of the GDPR and Articles 13 and 14 thereof, we hereby inform you of the categories of personal data we process, the purpose of each processing activity, and the legal basis that legitimises it.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.1. Registration and User Account Data</h3>
            <p>
              <strong className="text-black font-semibold">Categories of data processed:</strong>
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Examples</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Basic identification data</td>
                <td className="px-4 py-2 border-r border-black/10">Username or alias</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Electronic contact data</td>
                <td className="px-4 py-2 border-r border-black/10">Email address</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Blockchain identity data</td>
                <td className="px-4 py-2 border-r border-black/10">Ethereum/Aztec wallet address</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Access credentials</td>
                <td className="px-4 py-2 border-r border-black/10">Password hash, date and time of registration</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Preference data</td>
                <td className="px-4 py-2 border-r border-black/10">Account settings, language, notification preferences</td>
              </tr>
            </tbody></table></div>
            <p>
              <strong className="text-black font-semibold">Purpose of processing:</strong> Management, maintenance, and administration of the user account on the Humanity Ledger platform; verification of user identity for access to services; delivery of operational, technical, and security notices relating to the account.
            </p>
            <p>
              <strong className="text-black font-semibold">Legal basis:</strong> Article 6(1)(b) GDPR, <strong className="text-black font-semibold">Performance of a contract</strong> to which the data subject is party, or taking steps at the request of the data subject prior to entering into a contract. Account creation constitutes acceptance of our Terms and Conditions of Use, the performance of which requires the processing of these data.
            </p>
            <p>
              <strong className="text-black font-semibold">Mandatory nature:</strong> The provision of these data is <strong className="text-black font-semibold">mandatory</strong> for the use of the platform's services. Refusal to provide them will prevent the creation of an account and access to the services.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.2. KYC/AML Data (Identity Verification and Anti-Money Laundering)</h3>
            <p>
              <strong className="text-black font-semibold">Categories of data processed:</strong>
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Examples</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Identity data</td>
                <td className="px-4 py-2 border-r border-black/10">Full name, date of birth, nationality</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Identity documents</td>
                <td className="px-4 py-2 border-r border-black/10">National ID / NIE / passport number; document images</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Biometric data (for liveness verification)</td>
                <td className="px-4 py-2 border-r border-black/10">Facial image captured during the verification process</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Address data</td>
                <td className="px-4 py-2 border-r border-black/10">Full postal address; proof of address documents</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Risk profile data</td>
                <td className="px-4 py-2 border-r border-black/10">Declared source of funds, professional activity, political exposure level (PEP)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Sanctions data</td>
                <td className="px-4 py-2 border-r border-black/10">Results of checks against international sanctions lists (OFAC, EU, UN)</td>
              </tr>
            </tbody></table></div>
            <p>
              <strong className="text-black font-semibold">Purpose of processing:</strong> Attestation with the customer due diligence obligations established in Law 10/2010 of 28 April on the prevention of money laundering and terrorist financing, and its implementing regulation approved by Royal Decree 304/2014; verification of user identity (Know Your Customer, KYC); AML risk profile assessment; detection and prevention of suspicious transactions; reporting to SEPBLAC in the legally established circumstances.
            </p>
            <p>
              <strong className="text-black font-semibold">Legal basis:</strong> Article 6(1)(c) GDPR, <strong className="text-black font-semibold">Attestation with a legal obligation</strong> applicable to the data controller, in particular Law 10/2010 and Royal Decree 304/2014. With regard to biometric data, which constitute a special category of data pursuant to Article 9 GDPR, the legal basis is Article 9(2)(g) GDPR, in conjunction with Article 9(2)(b), for reasons of substantial public interest and attestation with legal obligations.
            </p>
            <p>
              <strong className="text-black font-semibold">Mandatory nature:</strong> The provision of these data is <strong className="text-black font-semibold">legally mandatory</strong>. Refusal to provide KYC/AML data will prevent access to certain platform functionalities subject to regulatory thresholds, as well as the execution of transactions that exceed the limits established by applicable regulations.
            </p>
            <div className="bg-black/5 p-4 rounded-lg font-medium border-l-4 border-black">
              <strong>Note on biometric data:</strong> Biometric data collected during the KYC verification process are processed exclusively by our specialist identity verification providers (identified in Section 6) and are not permanently stored in Humanity Ledger S.L.'s systems. The outcome of the verification process (approved/rejected and risk level) is retained by Humanity Ledger S.L. in attestation with AML regulations.
            </div>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.3. Blockchain Transaction Data</h3>
            <p>
              <strong className="text-black font-semibold">Categories of data processed:</strong>
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Description</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Transaction identifiers</td>
                <td className="px-4 py-2 border-r border-black/10">Transaction hash, block number, timestamp</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Transaction data</td>
                <td className="px-4 py-2 border-r border-black/10">Origin and destination addresses, transaction amount, asset type</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Activity history</td>
                <td className="px-4 py-2 border-r border-black/10">Chronological record of transactions executed on the platform</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Smart contract data</td>
                <td className="px-4 py-2 border-r border-black/10">Interactions with the platform's smart contracts</td>
              </tr>
            </tbody></table></div>
            <p>
              <strong className="text-black font-semibold">Purpose of processing:</strong> Recording and indexing of transactions carried out by the user on the Humanity Ledger platform for the purposes of: (i) providing the user with information on their activity history; (ii) ensuring the integrity and irrevocability of transactions; (iii) complying with transaction monitoring obligations under AML regulations; and (iv) supporting the Private Portfolio and Dashboard functionalities.
            </p>
            <p>
              <strong className="text-black font-semibold">Legal basis:</strong> Article 6(1)(f) GDPR, <strong className="text-black font-semibold">Legitimate interests</strong> of Humanity Ledger S.L., consisting in ensuring the operational integrity of the platform, maintaining a reliable record of executed transactions, and meeting the contractual expectations of users. This interest has been balanced against the rights and interests of users and found to be proportionate given that: (a) users have a reasonable expectation that their transactions will be recorded, as this is inherent to the nature of blockchain networks; and (b) Aztec Network's ZKP architecture ensures that the user's private transactions are not readable by Humanity Ledger S.L. without the corresponding viewing key.
            </p>
            <p>
              <strong className="text-black font-semibold">Relevant technical note:</strong> Transactions recorded on public blockchain networks (including Ethereum Mainnet) are <strong className="text-black font-semibold">public and immutable by their technical nature</strong>. Please refer to Section 9 for a detailed analysis of the implications of this circumstance in relation to data protection rights, in particular the right to erasure.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.4. Technical and Browsing Data</h3>
            <p>
              <strong className="text-black font-semibold">Categories of data processed:</strong>
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Examples</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Network data</td>
                <td className="px-4 py-2 border-r border-black/10">IP address, internet service provider</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Device data</td>
                <td className="px-4 py-2 border-r border-black/10">Device type, operating system, browser version, screen resolution</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Session data</td>
                <td className="px-4 py-2 border-r border-black/10">Session tokens, session duration, access and logout timestamps</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Access logs</td>
                <td className="px-4 py-2 border-r border-black/10">Server request logs, URLs accessed, HTTP response codes</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Approximate geolocation data</td>
                <td className="px-4 py-2 border-r border-black/10">Country and region derived from IP address (never precise GPS location)</td>
              </tr>
            </tbody></table></div>
            <p>
              <strong className="text-black font-semibold">Purpose of processing:</strong> Ensuring the security of the platform and detecting unauthorised or fraudulent access; diagnosis and resolution of technical incidents; aggregate analysis of platform performance; attestation with logging obligations imposed by applicable information security regulations.
            </p>
            <p>
              <strong className="text-black font-semibold">Legal basis:</strong> Article 6(1)(f) GDPR, <strong className="text-black font-semibold">Legitimate interests</strong> of Humanity Ledger S.L. in maintaining the security, availability, and integrity of the platform, and in protecting users against unauthorised access and fraudulent activities. Recital 49 of the GDPR recognises the processing of technical data for security purposes as a legitimate prevailing interest.
            </p>
            <p>
              <strong className="text-black font-semibold">Data minimisation:</strong> Humanity Ledger S.L. applies the minimisation principle established in Article 5(1)(c) GDPR. IP addresses are <strong className="text-black font-semibold">pseudonymised</strong> through truncation techniques after the operational retention period (90 days), and are subsequently retained only in aggregated or pseudonymised form for the remainder of the retention period indicated in Section 5.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.5. Tax Data for DAC8 Reporting</h3>
            <p>
              <strong className="text-black font-semibold">Categories of data processed:</strong>
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Examples</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Tax identification data</td>
                <td className="px-4 py-2 border-r border-black/10">Tax Identification Number (NIF/TIN) of the country of residence</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Tax residence data</td>
                <td className="px-4 py-2 border-r border-black/10">Country or countries of tax residence, applicable tax jurisdictions</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Reportable transaction data</td>
                <td className="px-4 py-2 border-r border-black/10">Volume of crypto asset transactions, realised capital gains and losses, assets held as at 31 December</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Ownership data</td>
                <td className="px-4 py-2 border-r border-black/10">Confirmation of beneficial ownership of reported assets</td>
              </tr>
            </tbody></table></div>
            <p>
              <strong className="text-black font-semibold">Purpose of processing:</strong> Attestation with the obligations to report information on crypto assets to tax authorities established in Council Directive (EU) 2023/2226 (<em>DAC8</em>), amending Directive 2011/16/EU on administrative cooperation in the field of taxation, and its transposition into Spanish law. Data will be reported to the Spanish Tax Agency (AEAT), which will proceed with the automatic exchange of information with the tax authorities of the relevant Member States.
            </p>
            <p>
              <strong className="text-black font-semibold">Legal basis:</strong> Article 6(1)(c) GDPR, <strong className="text-black font-semibold">Attestation with a legal obligation</strong> applicable to the data controller, arising from the DAC8 Directive and its Spanish implementing legislation.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.6. Support and Complaints Management Data</h3>
            <p>
              <strong className="text-black font-semibold">Categories of data processed:</strong>
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Examples</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Contact data</td>
                <td className="px-4 py-2 border-r border-black/10">Name, email address, account identifier</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Communication content</td>
                <td className="px-4 py-2 border-r border-black/10">Description of the incident or complaint, supporting documentation</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Support history data</td>
                <td className="px-4 py-2 border-r border-black/10">Ticket number, dates, resolution status, response history</td>
              </tr>
            </tbody></table></div>
            <p>
              <strong className="text-black font-semibold">Purpose of processing:</strong> Handling and resolving queries, technical incidents, and complaints raised by users; maintaining a record of support communications for quality purposes and to demonstrate attestation with our obligations to users; legal defence in the event of disputes.
            </p>
            <p>
              <strong className="text-black font-semibold">Legal basis:</strong> Article 6(1)(f) GDPR, <strong className="text-black font-semibold">Legitimate interests</strong> of Humanity Ledger S.L. in adequately managing its relationships with users, ensuring service quality, and protecting its rights in the event of complaints or litigation.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">4.7. Commercial Communications and Marketing</h3>
            <p>
              <strong className="text-black font-semibold">Categories of data processed:</strong>
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Category</td>
                <td className="px-4 py-2 border-r border-black/10">Examples</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Contact data</td>
                <td className="px-4 py-2 border-r border-black/10">Email address, account identifier</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Interaction data</td>
                <td className="px-4 py-2 border-r border-black/10">Open rates, clicks on communications, declared preferences</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Segmentation data</td>
                <td className="px-4 py-2 border-r border-black/10">User type (investor, developer, creator), activity level</td>
              </tr>
            </tbody></table></div>
            <p>
              <strong className="text-black font-semibold">Purpose of processing:</strong> Sending commercial communications regarding new services, features, events, platform updates, and opportunities related to the Humanity Ledger ecosystem and the $QDs token; personalisation of communications based on the user's profile and interests.
            </p>
            <p>
              <strong className="text-black font-semibold">Legal basis:</strong> Article 6(1)(a) GDPR, <strong className="text-black font-semibold">Consent</strong>, freely given, specific, informed, and unambiguous, obtained through active marking of the corresponding checkbox during registration or through subsequent voluntary subscription. The user may <strong className="text-black font-semibold">withdraw their consent at any time</strong> without affecting the lawfulness of prior processing, through:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The unsubscribe link included in each commercial communication;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The notification preferences settings in their user panel; or</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>A direct request to legal@humanidfi.com.</span></li>
            </ul>
          </div>
        </section>


        {/* 6 */}
        <section id="5-retention-periods">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. RETENTION PERIODS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In accordance with the storage limitation principle established in Article 5(1)(e) GDPR, personal data shall be retained for no longer than is strictly necessary for the purpose for which it was collected, while in all cases observing the minimum retention periods imposed by applicable regulations.
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Data Category</td>
                <td className="px-4 py-2 border-r border-black/10">Retention Period</td>
                <td className="px-4 py-2 border-r border-black/10">Regulatory Basis</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Registration and account data</td>
                <td className="px-4 py-2 border-r border-black/10">Duration of the contractual relationship + <strong>3 years</strong> after deregistration</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 1964 Spanish Civil Code (limitation period for personal actions)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">KYC/AML data (documents, due diligence records)</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>10 years</strong> from the termination of the business relationship</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 25 Law 10/2010; Art. 28 Royal Decree 304/2014</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Transaction and operations records (AML)</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>10 years</strong> from the date of the transaction</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 25 Law 10/2010</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Tax data (DAC8 and tax filings)</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>6 years</strong> from the relevant tax year</td>
                <td className="px-4 py-2 border-r border-black/10">Arts. 66–70 General Tax Law; DAC8 Directive</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Technical data and access logs</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>12 months</strong> from generation</td>
                <td className="px-4 py-2 border-r border-black/10">Security obligations (Art. 32 GDPR); LSSI</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Support and complaints data</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>3 years</strong> from resolution of the incident</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 1964 Spanish Civil Code</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Commercial communications</td>
                <td className="px-4 py-2 border-r border-black/10">Until withdrawal of consent</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 6(1)(a) GDPR</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Blockchain transaction data</td>
                <td className="px-4 py-2 border-r border-black/10"><strong>Indefinitely</strong> by technical nature (see Section 9)</td>
                <td className="px-4 py-2 border-r border-black/10">—</td>
              </tr>
            <div className="bg-black/5 p-4 rounded-lg font-medium border-l-4 border-black">
              <strong>Note:</strong> Once the active retention periods indicated above have elapsed, data will be <strong>blocked</strong> (retained under restricted access, accessible only to respond to judicial or administrative requests) for the additional period corresponding to the applicable statutory limitation periods, after which they will be <strong>securely deleted</strong> or subjected to irreversible anonymisation techniques.
            </div>
            <div className="bg-black/5 p-4 rounded-lg font-medium border-l-4 border-black">
              <strong>AML Retention Period (Law 10/2010):</strong> Article 25 of Law 10/2010, as amended following the transposition of the 6th AMLD, establishes a retention period of <strong>ten (10) years</strong>. This period prevails over the general five-year period applicable under prior regulations. Operators of crypto asset services subject to Law 10/2010 must apply this extended retention period.
            </div>
            </tbody></table></div>
          </div>
        </section>


        {/* 7 */}
        <section id="6-recipients-and-data-processors">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. RECIPIENTS AND DATA PROCESSORS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In accordance with Article 13(1)(e) GDPR, we hereby inform you of the categories of recipients with whom Humanity Ledger S.L. may share your personal data.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">6.1. Data Processors</h3>
            <p>
              The following providers act as <strong className="text-black font-semibold">data processors</strong> on behalf of Humanity Ledger S.L., with whom we have entered into data processing agreements in accordance with Article 28 GDPR:
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Provider / Category</td>
                <td className="px-4 py-2 border-r border-black/10">Service Provided</td>
                <td className="px-4 py-2 border-r border-black/10">Location</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>KYC/AML Provider</strong> (Sumsub, Onfido, or Veriff, [PENDING final confirmation])</td>
                <td className="px-4 py-2 border-r border-black/10">KYC identity verification, biometric liveness checks, sanctions and PEP screening</td>
                <td className="px-4 py-2 border-r border-black/10">EU / UK / International</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Travel Rule Provider</strong> (Notabene or equivalent)</td>
                <td className="px-4 py-2 border-r border-black/10">Attestation with the FATF Travel Rule protocol for crypto asset transfers</td>
                <td className="px-4 py-2 border-r border-black/10">International</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Cloud Infrastructure Provider</strong> ([PENDING, AWS, GCP, Azure, or other])</td>
                <td className="px-4 py-2 border-r border-black/10">Server hosting, databases, and computing services</td>
                <td className="px-4 py-2 border-r border-black/10">[PENDING, EU region preferred]</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Blockchain Analytics Provider</strong> ([PENDING])</td>
                <td className="px-4 py-2 border-r border-black/10">On-chain transaction monitoring for AML purposes</td>
                <td className="px-4 py-2 border-r border-black/10">International</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Communications Provider</strong> ([PENDING])</td>
                <td className="px-4 py-2 border-r border-black/10">Sending transactional emails and notifications</td>
                <td className="px-4 py-2 border-r border-black/10">EU / International</td>
              </tr>
            </tbody></table></div>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">6.2. Public Authorities (Mandatory Disclosures)</h3>
            <p>
              Humanity Ledger S.L. may communicate personal data to the following <strong className="text-black font-semibold">public authorities</strong> where there is a legal obligation or a duly reasoned request:
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Authority</td>
                <td className="px-4 py-2 border-r border-black/10">Circumstance of Disclosure</td>
                <td className="px-4 py-2 border-r border-black/10">Legal Basis</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>SEPBLAC</strong> (Executive Service of the Anti-Money Laundering Commission)</td>
                <td className="px-4 py-2 border-r border-black/10">Suspicious Transaction Reports (STRs); requests in the context of AML investigations</td>
                <td className="px-4 py-2 border-r border-black/10">Arts. 18 et seq. Law 10/2010</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>AEAT</strong> (Spanish Tax Agency)</td>
                <td className="px-4 py-2 border-r border-black/10">DAC8 reporting on crypto asset transactions; tax information requests</td>
                <td className="px-4 py-2 border-r border-black/10">DAC8 Directive; Art. 93 General Tax Law</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>CNMV</strong> (National Securities Market Commission)</td>
                <td className="px-4 py-2 border-r border-black/10">Regulatory requests under MiCA Regulation and securities legislation</td>
                <td className="px-4 py-2 border-r border-black/10">Regulation (EU) 2023/1114 (MiCA); LMV</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Judicial and law enforcement authorities</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Judicial orders, warrants, criminal investigations</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 6(1)(c) GDPR; Spanish Criminal Procedure Law</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>AEPD</strong> (Spanish Data Protection Agency)</td>
                <td className="px-4 py-2 border-r border-black/10">Data protection investigations</td>
                <td className="px-4 py-2 border-r border-black/10">Arts. 57–58 GDPR; LOPDGDD</td>
              </tr>
            </tbody></table></div>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">6.3. Principles Applicable to Data Disclosures</h3>
            <p>
              Humanity Ledger S.L. does not sell, rent, or transfer your personal data to third parties for those third parties' own commercial purposes. Any data transfer to third parties is carried out under a data processing agreement, standard contractual clauses, or an equivalent safeguard mechanism, or pursuant to an express legal obligation.
            </p>
          </div>
        </section>


        {/* 8 */}
        <section id="7-international-transfers-of-personal-data">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            7. INTERNATIONAL TRANSFERS OF PERSONAL DATA
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In accordance with Article 44 et seq. GDPR, Humanity Ledger S.L. ensures that any transfer of personal data to countries outside the European Economic Area (EEA) is carried out with the appropriate safeguards required by applicable regulations.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">7.1. Transfer Mechanisms</h3>
            <p>
              International transfers of personal data carried out by Humanity Ledger S.L. are based on the following mechanisms:
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Mechanism</td>
                <td className="px-4 py-2 border-r border-black/10">Description</td>
                <td className="px-4 py-2 border-r border-black/10">Application</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Adequacy decision</strong> (Art. 45 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">The European Commission has recognised that the destination country provides an adequate level of protection</td>
                <td className="px-4 py-2 border-r border-black/10">United Kingdom (current adequacy decision), other countries with current adequacy decisions</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Standard Contractual Clauses</strong> (Art. 46(2)(c) GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Contracts incorporating the SCCs adopted by Commission Decision 2021/914</td>
                <td className="px-4 py-2 border-r border-black/10">Providers in the USA and other countries without adequacy decisions</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Binding Corporate Rules</strong> (Art. 47 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Binding internal privacy policies in multinational groups</td>
                <td className="px-4 py-2 border-r border-black/10">Applicable to providers with approved BCRs</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Explicit consent</strong> (Art. 49(1)(a) GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">For occasional and non-systematic transfers, subject to prior information and express consent</td>
                <td className="px-4 py-2 border-r border-black/10">Specific cases</td>
              </tr>
            </tbody></table></div>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">7.2. Blockchain's Decentralised Nature</h3>
            <p>
              The Aztec Network and Ethereum blockchain networks operate on nodes distributed globally. The propagation of transactions to validating nodes in different jurisdictions is inherent to the technical nature of these networks and does not, strictly speaking, constitute an international transfer of personal data by Humanity Ledger S.L., to the extent that such propagation is outside the direct control of the data controller. Nevertheless, Humanity Ledger S.L. selects infrastructure and configurations that minimise the exposure of identifiable data outside the EEA, and uses Aztec Network's ZKP architecture precisely to ensure that the user's personal data remains encrypted in the decentralised environment.
            </p>
          </div>
        </section>


        {/* 9 */}
        <section id="8-data-subject-rights">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            8. DATA SUBJECT RIGHTS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The GDPR confers upon data subjects a set of rights in relation to the processing of their personal data. Below we set out each of these rights, together with the technical specificities that may condition their exercise in the context of a platform based on blockchain technology and ZKPs.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">8.1. Catalogue of Rights</h3>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Right</td>
                <td className="px-4 py-2 border-r border-black/10">Content</td>
                <td className="px-4 py-2 border-r border-black/10">Legal Basis</td>
                <td className="px-4 py-2 border-r border-black/10">Response Period</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Access</strong> (Art. 15 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Obtain confirmation of whether your data are being processed and, if so, access to them</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 15 GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">1 month (extendable by 2 additional months)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Rectification</strong> (Art. 16 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Rectify inaccurate data or complete incomplete data</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 16 GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">1 month</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Erasure / "Right to Be Forgotten"</strong> (Art. 17 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Request the erasure of your data where the legal grounds apply</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 17 GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">1 month</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Restriction of processing</strong> (Art. 18 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Request the suspension of processing in certain circumstances</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 18 GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">1 month</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Data portability</strong> (Art. 20 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Receive your data in a structured, commonly used, and machine-readable format, and transmit them to another controller</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 20 GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">1 month</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Objection</strong> (Art. 21 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Object to processing based on legitimate interests, including profiling</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 21 GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">Immediately for marketing; 1 month for others</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Not to be subject to automated decisions</strong> (Art. 22 GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Not to be subject to decisions based solely on automated processing that produce significant legal effects</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 22 GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">1 month</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Withdrawal of consent</strong> (Art. 7(3) GDPR)</td>
                <td className="px-4 py-2 border-r border-black/10">Withdraw previously granted consent at any time, without retroactive effect</td>
                <td className="px-4 py-2 border-r border-black/10">Art. 7(3) GDPR</td>
                <td className="px-4 py-2 border-r border-black/10">Immediately</td>
              </tr>
            </tbody></table></div>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">8.2. Procedure for Exercising Rights</h3>
            <p>
              To exercise any of the above rights, the user must submit a written request to Humanity Ledger S.L. through the following channels:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Email:</strong> legal@humanidfi.com (Subject: "Exercise of GDPR Rights")</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Postal address:</strong> [PENDING, registered office in Sagunto, Valencia]</span></li>
            </ul>
            <p>
              The request must include: 1. Full name of the applicant. 2. Identity document (national ID, NIE, or passport), for the purpose of verifying the identity of the applicant, which will be destroyed once identity has been verified. 3. A clear description of the right the applicant wishes to exercise. 4. Account identifier on the platform (email address or username).
            </p>
            <p>
              Humanity Ledger S.L. will respond to your request within <strong className="text-black font-semibold">one (1) month</strong> of its receipt. This period may be extended by a further <strong className="text-black font-semibold">two (2) months</strong> in cases of particular complexity, of which you will be informed within the initial period, together with the reasons for the extension.
            </p>
            <p>
              The processing of rights requests is <strong className="text-black font-semibold">free of charge</strong>. However, where requests are manifestly unfounded or excessive, in particular due to their repetitive nature, Humanity Ledger S.L. reserves the right to charge a reasonable fee or to refuse to act, in accordance with Article 12(5) GDPR.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">8.3. Specific Limitations in the Blockchain Context</h3>
            <p>
              The exercise of certain rights may be <strong className="text-black font-semibold">limited or conditional</strong> due to the technical specificities of blockchain technology. Users are referred to <strong className="text-black font-semibold">Section 9</strong> of this document for a detailed explanation of such limitations, in particular with regard to the <strong className="text-black font-semibold">right to erasure</strong> in relation to data recorded on-chain.
            </p>
          </div>
        </section>


        {/* 10 */}
        <section id="9-special-section-blockchain-data-and-immutability">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            9. SPECIAL SECTION: BLOCKCHAIN DATA AND IMMUTABILITY
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              This section specifically addresses the implications of processing personal data in the context of decentralised blockchain networks, with particular reference to the technologies employed by the Humanity Ledger platform.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">9.1. Technical Nature of Immutability</h3>
            <p>
              Blockchain networks, including Ethereum Mainnet and Aztec Network as a Layer 2 ZK-rollup, are characterised by their <strong className="text-black font-semibold">structural immutability</strong>: once a transaction has been validated and included in a block, its deletion or modification is technically impossible without compromising the integrity of the entire subsequent chain. This property is inherent to the technology and constitutes the fundamental guarantee of its security and integrity.
            </p>
            <p>
              Consequently, data or identifiers that may qualify as personal data and are recorded on-chain, in particular, <strong className="text-black font-semibold">wallet addresses</strong> (which under certain circumstances may be identifiable) and transaction metadata, <strong className="text-black font-semibold">cannot be erased</strong> from the blockchain by any entity, including Humanity Ledger S.L.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">9.2. Compatibility with the GDPR: Regulatory Position</h3>
            <p>
              Humanity Ledger S.L. bases its position on the compatibility between blockchain immutability and the GDPR on the following elements:
            </p>
            <p>
              <strong className="text-black font-semibold">9.2.1. Article 29 Working Party Report (WP248) and EDPB Guidance:</strong> The European Data Protection Board (EDPB) has acknowledged that technical immutability may constitute an objective limitation on the exercise of the right to erasure where the processing affects records in distributed ledger technologies.
            </p>
            <p>
              <strong className="text-black font-semibold">9.2.2. Article 17(3) GDPR, Exceptions to the Right to Erasure:</strong> The right to erasure is not absolute. Article 17(3) GDPR provides that that right shall not apply where processing is necessary for attestation with a legal obligation (Art. 17(3)(b)) or for the establishment, exercise, or defence of legal claims (Art. 17(3)(e)), both of which circumstances frequently arise in the context of financial transactions recorded on a blockchain.
            </p>
            <p>
              <strong className="text-black font-semibold">9.2.3. Aztec Network's Privacy Architecture:</strong> Humanity Ledger uses Aztec Network precisely to <strong className="text-black font-semibold">minimise the exposure of identifiable data on-chain</strong>. Private transactions on Aztec are encrypted using ZK proofs, such that their content is not readable by third parties or by Humanity Ledger S.L. without the user's corresponding viewing key. Only the <strong className="text-black font-semibold">transaction hash</strong> and minimal consensus metadata are accessible in the public ledger.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">9.3. Data Processed in the PXE (Private Execution Environment)</h3>
            <p>
              The <strong className="text-black font-semibold">PXE (Private Execution Environment)</strong> of Aztec Network is a local execution environment that operates exclusively on the user's device. Its fundamental characteristics from a data protection perspective are:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Local execution:</strong> ZK proofs are generated on the user's device; the underlying personal data does not leave that device.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Inaccessibility to Humanity Ledger S.L.:</strong> Data processed in the PXE are <strong className="text-black font-semibold">never transmitted to or accessible by</strong> Humanity Ledger S.L. or any third party, other than the user themselves.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">End-to-end encryption:</strong> Data in the PXE is encrypted using the user's private keys, which only the user controls.</span></li>
            </ul>
            <p>
              Consequently, Humanity Ledger S.L. <strong className="text-black font-semibold">does not act as data controller</strong> with respect to data processed exclusively in the user's PXE; the user themselves assumes that control as the controller of their own data.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">9.4. Viewing Keys and Regulatory Access</h3>
            <p>
              Aztec Network's architecture incorporates a system of <strong className="text-black font-semibold">viewing keys</strong> that enables <strong className="text-black font-semibold">selective disclosure</strong> of encrypted transactions to authorised recipients, without compromising the general privacy of the user.
            </p>
            <p>
              Humanity Ledger S.L. may provide, or be legally required to provide, viewing keys to competent authorities (SEPBLAC, AEAT, CNMV, judicial authorities) in the legally established circumstances. This disclosure constitutes an expressly foreseen and necessary exception to the privacy principle, required for the fulfilment of anti-money laundering obligations and cooperation with authorities.
            </p>
            <p>
              The viewing key system <strong className="text-black font-semibold">does not make $QDs or the Humanity Ledger platform a "privacy coin"</strong> in the technical-regulatory sense, as a controlled regulatory transparency mechanism exists. The privacy offered is from unauthorised third parties, not from competent authorities.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">9.5. Compensatory Data Protection Measures On-Chain</h3>
            <p>
              In response to the technical limitations inherent in blockchain immutability, Humanity Ledger S.L. adopts the following on-chain data protection measures:
            </p>
            <p>
              1. <strong className="text-black font-semibold">On-chain data minimisation:</strong> Only information strictly necessary for the validity and integrity of the transaction is recorded on the blockchain. Personally identifiable data is kept off-chain at all times. 2. <strong className="text-black font-semibold">Structural pseudonymisation:</strong> Wallet addresses function as pseudonyms. They are not linked in the public on-chain layer to the user's real identity. 3. <strong className="text-black font-semibold">Layer separation:</strong> The link between real identity (off-chain, in Humanity Ledger S.L.'s secure systems) and wallet address (on-chain) is protected by strict access controls and encryption. 4. <strong className="text-black font-semibold">Prior information and specific consent:</strong> Before recording any data on-chain, the user is informed of the irreversible nature of the record and provides their specific consent to that operation.
            </p>
          </div>
        </section>


        {/* 11 */}
        <section id="10-special-section-zero knowledge-proofs-and-privacy-by-design">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            10. SPECIAL SECTION: ZERO-KNOWLEDGE PROOFS AND PRIVACY BY DESIGN
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">10.1. Technical Basis of the ZKP System</h3>
            <p>
              Humanity Ledger's <strong className="text-black font-semibold">Claim Identity</strong> service allows users to generate and manage <strong className="text-black font-semibold">decentralised digital identities (DIDs)</strong> verified by means of zero knowledge proofs (ZKPs). This system has been designed in accordance with the principle of <strong className="text-black font-semibold">privacy by design and by default</strong> established in Article 25 GDPR.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">10.2. Data Flow in the Claim Identity Process</h3>
            <p>
              The ZKP identity verification process operates as follows from a data privacy perspective:
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">── [1] Identity documents + biometric data</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">↓ (processed LOCALLY on the user's device)</td>
              </tr>
              <tr>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">── [2] ZK proof generation (local process in PXE)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">↓</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">── [3] KYC verification by external provider (Sumsub/Onfido/Veriff)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">↓ (result: approved/rejected, minimal data)</td>
              </tr>
              <tr>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">── [4] Issuance of verified ZK proof</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">↓</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">── [5] ← HUMANITY LEDGER S.L. RECEIVES ONLY: ←</td>
              </tr>
            </tbody></table></div>
            <p>
              ``` [USER] • The mathematical ZK proof (not the underlying data) • Verified attributes in the form of boolean assertions (e.g.: "aged 18 or over: YES", "EU nationality: YES") • NOT received: national ID, passport, facial image, exact date of birth ```
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">10.3. Data that Humanity Ledger S.L. Does NOT Process under the ZKP Framework</h3>
            <p>
              Humanity Ledger S.L. expressly declares that, in the context of the Claim Identity service, it does <strong className="text-black font-semibold">not receive, store, or process</strong> the following personal data of the user:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The identity document (national ID, NIE, passport) in image format or the data extracted therefrom;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Biometric data (facial image, fingerprint) captured during the verification process;</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The exact date of birth (only the assertion of age of majority);</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The full postal address (only the assertion of residence in a particular jurisdiction, where necessary); or</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Any other personal data underlying the ZK proof.</span></li>
            </ul>
            <p>
              These data are processed <strong className="text-black font-semibold">exclusively by the external KYC provider</strong> (acting as a data processor on behalf of Humanity Ledger S.L.) and/or managed locally on the user's device through the PXE, without transmission to Humanity Ledger S.L.'s servers.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">10.4. Attestation with the Principle of Privacy by Design (Art. 25 GDPR)</h3>
            <p>
              Humanity Ledger's ZKP architecture gives practical effect to the principle of <strong className="text-black font-semibold">privacy by design and by default</strong> under Article 25 GDPR through the following measures:
            </p>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">GDPR Principle</td>
                <td className="px-4 py-2 border-r border-black/10">Technical Implementation</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Data minimisation</td>
                <td className="px-4 py-2 border-r border-black/10">Only verified boolean attributes are processed, not the underlying data</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Purpose limitation</td>
                <td className="px-4 py-2 border-r border-black/10">Each ZK proof is specific to a declared purpose</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Accuracy</td>
                <td className="px-4 py-2 border-r border-black/10">ZK proofs guarantee the veracity of the attributes without exposing the source data</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Integrity and confidentiality</td>
                <td className="px-4 py-2 border-r border-black/10">Cryptographic encryption using Barretenberg/Noir system (Aztec Network)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Pseudonymisation</td>
                <td className="px-4 py-2 border-r border-black/10">The user's blockchain identity is a pseudonymous DID not directly linked to their real identity</td>
              </tr>
            </tbody></table></div>
          </div>
        </section>


        {/* 12 */}
        <section id="11-data-security">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            11. DATA SECURITY
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In accordance with Article 32 GDPR, Humanity Ledger S.L. has implemented a set of appropriate technical and organisational measures to ensure a level of security commensurate with the risk of the processing.
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">11.1. Technical Security Measures</h3>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Measure</td>
                <td className="px-4 py-2 border-r border-black/10">Description</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Encryption in transit</strong></td>
                <td className="px-4 py-2 border-r border-black/10">All data traffic between the user and the platform is encrypted using TLS 1.3 or higher</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Encryption at rest</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Data stored in databases and file systems is encrypted using AES-256</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Two-factor authentication (2FA)</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Available and recommended for user account access</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Access controls</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Principle of least privilege; role-based data access; multi-factor authentication for administrative access</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>ZKP architecture</strong></td>
                <td className="px-4 py-2 border-r border-black/10">The personal data underlying identity proofs never leaves the user's device</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Pseudonymisation</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Internal identifiers do not correspond to public blockchain identifiers</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Security monitoring</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Intrusion detection systems (IDS/IPS); anomalous access alerts; audit logging</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Vulnerability management</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Periodic security audits; responsible vulnerability disclosure programme (bug bounty)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Backups</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Encrypted backups at defined intervals; disaster recovery procedures</td>
              </tr>
            </tbody></table></div>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">11.2. Organisational Security Measures</h3>
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Measure</td>
                <td className="px-4 py-2 border-r border-black/10">Description</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Staff training</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Regular training on data protection and cybersecurity for all personnel with access to personal data</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Confidentiality agreements</strong></td>
                <td className="px-4 py-2 border-r border-black/10">All staff and external collaborators with access to personal data are subject to confidentiality obligations</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Access and use policy</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Internal acceptable use policies for information systems and personal data</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Incident management</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Documented procedure for the detection, response to, and notification of security breaches</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Data Protection Impact Assessments (DPIAs)</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Conducting DPIAs (Art. 35 GDPR) for high-risk processing activities</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>Vendor due diligence</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Assessment of the security measures of data processors prior to engagement</td>
              </tr>
            </tbody></table></div>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">11.3. Notification of Security Breaches</h3>
            <p>
              In the event of a <strong className="text-black font-semibold">personal data breach</strong> that poses a risk to the rights and freedoms of data subjects, Humanity Ledger S.L. shall comply with the obligations established in Articles 33 and 34 GDPR:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Notification to the AEPD</strong> within a maximum of <strong className="text-black font-semibold">72 hours</strong> of becoming aware of the breach (Art. 33 GDPR).</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Communication to affected data subjects</strong> without undue delay where the breach is likely to result in a high risk to their rights and freedoms (Art. 34 GDPR), with information on the nature of the breach, the categories of data affected, the approximate number of persons affected, the likely consequences, and the measures taken or proposed to be taken.</span></li>
            </ul>
          </div>
        </section>


        {/* 13 */}
        <section id="12-cookies-and-tracking-technologies">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            12. COOKIES AND TRACKING TECHNOLOGIES
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The Website uses first-party and third-party cookies. For detailed information on the cookies used, their purposes, retention periods, and how to manage them, please consult our <a href="https://humanidfi.com/legal/cookies" className="text-black underline underline-offset-2">Cookie Policy</a>.
            </p>
          </div>
        </section>


        {/* 14 */}
        <section id="13-automated-decision-making-and-profiling">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            13. AUTOMATED DECISION-MAKING AND PROFILING
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              <strong className="text-black font-semibold">13.1.</strong> Humanity Ledger S.L. does <strong className="text-black font-semibold">not make automated decisions</strong> that produce legal effects or similarly significant effects on users, within the meaning of Article 22 GDPR.
            </p>
            <p>
              <strong className="text-black font-semibold">13.2.</strong> With regard to the KYC/AML process, the identity verification and risk screening systems used by our external KYC provider may apply automated tools to verify document authenticity and check against sanctions lists. Where a negative result is produced, a <strong className="text-black font-semibold">human review</strong> is carried out by a qualified attestation officer before any definitive decision affecting the user is made.
            </p>
            <p>
              <strong className="text-black font-semibold">13.3.</strong> Users who believe they have been affected by an automated decision have the right to: (i) request human review of the decision; (ii) express their point of view; and (iii) contest the decision. To exercise this right, please contact legal@humanidfi.com.
            </p>
          </div>
        </section>


        {/* 15 */}
        <section id="14-data-protection-officer-dpo">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            14. DATA PROTECTION OFFICER (DPO)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. is evaluating whether the appointment of a Data Protection Officer (DPO) is mandatory pursuant to Article 37 GDPR, given the nature, scope, and purposes of the processing activities carried out.
            </p>
            <p>
              Until a formal DPO is appointed, all data protection queries, rights requests, and complaints should be directed to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Email:</strong> legal@humanidfi.com</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Postal address:</strong> [PENDING, registered office in Sagunto, Valencia, Spain]</span></li>
            </ul>
          </div>
        </section>


        {/* 16 */}
        <section id="15-complaints-to-the-supervisory-authority">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            15. COMPLAINTS TO THE SUPERVISORY AUTHORITY
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              If you consider that the processing of your personal data by Humanity Ledger S.L. infringes the applicable data protection regulations, you have the right to lodge a complaint with the competent supervisory authority. In Spain, the competent supervisory authority is:
            </p>
            <p>
              <strong className="text-black font-semibold">Agencia Española de Protección de Datos (AEPD)</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Website: <a href="https://www.aepd.es" className="text-black underline underline-offset-2">www.aepd.es</a></span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Telephone: +34 901 100 099 / +34 912 663 517</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Address: C/ Jorge Juan, 6, 28001 Madrid, Spain</span></li>
            </ul>
            <p>
              This right does not affect your right to seek judicial remedies or to exercise your data subject rights directly with Humanity Ledger S.L. before lodging a complaint with the AEPD.
            </p>
          </div>
        </section>


        {/* 17 */}
        <section id="16-updates-to-this-privacy-policy">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            16. UPDATES TO THIS PRIVACY POLICY
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Humanity Ledger S.L. reserves the right to update or amend this Privacy Policy at any time to reflect changes in applicable legislation, judicial or regulatory doctrine, or changes in the processing activities carried out. Any material amendment will be notified to users via email and/or a prominent notice on the platform, with a minimum notice period of <strong className="text-black font-semibold">30 days</strong> before the amendment takes effect. The date of the last update will always be indicated at the top of this document.
            </p>
          </div>
        </section>


        {/* 18 */}
        <section id="17-contact">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            17. CONTACT
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              For any queries, complaints, or the exercise of data protection rights, please contact us through the following channels:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Email:</strong> legal@humanidfi.com</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Postal address:</strong> [PENDING, Sagunto, Province of Valencia, Kingdom of Spain]</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">Response period:</strong> 30 business days from receipt of the communication</span></li>
            </ul>
            <p>
              <em>© 2026 Humanity Ledger S.L., All Rights Reserved.</em> <em>Last Updated: 26 July 2026</em>
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
