// Updated: July 26, 2026 — Aligned with Aztec Network V5 Testnet reality.

export type PrivacyArchitectureSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: { title: string; body: string; href?: string; hrefLabel?: string };
};

export const PRIVACY_ARCHITECTURE_SECTIONS: PrivacyArchitectureSection[] = [

  // ===== 1. OVERVIEW =====
  {
    id: 'overview',
    title: 'System Overview — What Humanity Ledger actually does',
    paragraphs: [
      'Updated July 26, 2026. Humanity Ledger is a web application that lets participants monitor on chain capital flows, communicate with end to end encryption, and record verifiable product provenance — all anchored to the Aztec Network V5 testnet.',
      'The application is organized into three concentric layers: (1) the Client layer — a Next.js app running in your browser that handles all private computation locally; (2) the Platform API layer — our backend that handles authentication, session management, and routing, but never touches private keys; (3) the Aztec Network — the ZK rollup where all QD balances, provenance records, and identity proofs live as private encrypted state.',
      'The core principle is simple: anything that must stay secret never leaves your device. Our servers only see what they need to identify you — your wallet address — and nothing else.',
    ],
    bullets: [
      'Private keys, seed phrases, and note witness data never leave the browser sandbox.',
      'Our backend databases cannot read your QD balance, your chat messages, or your identity proof inputs.',
      'Sessions are short lived JWTs (15 min) stored in HTTP only cookies inaccessible to JavaScript.',
      'All cryptographic computation (Noir ABI encoding, ZK proof delegation) runs in the browser using WebAssembly.',
      'Currently operating on Aztec V5 Testnet — no real money transactions exist yet.',
    ],
    callout: {
      title: 'Legal Privacy Policy',
      body: 'For GDPR/CCPA data retention schedules, cookie classifications, and regulatory contact information, see the formal Privacy Policy.',
      href: '/legal/privacy',
      hrefLabel: 'Read the Legal Privacy Policy',
    },
  },

  // ===== 2. IDENTITY AND AUTHENTICATION =====
  {
    id: 'identity-authentication',
    title: 'Identity and Authentication — How you log in',
    paragraphs: [
      'Humanity Ledger supports two login methods: Web3 wallet (MetaMask, Coinbase Wallet, WalletConnect) and Turing Shield (email + 6-digit PIN). Both methods ultimately reduce to the same cryptographic proof: that you control a specific Ethereum address.',
      'Web3 Wallet Login: You sign an EIP-712 typed data message with your wallet private key. The message includes your address, a timestamp, and the current chain ID — ensuring each signature is unique and replay resistant. The signature is verified server side; your private key never leaves your device.',
      'Turing Shield (Email/PIN): Designed for mobile users on iOS/Safari where browser wallet extensions are unavailable. After email verification, you set a 6-digit PIN. The PIN gates access to a session token. This provides a usable authentication experience on mobile without compromising the underlying cryptographic identity model.',
      'In both cases, a short lived JWT is issued upon successful verification and stored in an HTTP only, Secure, SameSite=Strict cookie. The JWT contains only your wallet address and an expiry timestamp — no balance, no key material, no personal data.',
    ],
    bullets: [
      'EIP-712 signatures are single use: each includes a timestamp making them replay resistant.',
      'Turing Shield PIN is hashed with bcrypt server side; the raw PIN is never stored or logged.',
      'Session JWTs expire after 15 minutes; refresh tokens expire after 7 days and rotate on each use.',
      'No username, no password, no centralised identity registry — your Ethereum address is your identity.',
    ],
  },

  // ===== 3. AZTEC ZK PRIVATE STATE =====
  {
    id: 'aztec-private-state',
    title: 'Aztec Network — Private State and ZK Proofs',
    paragraphs: [
      'QD balances and provenance records are not stored on a public blockchain where anyone can read them. They exist as private, encrypted Notes inside the Aztec Network — a Zero Knowledge Layer 2 rollup anchored to Ethereum.',
      'When you perform an action that changes your balance (e.g., claim an airdrop, pay for a signal in LedgerChat), the application encodes the transaction parameters using Noir ABI encoding in the browser. This produces a structured witness that is sent to the Aztec V5 testnet RPC. The Aztec sequencer proves the state transition and anchors the resulting state root to Ethereum — without revealing your balance to anyone.',
      'What this means in practice: the Aztec Network knows a valid ZK proof was submitted and that a state transition occurred. It does NOT know your identity, your balance, who you sent tokens to, or how much. The cryptographic commitment scheme (Pedersen hashing over the Grumpkin curve) makes the private inputs mathematically opaque.',
      'Current testnet status: We are operating on the Aztec V5 testnet (v5.testnet.rpc.aztec-labs.com). Tokens are testnet only. No real monetary value. The architecture is production ready in design but not yet deployed to mainnet.',
    ],
    bullets: [
      'Private Notes use Pedersen commitments over the Grumpkin curve — arithmetically native to the BN254 proving system.',
      'Nullifiers prevent double spend: h(note_secret ‖ spending_key) → nullifier, derived by the owner only.',
      'The Barretenberg WASM prover runs in your browser, generating proofs locally before submission.',
      'State transitions are batched by the Aztec sequencer and anchored to Ethereum L1 as rollup commitments.',
      'No bridge contract, no wrapped token — QDs are native to Aztec, not an ERC-20 token.',
    ],
    callout: {
      title: 'Technical Specification',
      body: 'For complete Noir circuit architecture, QD tokenomics, and proof system details, consult the Whitepaper.',
      href: '/whitepaper',
      hrefLabel: 'Read the Whitepaper',
    },
  },

  // ===== 4. Ledger Chat ENCRYPTION =====
  {
    id: 'ledger-chat-encryption',
    title: 'Ledger Chat — Peer to Peer Encrypted Messaging',
    paragraphs: [
      'Ledger Chat enables encrypted, real time communication between Humanity Ledger participants. Messages are routed peer to peer and never stored in plaintext on any server we operate.',
      'Text messages: Encrypted end to end using the recipient\'s wallet-derived public key. Our backend acts only as a signaling relay — it sees encrypted ciphertext, not message content.',
      'Audio and Video Calls: Implemented via WebRTC with PeerJS for NAT traversal. The media stream (audio/video) travels directly between browsers using DTLS-SRTP encryption — our servers never touch the call audio or video. Only the signaling data (call initiation, answer, hang-up events) passes through our backend momentarily during connection setup.',
      'Paid Signals: Users can send encrypted signal attachments that require a QD payment to decrypt. The payment triggers a private Aztec state transition; upon confirmation, the decryption key is released locally on the recipient\'s device. Our servers never hold the decryption key.',
    ],
    bullets: [
      'Message content is end to end encrypted — our servers cannot read your chats.',
      'WebRTC audio/video is DTLS-SRTP encrypted and peer to peer — never proxied through our infrastructure.',
      'PeerJS signaling only exchanges connection metadata (offer/answer/ICE candidates), not call content.',
      'Paid signal decryption keys are derived from the Aztec state transition — not held by our backend.',
    ],
  },

  // ===== 5. DATA BOUNDARIES =====
  {
    id: 'data-boundaries',
    title: 'Data Boundaries — What we store and what we cannot access',
    paragraphs: [
      'We organize data into three explicit categories with clear technical boundaries.',
      'Category A — On Device Only (we can never access): Private keys, seed phrases, BabyJubJub note spending keys, Aztec witness inputs, decrypted chat messages, and Barretenberg prover intermediate state. This data lives exclusively in your browser\'s secure local storage. No network request in our application serializes or transmits any byte from this category.',
      'Category B — Our Backend Stores (minimal, pseudonymous): Your Ethereum wallet address (primary identifier), subscription tier and feature flags, API usage counters per address, session JWT state, and ephemeral QR bridge tokens (32-byte nonces, 60-second TTL, invalidated on first use). This is the only data subject to our data retention policy.',
      'Category C — Cryptographically Inaccessible (structurally impossible for us to read): QD balances and transaction history (encrypted on Aztec), chat message content (E2E encrypted), audio/video call content (WebRTC DTLS-SRTP), and Noir proof witness inputs (zeroed from memory after proof generation).',
    ],
    bullets: [
      'A full compromise of our backend database exposes only wallet addresses and tier metadata — no funds, no messages, no keys.',
      'HTTP-only cookies prevent XSS attacks from reading session tokens — they are inaccessible to all JavaScript.',
      'Server logs explicitly filter and redact any field that could contain key material or private data at the middleware layer.',
    ],
  },

  // ===== 6. SECURITY ARCHITECTURE =====
  {
    id: 'security-architecture',
    title: 'Security Architecture — How we protect the platform',
    paragraphs: [
      'Defense in depth: our security is layered so that no single failure exposes user funds or private data.',
      'Edge layer: DDoS mitigation and a Web Application Firewall operate at the CDN level, blocking volumetric attacks and known smart contract scanning patterns before they reach our application servers. Per-IP and per-wallet rate limits use a token-bucket algorithm.',
      'Application layer: Every API request is validated against a JWT signed with Ed25519. We maintain a tamper-evident audit log of authenticated requests (wallet address, endpoint, request UUID, hashed IP) with no private data included. Requests that fail JWT validation are rejected before touching any database.',
      'Smart contract layer: We monitor the Aztec testnet state root and nullifier tree for invariant violations (total supply conservation, Merkle root consistency). Anomalies trigger immediate alerts to the operations team. All QD contract code is open source and independently auditable.',
      'Operational security: JWT signing keys, database credentials, and all secrets are stored in an HSM-backed secrets manager. Secrets rotate on a 90-day schedule with zero-downtime hot rotation.',
    ],
    bullets: [
      'Rate limiter: 100 req/min per IP, 20 state-mutating req/min per wallet address.',
      'JWT expiry: session tokens 15 min, refresh tokens 7 days (single-use, rotating).',
      'Smart contract monitors evaluate invariants within approximately 2 Ethereum blocks of any state change.',
      'All secrets are HSM-backed with 90-day rotation schedules.',
      'The QD token contract is immutable — no admin keys, no upgrade proxies.',
    ],
  },
];

export const PRIVACY_TOC = PRIVACY_ARCHITECTURE_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));
