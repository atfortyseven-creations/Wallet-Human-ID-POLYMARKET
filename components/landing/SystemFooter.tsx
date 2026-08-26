import React from "react";
import Link from "next/link";

function FooterLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="font-sans text-[12px] font-medium text-black/50 hover:text-black transition-colors duration-200 block"
    >
      {children}
    </Link>
  );
}

const NAV_COLUMNS = [
  {
    label: "PRODUCT",
    links: [
      { label: "Architecture",   href: "/architecture" },
      { label: "Registry",       href: "/registry" },
      { label: "Whitepaper",     href: "/whitepaper" },
      { label: "Roadmap",        href: "/roadmap" },
    ]
  },
  {
    label: "DOCUMENTATION",
    links: [
      { label: "Overview",       href: "/docs/overview" },
      { label: "Security Model", href: "/docs/security-model" },
      { label: "Privacy Model",  href: "/docs/privacy-model" },
      { label: "ZK Proof Guide", href: "/docs/zk-proofs" },
    ]
  },
  {
    // Phase 15: SDK & Developers as Early Access (not Ghost Ecosystem)
    label: "DEVELOPERS",
    earlyAccess: true,
    links: [
      { label: "SDK — Early Access",    href: "/developers" },
      { label: "API Reference",         href: "/developers/api-docs" },
      { label: "ZK Sandbox",            href: "/zk-sandbox" },
      { label: "GitHub (Open Source)",  href: "https://github.com/humanityledger/Humanity-Ledger", isExternal: true },
    ]
  },
  {
    label: "COMPANY",
    links: [
      { label: "Vision",    href: "/vision" },
      { label: "News",      href: "/news" },
      { label: "Contact",   href: "/contact" },
    ]
  },
  {
    label: "LEGAL",
    links: [
      { label: "Terms & Conditions",  href: "/legal/terms" },
      { label: "Privacy Policy",      href: "/legal/privacy" },
      { label: "Security Policy",     href: "/legal/security" },
      { label: "Compliance (MiCA)",   href: "/legal/mica" },
      { label: "Cookie Policy",       href: "/legal/cookies" },
    ]
  }
];

// Phase 16 & 17: Legal Disclaimer — visible, honest, institutional-ready
const LEGAL_DISCLAIMER = `Humanity Ledger is a technology platform providing Zero-Knowledge identity and analytics infrastructure. 
It is NOT a regulated financial institution, investment advisor, brokerage, or custodian. 
Nothing on this platform constitutes financial, legal, or investment advice. 
The use of Zero-Knowledge proofs does not guarantee complete anonymity on-chain; blockchain data is inherently public and may be subject to analysis. 
Compliance responsibilities remain with the user. 
Regulatory status may vary by jurisdiction — users are advised to consult local regulations before using any financial features. 
Humanity Ledger is powered by Aztec Network (L2 ZK Rollup) and is subject to Aztec's protocol terms. 
This platform is currently in early access. Features may change without notice. Use at your own risk.`;

export function SystemFooter() {
  return (
    <footer className="w-full bg-white text-black border-t border-black/10">
      <div className="w-full max-w-[1300px] mx-auto px-8 md:px-16 pt-16 pb-8 flex flex-col gap-16">

        {/* Top Section: Logo + Columns */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">

          {/* Logo & tagline */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[280px]">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="font-sans text-[18px] font-bold tracking-tight text-black">
                HumanityLedger
              </span>
            </div>
            <p className="text-[11px] font-medium text-black/40 leading-relaxed">
              Pragmatic ZK Privacy. Hybrid Governance.<br />
              Powered by <a href="https://aztec.network" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">Aztec Network</a> L2.
            </p>
            {/* Phase 13: Honest infrastructure note */}
            <p className="text-[10px] text-black/30 leading-relaxed">
              Frontend hosted on Web2 infrastructure (Vercel). On-chain execution via Aztec Network Testnet. RPC: configurable by user.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-6 w-full">
            {NAV_COLUMNS.map((col) => (
              <div key={col.label} className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-black/30 whitespace-nowrap">
                    {col.label}
                  </span>
                  {/* Phase 15: Early Access badge for SDK section */}
                  {(col as any).earlyAccess && (
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-400/20 text-amber-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Early Access
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  {col.links.map((l) => (
                    <FooterLink key={l.label} href={l.href} external={(l as any).isExternal}>
                      {l.label}
                    </FooterLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 16 & 17: LEGAL DISCLAIMER SECTION — explicitly visible */}
        <div className="border border-black/8 rounded-2xl bg-black/[0.02] px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">
            Legal Disclaimer
          </p>
          <p className="text-[11px] text-black/40 leading-relaxed whitespace-pre-line">
            {LEGAL_DISCLAIMER}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-black/10 pb-8 md:pb-4">
          <span className="text-[12px] font-medium text-black/30">
            © 2026 Humanity Ledger S.L. · All rights reserved
          </span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Phase 17: Explicit compliance badges */}
            <span className="text-black/30 font-mono tracking-widest text-[9px] uppercase font-bold flex items-center gap-1.5 px-3 py-1 bg-black/[0.03] rounded-full">
              MiCA-Aware
            </span>
            <span className="text-black/30 font-mono tracking-widest text-[9px] uppercase font-bold flex items-center gap-1.5 px-3 py-1 bg-black/[0.03] rounded-full">
              GDPR-Aligned
            </span>
            {/* Phase 13: Aztec attribution */}
            <a
              href="https://aztec.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/30 font-mono tracking-widest text-[9px] uppercase font-bold flex items-center gap-1.5 px-3 py-1 bg-violet-500/5 border border-violet-500/10 rounded-full hover:bg-violet-500/10 transition-colors"
            >
              ⚡ Powered by Aztec Network
            </a>
            <Link href="/legal/terms" className="text-[11px] font-bold uppercase tracking-wider text-black/30 hover:text-black transition-colors">
              Terms & Attestation
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

