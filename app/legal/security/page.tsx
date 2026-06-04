'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'overview', label: '1. Security Overview' },
  { id: 'pillars', label: '2. Core Security Pillars' },
  { id: 'cryptography', label: '3. Cryptographic Architecture' },
  { id: 'smart-contracts', label: '4. Smart Contract Security' },
  { id: 'key-management', label: '5. Cryptographic Key Management' },
  { id: 'access-control', label: '6. Access Control & Personnel' },
  { id: 'incident-response', label: '7. Incident Response' },
  { id: 'penetration-testing', label: '8. Penetration Testing' },
  { id: 'disaster-recovery', label: '9. Disaster Recovery' },
  { id: 'reporting', label: '10. Vulnerability Reporting' },
];

export default function SecurityArchitecturePage() {
  return (
    <LegalDocLayout
      title="Security Architecture"
      subtitle="A detailed overview of the cryptographic measures, zero-trust infrastructure, and security protocols protecting the Whale Alert Network ecosystem."
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
            1. Security Overview
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              At Whale Alert Network, security is not an afterthought or a compliance checkbox — it is the fundamental pillar upon which our entire architecture is built. We understand that in the realm of decentralised finance, the integrity of data and the protection of user assets are absolutely paramount.
            </p>
            <p>
              We employ a defence-in-depth strategy, combining cutting-edge cryptographic protocols, a strict zero-trust operational model, and continuous third-party auditing to ensure that our platform remains resilient against emerging threats. This document outlines the exhaustive measures we take to secure our infrastructure and protect your digital Privatety.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section id="pillars">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Core Security Pillars
          </h2>
          <div className="space-y-3 text-[15px] leading-[1.75]">
            {[
              {
                title: 'Zero-Knowledge Architecture',
                desc: 'We utilise advanced zk-SNARKs to cryptographically verify human uniqueness and identity without ever storing or transmitting personally identifiable information. Every identity attestation is purely mathematical.',
              },
              {
                title: 'Non-Custodial Design',
                desc: 'We never hold, store, or have access to your private cryptographic keys. Your funds remain entirely in your custody, secured by your local device enclave. We are architecturally incapable of moving your assets.',
              },
              {
                title: 'Distributed Infrastructure',
                desc: 'Our backend operates on a globally distributed, highly redundant server architecture equipped with multi-layered, automated DDoS mitigation systems and geographic load balancing.',
              },
              {
                title: 'End-to-End Encryption',
                desc: 'All data transmitted between your device and our servers, including all chat messages, is secured using TLS 1.3 and AES-256 encryption at rest. We apply encryption at the transport layer, application layer, and storage layer.',
              },
              {
                title: 'Immutable Audit Trails',
                desc: 'Critical system changes, smart contract deployments, and administrative actions are cryptographically signed and logged on an immutable ledger, providing complete forensic traceability.',
              },
              {
                title: 'Hardware Authentication',
                desc: 'Internal access to production environments strictly requires FIDO2 hardware security keys. We do not rely on vulnerable SMS or email-based multi-factor authentication for any privileged access.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="border border-black/8 rounded-xl p-5">
                <h3 className="font-semibold text-black text-[14px] mb-2">{title}</h3>
                <p className="text-[14px] text-black/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 */}
        <section id="cryptography">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. Cryptographic Architecture
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Our cryptographic stack is built on proven, well-audited primitives. We do not use bespoke cryptographic schemes. Every cryptographic component has been subjected to independent peer review and formal security analysis.
            </p>
            <ul className="space-y-3 pl-5">
              {[
                'zk-SNARKs (Groth16 and PLONK variants) for zero-knowledge identity proofs and verifiable computation.',
                'Noir — Aztec Network\'s domain-specific language for writing auditable, custom zero-knowledge circuits deployed on the Aztec rollup.',
                'ECDSA and EdDSA elliptic curve signatures for transaction authentication on supported blockchain networks.',
                'AES-256-GCM for symmetric encryption of all data at rest across our storage infrastructure.',
                'TLS 1.3 with Perfect Forward Secrecy (PFS) for all data in transit.',
                'HKDF-based key derivation for session key management and key rotation protocols.',
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
        <section id="smart-contracts">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. Smart Contract and On-Chain Security
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The decentralised components of our platform are built with the highest standards of smart contract engineering. Given the immutable nature of blockchains, preventing vulnerabilities before deployment is our highest priority.
            </p>
            <ul className="space-y-3 pl-5">
              {[
                ['Rigorous Independent Auditing', 'Every smart contract deployed by Whale Alert Network undergoes exhaustive security audits by tier-1 independent blockchain security firms prior to mainnet launch.'],
                ['Formal Verification', 'We utilise formal mathematical verification techniques to prove the correctness of critical smart contract logic, ensuring immunity to common attack vectors such as reentrancy and integer overflow.'],
                ['Bug Bounty Program', 'We operate a continuous, high-reward public bug bounty program, incentivising the global white-hat hacker community to scrutinise our codebase.'],
                ['Multi-Signature Governance', 'Administrative controls over protocol parameters are secured by decentralised, multi-signature wallets requiring consensus from geographically distributed keyholders.'],
              ].map(([title, desc]) => (
                <li key={title as string} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                  <span><strong className="text-black font-semibold">{title}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5 */}
        <section id="key-management">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. Cryptographic Key Management Lifecycle
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The generation, storage, and rotation of cryptographic keys form the backbone of our data protection strategy. We employ Hardware Security Modules (HSMs) with FIPS 140-2 Level 3 certification to manage all root cryptographic material.
            </p>
            <p>
              Our key rotation protocols are fully automated and trigger on a regular temporal schedule or instantly in the event of suspected compromise. No single employee possesses the clearance or technical capability to extract private keys from HSM enclaves, ensuring total mitigation against insider threats.
            </p>
          </div>
        </section>

        {/* 6 */}
        <section id="access-control">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. Access Control and Personnel Security
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Technology is only as secure as the personnel operating it. Every member of the Whale Alert Network engineering and infrastructure team undergoes a rigorous, multi-stage background check before being granted access to internal systems.
            </p>
            <p>
              Access to critical production databases and deployment pipelines operates on a strict Principle of Least Privilege (PoLP) and requires multi-party computation approvals. All employees participate in mandatory, quarterly security awareness training focused on mitigating advanced social engineering and phishing campaigns.
            </p>
          </div>
        </section>

        {/* 7 */}
        <section id="incident-response">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            7. Incident Response and Transparency
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              While we engineer our systems to be resilient against all known attack vectors, we maintain a highly structured Incident Response Plan (IRP) to address potential zero-day vulnerabilities or systemic anomalies rapidly and effectively.
            </p>
            <p>
              In the event of a severe security incident, our protocol mandates immediate transparency. Users will be notified through all official channels within 24 hours, accompanied by a preliminary technical post-mortem and actionable guidance to protect their assets. We believe that hiding vulnerabilities is a greater risk than the vulnerabilities themselves.
            </p>
          </div>
        </section>

        {/* 8 */}
        <section id="penetration-testing">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            8. Continuous Penetration Testing
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Our infrastructure is subjected to continuous, aggressive penetration testing by specialised red teams mimicking advanced persistent threats (APTs). These simulated cyberattacks target every layer of our technology stack, from cloud infrastructure and APIs down to individual smart contracts.
            </p>
            <p>
              All discovered vulnerabilities are immediately patched, and the mitigation strategies are independently verified before any updates are pushed to the production environment. We adhere strictly to the principle of "secure by default" in every architectural decision.
            </p>
          </div>
        </section>

        {/* 9 */}
        <section id="disaster-recovery">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            9. Disaster Recovery and Business Continuity
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We operate a highly resilient, globally distributed infrastructure engineered to withstand catastrophic failures, natural disasters, and coordinated regional attacks. Our databases are synchronously replicated across multiple independent geographical zones to ensure zero data loss (RPO = 0) and near-instantaneous failover (RTO &lt; 60 seconds).
            </p>
            <p>
              Regular failover drills are conducted quarterly to validate our Business Continuity Plan (BCP) in real-world scenarios, ensuring that our analytics platforms and communication networks remain fully operational under any circumstances.
            </p>
          </div>
        </section>

        {/* 10 */}
        <section id="reporting">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            10. Vulnerability Reporting
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              If you are a security researcher and believe you have discovered a vulnerability in our platform, API, or smart contracts, we strongly encourage responsible disclosure. Please contact our security team before any public disclosure to allow us to investigate and remediate the issue.
            </p>
            <div className="border border-black/10 rounded-xl p-5 sm:p-6 space-y-4 mt-2">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Email</p>
                <a href="mailto:humanityledger@gmail.com" className="text-black text-[15px] underline underline-offset-2 hover:text-black/60 transition-colors break-all">humanityledger@gmail.com</a>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Telegram</p>
                <a href="https://t.me/humanityledger" target="_blank" rel="noopener noreferrer" className="text-black text-[15px] underline underline-offset-2 hover:text-black/60 transition-colors">@humanityledger</a>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Expected Response Time</p>
                <p className="text-black text-[15px]">Within 48 hours of submission</p>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Disclosure Policy</p>
                <p className="text-black/70 text-[14px] leading-relaxed">We request a minimum of 90 days to remediate reported vulnerabilities before any public disclosure. We do not pursue legal action against researchers who disclose in good faith.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
