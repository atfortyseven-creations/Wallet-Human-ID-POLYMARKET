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
      { slug: "architecture", label: "System Architecture" },
      { slug: "cryptography", label: "Cryptography Matrix" },
      { slug: "zero-knowledge", label: "Zero-Knowledge Proofs" },
      { slug: "p2p-routing", label: "P2P Onion Routing" },
    ]
  },
  {
    group: "Applications",
    items: [
      { slug: "ledger-chat", label: "Ledger Chat" },
      { slug: "app-hub", label: "The App Hub" },
      { slug: "identity", label: "Sovereign Identity" },
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
