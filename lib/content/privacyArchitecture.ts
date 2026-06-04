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
    title: 'System Overview: Aztec Zero-Knowledge Architecture',
    paragraphs: [
      'Humanity Ledger operates at the absolute vanguard of institutional decentralized finance. By unifying high-frequency on-chain telemetry with absolute cryptographic privacy via Aztec Layer 2 and Noir ZK circuits, the system orchestrates a frictionless execution environment for capital flows, entirely untethered from centralized SaaS intermediaries.',
      'The architecture is organized as a strict stratified topology across four Private layers: (1) the Client Terminal layer, running entirely within the user\'s browser as a Next.js application co-resident with an embedded Aztec Private Execution Environment (PXE) instance; (2) the Core Services layer, which hosts the HMAC-SHA256 authentication subsystem, the Platform Token escrow engine, the shielded portfolio service, L2 telemetry aggregation pipelines, and the XMTP v5 encrypted messaging relay; (3) the Backend and Sequencer layer, where the Humanity Ledger API Gateway routes and authenticates all inter-service traffic before delegating cryptographic work to the Whale ZK-Rollup Worker pool; and (4) the Immutable Ledger layer, comprising Ethereum Mainnet acting as the canonical state root anchor and the Aztec L2 shielded pool processing encrypted UTXO transitions.',
      'Data flows are strictly directional: the client issues signed requests upward into Core Services, which in turn cascade into the Backend layer. The Aztec L2 anchors its periodic rollup commitments into Ethereum L1 via L1-to-L2 message portal contracts, while Ethereum L1 provides cryptographic finality guarantees back down to the rollup verifier. No path exists by which raw private inputs — keys, balances, witness data — travel outside the client device boundary.',
      'This documentation maps the exhaustive thermodynamic flow of data, value, the Platform Token, and identity across our entire infrastructure. Every vector is secured, every state transition is proven, and all client telemetry is strictly localized on the user device.'
    ],
    bullets: [
      'Zero-Knowledge Proofs (zk-SNARKs) isolate user identity from capital vectors using Barretenberg UltraPlonk over the BN254 elliptic curve.',
      'Institutional execution vectors (Swap, Bridge, Ingress) execute directly on immutable smart contracts via Aztec L1 to L2 messaging portals.',
      'Decentralized communication via XMTP v5 guarantees absolute end-to-end encryption using MLS group messaging semantics.',
      'No passwords. No email. Your wallet address is your Private identity anchored by ECDSA signatures on secp256k1.',
      'Sessions are short-lived JWTs signed with Ed25519, stored exclusively in HTTP-only cookies — JavaScript cannot read or exfiltrate them.',
      'All user-facing computation involving private keys, note witnesses, and balance commitments executes locally in WebAssembly, never leaving the browser sandbox.'
    ],
    callout: {
      title: 'Legal Privacy Policy',
      body: 'For data retention schedules, cookie classifications, GDPR/CCPA compliance language, and regulatory contact information, see the formal Privacy Policy.',
      href: '/legal/privacy',
      hrefLabel: 'Read the Legal Privacy Policy'
    }
  },

  // ===== 2. ZK SYBIL RESISTANCE =====
  {
    id: 'zk-authentication-sybil',
    title: 'Zero-Knowledge Sybil Resistance',
    paragraphs: [
      'The network enforces a cryptographic personhood verification standard without ever revealing the underlying identity of the participant. When a user initiates an authenticated session, the local client wallet generates an EIP-712 typed-data payload embedding the user\'s alias, their Ethereum address as the signer field, a snapshot of the current block number, the live gas price, the active chain ID, and a Unix millisecond timestamp. This multi-dimensional entropy anchoring ensures that no two identity proofs can be structurally identical, even for the same signer across adjacent blocks.',
      'The authentication sequence proceeds through six discrete phases. In the first phase, the End User — ideally protected by a hardware security module or secure enclave — instructs the Client Wallet to initiate a shielded access request. In the second phase, the wallet surfaces an EIP-712 signature prompt: the user reviews the human-readable typed message in their wallet extension and approves it with their ECDSA private key. In the third phase, the signed payload is passed into the Aztec Private Execution Environment running as a WebAssembly module in the browser; here, a Noir circuit is compiled with the EIP-712 signature as the private witness input. The circuit enforces a predicate: "there exists a private key whose corresponding secp256k1 public key maps to this Ethereum address, and it produced this valid ECDSA signature over this exact payload." In the fourth phase, the Barretenberg prover — operating over the BN254 pairing-friendly curve using UltraPlonk arithmetization — generates a succinct zk-SNARK proof and derives a cryptographic nullifier hash by hashing the address scalar through the Pedersen compression function. The private key scalar is zeroed from memory immediately after witness compilation and never serializes to any storage boundary.',
      'In the fifth phase, the wallet submits the proof bundle — containing the public statement, the SNARK proof, and the nullifier — to the Network Validator. The validator runs the BN254 elliptic curve pairing check, confirming that the proof verifies against the publicly known verification key without requiring access to the witness. In the sixth and final phase, upon successful verification, the validator issues a short-lived Ed25519-signed JWT that grants the client an encrypted shielded session token. The true public key of the participant is never transmitted to or stored by any server component at any point during this sequence.'
    ],
    bullets: [
      'The nullifier hash derived from the user\'s address scalar serves as a double-spend prevention mechanism: the same address cannot re-register a colliding identity within the same epoch without the validator detecting the nullifier collision.',
      'Proof generation time on a modern device is approximately 800–1,200 milliseconds, owing to the highly optimized Barretenberg WASM binary compiled with SIMD vectorization support.',
      'The Noir circuit source is open-source and auditable; the compiled ACIR (Abstract Circuit Intermediate Representation) bytecode is deterministically reproducible from the source.'
    ]
  },

  // ===== 3. AZTEC PRIVATE STATE =====
  {
    id: 'aztec-private',
    title: 'Aztec Private State and ZK Proof Architecture',
    paragraphs: [
      'Public Ethereum reveals every transfer amount, sender, and receiver to every participant in the network, permanently and irrevocably. Aztec Network addresses this by introducing a private execution layer operating as an L2 rollup anchored to Ethereum L1. Within this layer, asset balances and transfers are represented not as transparent ledger entries but as encrypted UTXOs — called Notes — stored in a cryptographic Append-Only Merkle tree with Pedersen-hashed leaves. The L1 chain sees only a single scalar: the new state root of the Note tree, asserted to be the correct output of a valid zero-knowledge proof batch.',
      'Humanity Ledger uses the Noir programming language — a Rust-adjacent domain-specific language for ZK circuit description — to encode the rules governing token transfers, membership proofs, and KYC eligibility checks. Each Noir program compiles to an ACIR bytecode representation which is then fed into the Barretenberg proving backend, a highly optimized C++ library compiled to WebAssembly. Proving occurs entirely within the user\'s browser: the private inputs (note secrets, spending keys, balance commitments, transfer amounts) are provided as the witness, the circuit constraints are evaluated, and the Barretenberg UltraPlonk prover generates a succinct SNARK proof that no private values needed to be disclosed.',
      'The Aztec L2 Sequencer collects these client-submitted proofs into batches. A batch verifier node aggregates multiple individual proofs into a single recursive proof using the UltraPlonk merge protocol, then posts the compressed state transition and the aggregated proof to the Rollup Verifier smart contract on Ethereum Mainnet. The Verifier contract executes an on-chain BN254 pairing check to confirm validity; if it passes, the new Note tree root and Nullifier tree root become canonical. The Nullifier tree separately tracks which Notes have been spent, preventing double-spend attacks with the same mathematical guarantees as the spending proof itself.',
      'Shielding — the act of moving assets from the public Ethereum state into the Aztec private pool — uses the L1-to-L2 message passing infrastructure. A user calls a public Ethereum contract which locks the tokens and emits a message; the Aztec sequencer picks up this message, creates a corresponding private Note in the shielded pool credited to the user\'s Aztec account, and includes the note creation in the next valid rollup batch. Unshielding is the reverse: the user provides a spending proof, the sequencer burns the Note in the private pool and sends an L2-to-L1 message authorizing token release from the L1 escrow contract.'
    ],
    bullets: [
      'Private Notes use Pedersen commitments over the Grumpkin elliptic curve (BN254\'s scalar field curve), making them arithmetically native inside the BN254 proving system without costly field conversions.',
      'Nullifiers are derived by hashing the note\'s secret scalar together with the spending key scalar: h(note_secret ‖ spending_key) → nullifier. This design ensures that only the rightful owner can generate the valid nullifier and spend the note.',
      'Selective disclosure allows a user to prove a compound predicate — such as "my balance exceeds 1,000 USDC" or "I completed KYC before block N" — as a ZK statement without revealing the underlying balance value or KYC timestamp to the verifying party.',
      'The Note commitment tree uses an arity-2 Merkle structure with Pedersen hashing at every internal node, enabling efficient membership proofs with logarithmic proof size relative to tree depth.',
      'Shielding and unshielding operations are atomic with respect to the rollup batch: partial state transitions cannot occur, eliminating the class of race-condition exploits endemic to optimistic bridge designs.'
    ],
    callout: {
      title: 'Technical Depth',
      body: 'For complete circuit specifications, tokenomics modelling, formal security assumptions, and independent audit reports, consult the Whitepaper.',
      href: '/whitepaper',
      hrefLabel: 'Read the Whitepaper'
    }
  },

  // ===== 4. DATA BOUNDARIES =====
  {
    id: 'data-boundaries',
    title: 'Data Boundary Architecture',
    paragraphs: [
      'The Humanity Ledger data architecture is organized around three mutually exclusive storage domains whose boundaries are enforced by a combination of cryptographic design, client-side code architecture, and strict server-side schema constraints. Understanding which data resides in each domain is essential to assessing the system\'s privacy guarantees.',
      'The first domain is the On-Device Private Store. This domain encompasses all material whose disclosure to any external party would constitute a catastrophic security breach: ECDSA private keys (secp256k1) and BabyJubJub private keys used for Aztec note spending; BIP-39 mnemonic seed phrases that deterministically derive the entire key hierarchy; AES-256-GCM encrypted ciphertexts of XMTP conversation content; zero-knowledge witness inputs including note commitment secrets and balance scalars; and any intermediate computation state produced by the Barretenberg WASM prover during proof generation. All material in this domain lives in the browser\'s IndexedDB or in a hardware-backed secure enclave where the device supports it. It is encrypted at rest using AES-256-GCM with keys derived via PBKDF2-SHA256 over 600,000 iterations. No network request originating from the application ever serializes or transmits any byte from this domain.',
      'The second domain is the Humanity Ledger API Server Store. This domain contains the minimal structured data required to operate the application as a multi-user service: the user\'s wallet address (hexadecimal Ethereum public address) used as the primary account identifier; tier classification metadata and entitlement flags derived from on-chain token holdings; rate-limit counters and API usage telemetry aggregated by address; content posted to public forum surfaces; and ephemeral QR bridge tokens used for cross-device session linking, which are written to Redis with a 60-second TTL and are cryptographically unlinked from the session JWT by design. Session JWTs are Ed25519-signed compact tokens containing only the wallet address and an expiry timestamp — they carry zero information about portfolio balances, trading history, or any on-chain activity.',
      'The third domain is Cryptographically Inaccessible Material — data that neither we nor any third party can reconstruct, regardless of legal compulsion or infrastructure compromise. This domain is not a storage location but an explicit design invariant: BIP-39 seed phrases are never transmitted and never stored server-side, making server-side recovery structurally impossible; decrypted XMTP message content remains accessible only to the communicating parties\' local devices; raw portfolio balances and Aztec Note values are privately committed and provably unknown to anyone except the note owner; and zk-SNARK witness inputs are ephemeral in-memory scalars that are explicitly zeroed after proof generation.'
    ],
    bullets: [
      'Our server infrastructure cannot decrypt any XMTP message under any circumstance — the encryption keys are derived from the communicating wallets\' private keys, which never leave the respective devices.',
      'A complete compromise of the Humanity Ledger server database would expose only wallet addresses and tier metadata — no funds, no private keys, no communications.',
      'The QR cross-device bridge token is a 32-byte cryptographic nonce with a 60-second server-side TTL, generated fresh for every session link attempt and invalidated immediately upon first use.',
      'Session JWTs are stored exclusively in HTTP-only, Secure, SameSite=Strict cookies — they are inaccessible to JavaScript, preventing XSS-driven session theft.',
      'All server-side logging explicitly filters and redacts any field that could contain key material, memo data, or portfolio information at the middleware layer before log emission.'
    ]
  },

  // ===== 5. GLOBAL SECURITY ARCHITECTURE =====
  {
    id: 'global-security-architecture',
    title: 'Global Security and Circuit Breaker Architecture',
    paragraphs: [
      'The security architecture is organized as a five-tier defense-in-depth topology, where each layer operates independently and the failure of any single layer does not compromise the security guarantees of the layers beneath it.',
      'The first tier is the Perimeter Defense layer, operating at the network edge before any traffic reaches the application servers. Cloudflare\'s DDoS mitigation absorbs volumetric and protocol-level flood attacks at the anycast network level. Immediately downstream, a Web Application Firewall enforces an OWASP rule set augmented with custom rules blocking known smart contract scanning patterns, JSON-RPC abuse vectors, and signature replay attempts. A token-bucket edge rate limiter enforces per-IP and per-wallet-address request quotas with exponential backoff for violators, ensuring that API brute-force and credential-stuffing attacks are structurally unprofitable.',
      'The second tier is the Application Verification layer. Every request that reaches the application server passes through an Ed25519 JWT middleware that validates the token signature, checks the expiry timestamp, verifies the wallet address claim matches the request origin, and rejects any malformed or replayed token. The middleware writes a tamper-evident audit log entry for every authenticated request, associating it with a request UUID, the wallet address, the originating IP hash, and the endpoint called.',
      'The third tier is the Smart Contract Invariant Monitor, a continuous off-chain process that subscribes to Ethereum Mainnet event logs and Aztec L2 sequencer output in real time. This monitor evaluates a set of algebraic invariants over the contract state — total supply conservation across shield/unshield operations, Merkle root consistency between the on-chain contract and the off-chain note tree index, and nullifier set monotonicity — and raises an alert if any invariant is violated. The monitor additionally tracks the ZK-Rollup Anomaly Engine, which applies statistical heuristics to proof submission patterns to detect batches whose proof generation time, size, or public input distributions fall outside three standard deviations of the expected distribution.',
      'The fourth tier is the Active Defense layer, centered on the L1 Circuit Breaker Contract — a Solidity smart contract with a governance-controlled pause authority. Upon receiving a trigger signal from the Invariant Monitor or the Anomaly Engine, the Circuit Breaker executes a two-phase freeze: it first pauses all capital relay contracts (swap routers, bridge escrows, token minting endpoints) by setting a global pause flag checked at the top of every state-mutating function; it then emits a PagerDuty-integrated alert to the on-call operations team with a full state snapshot. No capital movement is possible while the Circuit Breaker is active — the pause is enforced at the EVM opcode level with no bypass path available to any external account.',
      'The fifth tier is the Governance and Recovery layer, which defines the process for Circuit Breaker deactivation. Reactivating the system requires a multi-signature authorization from the core team\'s cold-storage hardware wallets (a 3-of-5 threshold scheme), a post-mortem report documenting the root cause and remediation, and a mandatory 24-hour time-lock before the pause is lifted, giving the community visibility into the proposed state transition before it executes.'
    ],
    bullets: [
      'The edge rate limiter operates on a per-IP token bucket refilling at 100 requests per minute, with wallet-address-level sub-limits of 20 state-mutating requests per minute to prevent on-chain spam.',
      'JWT expiry is set to 15 minutes for session tokens and 7 days for refresh tokens; refresh tokens are single-use and rotated on every use, making token replay attacks a narrow single-attempt window.',
      'The Invariant Monitor evaluates its algebraic constraint set within 2 Ethereum blocks (~24 seconds) of any on-chain state change, providing near-real-time anomaly detection.',
      'The Circuit Breaker contract is itself immutable — it has no upgrade proxy and no owner key that can unilaterally disable the pause mechanism, preventing insider-threat governance attacks.',
      'All secrets used in server-side operations (JWT signing keys, Telegram alert bot tokens, database credentials) are stored in an HSM-backed secrets manager and rotated on a 90-day schedule with zero-downtime hot rotation support.'
    ]
  }
];

export const PRIVACY_TOC = PRIVACY_ARCHITECTURE_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));
