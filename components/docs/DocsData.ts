export const DOC_SECTIONS = [
  {
    group: "Getting Started",
    items: [
      { slug: "overview", label: "Platform Overview" },
      { slug: "identity", label: "Digital Identity (DID)" },
      { slug: "app-hub", label: "App Hub" },
    ]
  },
  {
    group: "Ledger Chat",
    items: [
      { slug: "ledger-chat", label: "Introduction" },
      { slug: "p2p-routing", label: "Secure P2P Routing" },
    ]
  },
  {
    group: "Protocol & Architecture",
    items: [
      { slug: "architecture", label: "Architecture Overview" },
      { slug: "cryptography", label: "Encryption Systems" },
      { slug: "zero-knowledge", label: "Zero-Knowledge Privacy" },
      { slug: "quantum-dots", label: "Quantum Dots (QD Token)" },
    ]
  },
  {
    group: "Security & Audits",
    items: [
      { slug: "audits", label: "Security Audits" },
      { slug: "bug-bounty", label: "Bug Bounty" },
      { slug: "transparency", label: "Transparency Report" },
    ]
  },
  {
    group: "Legal & Compliance",
    items: [
      { slug: "terms", label: "Terms of Service" },
      { slug: "privacy", label: "Privacy Policy" },
      { slug: "cookies", label: "Cookie Policy" },
      { slug: "aml-kyc", label: "AML & KYC Framework" },
      { slug: "disclaimer", label: "Risk Disclaimer" },
    ]
  },
  {
    group: "Developers",
    items: [
      { slug: "changelog", label: "Changelog" },
    ]
  }
];

export const ALL_DOC_SLUGS = DOC_SECTIONS.flatMap(s => s.items.map(i => ({ ...i, group: s.group })));
