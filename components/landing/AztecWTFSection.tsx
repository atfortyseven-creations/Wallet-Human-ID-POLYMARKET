"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MermaidDiagram } from "../privacy/MermaidDiagram";

const fadeUp: any = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
      {children}
    </span>
  );
}

function PartLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <div className="w-12 h-[2px] bg-slate-300 rounded-full" />
      <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
        Part {number}
      </span>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />
    </div>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-4 my-8">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4 text-[16px] md:text-[18px] text-slate-700 leading-relaxed items-start">
          <span className="mt-[8px] w-[6px] h-[6px] bg-slate-800 shrink-0" />
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AztecWTFSection() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={heroRef}
      id="wtf-is-aztec"
      className="w-full bg-[#FAFAFC] py-24 md:py-40 relative overflow-hidden"
    >
      {/* Premium subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[900px] mx-auto px-6 md:px-10 relative z-10">

        {/* ─── MASTHEAD ─────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeUp}
          className="text-center mb-20 md:mb-32"
        >
          <Tag>Aztec Network Education</Tag>
          <h2
            className="text-[56px] md:text-[88px] lg:text-[104px] font-bold tracking-tight leading-[0.95] text-slate-900 mb-10 drop-shadow-sm"
          >
            Understanding what<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Aztec Network is</span>
          </h2>
          <p className="text-[20px] md:text-[24px] text-slate-500 leading-relaxed max-w-[720px] mx-auto font-medium">
            Blockchains like Bitcoin and Ethereum provide humanity with programmable digital money.
            Aztec is a privacy first Layer 2 on Ethereum. It enables a critical dimension of programmable
            digital money that has heretofore been ignored:{" "}
            <strong className="text-indigo-600 font-bold">privacy.</strong>
          </p>
        </motion.div>

        {/* Hero image */}
        <div className="w-full max-w-4xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm"><MermaidDiagram chart={`\n    flowchart TD\n      classDef public fill:#ffffff,stroke:#111111,stroke-width:2px,color:#111111\n      classDef private fill:#ffffff,stroke:#111111,stroke-width:2px,stroke-dasharray: 5 5,color:#111111\n      classDef action fill:#f9f9f9,stroke:#111111,stroke-width:1px,color:#111111\n\n      User((User))\n      \n      subgraph Aztec["Aztec Network"]\n        direction LR\n        PState[(Private State)]:::private\n        PuState[(Public State)]:::public\n      end\n      \n      User -- "Shields Assets" --> PState\n      PState -- "Private Transfers" --> PState\n      User -- "Public Transfers" --> PuState\n      PState -- "Unshields Assets" --> PuState\n  `} caption="Understanding Aztec Network: Programmability & Privacy" /></div>

        {/* ─── TL;DR ─────────────────────────────────────────────────── */}
        <Section className="mb-24">
          <div className="bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_24px_80px_rgba(0,0,0,0.04)] rounded-[32px] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8">TL;DR</h3>
            <p className="text-[20px] md:text-[24px] leading-relaxed mb-8 text-slate-800 font-medium">
              Blockchains like Bitcoin and Ethereum provide humanity with programmable digital money.
            </p>
            <p className="text-[18px] md:text-[20px] leading-relaxed mb-6 text-slate-600">
              By <em>programmable digital money,</em> we mean that users can:
            </p>
            <BulletList items={[
              <span key="1" className="text-slate-600">Program what digital money represents, what store of value is assigned to which specific digital currency</span>,
              <span key="2" className="text-slate-600">Define its properties and behavior: the rules of transmitting money, tracing it, destroying it</span>,
              <span key="3" className="text-slate-600">Ensure that money follows the rules and behaviors programmed into it, <strong className="text-slate-900 font-bold">without relying on a trusted third party</strong></span>,
            ]} />
            <div className="mt-12 pt-10 border-t border-slate-200/60">
              <p className="text-[22px] md:text-[28px] font-bold text-slate-900 leading-relaxed">
                Aztec is a privacy first Layer 2 on Ethereum. It enables a critical dimension of
                programmable digital money that has heretofore been ignored:{" "}
                <span className="text-indigo-600">privacy.</span>
              </p>
            </div>
          </div>
        </Section>

        {/* Table of contents */}
        <Section className="mb-24">
          <div className="bg-white rounded-[24px] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Contents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[14px] font-black uppercase tracking-wide text-slate-900 mb-5">Part 1: Introduction to privacy</p>
                <ul className="space-y-4">
                  {["Do we need privacy?", "Do zero knowledge proofs provide privacy by default?", "Early years of blockchain privacy", "What is programmable blockchain privacy?"].map((t, i) => (
                    <li key={i} className="text-[15px] text-slate-500 flex gap-3 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-200" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[14px] font-black uppercase tracking-wide text-slate-900 mb-5">Part 2: How Aztec provides privacy</p>
                <ul className="space-y-4">
                  {["Programmable composable privacy", "Private state", "Composing private state and public state", "How Aztec smart contracts are executed"].map((t, i) => (
                    <li key={i} className="text-[15px] text-slate-500 flex gap-3 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-200" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── PART 1 ────────────────────────────────────────────────── */}
        <Section className="mb-16">
          <PartLabel number="1" title="Introduction to privacy" />
          <h3
            className="text-[40px] md:text-[64px] font-bold tracking-tight text-slate-900 mb-8 leading-[1.05]"
          >
            Part 1<br />
            <span className="text-slate-400">Introduction to privacy</span>
          </h3>
        </Section>

        {/* Do we need privacy? */}
        <Section className="mb-10">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-6 tracking-tight">
            Do we need privacy?
          </h4>
          <p className="text-[18px] md:text-[22px] text-slate-500 leading-relaxed mb-6 italic bg-indigo-50/50 p-6 rounded-2xl border border-indigo-50">
            If you are already an on chain privacy maxi, feel free to skip this section.
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Without privacy, every transaction is transparent. Everyone knows everything happening at all times.
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Can you imagine our world with full financial transparency?
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Today's blockchain activity is transparent not only for individuals but also for governments, corporations, financial and social institutions, Central Banks, insurance companies, hedge funds, family offices, and literally everyone else.
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Needless to say, governments and institutions are loath to jump into a financial system whereby their operations are fully transparent. Where you spend your money, and how, is itself critical intellectual property.
          </p>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 my-10">
            <p className="text-[20px] md:text-[24px] text-slate-800 leading-relaxed font-semibold">
              The problem of transparency is not just in transparency itself, it is in its non configurability.
            </p>
            <p className="text-[18px] text-slate-500 mt-4">
              Blockchain data is unalterably public.
            </p>
          </div>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-8">
            For many use cases, personal data compliance, trading and financial services, pulling off chain assets on chain, some data should stay public while some should stay private. A whole class of use cases demands public and private flexibility:
          </p>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-16">
            <BulletList items={[
              "On chain identity and KYC without data disclosure",
              "Bringing off chain assets on chain (property, art, documents)",
              "Building boutique financial services without trusted third parties",
              "Compliant dapps allowing privacy",
              "Customizable data disclosure (e.g. medical data or ML training datasets)",
            ]} />
          </div>
        </Section>

        {/* ZK Proofs */}
        <Section className="mb-10">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-8 tracking-tight">
            Do zero knowledge proofs provide privacy?
          </h4>
        </Section>

        <div className="w-full max-w-4xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm"><MermaidDiagram chart={`\n    flowchart LR\n      classDef nofill fill:#ffffff,stroke:#111111,stroke-width:2px,color:#111111\n      \n      subgraph ZK["Zero-Knowledge Proofs"]\n        direction TB\n        Scale["Scalability (Rollups)"]:::nofill\n        Integrity["Computation Integrity"]:::nofill\n      end\n      \n      subgraph Privacy["Privacy"]\n        direction TB\n        Conf["Confidentiality"]:::nofill\n        Hide["Data Hiding"]:::nofill\n      end\n      \n      ZK -. "Do NOT provide by default" .-> Privacy\n  `} caption="ZK Proofs provide Scalability & Integrity, not Privacy by default" /></div>

        <Section className="mb-16">
          <div className="bg-white border border-rose-100 rounded-[24px] p-8 md:p-12 mb-8 shadow-sm">
            <p className="text-[13px] font-black uppercase tracking-wide text-rose-500 mb-4">Common Myth</p>
            <p className="text-[18px] md:text-[22px] text-slate-700 leading-relaxed font-medium">
              It is a well known myth that zero knowledge proofs offer privacy by default, or that they make it simple to build dapps with on chain privacy features.
            </p>
          </div>
          <div className="bg-indigo-600 text-white rounded-[24px] p-8 md:p-12 mb-12 shadow-xl shadow-indigo-500/20">
            <p className="text-[13px] font-black uppercase tracking-wide text-indigo-200 mb-4">Reality</p>
            <p className="text-[20px] md:text-[26px] leading-relaxed text-white font-semibold">
              Zero knowledge proofs DO NOT provide privacy by default. It is pretty hard in the current state of affairs to build dapps with privacy features.
            </p>
          </div>
          
          <h5 className="text-[24px] font-bold text-slate-900 mb-6 mt-12">What zero knowledge proofs actually do</h5>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Before ZK proofs, checking that a network state transition is correct required re executing all network transactions. With ZK proofs, instead of re executing all transactions, one can simply verify a constant size proof of correct computation.
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Proving state transitions (as in zk rollups) or proving general claims about arbitrary program execution <strong className="text-slate-900 font-bold">has nothing to do with privacy.</strong>
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed">
            More specifically, zk rollups do <em>not</em> offer privacy by default, nor do they necessarily imply any privacy capability above and beyond public transparent blockchains.
          </p>
        </Section>

        {/* Early years */}
        <Section className="mb-16">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-8 tracking-tight">
            Early years of blockchain privacy
          </h4>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-8">
            You might think Ethereum already has privacy, a fair thought. There are a couple of categories of existing privacy protocols worth mentioning:
          </p>
          <div className="grid gap-6 mb-10">
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-8">
              <h6 className="text-[16px] font-black uppercase tracking-wide text-slate-900 mb-4">Mixnets</h6>
              <p className="text-[16px] md:text-[18px] text-slate-500 leading-relaxed">
                One or more proxy servers take in messages from multiple senders, shuffle them, and send them back out in a random order to the next destination, either a message receiver or another proxy server.
              </p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-8">
              <h6 className="text-[16px] font-black uppercase tracking-wide text-slate-900 mb-4">Monolithic Privacy dApps</h6>
              <p className="text-[16px] md:text-[18px] text-slate-500 leading-relaxed">
                dApps on Ethereum, privacy specific L2s, or privacy specific L1s allowing private transfers. Nevertheless, their functionality is pretty limited: private transfers are allowed only <em>inside</em> the specific dapp, with no cross application composability.
              </p>
            </div>
          </div>
          <div className="bg-slate-900 text-white rounded-3xl p-8 text-center mt-8">
            <p className="text-[20px] md:text-[24px] font-medium">
              As we can see, privacy alone is not enough. <br/>
              <strong className="text-indigo-400 font-bold mt-2 inline-block">It must be programmable.</strong>
            </p>
          </div>
        </Section>

        {/* Programmable privacy */}
        <Section className="mb-16">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-8 tracking-tight">
            What is programmable blockchain privacy?
          </h4>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-10">
            Blockchain privacy can be represented as a sum of two components:
          </p>
          
          {/* Premium inline diagram */}
          <PrivacyComponentsDiagram />

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 mt-10">
            <div className="bg-indigo-50 rounded-[24px] p-8 border border-indigo-100">
              <h6 className="text-[16px] font-black uppercase tracking-wide text-indigo-900 mb-4">Data Privacy</h6>
              <p className="text-[16px] md:text-[18px] leading-relaxed text-indigo-700">
                The ability of smart contracts to have private encrypted state owned by a user and unseen by the external world.
              </p>
            </div>
            <div className="bg-indigo-50 rounded-[24px] p-8 border border-indigo-100">
              <h6 className="text-[16px] font-black uppercase tracking-wide text-indigo-900 mb-4">Confidentiality</h6>
              <p className="text-[16px] md:text-[18px] leading-relaxed text-indigo-700">
                The ability of smart contracts to process encrypted data internally, execute private functions and transactions. Ensures private information is not accessible to unauthorized applications.
              </p>
            </div>
          </div>
        </Section>

        {/* ─── PART 2 ────────────────────────────────────────────────── */}
        <Section className="mb-16 mt-32">
          <PartLabel number="2" title="How has Aztec managed to provide privacy?" />
          <h3
            className="text-[40px] md:text-[64px] font-bold tracking-tight text-slate-900 mb-8 leading-[1.05]"
          >
            Part 2<br />
            <span className="text-slate-400">How has Aztec managed to provide privacy?</span>
          </h3>
          <p className="text-[20px] md:text-[24px] text-slate-600 leading-relaxed">
            We discussed how privacy is insufficient without programmability. But even programmability is not very useful without composability.
          </p>
        </Section>

        {/* Programmable composable */}
        <Section className="mb-16">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-8 tracking-tight">
            Programmable composable privacy
          </h4>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Programmability in a blockchain context implies smart contracts, programs which execute predetermined logic automatically when specific conditions are met. Regular blockchains have <em>public</em> network state.
          </p>
          <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-8 mb-10">
            <p className="text-[20px] md:text-[24px] text-slate-800 leading-relaxed font-medium">
              To make money programmable, composable, and privacy preserving, we need two types of network state: <strong className="text-indigo-600 font-bold">public and private.</strong>
            </p>
          </div>
          <h5 className="text-[24px] font-bold text-slate-900 mb-6">Composability for functional goals</h5>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Imagine a privacy preserving DEX on Aztec Network. Users can make swaps without disclosing what they are swapping or in what volumes. Asset names and transaction volumes stay private.
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            However, if we make all DEX information private, users cannot know asset prices, and without prices, they cannot make trading decisions. So some information, like current asset prices, must stay public.
          </p>
          <div className="inline-block bg-indigo-50 text-indigo-600 font-bold px-6 py-3 rounded-full text-[16px] mb-10">
            Privacy for user information. Publicity for protocol information.
          </div>
          
          <h5 className="text-[24px] font-bold text-slate-900 mb-6">Composability for compliance goals</h5>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed">
            Applications can configure compliance according to specific jurisdictions. Depending on what needs to be proven, only the required minimum of information can be disclosed while the rest stays private. Users can provide evidence that a specific event took place in their transaction history, without disclosing amounts, dates, addresses, or anything else.
          </p>
        </Section>

        {/* Private state */}
        <Section className="mb-10">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-8 tracking-tight">
            Private state
          </h4>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Aztec design for private state intends to leak no data at all. That is why we cannot just encrypt account based state and modify it in place in the tree, modifying a particular encrypted leaf leaks information like the leaf location in the tree, what contract and state it touches, etc.
          </p>
          <div className="bg-slate-50 border-l-4 border-indigo-500 p-8 rounded-r-2xl mb-6">
            <p className="text-[18px] md:text-[22px] text-slate-800 leading-relaxed">
              Therefore, to store private state, Aztec uses an <strong className="font-bold">append only</strong> approach. Existing entries in the database cannot be modified or deleted, only new entries can be appended.
            </p>
          </div>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed">
            To delete or update an entry, Aztec uses <strong className="text-slate-900 font-bold">nullifiers</strong>. Nullifiers live in a separate nullifier tree, the <em>Nullifier Set</em>. To delete an entry, a matching nullifier is created in the nullifier tree.
          </p>
        </Section>

        <div className="w-full max-w-4xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm"><MermaidDiagram chart={`\n    flowchart TD\n      classDef tree fill:#ffffff,stroke:#111111,stroke-width:2px,color:#111111\n      classDef leaf fill:#f9f9f9,stroke:#111111,stroke-width:1px,color:#111111\n      \n      Root["Nullifier Tree Root"]:::tree\n      \n      N1["Node 1"]:::tree\n      N2["Node 2"]:::tree\n      Root --> N1\n      Root --> N2\n      \n      L1["Nullifier A"]:::leaf\n      L2["Nullifier B"]:::leaf\n      L3["Empty"]:::leaf\n      L4["Empty"]:::leaf\n      \n      N1 --> L1\n      N1 --> L2\n      N2 --> L3\n      N2 --> L4\n      \n      style Root font-weight:bold\n  `} caption="The Aztec Nullifier Set: An append-only structure for private state deletion" /></div>

        <Section className="mb-10">
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed">
            To create a nullifier for a specific entry, one must have the nullifier secret key corresponding to the owner of that entry. <strong className="text-slate-900 font-bold">No nullifier key, no nullifier.</strong> Nullifiers are deterministically generated from UTXO inputs and cannot be forged.
          </p>
        </Section>

        <Section className="mb-10">
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed">
            The entry is live if there is no nullifier linked to it in the Nullifier Set.
          </p>
        </Section>

        <Section className="mb-16">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-[32px] p-10 md:p-14 mt-10 shadow-2xl">
            <p className="text-[14px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Core Architecture</p>
            <p className="text-[22px] md:text-[28px] leading-relaxed text-white/95 font-medium">
              Private state is structured as a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 font-bold">UTXO</span>
              {" "}, the same fundamental structure underlying the Bitcoin network. If public state is stored in an account based Merkle Tree and private state in a UTXO based Merkle Tree, how are they composable?
            </p>
          </div>
        </Section>

        {/* Composing states */}
        <Section className="mb-16">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-8 tracking-tight">
            Composing private state and public state
          </h4>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-10">
            The requirements for private and public state transitions are entirely different. Let us deconstruct each:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-slate-200 shadow-md shadow-slate-100/50 rounded-[28px] p-10">
              <h6 className="text-[15px] font-black uppercase tracking-wide text-indigo-600 mb-6">Private State Transitions</h6>
              <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">
                Require <strong className="text-slate-900">client side proof generation</strong> to prevent data leakage. After function execution, a proof of correct execution is generated on the user device <em>before</em> being sent to a sequencer. The private transaction is represented by the proof of its correct execution and a few other pieces of data, commitments, nullifiers, contract deployment data, that disclose nothing about the transaction.
              </p>
            </div>
            <div className="bg-white border border-slate-200 shadow-md shadow-slate-100/50 rounded-[28px] p-10">
              <h6 className="text-[15px] font-black uppercase tracking-wide text-purple-600 mb-6">Public State Transitions</h6>
              <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">
                The correctness of transaction execution is proven by a third party, usually a prover, since there is no need to hide transaction data. In both cases transactions are forwarded to the mempool and ordered by the sequencer.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-[32px] p-10 border border-slate-100">
            <h5 className="text-[20px] font-bold text-slate-900 mb-6">Public functions can:</h5>
            <BulletList items={[
              "Read and write public state",
              "Insert into the UTXO tree for use in private functions",
              "Broadcast information to everyone (similar to msg.data on Ethereum)",
              "Unshield data (move data from private state to public state), if the call was initiated by a private function",
            ]} />
            <h5 className="text-[20px] font-bold text-slate-900 mb-6 mt-12">Private functions can:</h5>
            <BulletList items={[
              "Privately read from, and insert into the private UTXO tree",
              "Insert into the Nullifier Set",
              "Create proofs from historical data (coprocessor functionality)",
              "Shield data (move data from public state to private state)",
              "Call public functions (but without any return values)",
            ]} />
          </div>
        </Section>

        {/* How smart contracts are executed */}
        <Section className="mb-12">
          <h4 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-8 tracking-tight">
            How Aztec smart contracts are executed
          </h4>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-10">
            Aztec smart contract execution follows a specific order:
          </p>
          
          {/* Premium inline execution flow diagram */}
          <ExecutionFlowDiagram />

          

          <h5 className="text-[24px] font-bold text-slate-900 mb-6 mt-12">Private functions to zk SNARK circuits</h5>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-6">
            Private functions do NOT perform any state updates on their own. Instead, they are executed privately and proofs of their correct execution are generated on the user side. Each proof must then be verified by the kernel and rollup circuits.
          </p>
          <p className="text-[18px] md:text-[22px] text-slate-600 leading-relaxed mb-8">
            Every private function is converted into a zk SNARK circuit, made possible thanks to the{" "}
            <a href="https://noir-lang.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">
              Noir
            </a>
            {" "}programming language, a Domain Specific Language for SNARK proving systems developed by the Aztec team.
          </p>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-[28px] p-10 mb-8">
            <h5 className="text-[24px] font-bold text-indigo-900 mb-4">The Private Kernel Circuit</h5>
            <p className="text-[18px] md:text-[22px] text-indigo-700 leading-relaxed">
              To execute all private functions and build a proof of transaction execution correctness, Aztec uses the Private Kernel Circuit, which runs <strong className="font-bold">locally on the user device</strong> so all private inputs remain private.
            </p>
          </div>
        </Section>

        <div className="w-full max-w-4xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm"><MermaidDiagram chart={`\n    sequenceDiagram\n      actor User as User Device\n      participant Kernel as Private Kernel Circuit\n      participant Rollup as Rollup Circuit (Sequencer)\n      participant L1 as Ethereum L1\n      \n      User->>Kernel: 1. Execute Private Function locally\n      Kernel->>Kernel: 2. Generate ZK Proof of Execution\n      Kernel->>Rollup: 3. Send Proof + Public Inputs (No Private Data)\n      Rollup->>Rollup: 4. Verify Proof & Merge with others\n      Rollup->>L1: 5. Post Rollup Proof to L1\n      L1->>L1: 6. Verify Rollup Proof\n  `} caption="Private Kernel Circuit: Local execution ensures private inputs never leave the device" /></div>

        <Section className="mb-20">
          <h5 className="text-[24px] font-bold text-slate-900 mb-6">How the rollup circuit works</h5>
          <div className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-10">
            <BulletList items={[
              "The rollup circuit creates proofs of pairs of transactions recursively until it gets a final block proof",
              "The sequencer validates Oracle data provided as public inputs to the circuits",
              "The sequencer performs UTXO updates",
              "The sequencer performs nullifier updates and validates nullifiers that do not already exist",
            ]} />
            <p className="text-[18px] md:text-[20px] text-slate-500 leading-relaxed mt-10 pt-8 border-t border-slate-100">
              Once the rollup circuit proof is generated, the sequencer posts calldata to L1 and the proof is verified by a smart contract on Ethereum. State hashes and message boxes are updated.
            </p>
          </div>
        </Section>

        {/* ─── SUMMARY ────────────────────────────────────────────────── */}
        <Section className="mt-32">
          <div className="bg-white border border-slate-200 rounded-[40px] p-12 md:p-20 text-center shadow-[0_20px_80px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <Tag>Summary</Tag>
            <h3
              className="text-[40px] md:text-[64px] font-bold text-slate-900 tracking-tight leading-[1.05] mb-10"
            >
              Privacy is a fundamental<br />human right.
            </h3>
            <p className="text-[20px] md:text-[24px] text-slate-500 leading-relaxed mb-12 max-w-[700px] mx-auto">
              We all expect privacy with our personal info, payments, and daily communications. Aztec Labs is building toward a blockchain based internet where privacy will be protected.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16">
              <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-10">
                <div className="text-[14px] font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  For Developers
                </div>
                <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">Build privacy preserving applications using Noir, the universal ZK language.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-10">
                <div className="text-[14px] font-black uppercase tracking-widest text-purple-500 mb-4 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  For Users
                </div>
                <p className="text-[16px] md:text-[18px] text-slate-600 leading-relaxed">Selectively reveal information about your identity, finances, and more, on your terms.</p>
              </div>
            </div>
            
            <p className="text-[20px] md:text-[24px] font-bold text-indigo-600 mt-10 mb-12">
              Privacy is the single critical feature that will bring users into this future.
            </p>
            
            <div>
              <a
                href="https://aztec.network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white text-[14px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
              >
                Learn More at aztec.network
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
            </div>
          </div>
        </Section>

      </div>
    </section>
  );
}


function PrivacyComponentsDiagram() { return <div className="w-full max-w-4xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm"><MermaidDiagram chart={`\n    flowchart LR\n      classDef comp fill:#ffffff,stroke:#111111,stroke-width:2px,color:#111111\n      \n      P["Programmable Privacy"]:::comp\n      D["Data Privacy"]:::comp\n      C["Confidentiality"]:::comp\n      \n      P --> D\n      P --> C\n  `} caption="The two architectural pillars of programmable blockchain privacy" /></div>; }

function ExecutionFlowDiagram() { return <div className="w-full max-w-4xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm"><MermaidDiagram chart={`\n    flowchart TD\n      classDef node fill:#ffffff,stroke:#111111,stroke-width:2px,color:#111111\n      \n      A["1. Private Function (User Device)"]:::node\n      B["2. Private Kernel Circuit (User Device)"]:::node\n      C["3. Sequencer Mempool"]:::node\n      D["4. Rollup Circuit (Sequencer)"]:::node\n      E["5. Ethereum L1 Verification"]:::node\n      \n      A --> B\n      B --> C\n      C --> D\n      D --> E\n  `} caption="End to end flow: from user device to Ethereum L1 finality" /></div>; }