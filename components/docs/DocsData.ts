export const DOC_SECTIONS = [
  {
    group: "Overview",
    items: [
      { slug: "index", label: "Documentation Index" },
      { slug: "status", label: "Platform Status" },
      { slug: "architecture", label: "Architecture" },
      { slug: "app-hub", label: "App Hub" },
    ],
  },
  {
    group: "Core Systems",
    items: [
      { slug: "ledger-chat", label: "Ledger Chat" },
      { slug: "authentication", label: "Authentication" },
      { slug: "cryptography", label: "Cryptography Matrix" },
    ],
  }
];

export const ALL_DOC_SLUGS = DOC_SECTIONS.flatMap((s) =>
  s.items.map((i) => ({ ...i, group: s.group }))
);
