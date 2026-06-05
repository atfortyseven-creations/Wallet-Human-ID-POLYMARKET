"use client";

import React, { useState } from "react";
import { AztecZKMetrics } from "./AztecZKMetrics";

const SECURITY_PILLARS = [
  {
    index: "01",
    label: "Private by Default",
    protocol: "Zk-Rollup",
    body: "Our core system is built on the Aztec Network. Instead of public smart contracts, we use private execution on your device to ensure all your actions, funds, and data stay completely confidential before settling on Ethereum."
  },
  {
    index: "02",
    label: "Absolute Privacy",
    protocol: "Zero-Knowledge",
    body: "Your identity, assets, and activities remain completely secure. Our infrastructure guarantees that your interactions stay private at all times."
  },
  {
    index: "03",
    label: "Maximum Security",
    protocol: "Verified Cryptography",
    body: "Built for maximum safety, our platform works without traditional passwords. We use advanced cryptography to secure your account, protecting you from data breaches."
  },
  {
    index: "04",
    label: "Secure Operations",
    protocol: "Encrypted Tunnels",
    body: "Every action you take is routed through secure, end-to-end encrypted connections. Your data and strategies are always protected from third-party viewing."
  }
];

const HIGHLIGHTS = [
  { key: "Underlying Infrastructure", value: "Aztec L2 zkRollup" },
  { key: "State Management", value: "Encrypted UTXOs (Private State)" },
  { key: "Encryption Standard", value: "AES-GCM-256" },
  { key: "Identity Verification", value: "Biometric Activeness Proofs" },
  { key: "Session Control", value: "Zero-Knowledge Mathematics" },
  { key: "Cross-Layer Execution", value: "Seamless L1  L2 Messaging" }
];

const AZTEC_EXTENDED_POINTS = [
  {
    title: "Private Actions",
    desc: "Actions run on your device to keep your logic and parameters completely confidential."
  },
  {
    title: "Public Operations",
    desc: "Transparent operations are used only when public visibility is required, like in shared liquidity pools."
  },
  {
    title: "Encrypted Assets",
    desc: "Your assets and data are mathematically encrypted so only you can access them."
  },
  {
    title: "Public Trees",
    desc: "We maintain network health securely without exposing any of your personal data."
  },
  {
    title: "Seamless Flow",
    desc: "Easily mix private and public actions in a single step without complicated bridging."
  },
  {
    title: "Secure Messaging",
    desc: "A direct and safe way to communicate between Ethereum and our network without risky third parties."
  },
  {
    title: "Local Proving",
    desc: "Security proofs are generated on your own device, ensuring your raw data never leaves your hands."
  },
  {
    title: "Decentralized Network",
    desc: "A globally distributed network processes transactions blindly, meaning they cannot front-run or censor you."
  },
  {
    title: "Safe Smart Contracts",
    desc: "Built with Noir, a secure programming language designed to prevent bugs and keep operations safe."
  },
  {
    title: "Bot Prevention",
    desc: "We stop automated bots completely using biometric liveness checks while keeping real human users fully anonymous."
  }
];

export function AztecArchitectureSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      className="w-full bg-[#FFFFFF] border-t border-black/8"
      aria-label="Institutional Security Architecture"
    >
      <div className="w-full max-w-[2560px] mx-auto px-5 sm:px-8 py-24 flex flex-col gap-16 items-center">

        {/*  Section Header  */}
        <div className="w-full max-w-[850px] flex flex-col gap-6 text-left">
          <div className="border-b border-slate-200/60 pb-5 flex flex-col items-start justify-start w-full">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
              Security Infrastructure
            </h1>
            <span className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Zero-Trust Protocol
            </span>
          </div>

          <div className="flex flex-col gap-4 font-sans text-sm text-slate-500 font-medium leading-relaxed max-w-xl text-left">
            <p>
              In the modern era of the internet, your data needs protection. 
              Our system is built from the ground up on a foundation of absolute privacy, 
              ensuring that your actions and information are never exposed to the public.
            </p>
            <p>
              Unlike conventional platforms that track your every move, 
              we separate the act of participating from the act of revealing who you are. 
              You gain total access while maintaining complete personal privacy.
            </p>
          </div>
        </div>

        {/*  Security Pillars  */}
        <div className="w-full max-w-[850px]">
          <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
            {SECURITY_PILLARS.map((pillar) => {
              const isOpen = expanded === pillar.index;
              return (
                <button
                  key={pillar.index}
                  onClick={() => setExpanded(isOpen ? null : pillar.index)}
                  className="bg-white text-left flex flex-col sm:flex-row items-stretch group overflow-hidden hover:bg-[#FFFFFF] transition-colors duration-200 w-full"
                >
                  {/* Index column */}
                  <div className="w-full sm:w-[100px] bg-[#FFFFFF] group-hover:bg-[#f2f1eb] border-b sm:border-b-0 sm:border-r border-black/10 flex items-center justify-center p-4 shrink-0 transition-colors duration-200">
                    <span className="font-mono text-[22px] font-black text-black/15 leading-none select-none">
                      {pillar.index}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <span className="font-mono text-[11px] font-black uppercase tracking-widest text-black text-left">
                        {pillar.label}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[8px] uppercase tracking-widest text-black/40 bg-black/5 px-2 py-0.5 border border-black/8 text-left">
                          {pillar.protocol}
                        </span>
                        <span className="font-mono text-[10px] text-black/20 select-none">
                          {isOpen ? "" : "+"}
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <p className="font-serif text-[14px] sm:text-[15px] text-[#333] leading-[1.75] text-left border-t border-black/8 pt-4 mt-2">
                        {pillar.body}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/*  Technical Highlights  */}
        <div className="w-full max-w-[850px] flex flex-col gap-0">
          <div className="border-b border-black pb-2 mb-0">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/50 font-bold">
              Infrastructure Highlights
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black/10 border border-black/10 border-t-0">
            {HIGHLIGHTS.map((spec) => (
              <div key={spec.key} className="bg-white flex flex-col sm:flex-row items-stretch">
                <div className="w-full sm:w-[200px] bg-[#FFFFFF] border-b sm:border-b-0 sm:border-r border-black/8 px-4 py-3 flex items-center shrink-0">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-black/45 font-bold">
                    {spec.key}
                  </span>
                </div>
                <div className="flex-1 px-4 py-3 flex items-center">
                  <span className="font-mono text-[11px] text-black font-black tracking-wide">
                    {spec.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  Extended Aztec Integration  */}
        <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-12 mt-12 border-t border-black pb-12 pt-16">
          
          <div className="w-full lg:w-[35%] flex flex-col gap-6">
            <h3 className="font-mono text-[14px] font-bold uppercase tracking-[0.2em] text-black">
              Deep Integration Substrate
            </h3>
            <p className="font-serif text-[15px] text-[#444] leading-relaxed text-left">
              The fusion of the Humanity Ledger and Aztec Network creates an impenetrable cryptographic shield. This integration relies on specialized primitives operating in perfect synchrony, designed strictly for entities requiring institutional-grade execution without compromising strategic opacity.
            </p>
            <div className="w-full bg-white rounded-[2rem] border border-black/10 shadow-sm flex items-center justify-center p-6 overflow-hidden relative mt-4">
               <div className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF]/50 to-transparent mix-blend-multiply pointer-events-none" />
               <AztecZKMetrics />
            </div>
          </div>

          <div className="w-full lg:w-[65%] grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black/10 border border-black/10 shadow-sm">
            {AZTEC_EXTENDED_POINTS.map((pt, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 hover:bg-[#FFFFFF] transition-colors duration-300 flex flex-col justify-center">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black mb-3 block">
                  {pt.title}
                </span>
                <p className="font-serif text-[14px] text-[#555] leading-[1.65] text-left">
                  {pt.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*  Closing Statement  */}
        <div className="w-full max-w-[850px] border-l-2 border-black pl-5 flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/35 font-bold">
            The Institutional Edge
          </span>
          <p className="font-serif text-[14px] text-[#444] leading-relaxed text-left">
            Your analytics is only as valuable as your ability to protect it. 
            The Humanity Ledger provides the definitive shield, allowing you to intercept, 
            analyze, and execute upon the flow of global capital with rigorous security.
          </p>
        </div>

      </div>
    </section>
  );
}
