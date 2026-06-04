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
      { label: "Architecture", href: "/architecture" },
      { label: "Registry",     href: "/registry" },
      { label: "Whitepaper",   href: "/whitepaper" },
    ]
  },
  {
    label: "DEVELOPERS",
    links: [
      { label: "API Docs",  href: "/developers/api-docs" },
      { label: "GitHub",    href: "https://github.com/humanityledger/Humanity-Ledger", isExternal: true },
    ]
  },
  {
    label: "COMPANY",
    links: [
      { label: "Vision",   href: "/vision" },
    ]
  }
];

export function SystemFooter() {
  return (
    <footer className="w-full bg-white text-black py-16 px-8 md:px-16 border-t border-black/10 mt-auto">
      <div className="w-full max-w-[1300px] mx-auto flex flex-col gap-16">

        {/* Top Section: Logo + Columns */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">

          {/* Logo & tagline */}
          <div className="flex flex-col gap-4 max-w-[280px]">
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
              GDPR-aligned by design.<br />
              Humanity Ledger never collects, processes, or stores your personal information.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
            {NAV_COLUMNS.map((col) => (
              <div key={col.label} className="flex flex-col gap-5">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-black/30">
                  {col.label}
                </span>
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

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-black/10">
          <span className="text-[12px] font-medium text-black/30">
            © 2026 Humanity Ledger · All rights reserved
          </span>
          <Link href="/privacy" className="text-[11px] font-bold uppercase tracking-wider text-black/30 hover:text-black transition-colors">
            Privacy Policy
          </Link>
        </div>

      </div>
    </footer>
  );
}
