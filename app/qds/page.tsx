"use client";

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';


//  Page Data 

const STATS = [
  { label: 'Total Supply',      value: '210,000,000', sub: 'QDs — mathematically fixed hard cap' },
  { label: 'Decimal Precision', value: 'Noir Native',  sub: 'Aztec Network private state model' },
  { label: 'Distribution',     value: '100% earned',  sub: 'Proof of Contribution mechanism' },
  { label: 'Team Allocation',  value: '15%',           sub: '4-year vesting, 1-year cliff' },
  { label: 'Network',          value: 'Aztec Testnet', sub: 'v5.testnet.rpc.aztec-labs.com' },
  { label: 'Governance',       value: 'On-chain ZK',   sub: 'Cryptographic community vote' },
];

type Section = {
  num: string;
  title: string;
  paragraphs: string[];
  diagram?: string[];
};

const SECTIONS: Section[] = [
  {
    num: '01',
    title: 'What are QDs (Quantum Dots)?',
    paragraphs: [
      'Updated as of July 21, 2026: QDs (Quantum Dots) are the foundational digital asset and economic engine of the Whale Network. They are the base layer of exchange: finite, cryptographically verifiable, and enforced entirely by the Aztec Network protocol.',
      'The supply is mathematically hard-capped at 210,000,000 units. QDs do not operate on Ethereum L1 directly; they are native to the Aztec V5 Layer 2, meaning all QD balances and transfers are private by default, leveraging advanced Zero-Knowledge (ZK) circuits.',
      'There are no admin backdoors, no emergency overrides, and no inflation mechanisms. The rules are baked into the genesis state.'
    ],
  },
  {
    num: '02',
    title: 'What are QDs used for?',
    paragraphs: [
      'QDs are not just a store of value; they are utility tokens required to operate the most advanced features of the Whale Network ecosystem.',
      '1. Whale Terminal Pro: Spending QDs unlocks Tier 2 (Pro) and Tier 3 (Whale) analytical tools, real-time tracking, and advanced market insights.',
      '2. Encrypted Signals (Whale Chat): Users spend QDs to decrypt premium peer-to-peer signals and access exclusive anomaly alerts within the terminal chat.',
      '3. On-Chain Governance: Proposing protocol upgrades or voting on market proposals requires QDs to prevent sybil attacks and align economic incentives.',
      '4. Studio Provenance: Minting immutable product passports and QR walls requires a fee denominated in QDs.'
    ],
  },
  {
    num: '03',
    title: 'Step-by-Step: Acquiring QDs',
    paragraphs: [
      'Currently, during the Aztec Testnet phase, QDs can be acquired through direct network participation and authorized airdrops.',
      'Step 1: Authenticate into the Whale Network using your Web3 Wallet or Turing Shield (Email/PIN).',
      'Step 2: Open the Whale Terminal (press Cmd/Ctrl + K from anywhere).',
      'Step 3: Navigate to the "Identity / Airdrop" tab on the left sidebar.',
      'Step 4: Click the "Claim Airdrop" button. Your identity will be verified via a ZK-proof, and 50 testnet QDs will be deposited into your private Aztec balance.'
    ],
  },
  {
    num: '04',
    title: 'Step-by-Step: Spending QDs in Whale Chat',
    paragraphs: [
      'Whale Chat features an internal peer-to-peer economy where you can pay for high-value intelligence.',
      'Step 1: Open Whale Chat and select a conversation with an encrypted signal.',
      'Step 2: Click on the "Decrypt Signal" or "Pay" prompt attached to the message.',
      'Step 3: The system will generate a Noir ABI encoded transaction. Confirm the payment (e.g., 5 QDs).',
      'Step 4: Once the Aztec RPC confirms your ZK transaction, the signal decrypts locally on your device.'
    ],
    diagram: [
      "      [User]                        [Aztec Network]                  [Recipient]",
      "         |                                 |                              |",
      " 1. Clicks 'Pay 5 QDs'                     |                              |",
      "         |---(Noir Encoded Tx)------------>|                              |",
      "         |                                 |---(Verify ZK Proof)          |",
      "         |                                 |                              |",
      "         |<--(State Root Updated)----------|                              |",
      " 2. Signal Decrypted                       |                              |",
      "         |                                 |---(Private Balance +5)------>|"
    ]
  },
  {
    num: '05',
    title: 'Step-by-Step: Using QDs for Governance',
    paragraphs: [
      'The network is governed by its active participants, not by a central authority.',
      'Step 1: Open the Whale Terminal and navigate to the "Governance" tab.',
      'Step 2: Browse active Market Proposals (e.g., modifying alert thresholds or adding new assets).',
      'Step 3: Select a proposal and choose FOR, AGAINST, or ABSTAIN.',
      'Step 4: Sign the transaction. A small QD fee is burned/locked to register your vote cryptographically on the ledger.'
    ],
  },
  {
    num: '06',
    title: 'Privacy and Cryptography Architecture',
    paragraphs: [
      'Unlike public blockchains where your wallet balance is visible to everyone, QDs utilize Sovereign ZK Circuits to ensure complete financial privacy.',
      'When you transfer QDs, the Aztec Network only verifies that you have sufficient balance and that you have authorized the transfer (via a valid ZK proof). The network does NOT learn who you are, who you sent it to, or how much you sent.',
      'This architecture protects trading strategies, prevents front-running, and ensures that Whale Network participants can operate with sovereign-grade privacy.'
    ],
    diagram: [
      "┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐",
      "│   Whale App Client   │        │     Aztec Testnet    │        │   Humanity Ledger    │",
      "│                      │        │                      │        │                      │",
      "│ 1. Encode parameters │───────>│ 3. Validate ACIR     │───────>│ 5. Store Encrypted   │",
      "│ 2. Generate ZK Proof │        │ 4. Nullify spent QDs │        │    State Updates     │",
      "└──────────────────────┘        └──────────────────────┘        └──────────────────────┘"
    ]
  }
];

//  Main Page 

export default function QDsPage() {
  const heroRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const heroOpa   = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased overflow-x-hidden selection:bg-black selection:text-white">

      {/*  HERO  */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden bg-white"
        style={{ minHeight: '100svh' }}
      >
        {/* Static Image  replaces buggy 3D Atom */}
        {mounted && (
          <div
            className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
          >
            {/* Logo removed per user request for pure white background */}
          </div>
        )}

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-56 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />

        {/* Hero text  parallax on scroll */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpa, minHeight: '100svh' } as any}
          className="relative z-20 flex flex-col items-center justify-center text-center px-6 select-none pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center" style={{ minHeight: '100svh' }}>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="font-mono text-[11px] font-black uppercase tracking-[0.5em] text-black/40 mb-8 block"
            >
              Humanity Ledger · Digital Asset
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="font-black tracking-tighter uppercase leading-[0.85] text-black mb-6"
              style={{ fontSize: 'clamp(72px, 16vw, 180px)' }}
            >
              QDs
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
              className="font-serif text-black/50 max-w-[560px] leading-relaxed"
              style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}
            >
              Quantum Dots. 210,000,000 units. Private by default.
              <br className="hidden md:block" />
              Native Aztec Network — Noir smart contract.
            </motion.p>

            {/* Scroll cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
              className="mt-16 flex flex-col items-center gap-2"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/20">Scroll</span>
              <div className="w-px h-10 bg-gradient-to-b from-black/15 to-transparent" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/*  STATS BAND  */}
      <section className="w-full border-y border-black/10 bg-white py-14">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-2 p-5 rounded-2xl bg-white border border-black/10 hover:border-black/15 transition-colors shadow-sm"
            >
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/40">
                {s.label}
              </span>
              <span className="font-black text-[20px] tracking-tight text-black leading-none">
                {s.value}
              </span>
              <span className="font-mono text-[9px] text-black/50 leading-snug">
                {s.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/*  CONTENT SECTIONS  */}
      <section className="w-full max-w-[960px] mx-auto px-6 py-28 md:py-40 flex flex-col gap-28 md:gap-40">
        {SECTIONS.map((s) => (
          <motion.article
            key={s.num}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row gap-8 md:gap-20"
          >
            {/* Section label */}
            <div className="w-full md:w-[220px] shrink-0 flex flex-col gap-3 pt-1">
              <span className="font-mono text-[10px] font-black text-black/22 tracking-[0.3em]">
                {s.num}
              </span>
              <h2 className="text-[22px] md:text-[28px] font-black tracking-tight leading-[1.15] text-black">
                {s.title}
              </h2>
              <div className="w-8 h-[2px] bg-black rounded-full mt-2" />
            </div>

            {/* Body text */}
            <div className="flex-1 flex flex-col gap-6">
              {s.paragraphs.map((p, pi) => (
                <p
                  key={pi}
                  className="font-serif text-black/58 leading-[1.9]"
                  style={{ fontSize: 'clamp(15px, 1.5vw, 17px)' }}
                >
                  {p}
                </p>
              ))}
              {s.diagram && (
                <div className="mt-6 p-6 bg-black/[0.03] rounded-2xl border border-black/5 overflow-x-auto shadow-inner">
                  <pre className="font-mono text-[10px] md:text-[12px] leading-[1.4] text-black/70">
                    {s.diagram.join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </motion.article>
        ))}
      </section>

      {/*  MID-PAGE IMAGE DIVIDER  */}
      <section
        className="w-full relative border-y border-black/10 bg-white overflow-hidden"
        style={{ height: 'clamp(340px, 45vh, 520px)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Logo removed per user request for pure white background */}
        </div>
        {/* Edge fades */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-white/20 backdrop-blur-[2px]">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.55em] text-black/40 drop-shadow-sm">
            QDs · Quantum Dots · 210,000,000 · Noir / Aztec
          </span>
        </div>
      </section>

      {/*  FINAL CTA  */}
      <section className="relative w-full py-32 md:py-48 flex flex-col items-center justify-center overflow-hidden bg-white border-b border-black/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl flex flex-col items-center gap-8 px-6 text-center"
        >
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-black/40">
            Native Aztec Token · Testnet Active
          </span>
          <h2
            className="font-black tracking-tighter uppercase leading-[0.87] text-black text-balance"
            style={{ fontSize: 'clamp(36px, 7vw, 72px)' }}
          >
            Private by default.
          </h2>
          <p
            className="font-serif text-black/60 leading-relaxed max-w-xl"
            style={{ fontSize: 'clamp(15px, 1.7vw, 19px)' }}
          >
            Open participation. Fixed supply. No exceptions to either rule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              href="/status"
              className="px-10 py-5 bg-black text-white hover:bg-black/90 rounded-full font-mono text-[11px] font-black uppercase tracking-[0.22em] transition-transform active:scale-95 shadow-xl"
            >
              Network Status
            </Link>
            <Link
              href="/developer"
              className="px-10 py-5 bg-transparent border border-black/10 text-black hover:bg-black/5 rounded-full font-mono text-[11px] font-black uppercase tracking-[0.22em] transition-transform active:scale-95"
            >
              Technical Docs
            </Link>
          </div>
        </motion.div>
      </section>

      {/*  FOOTER  */}
      <footer className="w-full bg-white border-t border-black/[0.05] py-10 px-6">
        <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.28em] text-black/28">
            © 2026 Humanity Ledger · QDs Protocol
          </span>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy',   href: '/privacy'   },
              { label: 'Developer', href: '/developer' },
              { label: 'Status',    href: '/status'    },
              { label: 'Legal',     href: '/legal'     },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/28 hover:text-black transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
