'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';
import { Target, Sparkles, Lock, Shield, Users, Globe, Activity, Rocket, Lightbulb, Handshake, Leaf } from 'lucide-react';

const TOC: TocItem[] = [
  { id: 'origin', label: 'Our Origin Story' },
  { id: 'mission-vision', label: 'Mission & Vision' },
  { id: 'values', label: 'Core Values' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'global-reach', label: 'Global Reach & ESG' },
  { id: 'technology', label: 'Technology Stack' },
  { id: 'open-source-aztec', label: 'Open Source & Aztec Integration' },
];

const VALUES = [
  { icon: <Lock size={18} />, title: 'Privacy First', desc: 'Your personal data is yours. We use advanced cryptography to verify authenticity without ever storing or selling sensitive user information.' },
  { icon: <Shield size={18} />, title: 'Absolute Security', desc: 'We implement the highest security standards in the industry, undergoing regular public audits. Your funds remain in your custody at all times.' },
  { icon: <Users size={18} />, title: 'Community Driven', desc: 'We build for our users. Every feature is meticulously designed with the feedback, needs, and safety of our global community in mind.' },
  { icon: <Globe size={18} />, title: 'Global Accessibility', desc: 'Financial tools should not be limited by geography. We design our platform to be lightweight, responsive, and usable from any device, anywhere.' },
  { icon: <Activity size={18} />, title: 'Transparency', desc: 'We believe trust is earned through complete transparency. From open-source components to clear documentation, we hide nothing from our users.' },
  { icon: <Rocket size={18} />, title: 'Continuous Innovation', desc: 'We constantly iterate and improve our platform, adopting the latest proven technologies to provide the fastest and most reliable experience possible.' },
  { icon: <Lightbulb size={18} />, title: 'Education & Empowerment', desc: 'We do not just provide tools; we provide knowledge. We are committed to educating our users to make informed, intelligent financial decisions.' },
  { icon: <Handshake size={18} />, title: 'Integrity', desc: 'We operate with uncompromising ethical standards. We do not engage in hidden fees, deceptive practices, or user manipulation of any kind.' },
  { icon: <Leaf size={18} />, title: 'Sustainability', desc: 'We are committed to building a platform that is economically sustainable and environmentally conscious by selecting efficient blockchain networks.' },
];

const STACK = [
  {
    title: 'Frontend Architecture',
    items: ['React & Next.js for server-side rendering and high performance', 'Tailwind CSS for precise, responsive, and accessible UI design', 'Framer Motion for fluid, hardware-accelerated micro-animations', 'Strict TypeScript for robust, error-free codebases'],
  },
  {
    title: 'Backend Systems',
    items: ['Node.js & Edge Functions for ultra-low latency global distribution', 'PostgreSQL for highly reliable, ACID-compliant data storage', 'Redis caching layers for instant real-time messaging delivery', 'GraphQL and REST APIs for highly efficient data querying'],
  },
  {
    title: 'Security Infrastructure',
    items: ['Zero-Knowledge Proofs (zk-SNARKs) for absolute privacy preservation', 'End-to-end encrypted protocol layers for all communications', 'WebAuthn and secure biometric authentication integration', 'Multi-layered automated DDoS protection and traffic filtering'],
  },
  {
    title: 'Blockchain Integration',
    items: ['EVM-compatible, deeply audited smart contract infrastructure', 'Viem & Wagmi for resilient, agnostic wallet connection layers', 'Enterprise-tier node providers (Alchemy, Infura) for uptime', 'Advanced real-time mempool monitoring and transaction simulation', 'Aztec Network (programmable ZK rollup) for private on-chain state transitions', 'Noir — domain-specific language for writing custom zero-knowledge circuits'],
  },
];

export default function AboutPage() {
  return (
    <LegalDocLayout
      title="About Us"
      subtitle="The mission, vision, and people behind Whale Alert Network — a platform built to make advanced decentralised finance accessible, transparent, and secure for everyone."
      lastUpdated="May 25, 2026"
      category="Company"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* Origin */}
        <section id="origin">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Our Origin Story
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Whale Alert Network was founded with a simple, profound realisation: the technological tools and market analytics used by professional traders and large financial institutions were vastly superior to those available to everyday users. Moreover, the decentralised finance (DeFi) space, while promising absolute transparency and democratisation, was becoming increasingly complex, fragmented, and fraught with security risks.
            </p>
            <p>
              A specialised group of passionate software engineers, financial analysts, and user experience designers came together to bridge this growing gap. We set out to build a holistic platform that strips away the daunting complexity of blockchain technology, presenting users with a clean, intuitive, and highly professional interface that rivals the best consumer applications in the world.
            </p>
            <p>
              The result is a comprehensive Web3 dashboard that seamlessly integrates nine core modules — including the Humanity Ledger (a real-time on-chain scanner and private portfolio tracker) and Whale Chat (end-to-end encrypted wallet-to-wallet messaging) — accessible across devices via a frictionless, cryptographically secure QR-code session synchronisation.
            </p>
            <p>
              From our early days developing simple portfolio trackers, we have rapidly evolved into a comprehensive global ecosystem. Today, we offer real-time market analysis, secure end-to-end encrypted communication channels, advanced asset management tools, and institutional-grade charting — all packaged into an accessible web application. Our fundamental commitment to never compromising on user privacy has guided every architectural decision we have made since day one.
            </p>
            <p>
              We maintain 100% operational status across our distributed node infrastructure with zero reported outages, demonstrating a proven track record of shipping complex features without compromising security or uptime.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section id="mission-vision">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Mission &amp; Vision
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border border-black/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border border-black/15 rounded-lg flex items-center justify-center">
                  <Target size={16} className="text-black" />
                </div>
                <h3 className="font-bold text-black text-[15px]">Our Mission</h3>
              </div>
              <p className="text-[14px] leading-relaxed text-black/65">
                To democratise access to global financial markets by providing powerful, transparent, and easy-to-use analytical tools while stringently protecting user data. We aim to break down the traditional barriers of entry to decentralised finance, empowering individuals worldwide to take full, informed control of their economic future.
              </p>
            </div>
            <div className="border border-black/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border border-black/15 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-black" />
                </div>
                <h3 className="font-bold text-black text-[15px]">Our Vision</h3>
              </div>
              <p className="text-[14px] leading-relaxed text-black/65">
                We envision a global society where financial systems are open, inclusive, and built on verifiable trustless technology. A future where every person can verify their identity and manage their digital assets without compromising their privacy, accessing elite trading analytics and secure networks from any device, anywhere in the world.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section id="values">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Core Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="border border-black/8 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="text-black/40">{icon}</div>
                  <h4 className="font-semibold text-black text-[14px]">{title}</h4>
                </div>
                <p className="text-[13px] text-black/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Leadership */}
        <section id="leadership">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Leadership &amp; Corporate Governance
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <div className="flex flex-col sm:flex-row gap-6 items-start border border-black/8 rounded-xl p-6">
              <div className="sm:w-[140px] shrink-0">
                <img
                  src="/system-shots/photo_2026-05-16_19-57-16.jpg"
                  alt="Stefan Antonio Cirisanu, CEO"
                  className="rounded-xl border border-black/10 w-full object-cover aspect-square"
                />
                <p className="mt-3 text-[13px] font-bold text-black text-center">Stefan Antonio Cirisanu</p>
                <p className="text-[11px] text-black/45 text-center font-mono uppercase tracking-wider mt-0.5">CEO & Founder</p>
                <div className="flex flex-col items-center gap-1 mt-2">
                  <a href="https://x.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="text-[11px] text-black/50 hover:text-black/80 transition-colors font-mono">@whalecosystem</a>
                  <a href="https://www.linkedin.com/in/stefan-antonio-cirisanu-40116140b/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-black/50 hover:text-black/80 transition-colors font-mono">LinkedIn</a>
                </div>
              </div>
              <div className="space-y-3">
                <p>
                  The team behind Whale Alert Network is a diverse, globally distributed group of professionals. Our leadership brings together extensive experience from top-tier technology companies, traditional financial institutions, and leading blockchain research organisations. We operate in a flat, meritocratic structure where the best ideas win, regardless of who proposes them.
                </p>
                <p>
                  We foster a culture of continuous learning and intense focus on user experience. Our team is united by a shared passion for decentralisation and a profound respect for individual privacy.
                </p>
                <p>
                  Our corporate governance employs an independent board of advisors composed of legal experts, cybersecurity veterans, and macroeconomists who rigorously audit our strategic direction. This ensures that every technological deployment strictly aligns with our foundational manifesto of user empowerment and ethical financial indexing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Reach & ESG */}
        <section id="global-reach">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Global Reach &amp; ESG Commitment
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Whale Alert Network is not confined by geopolitical borders. Our infrastructure is deployed across multiple regions, ensuring low-latency access and uninterrupted service for a truly global user base. We are actively localising our analytics engine to support multiple international languages and region-specific regulatory frameworks.
            </p>
            <p>
              Environmental, Social, and Governance (ESG) principles are embedded deep within our operational DNA. In an industry often criticised for its carbon footprint, we have strategically aligned our node infrastructure with data centres powered entirely by renewable energy sources. We actively support research into energy-efficient cryptographic proofs and aggressively optimise our server-side computational load to minimise our environmental impact.
            </p>
          </div>
        </section>

        {/* Technology */}
        <section id="technology">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Technology Stack
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70 mb-6">
            <p>
              We leverage a modern, robust, and heavily audited technology stack to deliver a seamless user experience, ensuring uncompromising performance, security, and scalability across global markets.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STACK.map(({ title, items }) => (
              <div key={title} className="border border-black/8 rounded-xl p-5">
                <h3 className="font-semibold text-black text-[14px] mb-3">{title}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-black/60 leading-snug">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source & Aztec Integration */}
        <section id="open-source-aztec">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Open Source &amp; Aztec Integration
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Whale Alert Network is entirely <strong>Open Source</strong>. We believe that true financial Privatety and privacy can only be achieved when the underlying code is fully transparent, auditable, and verifiable by the community. We do not commercialise the system; our goal is to provide a robust, production-ready public good for the decentralised ecosystem.
            </p>
            <p>
              We are deeply integrated with the <strong>Aztec Network</strong>, a programmable zero-knowledge (ZK) rollup. By leveraging Aztec’s Noir circuits and confidential execution environments, we obscure sensitive user interactions:
            </p>
            <ul className="space-y-2 pl-5">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                <span><strong>Whale Chat:</strong> Utilises Aztec’s encrypted logs and private state variables to ensure wallet-to-wallet messages remain absolutely confidential on-chain.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                <span><strong>Humanity Ledger:</strong> Acts as a secure, private block explorer. Through custom Aztec account contracts, users can privately view balances and history without exposing their financial footprint to the public network.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                <span><strong>QR Session Sync:</strong> Employs ZK proofs for session validation across mobile and desktop, authenticated via Aztec account contracts without exposing private keys over the network.</span>
              </li>
            </ul>
            <p>
              This open-source initiative, spearheaded by our founder Stefan Antonio Cirisanu, is actively seeking support through the Aztec Network grant program to fund rigorous security auditing of our custom Noir circuits and facilitate our full deployment to the Aztec ecosystem.
            </p>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
