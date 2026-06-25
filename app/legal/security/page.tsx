'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'humanity-ledger-s-l-whale-network', label: `Humanity Ledger S.L. — Whale Network` },
  { id: '1-objective-and-scope', label: `1. OBJECTIVE AND SCOPE` },
  { id: '2-incident-response-team-internal-cert', label: `2. INCIDENT RESPONSE TEAM (Internal CERT)` },
  { id: '3-incident-classification', label: `3. INCIDENT CLASSIFICATION` },
  { id: '4-6-phase-response-procedure-sans-nist-methodology', label: `4. 6-PHASE RESPONSE PROCEDURE (SANS/NIST Methodology)` },
  { id: '5-emergency-contacts', label: `5. EMERGENCY CONTACTS` }
];

export default function LegalPage() {
  return (
    <LegalDocLayout
      title="Security Architecture"
      subtitle="This policy sets forth the legal and compliance rules governing the Whale Network ecosystem."
      lastUpdated="June 2026"
      category="Legal & Security"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="humanity-ledger-s-l-whale-network">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Humanity Ledger S.L. — Whale Network
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              <strong className="text-black font-semibold">Version:</strong> 1.0 | <strong className="text-black font-semibold">Date:</strong> 6 June 2026 | <strong className="text-black font-semibold">Classification:</strong> Confidential / Internal Use Only
            </p>
          </div>
        </section>


        {/* 2 */}
        <section id="1-objective-and-scope">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. OBJECTIVE AND SCOPE
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              This Cyber Security Incident Response Plan (CSIRP) establishes the technical, organisational, and legal procedures that Humanity Ledger S.L. must follow in the event of incidents compromising the confidentiality, integrity, or availability of the Whale Network infrastructure, user data (GDPR), or digital assets ($QDs).
            </p>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">Scope of application:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Web servers, APIs, and centralised databases of humanidfi.com.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Smart contracts deployed on Ethereum L1 or Aztec Network L2.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Nodes, sequencers, or network infrastructure providers.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Administrator accounts (hosting, cloud, social media, GitHub).</span></li>
            </ul>
          </div>
        </section>


        {/* 3 */}
        <section id="2-incident-response-team-internal-cert">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. INCIDENT RESPONSE TEAM (Internal CERT)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              In the event of a High or Critical severity incident, the Response Team is constituted, led by: 1. <strong className="text-black font-semibold">Incident Manager:</strong> [PENDING — CTO or Director]. Coordinates the overall response. 2. <strong className="text-black font-semibold">Tech Lead:</strong> Responsible for containment, forensic analysis, and mitigation. 3. <strong className="text-black font-semibold">Legal/Compliance Officer:</strong> Manages mandatory notifications (AEPD, CNMV, users). 4. <strong className="text-black font-semibold">Communications (PR):</strong> Manages public communication on networks (Twitter, Discord) to prevent misinformation and FUD.
            </p>
          </div>
        </section>


        {/* 4 */}
        <section id="3-incident-classification">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. INCIDENT CLASSIFICATION
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Level</td>
                <td className="px-4 py-2 border-r border-black/10">Description</td>
                <td className="px-4 py-2 border-r border-black/10">Examples</td>
                <td className="px-4 py-2 border-r border-black/10">Max. Response Time</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>P1 - CRITICAL</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Total compromise, theft of funds, massive exposure of KYC data, or loss of control of the smart contract.</td>
                <td className="px-4 py-2 border-r border-black/10">Theft of treasury private keys, critical exploit in the token contract (e.g., infinite minting), breach in the Sumsub/KYC DB.</td>
                <td className="px-4 py-2 border-r border-black/10">Immediate (24/7)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>P2 - HIGH</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Critical service outage, severe DDoS attack, critical vulnerability discovered prior to exploitation.</td>
                <td className="px-4 py-2 border-r border-black/10">Aztec RPC outage preventing transactions, massive DDoS on the website, critical flaw in the front-end.</td>
                <td className="px-4 py-2 border-r border-black/10">&lt; 1 hour</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10"><strong>P3 - MEDIUM</strong></td>
                <td className="px-4 py-2 border-r border-black/10">Isolated problems affecting few users, non-critical UI flaws, failed intrusion attempts.</td>
                <td className="px-4 py-2 border-r border-black/10">Isolated users cannot connect wallet due to local RPC error, repelled brute-force attack.</td>
                <td className="px-4 py-2 border-r border-black/10">&lt; 24 hours (business hours)</td>
              </tr>
            </tbody></table></div>
          </div>
        </section>


        {/* 5 */}
        <section id="4-6-phase-response-procedure-sans-nist-methodology">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. 6-PHASE RESPONSE PROCEDURE (SANS/NIST Methodology)
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">PHASE 1: PREPARATION (Continuous Maintenance)</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Perform daily immutable backups of off-chain databases.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Maintain multi-signature hardware wallets (Gnosis Safe) for treasury funds.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Have pre-drafted crisis communications ready for Twitter/Discord.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Conduct smart contract audits pre-TGE.</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">PHASE 2: IDENTIFICATION</h3>
            <p>
              <em>Objective: Detect and confirm the existence and scope of the incident.</em>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>If an alarm is triggered (e.g., Datadog, AWS CloudWatch, Forta on blockchain) or there is a community report:</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The Tech Lead confirms whether it is a false positive.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>If real, classifies the level (P1, P2, P3).</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>If P1/P2, the Internal CERT is activated and the "War Room" is initiated (secure communication channel, e.g., Signal).</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">PHASE 3: CONTAINMENT</h3>
            <p>
              <em>Objective: Halt the bleeding (data exfiltration or loss of funds).</em> <strong className="text-black font-semibold">For off-chain incidents (Web/DB):</strong>
            </p>
            <ul className="space-y-2 pl-5">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Isolate affected servers, block malicious IPs, immediately rotate ALL credentials (AWS, GitHub, Vercel).</span></li>
            </ul>
            <p>
              <strong className="text-black font-semibold">For on-chain incidents (Smart Contracts):</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>The Noir $QDs token contract is strictly immutable and non-custodial by design. There is NO central pause mechanism. Containment relies exclusively on front-end isolation.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Send vulnerable company treasury funds to a backup cold wallet (White Hat Rescue). Note: User non-custodial funds cannot be accessed or rescued by the team.</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">PHASE 4: ERADICATION AND FORENSIC ANALYSIS</h3>
            <p>
              <em>Objective: Eliminate the root vulnerability.</em>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Identify the attack vector (0-day, employee phishing, keylogger, logical flaw in Noir code).</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Deploy security patches.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Purge compromised systems. Rebuild from clean, verified backups.</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">PHASE 5: RECOVERY</h3>
            <p>
              <em>Objective: Restore the service to normal operations.</em>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Reactivate front-end services and routing following technical validation.</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Enhanced monitoring for the subsequent 72 hours to ensure no persistent access (backdoors) remains.</span></li>
            </ul>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">PHASE 6: MANDATORY LEGAL NOTIFICATIONS (GDPR / MiCA)</h3>
            <p>
              1. <strong className="text-black font-semibold">In the event of a personal data breach (KYC, IPs, emails):</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">To the AEPD:</strong> MANDATORY notification within a maximum period of <strong className="text-black font-semibold">72 hours</strong> from awareness (Art. 33 GDPR).</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span><strong className="text-black font-semibold">To users:</strong> If there is a high risk to their rights, individual notification by email must be sent "without undue delay" (Art. 34 GDPR).</span></li>
            </ul>
            <p>
              2. <strong className="text-black font-semibold">If it affects the $QDs token or operations (MiCA):</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Notify the CNMV and users via the official website and social channels, documenting the incident.</span></li>
            </ul>
            <p>
              3. <strong className="text-black font-semibold">Post-Incident Review (Post-Mortem):</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>Within a maximum of 7 days post-resolution, the CERT shall draft a Post-Mortem report detailing what failed, how it was resolved, and what structural measures will be implemented to prevent recurrence.</span></li>
            </ul>
          </div>
        </section>


        {/* 6 */}
        <section id="5-emergency-contacts">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. EMERGENCY CONTACTS
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Provider / Body</td>
                <td className="px-4 py-2 border-r border-black/10">Contact</td>
                <td className="px-4 py-2 border-r border-black/10">Use</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">AEPD (Data Protection)</td>
                <td className="px-4 py-2 border-r border-black/10">AEPD Electronic Headquarters</td>
                <td className="px-4 py-2 border-r border-black/10">Data breach notification (&lt;72h)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">CNMV</td>
                <td className="px-4 py-2 border-r border-black/10">Electronic Headquarters</td>
                <td className="px-4 py-2 border-r border-black/10">Notification of market impact</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">Cloud Provider</td>
                <td className="px-4 py-2 border-r border-black/10">[PENDING]</td>
                <td className="px-4 py-2 border-r border-black/10">Off-chain infra blocking/support</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">INCIBE-CERT</td>
                <td className="px-4 py-2 border-r border-black/10">incidencias@incibe-cert.es</td>
                <td className="px-4 py-2 border-r border-black/10">Technical support and reporting in Spain</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r border-black/10">National Police (BIT)</td>
                <td className="px-4 py-2 border-r border-black/10">denuncias.bit@policia.es</td>
                <td className="px-4 py-2 border-r border-black/10">Reporting cyberattacks / theft of funds</td>
              </tr>
            </tbody></table></div>
            <p>
              <em>Mandatory compliance document for all technical and managerial personnel.</em>
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
