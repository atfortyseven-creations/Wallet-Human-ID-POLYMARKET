"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

// ─── Animation primitives ────────────────────────────────────────────────────

const FADE_UP: any = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const STAGGER: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

function InViewSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={STAGGER}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      variants={FADE_UP}
      className="text-[10.5px] font-black uppercase tracking-[0.22em] text-black/40 block mb-3"
    >
      {children}
    </motion.span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      variants={FADE_UP}
      className="text-[32px] md:text-[42px] lg:text-[50px] font-black tracking-tight text-black leading-[1.05] mb-5"
    >
      {children}
    </motion.h2>
  );
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      variants={FADE_UP}
      className="text-[16px] md:text-[18px] font-medium text-black/60 leading-relaxed max-w-[640px] mb-8"
    >
      {children}
    </motion.p>
  );
}

interface NavButtonProps {
  href: string;
  label: string;
  variant?: "primary" | "outline";
}

function NavButton({ href, label, variant = "primary" }: NavButtonProps) {
  const base = "inline-flex items-center gap-2 px-6 py-3 text-[13.5px] font-bold tracking-wide transition-all active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? `${base} bg-black text-white hover:bg-black/85`
      : `${base} border-2 border-black/20 text-black hover:bg-black/[0.04]`;
  return (
    <Link href={href} className={styles}>
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <motion.div variants={FADE_UP} className="flex flex-col gap-3 p-6 border border-black/8 bg-white hover:border-black/20 hover:-translate-y-0.5 transition-all duration-300">
      <div className="w-10 h-10 border border-black/10 flex items-center justify-center text-black/60">
        {icon}
      </div>
      <h4 className="text-[15px] font-black text-black">{title}</h4>
      <p className="text-[13.5px] font-medium text-black/55 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── MODULE SHOWCASE SECTIONS ────────────────────────────────────────────────
// Each section is a high-fidelity expert presentation of a Whale Network module.
// Sorted: wallet-agnostic modules first, then wallet-dependent ones.

// ─── 1. FORUM — No wallet required ──────────────────────────────────────────
function ForumShowcase() {
  return (
    <section id="module-forum" className="w-full bg-white border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <SectionLabel>Forum — Governance & Discourse</SectionLabel>
              <SectionTitle>
                Where sovereign minds<br />
                <span className="text-black/40">deliberate publicly.</span>
              </SectionTitle>
              <SectionBody>
                The Whale Network Forum is a fully on-chain governance and discourse infrastructure. Every topic, proposal and debate is cryptographically attributed to a verified Aztec identity — ensuring that every voice belongs to a real, Sybil-resistant participant. No bots, no ghost accounts, no anonymous manipulation.
              </SectionBody>
              <motion.p variants={FADE_UP} className="text-[14px] font-medium text-black/50 mb-8 leading-relaxed max-w-[580px]">
                Built on the Aztec ZK stack, Forum participation is permissionless for reading and identity-gated for writing. Proposals authored here can be escalated to on-chain governance votes without ever leaving the ecosystem.
              </motion.p>
              <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-3">
                <NavButton href="/forum" label="Enter Forum" />
                <NavButton href="/forum/new" label="Post a Topic" variant="outline" />
              </motion.div>
            </div>
            <motion.div variants={FADE_UP} className="grid grid-cols-2 gap-4">
              <FeatureItem
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                title="Sybil-Resistant Threads"
                description="Each post is anchored to a verified ZK identity — impossible to duplicate or fabricate."
              />
              <FeatureItem
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                title="Governance Proposals"
                description="Submit protocol upgrade proposals that can escalate directly to on-chain vote."
              />
              <FeatureItem
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                title="Public Discourse"
                description="Engage with the global Whale Network community on research, security, and strategy."
              />
              <FeatureItem
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
                title="Live Activity Feed"
                description="Real-time notifications for replies, mentions, and governance milestones."
              />
            </motion.div>
          </div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 2. DEVELOPERS & API DOCS — No wallet required ──────────────────────────
function DevelopersShowcase() {
  return (
    <section id="module-developers" className="w-full bg-[#fafafa] border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div variants={FADE_UP} className="order-2 lg:order-1">
              {/* Code block visual */}
              <div className="bg-[#0d0d0d] border border-white/5 p-6 font-mono text-[12.5px] leading-6 overflow-hidden select-none">
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="text-[#6a737d]">{"// Whale Network REST API"}</div>
                <div className="mt-2 text-[#79b8ff]">{"POST"} <span className="text-[#f97583]">/api/zk/compile</span></div>
                <div className="text-white/40">{"{"}</div>
                <div className="pl-4 text-[#b392f0]">{'"circuit"'}<span className="text-white/40">:</span> <span className="text-[#9ecbff]">{'"identity_proof"'}</span><span className="text-white/40">,</span></div>
                <div className="pl-4 text-[#b392f0]">{'"inputs"'}<span className="text-white/40">:</span> <span className="text-[#9ecbff]">{'"{"walletAddress":"0x..."}"'}</span></div>
                <div className="text-white/40">{"}"}</div>
                <div className="mt-3 text-[#6a737d]">{"// → 200 OK"}</div>
                <div className="text-white/40">{"{"}</div>
                <div className="pl-4 text-[#e6db74]">{'"proof"'}<span className="text-white/40">:</span> <span className="text-[#9ecbff]">{'"0x2f7a8b..."'}</span><span className="text-white/40">,</span></div>
                <div className="pl-4 text-[#e6db74]">{'"verified"'}<span className="text-white/40">:</span> <span className="text-[#f97583]">true</span></div>
                <div className="text-white/40">{"}"}</div>
              </div>
            </motion.div>
            <div className="order-1 lg:order-2">
              <SectionLabel>Developers — API & SDK</SectionLabel>
              <SectionTitle>
                Build private apps<br />
                <span className="text-black/40">on Aztec infrastructure.</span>
              </SectionTitle>
              <SectionBody>
                The Whale Network Developer Suite exposes a complete REST and WebSocket API over the Aztec execution layer. Compile Noir circuits, submit ZK proofs, query identity attestations, and integrate private state management — all through documented, audited endpoints.
              </SectionBody>
              <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-3">
                <NavButton href="/developers/api-docs" label="View API Docs" />
                <NavButton href="/developer/sandbox" label="Try Sandbox" variant="outline" />
                <NavButton href="/developer/introduction-to-decentralized-analysis" label="Read Guides" variant="outline" />
              </motion.div>
            </div>
          </div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 3. REGISTRY — Partially wallet-free ────────────────────────────────────
function RegistryShowcase() {
  return (
    <section id="module-registry" className="w-full bg-white border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="text-center mb-14 flex flex-col items-center">
            <SectionLabel>Identity Registry — Global Coverage</SectionLabel>
            <SectionTitle>
              Sovereign identity,<br />
              <span className="text-black/40">verified across 195 countries.</span>
            </SectionTitle>
            <SectionBody>
              The Whale Network Identity Registry maps cryptographic attestations to real-world verification standards across every jurisdiction. Using zero-knowledge proofs, identities are verified once and proven indefinitely — without repeated document disclosure. This is the compliance layer of the post-KYC era.
            </SectionBody>
            <motion.div variants={FADE_UP} className="flex flex-wrap items-center justify-center gap-3">
              <NavButton href="/registry" label="Explore Registry" />
              <NavButton href="/clearance" label="Get Clearance" variant="outline" />
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div variants={STAGGER} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/8">
            {[
              { value: "195", unit: "Countries", label: "Global coverage" },
              { value: "ZK", unit: "Proof Protocol", label: "Aztec Noir circuits" },
              { value: "W3C", unit: "Standard", label: "Verifiable Credentials" },
              { value: "0", unit: "Data Leakage", label: "Private by design" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={FADE_UP}
                className="bg-white px-6 py-8 flex flex-col items-center text-center"
              >
                <div className="text-[36px] md:text-[44px] font-black text-black tracking-tighter leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-black/45 mb-1.5">
                  {stat.unit}
                </div>
                <div className="text-[12px] font-medium text-black/35">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 4. WHALE CHAT — ZK Encrypted Messaging ─────────────────────────────────
function WhaleChatShowcase() {
  return (
    <section id="module-whale-chat" className="w-full bg-[#fafafa] border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <SectionLabel>Whale Chat — ZK Encrypted Messaging</SectionLabel>
              <SectionTitle>
                Communication without<br />
                <span className="text-black/40">a trace.</span>
              </SectionTitle>
              <SectionBody>
                Whale Chat is the first messaging protocol built natively on the Aztec Private Execution Environment. Messages are encrypted, anchored to your cryptographic identity, and verified without any metadata ever touching a central server. No phone number. No IP logging. No third-party key custody.
              </SectionBody>
              <motion.p variants={FADE_UP} className="text-[13.5px] font-medium text-black/50 mb-8 leading-relaxed max-w-[580px] p-4 border border-black/8 bg-white">
                <strong className="text-black/70 font-black">Turing-Shield Compliance:</strong> Whale Chat enforces hardware-gated identity verification. Every participant is Sybil-resistant, making it structurally impossible to operate anonymously for malicious purposes — unlike Telegram or Signal where anonymous onboarding allows abuse.
              </motion.p>
              <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-3">
                <NavButton href="/chat" label="Open Whale Chat" />
                <NavButton href="/connect" label="Connect Wallet First" variant="outline" />
              </motion.div>
            </div>
            <motion.div variants={FADE_UP} className="flex flex-col gap-4">
              {[
                {
                  title: "End-to-End ZK Encryption",
                  desc: "Messages are encrypted using keys derived from your Aztec private note. The server processes only nullifiers — never content.",
                  badge: "Aztec Native",
                },
                {
                  title: "Turing-Shield Identity Gate",
                  desc: "Hardware-anchored verification ensures every participant is a unique, real human. Cybercriminals cannot bypass identity with VPNs or throwaway wallets.",
                  badge: "Security",
                },
                {
                  title: "No Metadata Retention",
                  desc: "Timestamp, sender, recipient and message size are all shielded. The network has zero knowledge of who said what to whom.",
                  badge: "Privacy",
                },
                {
                  title: "Regulatory Disclosure Keys",
                  desc: "Generate selective viewing keys for legal compliance. Prove you sent a message to a regulator without revealing any other conversation.",
                  badge: "Compliance",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 border border-black/8 bg-white hover:border-black/18 transition-all">
                  <div className="shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/50">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[14px] font-black text-black">{item.title}</h4>
                      <span className="text-[9.5px] font-black uppercase tracking-widest text-black/35 border border-black/12 px-1.5 py-0.5">{item.badge}</span>
                    </div>
                    <p className="text-[13px] font-medium text-black/55 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 5. PORTFOLIO & TERMINAL — Private Wealth Management ────────────────────
function PortfolioShowcase() {
  return (
    <section id="module-portfolio" className="w-full bg-white border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <SectionLabel>Portfolio & Terminal — Private Wealth Layer</SectionLabel>
              <SectionTitle>
                Your entire financial life.<br />
                <span className="text-black/40">Invisible to the world.</span>
              </SectionTitle>
              <SectionBody>
                The Whale Network Terminal is the sovereign operating system for high-net-worth individuals navigating the on-chain economy. Portfolio balances, transaction history, whale movements, and liquidity flows are all tracked in real-time — and all encrypted. Your wealth management is your business alone.
              </SectionBody>
              <motion.div variants={FADE_UP} className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Real-time whale movement alerts",
                  "Shielded portfolio tracking",
                  "Cross-chain asset aggregation",
                  "DeFi protocol analytics",
                  "Custom price & gas alerts",
                  "Institutional-grade reporting",
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] font-medium text-black/65">
                    <div className="w-1 h-1 rounded-full bg-black/40 shrink-0" />
                    {feat}
                  </div>
                ))}
              </motion.div>
              <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-3">
                <NavButton href="/portfolio" label="Connect & View Portfolio" />
                <NavButton href="/terminal" label="Open Terminal" variant="outline" />
              </motion.div>
            </div>
            <motion.div variants={FADE_UP} className="border border-black/10 bg-[#fafafa] p-6">
              <div className="text-[10.5px] font-black uppercase tracking-widest text-black/35 mb-4">Portfolio Preview</div>
              <div className="space-y-3">
                {[
                  { token: "ETH", value: "███████████", pct: "+4.2%", color: "text-emerald-600" },
                  { token: "BTC", value: "████████", pct: "+1.8%", color: "text-emerald-600" },
                  { token: "USDC", value: "██████", pct: "±0.0%", color: "text-black/40" },
                  { token: "ARB", value: "████", pct: "-0.7%", color: "text-red-500" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[12px] font-black text-black/70 w-10 shrink-0">{row.token}</span>
                    <div className="flex-1 h-1.5 bg-black/8 overflow-hidden">
                      <div
                        className="h-full bg-black/20"
                        style={{ width: `${[85, 65, 50, 35][i]}%` }}
                      />
                    </div>
                    <span className={`text-[12px] font-bold w-12 text-right shrink-0 ${row.color}`}>{row.pct}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-black/8 text-[11px] font-medium text-black/30 text-center tracking-wider uppercase">
                Balances encrypted — connect wallet to reveal
              </div>
            </motion.div>
          </div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 6. STUDIO PROVENANCE ───────────────────────────────────────────────────
function StudioProvenanceShowcase() {
  return (
    <section id="module-studio" className="w-full bg-[#fafafa] border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="text-center flex flex-col items-center mb-14">
            <SectionLabel>Studio Provenance — ZK Asset Certification</SectionLabel>
            <SectionTitle>
              Provenance without<br />
              <span className="text-black/40">public exposure.</span>
            </SectionTitle>
            <SectionBody>
              Studio Provenance is a zero-knowledge certification engine for digital and physical assets. Built on Noir circuits and deployed on the Aztec rollup, it enables creators, institutions, and collectors to establish irrefutable proof of asset origin, ownership history, and authenticity — all without revealing sensitive metadata to the public ledger.
            </SectionBody>
            <motion.div variants={FADE_UP} className="flex flex-wrap items-center justify-center gap-3">
              <NavButton href="/studio/provenance" label="Open Studio" />
              <NavButton href="/developers/api-docs" label="Read Technical Spec" variant="outline" />
            </motion.div>
          </div>

          <motion.div variants={STAGGER} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Submit Asset",
                desc: "Upload your asset metadata — creation date, authorship, and supporting evidence — into the private proving environment.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
              },
              {
                step: "02",
                title: "ZK Proof Generation",
                desc: "A Noir circuit generates a zero-knowledge proof of your asset's provenance, signed by your Aztec identity, without disclosing underlying data.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
              },
              {
                step: "03",
                title: "On-Chain Certification",
                desc: "The proof is published to the Aztec rollup, creating a permanent, tamper-proof provenance record verifiable by anyone with the public verification key.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={FADE_UP}
                className="p-7 border border-black/8 bg-white flex flex-col gap-4 hover:border-black/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black tracking-widest uppercase text-black/30">Step {item.step}</span>
                  <div className="w-9 h-9 border border-black/10 flex items-center justify-center text-black/50">
                    {item.icon}
                  </div>
                </div>
                <h4 className="text-[17px] font-black text-black">{item.title}</h4>
                <p className="text-[13.5px] font-medium text-black/55 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 7. QDS — Quantum Data Scoring ─────────────────────────────────────────
function QDSShowcase() {
  return (
    <section id="module-qds" className="w-full bg-white border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div variants={FADE_UP} className="border border-black/8 p-6 bg-[#fafafa]">
              <div className="text-[10.5px] font-black uppercase tracking-widest text-black/35 mb-5">QDS Live Signal</div>
              <div className="space-y-4">
                {[
                  { label: "Solvency Score", value: 94, color: "bg-emerald-500" },
                  { label: "Liquidity Depth", value: 78, color: "bg-black" },
                  { label: "Smart Money Flow", value: 87, color: "bg-black" },
                  { label: "Regulatory Risk", value: 12, color: "bg-red-400" },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[12px] font-bold text-black/60 mb-1.5">
                      <span>{bar.label}</span>
                      <span className="font-black text-black">{bar.value}</span>
                    </div>
                    <div className="h-1.5 bg-black/8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        className={`h-full ${bar.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-black/8 text-[11px] text-black/30 font-medium text-center uppercase tracking-wider">
                Real-time Aztec network scoring engine
              </div>
            </motion.div>
            <div>
              <SectionLabel>QDS — Quantum Data Scoring Engine</SectionLabel>
              <SectionTitle>
                On-chain intelligence,<br />
                <span className="text-black/40">quantified.</span>
              </SectionTitle>
              <SectionBody>
                The QDS (Quantum Data Scoring) module is Whale Network's proprietary risk and signal intelligence framework. It aggregates on-chain activity, liquidity flows, smart money positioning, and regulatory exposure into composite scores that institutional investors use to make decisions before the market moves.
              </SectionBody>
              <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-3">
                <NavButton href="/qds" label="Open QDS Dashboard" />
                <NavButton href="/predictions" label="View Predictions" variant="outline" />
              </motion.div>
            </div>
          </div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 8. TOKENOMICS & LEDGER ─────────────────────────────────────────────────
function TokenomicsShowcase() {
  return (
    <section id="module-tokenomics" className="w-full bg-[#fafafa] border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="text-center flex flex-col items-center mb-12">
            <SectionLabel>Tokenomics — Economic Architecture</SectionLabel>
            <SectionTitle>
              A meritocracy,<br />
              <span className="text-black/40">built in code.</span>
            </SectionTitle>
            <SectionBody>
              Whale Network's economic model is anchored on zero-founder-allocation principles. Token distribution is driven exclusively by verifiable on-chain participation — every credential earned, every governance vote submitted, every ZK proof generated. There is no insider advantage in a system where all merit is public and cryptographic.
            </SectionBody>
            <motion.div variants={FADE_UP} className="flex flex-wrap items-center justify-center gap-3">
              <NavButton href="/tokenomics" label="Explore Tokenomics" />
              <NavButton href="/ledger" label="View Humanity Ledger" variant="outline" />
            </motion.div>
          </div>

          <motion.div variants={STAGGER} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/8">
            {[
              { value: "0%", label: "Founder Allocation", sub: "100% merit-driven" },
              { value: "ZK", label: "Proof-of-Participation", sub: "Noir-circuit verified" },
              { value: "∞", label: "Sybil Resistance", sub: "One human, one identity" },
              { value: "L2", label: "Aztec Settlement", sub: "Ethereum-secured" },
            ].map((stat, i) => (
              <motion.div key={i} variants={FADE_UP} className="bg-white p-7 flex flex-col items-center text-center">
                <div className="text-[40px] font-black text-black tracking-tighter mb-1.5">{stat.value}</div>
                <div className="text-[11px] font-black uppercase tracking-widest text-black/45 mb-1">{stat.label}</div>
                <div className="text-[12px] font-medium text-black/30">{stat.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 9. LEGAL & COMPLIANCE ──────────────────────────────────────────────────
function LegalComplianceShowcase() {
  return (
    <section id="module-legal" className="w-full bg-white border-t border-black/8 py-20 md:py-28">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <SectionLabel>Legal & Compliance — Institutional Grade</SectionLabel>
              <SectionTitle>
                Privacy-preserving.<br />
                <span className="text-black/40">Regulatory-ready.</span>
              </SectionTitle>
              <SectionBody>
                Whale Network is architected from the ground up to satisfy the most demanding legal and compliance frameworks globally — from EU GDPR and MiCA to US SEC guidance and FATF travel rules. Our compliance layer uses zero-knowledge selective disclosure to satisfy auditors and regulators without public exposure of private data.
              </SectionBody>
              <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-3">
                <NavButton href="/legal/compliance" label="Read Compliance" />
                <NavButton href="/legal/privacy" label="Privacy Policy" variant="outline" />
                <NavButton href="/legal/security" label="Security" variant="outline" />
              </motion.div>
            </div>
            <motion.div variants={FADE_UP} className="grid grid-cols-1 gap-3">
              {[
                { badge: "EU GDPR", label: "Full data minimization compliance via ZK proof architecture." },
                { badge: "MiCA", label: "Markets in Crypto-Assets regulation alignment and disclosure readiness." },
                { badge: "FATF Travel Rule", label: "Selective disclosure keys for cross-border transaction reporting." },
                { badge: "W3C VC", label: "Verifiable Credentials standard — machine-readable, court-admissible." },
                { badge: "AML/KYC", label: "Prove identity compliance without re-submitting documents repeatedly." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-black/8 hover:border-black/16 transition-all">
                  <span className="shrink-0 text-[9.5px] font-black uppercase tracking-widest text-black/40 border border-black/15 px-2 py-1 mt-0.5 whitespace-nowrap">{item.badge}</span>
                  <p className="text-[13.5px] font-medium text-black/60 leading-relaxed">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── 10. SUPPORT & VOSS SUPREMACY ───────────────────────────────────────────
function SupportShowcase() {
  return (
    <section id="module-support" className="w-full bg-[#f5f5f5] border-t border-black/8 py-16 md:py-20">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <InViewSection>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-[580px]">
              <SectionLabel>Support & Enterprise</SectionLabel>
              <SectionTitle>
                <span className="text-[28px] md:text-[36px]">Institutional<br />
                  <span className="text-black/40">support infrastructure.</span>
                </span>
              </SectionTitle>
              <SectionBody>
                Enterprise deployments, SLA agreements, custom integration support, and dedicated security consulting. Whale Network provides enterprise-grade onboarding for institutions, DAOs, and regulated entities requiring bespoke zero-knowledge infrastructure.
              </SectionBody>
            </div>
            <motion.div variants={FADE_UP} className="flex flex-col gap-3 shrink-0">
              <NavButton href="/support" label="Contact Support" />
              <NavButton href="/vip" label="VIP Programme" variant="outline" />
              <NavButton href="/partnership" label="Enterprise Partnership" variant="outline" />
            </motion.div>
          </div>
        </InViewSection>
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function ModuleShowcaseSections() {
  return (
    <div className="w-full">
      {/* ── Separator ── */}
      <div className="w-full max-w-[1100px] mx-auto px-6 py-10">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-black/8" />
          <span className="text-[10.5px] font-black uppercase tracking-[0.25em] text-black/30 whitespace-nowrap">
            Platform Modules
          </span>
          <div className="flex-1 h-px bg-black/8" />
        </div>
      </div>

      <ForumShowcase />
      <DevelopersShowcase />
      <RegistryShowcase />
      <WhaleChatShowcase />
      <PortfolioShowcase />
      <StudioProvenanceShowcase />
      <QDSShowcase />
      <TokenomicsShowcase />
      <LegalComplianceShowcase />
      <SupportShowcase />
    </div>
  );
}
