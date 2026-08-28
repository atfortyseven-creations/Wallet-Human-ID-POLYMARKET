export const DOC_SECTIONS = [
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
    group: "Protocol Architecture",
    items: [
      { slug: "architecture", label: "Architecture Overview" },
      { slug: "cryptography", label: "Encryption Systems" },
      { slug: "zero-knowledge", label: "Privacy Engine" },
      { slug: "p2p-routing", label: "Decentralized Routing" },
    ]
  },
  {
    group: "Applications",
    items: [
      { slug: "ledger-chat", label: "Ledger Chat" },
      { slug: "app-hub", label: "The App Hub" },
      { slug: "identity", label: "Wallet Identity" },
    ]
  },
  {
    group: "Security & Audits",
    items: [
      { slug: "audits", label: "Security Audits" },
      { slug: "bug-bounty", label: "Bug Bounty Program" },
      { slug: "transparency", label: "Transparency Report" },
    ]
  }
];

export const ALL_DOC_SLUGS = DOC_SECTIONS.flatMap(s => s.items.map(i => ({ ...i, group: s.group })));
