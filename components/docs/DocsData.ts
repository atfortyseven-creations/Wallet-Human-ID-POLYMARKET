export const DOC_SECTIONS = [
  {
    group: "Overview",
    items: [
      { slug: "overview", label: "What Humanity Ledger Does" },
      { slug: "why-privacy", label: "Why Privacy Matters" },
    ],
  },
  {
    group: "Getting Started",
    items: [
      { slug: "quickstart", label: "Quickstart" },
      { slug: "connect-wallet", label: "Connect Your Wallet" },
      { slug: "aztec-identity", label: "Create Aztec Identity" },
    ],
  },
  {
    group: "Core Concepts",
    items: [
      { slug: "zk-proofs", label: "Zero-Knowledge Proofs" },
      { slug: "utxo-model", label: "UTXO & Private Notes" },
      { slug: "pxe", label: "Private Execution Env." },
      { slug: "nullifiers", label: "Nullifiers & Double-Spend" },
    ],
  },
  {
    group: "Products",
    items: [
      { slug: "studio-provenance", label: "Studio Provenance" },
      { slug: "ledger-chat", label: "LedgerChat" },
      { slug: "portfolio-terminal", label: "Portfolio Terminal" },
    ],
  },
  {
    group: "Privacy & Security",
    items: [
      { slug: "privacy-model", label: "Privacy Model" },
      { slug: "threat-model", label: "Threat Model" },
      { slug: "transaction-lifecycle", label: "Transaction Lifecycle" },
    ],
  },
  {
    group: "Aztec Network",
    items: [
      { slug: "aztec-l2", label: "Aztec L2 Architecture" },
      { slug: "noir-language", label: "Noir Language" },
      { slug: "finality", label: "Transaction Finality" },
    ],
  },
  {
    group: "Reference",
    items: [
      { slug: "api-reference", label: "API Reference" },
      { slug: "sdk", label: "SDK (Humanity Ledger JS)" },
      { slug: "security-model", label: "Security Model" },
      { slug: "open-source", label: "Open Source" },
    ],
  },
];

export const ALL_DOC_SLUGS = DOC_SECTIONS.flatMap((s) =>
  s.items.map((i) => ({ ...i, group: s.group }))
);
