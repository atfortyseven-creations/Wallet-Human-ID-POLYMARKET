"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CDN = "https://cdn.prod.website-files.com/6853ac4c855c81d9ecabc574";

const IMAGES = {
  hero:           `${CDN}/68aefb9095a0a1447e9d5536_Aztec%20Blog%20Template_Archive.webp`,
  transparency:   `${CDN}/68a35dcfe6c0178ab9ab92d4_65d8b665f2958ed62f9ed3f7_image-7.webp`,
  privacyFeature: `${CDN}/68a35df115b93ae708ac249b_65d8b67818df829df1917b12_image-6.webp`,
  zkProofs:       `${CDN}/68a35dfdda3f0b7efe948426_65d8b68acf09fc8ea957d48d_image-8-1024x538.webp`,
  dataPrivacy:    `${CDN}/68a35e1c38e0197c1af7c5ee_65d8b6bf4ee00bcecc27b4a3_image-9.webp`,
  nullifierTree:  `${CDN}/68a35e4f3e3f72762c521c89_65d8b706f8126c79c3e1365d.webp`,
  nullifierKey:   `${CDN}/68a35e5fe92b23d5116d30f5_65d8b70f3f47b0bc87faaf75_image-10.webp`,
  entryLive:      `${CDN}/68a35e8438f84162c0117534_65d8b72f6d58b591415e06c2_image-11.webp`,
  kernelCircuit:  `${CDN}/68a35ec438e0197c1af81cf6_65d8b769b6af8c17617287c8.webp`,
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const fadeIn: any = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut", delay },
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

function Img({ src, alt, caption, className = "" }: { src: string; alt: string; caption?: string; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.figure
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeIn}
      custom={0.1}
      className={`w-full my-10 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover rounded-[20px] border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.07)]"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-[11px] text-black/40 font-medium tracking-wide">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.18em] mb-4">
      {children}
    </span>
  );
}

function PartLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-8 h-[1px] bg-black/20" />
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40">
        Part {number}
      </span>
      <div className="flex-1 h-[1px] bg-black/10" />
    </div>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3 my-6">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[16px] md:text-[18px] text-black/65 leading-relaxed">
          <span className="mt-[6px] w-[6px] h-[6px] rounded-full bg-black/30 shrink-0" />
          <span>{item}</span>
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
      className="w-full bg-[#F8F8F6] border-t border-black/[0.06] py-24 md:py-36"
    >
      <div className="w-full max-w-[860px] mx-auto px-6 md:px-8">

        {/* ─── MASTHEAD ─────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeUp}
          className="text-center mb-16 md:mb-24"
        >
          <Tag>Aztec Network · Feb 23rd 2024</Tag>
          <h2
            className="text-[48px] md:text-[80px] lg:text-[96px] font-bold tracking-tight leading-[0.95] text-black mb-8"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            WTF is<br />
            <em className="italic">Aztec?</em>
          </h2>
          <p className="text-[18px] md:text-[22px] text-black/60 leading-relaxed max-w-[640px] mx-auto font-medium">
            Blockchains like Bitcoin and Ethereum provide humanity with programmable digital money.
            Aztec is a privacy-first Layer 2 on Ethereum. It enables a critical dimension of programmable
            digital money that has heretofore been ignored:{" "}
            <strong className="text-black font-semibold">privacy.</strong>
          </p>
        </motion.div>

        {/* Hero image */}
        <Img
          src={IMAGES.hero}
          alt="WTF is Aztec — Hero"
          className="mb-20"
        />

        {/* ─── TL;DR ─────────────────────────────────────────────────── */}
        <Section className="mb-20">
          <div className="bg-black text-white rounded-[24px] p-8 md:p-12">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">TL;DR</h3>
            <p className="text-[18px] md:text-[20px] leading-relaxed mb-6 text-white/90">
              Blockchains like Bitcoin and Ethereum provide humanity with programmable digital money.
            </p>
            <p className="text-[16px] md:text-[18px] leading-relaxed mb-4 text-white/75">
              By <em>programmable digital money,</em> we mean that users can:
            </p>
            <BulletList items={[
              <span key="1" className="text-white/75">Program what digital money represents — what store of value is assigned to which specific digital currency</span>,
              <span key="2" className="text-white/75">Define its properties and behavior: the rules of transmitting money, tracing it, destroying it, etc.</span>,
              <span key="3" className="text-white/75">Ensure that money follows the rules and behaviors programmed into it — <strong className="text-white">without relying on a trusted third party</strong></span>,
            ]} />
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-[20px] md:text-[24px] font-bold text-white leading-relaxed">
                Aztec is a privacy-first Layer 2 on Ethereum. It enables a critical dimension of
                programmable digital money that has heretofore been ignored:{" "}
                <span className="text-[#D4FF28]">privacy.</span>
              </p>
            </div>
          </div>
        </Section>

        {/* Table of contents */}
        <Section className="mb-20">
          <div className="border border-black/10 rounded-[20px] p-8 bg-white">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 mb-6">Contents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[13px] font-black uppercase tracking-wide text-black mb-3">Part 1: Introduction into privacy</p>
                <ul className="space-y-2">
                  {["Do we need privacy?", "Do zero-knowledge proofs provide privacy by default?", "Early years of blockchain privacy", "What is programmable blockchain privacy?"].map((t, i) => (
                    <li key={i} className="text-[14px] text-black/55 flex gap-2">
                      <span className="text-black/20">—</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[13px] font-black uppercase tracking-wide text-black mb-3">Part 2: How Aztec provides privacy</p>
                <ul className="space-y-2">
                  {["Programmable composable privacy", "Private state", "Composing private state and public state", "How Aztec smart contracts are executed"].map((t, i) => (
                    <li key={i} className="text-[14px] text-black/55 flex gap-2">
                      <span className="text-black/20">—</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── PART 1 ────────────────────────────────────────────────── */}
        <Section className="mb-12">
          <PartLabel number="1" title="Introduction to privacy" />
          <h3
            className="text-[36px] md:text-[52px] font-bold tracking-tight text-black mb-6 leading-[1.1]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Part 1:<br />Introduction to privacy
          </h3>
        </Section>

        {/* Do we need privacy? */}
        <Section className="mb-6">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            Do we need privacy?
          </h4>
          <p className="text-[16px] md:text-[18px] text-black/60 leading-relaxed mb-4 italic">
            If you're already an on-chain privacy maxi, feel free to skip this section.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Without privacy, every transaction is transparent. Everyone knows everything happening at all times.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            Can you imagine our world with full financial transparency?
          </p>
        </Section>

        <Img src={IMAGES.transparency} alt="Full financial transparency" caption="Full financial transparency — the uncomfortable reality of today's public blockchains" />

        <Section className="mb-6">
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Today's blockchain activity is transparent not only for individuals but also for governments, corporations, financial and social institutions — Central Banks, insurance companies, hedge funds, family offices — and literally everyone else.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Needless to say, governments and institutions are loath to jump into a financial system whereby their operations are fully transparent. Where you spend your money — and how — is itself critical intellectual property.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            <strong className="text-black">The problem of transparency is not just in transparency itself — it's in its non-configurability.</strong> Blockchain data is unalterably public.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-6">
            For many use cases — personal data compliance, trading and financial services, pulling off-chain assets on-chain — some data should stay public while some should stay private. A whole class of use-cases demands public-private flexibility:
          </p>
          <BulletList items={[
            "On-chain identity and KYC without data disclosure",
            "Bringing off-chain assets on-chain (property, art, documents)",
            "Building boutique financial services without trusted third parties",
            "Compliant dapps allowing privacy",
            "Customizable data disclosure (e.g., medical data or ML training datasets)",
          ]} />
        </Section>

        <Img src={IMAGES.privacyFeature} alt="What is privacy in blockchain context?" caption="What features and properties should blockchain privacy have?" />

        {/* ZK Proofs */}
        <Section className="mb-6">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            Do zero-knowledge proofs provide privacy?
          </h4>
        </Section>

        <Img src={IMAGES.zkProofs} alt="ZK Proofs and privacy" />

        <Section className="mb-12">
          <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-6 md:p-8 mb-6">
            <p className="text-[15px] font-black uppercase tracking-wide text-amber-700 mb-3">Common Myth</p>
            <p className="text-[16px] md:text-[18px] text-amber-900 leading-relaxed">
              It's a well-known myth that zero-knowledge proofs offer privacy by default, or that they make it simple to build dapps with on-chain privacy features.
            </p>
          </div>
          <div className="bg-black text-white rounded-[16px] p-6 md:p-8 mb-6">
            <p className="text-[15px] font-black uppercase tracking-wide text-white/50 mb-3">Reality</p>
            <p className="text-[16px] md:text-[18px] leading-relaxed text-white/90">
              Zero-knowledge proofs <strong className="text-[#D4FF28]">DO NOT</strong> provide privacy by default. It's pretty hard in the current state of affairs to build dapps with privacy features.
            </p>
          </div>
          <h5 className="text-[20px] font-bold text-black mb-4 mt-8">What zero-knowledge proofs actually do</h5>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Before ZK proofs, checking that a network state transition is correct required re-executing all network transactions. With ZK proofs, instead of re-executing all transactions, one can simply verify a ~constant-size proof of correct computation.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Proving state transitions (as in zk-rollups) or proving general claims about arbitrary program execution <strong className="text-black">has nothing to do with privacy.</strong>
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            More specifically, zkRollups do <em>not</em> offer privacy by default, nor do they necessarily imply any privacy capability above and beyond public transparent blockchains.
          </p>
        </Section>

        {/* Early years */}
        <Section className="mb-12">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            Early years of blockchain privacy
          </h4>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-6">
            You might think Ethereum already has privacy — a fair thought. There are a couple of categories of existing privacy protocols worth mentioning:
          </p>
          <div className="space-y-4">
            <div className="border border-black/10 rounded-[16px] p-6 bg-white">
              <h6 className="text-[14px] font-black uppercase tracking-wide text-black mb-2">Mixnets</h6>
              <p className="text-[15px] md:text-[16px] text-black/65 leading-relaxed">
                One or more proxy servers take in messages from multiple senders, shuffle them, and send them back out in a random order to the next destination — either a message receiver or another proxy server.
              </p>
            </div>
            <div className="border border-black/10 rounded-[16px] p-6 bg-white">
              <h6 className="text-[14px] font-black uppercase tracking-wide text-black mb-2">"Monolithic" Privacy dApps</h6>
              <p className="text-[15px] md:text-[16px] text-black/65 leading-relaxed">
                dApps on Ethereum, privacy-specific L2s, or privacy-specific L1s allowing private transfers. Nevertheless, their functionality is pretty limited: private transfers are allowed only <em>inside</em> the specific dapp, with no cross-application composability.
              </p>
            </div>
          </div>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mt-6">
            As we can see, privacy alone is not enough. <strong className="text-black">It must be programmable.</strong>
          </p>
        </Section>

        {/* Programmable privacy */}
        <Section className="mb-12">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            What is programmable blockchain privacy?
          </h4>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-6">
            Blockchain privacy can be represented as a sum of two components:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="bg-black text-white rounded-[20px] p-8">
              <div className="text-[32px] mb-4">🔒</div>
              <h6 className="text-[15px] font-black uppercase tracking-wide text-white/60 mb-3">Data Privacy</h6>
              <p className="text-[15px] md:text-[16px] leading-relaxed text-white/85">
                The ability of smart contracts to have private (encrypted) state owned by a user and unseen by the external world.
              </p>
            </div>
            <div className="bg-black text-white rounded-[20px] p-8">
              <div className="text-[32px] mb-4">🫥</div>
              <h6 className="text-[15px] font-black uppercase tracking-wide text-white/60 mb-3">Confidentiality</h6>
              <p className="text-[15px] md:text-[16px] leading-relaxed text-white/85">
                The ability of smart contracts to process encrypted data internally — execute private functions and transactions. Ensures private information is not accessible to unauthorized applications.
              </p>
            </div>
          </div>
        </Section>

        <Img src={IMAGES.dataPrivacy} alt="Data privacy and confidentiality" caption="The two pillars of programmable blockchain privacy" />

        {/* ─── PART 2 ────────────────────────────────────────────────── */}
        <Section className="mb-12 mt-16">
          <PartLabel number="2" title="How has Aztec managed to provide privacy?" />
          <h3
            className="text-[36px] md:text-[52px] font-bold tracking-tight text-black mb-6 leading-[1.1]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Part 2:<br />How has Aztec managed<br />to provide privacy?
          </h3>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            We discussed how privacy is insufficient without programmability. But even programmability is not very useful without composability.
          </p>
        </Section>

        {/* Programmable composable */}
        <Section className="mb-12">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            Programmable composable privacy
          </h4>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Programmability in a blockchain context implies smart contracts — programs which execute predetermined logic automatically when specific conditions are met. Regular blockchains have <em>public</em> network state.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            To make money programmable, composable, and privacy-preserving, we need two types of network state: <strong className="text-black">public and private.</strong>
          </p>
          <h5 className="text-[20px] font-bold text-black mb-4 mt-8">Composability for functional goals</h5>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Imagine a privacy-preserving DEX on Aztec Network. Users can make swaps without disclosing what they're swapping or in what volumes. Asset names and transaction volumes stay private.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            However, if we make all DEX information private, users can't know asset prices — and without prices, they can't make trading decisions. So some information, like current asset prices, must stay public.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed font-medium text-black">
            Privacy for user information. Publicity for protocol information.
          </p>
          <h5 className="text-[20px] font-bold text-black mb-4 mt-8">Composability for compliance goals</h5>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            Applications can configure compliance according to specific jurisdictions. Depending on what needs to be proven, only the required minimum of information can be disclosed while the rest stays private. Users can provide evidence that a specific event took place in their transaction history — without disclosing amounts, dates, addresses, or anything else.
          </p>
        </Section>

        {/* Private state */}
        <Section className="mb-6">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            Private state
          </h4>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Aztec's design for private state intends to leak no data at all. That's why we can't just encrypt account-based state and modify it in-place in the tree — modifying a particular encrypted leaf leaks information like the leaf location in the tree, what contract and state it touches, etc.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Therefore, to store private state, Aztec uses an <strong className="text-black">"append only"</strong> approach. Existing entries in the database cannot be modified or deleted — only new entries can be appended.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            To delete or update an entry, Aztec uses <strong className="text-black">nullifiers</strong>. Nullifiers live in a separate nullifier tree — the <em>Nullifier Set</em>. To delete an entry, a matching nullifier is created in the nullifier tree.
          </p>
        </Section>

        <Img src={IMAGES.nullifierTree} alt="Nullifier tree structure" caption="The Aztec Nullifier Set — an append-only structure for private state deletion" />

        <Section className="mb-6">
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            To create a nullifier for a specific entry, one must have the nullifier secret key corresponding to the owner of that entry. <strong className="text-black">No nullifier key — no nullifier.</strong> Nullifiers are deterministically generated from UTXO inputs and can't be forged.
          </p>
        </Section>

        <Img src={IMAGES.nullifierKey} alt="Nullifier key structure" caption="Nullifiers are deterministically generated — they cannot be forged without the secret key" />

        <Section className="mb-6">
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            The entry is live if there is no nullifier linked to it in the Nullifier Set.
          </p>
        </Section>

        <Img src={IMAGES.entryLive} alt="Entry liveness in Aztec" caption="An entry is live as long as no matching nullifier exists in the Nullifier Set" />

        <Section className="mb-12">
          <div className="bg-black text-white rounded-[20px] p-8 md:p-10 mt-4">
            <p className="text-[13px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Core Architecture</p>
            <p className="text-[17px] md:text-[19px] leading-relaxed text-white/90">
              Private state is structured as a{" "}
              <span className="text-[#D4FF28] font-semibold">UTXO</span>
              {" "}— the same fundamental structure underlying the Bitcoin network. If public state is stored in an account-based Merkle Tree and private state in a UTXO-based Merkle Tree, how are they composable?
            </p>
          </div>
        </Section>

        {/* Composing states */}
        <Section className="mb-12">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            Composing private state and public state
          </h4>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-6">
            The requirements for private and public state transitions are entirely different. Let's deconstruct each:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="border border-black/10 rounded-[20px] p-7 bg-white">
              <h6 className="text-[13px] font-black uppercase tracking-wide text-black/50 mb-4">Private State Transitions</h6>
              <p className="text-[15px] text-black/70 leading-relaxed">
                Require <strong className="text-black">client-side proof generation</strong> to prevent data leakage. After function execution, a proof of correct execution is generated on the user's device <em>before</em> being sent to a sequencer. The private transaction is represented by the proof of its correct execution and a few other pieces of data — commitments, nullifiers, contract deployment data — that disclose nothing about the transaction.
              </p>
            </div>
            <div className="border border-black/10 rounded-[20px] p-7 bg-white">
              <h6 className="text-[13px] font-black uppercase tracking-wide text-black/50 mb-4">Public State Transitions</h6>
              <p className="text-[15px] text-black/70 leading-relaxed">
                The correctness of transaction execution is proven by a third party — usually a prover — since there is no need to hide transaction data. In both cases transactions are forwarded to the mempool and ordered by the sequencer.
              </p>
            </div>
          </div>
          <h5 className="text-[18px] font-bold text-black mb-4">Public functions can:</h5>
          <BulletList items={[
            "Read and write public state",
            "Insert into the UTXO tree for use in private functions",
            "Broadcast information to everyone (similar to msg.data on Ethereum)",
            "Unshield data (move data from private state to public state), if the call was initiated by a private function",
          ]} />
          <h5 className="text-[18px] font-bold text-black mb-4 mt-6">Private functions can:</h5>
          <BulletList items={[
            "Privately read from, and insert into the private UTXO tree",
            "Insert into the Nullifier Set",
            "Create proofs from historical data (coprocessor functionality)",
            "Shield data (move data from public state to private state)",
            "Call public functions (but without any return values)",
          ]} />
        </Section>

        {/* How smart contracts are executed */}
        <Section className="mb-6">
          <h4 className="text-[24px] md:text-[32px] font-bold text-black mb-5 tracking-tight">
            How Aztec smart contracts are executed
          </h4>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-6">
            Aztec smart contract execution follows a specific order:
          </p>
          <div className="space-y-4 mb-8">
            {[
              { n: "1", t: "All private functions are executed in an execution trace" },
              { n: "2", t: "A proof of correct execution is generated on the user's device" },
              { n: "3", t: "All public functions are executed by the sequencer" },
            ].map((s) => (
              <div key={s.n} className="flex gap-5 items-start bg-white border border-black/8 rounded-[16px] p-6">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-[14px] font-black shrink-0">
                  {s.n}
                </div>
                <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed pt-1">{s.t}</p>
              </div>
            ))}
          </div>
          <h5 className="text-[20px] font-bold text-black mb-4">Private functions → zk-SNARK circuits</h5>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Private functions do NOT perform any state updates on their own. Instead, they are executed privately and proofs of their correct execution are generated on the user's side. Each proof must then be verified by the kernel and rollup circuits.
          </p>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mb-4">
            Every private function is converted into a zk-SNARK circuit — made possible thanks to the{" "}
            <a href="https://noir-lang.org/" target="_blank" rel="noopener noreferrer" className="underline text-black font-semibold">
              Noir
            </a>
            {" "}programming language — a Domain Specific Language for SNARK proving systems developed by the Aztec team.
          </p>
          <h5 className="text-[20px] font-bold text-black mb-4 mt-8">The Private Kernel Circuit</h5>
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
            To execute all private functions and build a proof of transaction execution correctness, Aztec uses the Private Kernel Circuit — which runs <strong className="text-black">locally on the user's device</strong> so all private inputs remain private.
          </p>
        </Section>

        <Img src={IMAGES.kernelCircuit} alt="How the Private Kernel Circuit works" caption="The Private Kernel Circuit — runs locally on the user's device to ensure private inputs never leave" />

        <Section className="mb-12">
          <h5 className="text-[20px] font-bold text-black mb-4">How the rollup circuit works</h5>
          <BulletList items={[
            "The rollup circuit creates proofs of pairs of transactions recursively until it gets a final block proof",
            "The sequencer validates 'Oracle' data provided as public inputs to the circuits",
            "The sequencer performs UTXO updates",
            "The sequencer performs nullifier updates and validates nullifiers that do not already exist",
          ]} />
          <p className="text-[16px] md:text-[18px] text-black/70 leading-relaxed mt-6">
            Once the rollup circuit proof is generated, the sequencer posts calldata to L1 and the proof is verified by a smart contract on Ethereum. State hashes and message boxes are updated.
          </p>
        </Section>

        {/* ─── SUMMARY ────────────────────────────────────────────────── */}
        <Section className="mt-20">
          <div className="bg-black rounded-[28px] p-10 md:p-14 text-center">
            <Tag>Summary</Tag>
            <h3
              className="text-[32px] md:text-[52px] font-bold text-white tracking-tight leading-[1.1] mb-8"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Privacy is a fundamental<br />human right.
            </h3>
            <p className="text-[17px] md:text-[20px] text-white/70 leading-relaxed mb-8 max-w-[600px] mx-auto">
              We all expect privacy with our personal info, payments, and daily communications. Aztec Labs is building toward a blockchain-based internet where privacy will be protected.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left mt-10">
              <div className="bg-white/5 border border-white/10 rounded-[16px] p-6">
                <div className="text-[24px] mb-3">👩‍💻</div>
                <h6 className="text-[14px] font-black uppercase tracking-wide text-white/50 mb-2">For Developers</h6>
                <p className="text-[15px] text-white/75 leading-relaxed">Build privacy-preserving applications using Noir — the universal ZK language</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[16px] p-6">
                <div className="text-[24px] mb-3">🔐</div>
                <h6 className="text-[14px] font-black uppercase tracking-wide text-white/50 mb-2">For Users</h6>
                <p className="text-[15px] text-white/75 leading-relaxed">Selectively reveal information about your identity, finances, and more — on your terms</p>
              </div>
            </div>
            <p className="text-[17px] font-bold text-[#D4FF28] mt-10">
              Privacy is the single critical feature that will bring users into this future.
            </p>
            <div className="mt-8">
              <a
                href="https://aztec.network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4FF28] text-black text-[13px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
              >
                Learn More at aztec.network →
              </a>
            </div>
          </div>
        </Section>

      </div>
    </section>
  );
}
