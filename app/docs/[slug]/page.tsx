import { DocsShell } from '@/components/docs/DocsShell';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CONTENT_MAP: Record<string, string> = {
  "ledger-chat": `
# Ledger Chat: The Sovereign Communication Protocol
*First Release: 01/01/2027*

Ledger Chat represents a paradigm shift in digital communication. By moving away from centralized servers and phone number-based identity, we have created the world's first mathematically guaranteed private messaging ecosystem.

## 1. Decentralized Identity (DID)
Unlike legacy messaging applications (WhatsApp, Telegram, Signal) that bind your identity to a vulnerable SIM card or phone number, Ledger Chat utilizes **Ethereum-based Sign-In (SIWE)** and **Sovereign Identity Profiles**. Your public key is your identity; your private key is your absolute sovereignty.

## 2. End-to-End Encryption via XMTP
All messages, payloads, and voice notes are secured using the **Extensible Message Transport Protocol (XMTP)**.
- **Double Ratchet Algorithm**: Perfect Forward Secrecy ensures past messages remain cryptographically secure even if a future key is compromised.
- **Off-Chain Storage**: Messages are encrypted uniquely for the recipient wallet address and stored across decentralized node networks.

## 3. Burn-on-Read
Our proprietary Zero-Knowledge State Channels allow Burn-on-Read messages. Once decrypted, a cryptographic proof permanently severs the IPFS link. The message is annihilated from the storage layer, leaving zero trace.

## 4. Quantum Dot Micro-Transactions
Natively integrated with the Humanity Ledger EVM portfolio. Stream **Quantum Dots (QDs)** or send stablecoins directly inside the chat — no payment processors, no banks, no intermediaries.

## 5. Mathematical Authenticity
Every message is signed via ECDSA. The UI automatically verifies the signature against the sender's public wallet address. Spoofing is mathematically impossible.
`,
  "architecture": `
# System Architecture

The Humanity Ledger ecosystem is engineered with abysmal complexity on the backend, yet presented with absolute simplicity on the frontend.

## 1. Zero-Trust Security Model
Every state modification, payload decryption, and transaction request must carry a verifiable cryptographic signature. The backend completely distrusts the frontend.

### Backend Stack
- **Node.js / Next.js 15**: Running across distributed Vercel edge regions.
- **PostgreSQL / Prisma ORM**: Off-chain analytics, fiat-to-crypto bridging states.
- **Redis Pub/Sub**: Zero-latency WebSocket connections for real-time portfolio sync.

## 2. The TuringShield Cryptographic Handshake
1. Mobile wallet scans the ephemeral QR code.
2. Mobile generates an **AES-GCM-256** payload secured by a Server-Signed JWT.
3. The server validates the signature — no client-side forgery possible.
4. The desktop UI receives the decryption key via WebSockets and unlocks the local vault.

## 3. Zero-Knowledge Proofs (Aztec Network)
- **State Shielding**: Bridge public ERC-20 assets into shielded UTXOs.
- **Client-Side Proving**: WASM-generated zk-SNARK proofs that never reveal amounts or recipients to RPC nodes.

## 4. Multi-Chain Portfolio
Simultaneously connected to Ethereum, Polygon, Arbitrum, and Optimism. Balances indexed, cached, and served in real-time.
`,
  "privacy": `
# Privacy Redefined

For too long, corporations harvested user data. Humanity Ledger terminates surveillance capitalism through applied cryptography.

## 1. Data Minimization
No name. No email. No phone number. Your wallet address is your absolute identity.

## 2. No Tracking
No Google Analytics. No Meta Pixel. No behavioral tracking.

## 3. Cryptographic Obfuscation
Our Aztec-powered privacy layer obfuscates the origin and destination of your on-chain capital. Financial privacy is a fundamental human right.

## 4. Local-First Vault
Private keys are encrypted locally using **AES-256-GCM** with 600,000 PBKDF2 iterations. We cannot access your funds or messages — even if compelled by law enforcement.

## 5. Open Source Verification
Trust is not assumed; it is verified. Critical encryption algorithms are publicly auditable on GitHub.
`,
  "terms": `
# Terms of Service
*Last Updated: January 1, 2027*

Welcome to Humanity Ledger. By accessing our protocol, you agree to these Terms.

## 1. Decentralization
You maintain sole ownership and control over your cryptographic keys, your identity, and your data.

## 2. No Custody
We are a non-custodial software provider. We do not store or have access to your private keys.

## 3. Limitation of Liability
The software is provided AS IS without warranty. Humanity Ledger is not liable for any direct or indirect damages.

## 4. Governing Law
These terms are governed by the laws of the European Union.
`,
  "cookies": `
# Cookie Policy
*Last Updated: January 1, 2027*

Humanity Ledger is committed to preserving your privacy. Unlike Web2 platforms, we do not use third-party tracking cookies, pixels, or cross-site fingerprinting.

## 1. Essential Cookies Only
We only use strictly necessary cookies to maintain your active session (e.g., SIWE JWT tokens) and remember your UI preferences (dark/light mode, language). 

## 2. No Analytics
We do not use Google Analytics, Mixpanel, or any behavior-tracking software. Your interactions with the Aztec Mainnet are your business alone.

## 3. Local Storage
Your cryptographic keys and portfolio state are stored entirely in your browser's local storage and encrypted with AES-256-GCM. We have zero access to this data.
`,
  "aml-kyc": `
# AML & KYC Framework
*Last Updated: January 1, 2027*

Humanity Ledger operates as a non-custodial software infrastructure provider on the Aztec Mainnet. 

## 1. Non-Custodial Nature
We do not hold, manage, or control user funds. Users interact directly with the decentralized Aztec protocol using their self-custodied keys.

## 2. Regulatory Compliance
While our infrastructure is permissionless, users accessing fiat on-ramps (e.g., via MoonPay) are subject to the KYC/AML procedures of those third-party providers.

## 3. Protocol Level
The Aztec network itself enforces strict privacy guarantees while allowing users to voluntarily generate compliance proofs (e.g., proving a transaction does not originate from a sanctioned address) using zero-knowledge technology without revealing the exact source of funds.
`,
  "disclaimer": `
# Risk Disclaimer
*Last Updated: January 1, 2027*

Interacting with experimental cryptographic systems involves inherent risks.

## 1. Software Risks
Humanity Ledger and the Aztec Mainnet rely on complex mathematics (Zero-Knowledge Proofs, Elliptic Curve Cryptography). While heavily audited, unforeseen bugs could result in the loss of funds.

## 2. No Financial Advice
Nothing on this platform constitutes financial advice. The value of cryptographic assets can be highly volatile.

## 3. Total Loss of Keys
Because the system is non-custodial and decentralized, if you lose your private keys or seed phrase, Humanity Ledger cannot recover your funds. There is no "forgot password" feature in Web3.
`,
  "cryptography": `
# Encryption Systems

Humanity Ledger employs a multi-layered cryptographic architecture to ensure absolute privacy and data integrity.

## 1. Network Layer (Aztec)
We utilize the **Aztec Mainnet** for all financial interactions. This leverages **zk-SNARKs** (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) compiled via the **Noir** language to obfuscate transaction amounts, senders, and receivers.

## 2. Messaging Layer (XMTP)
All communications via Ledger Chat are secured using **XMTP**, which employs the **Double Ratchet Algorithm** (similar to Signal) for Perfect Forward Secrecy. Messages are encrypted locally before being transmitted to the decentralized relay network.

## 3. Local Vault
Sensitive data stored on your device is encrypted using **AES-256-GCM** with keys derived via **PBKDF2** (600,000 iterations), ensuring brute-force resistance even against state-level adversaries.
`,
  "zero-knowledge": `
# Privacy Systems (Zero-Knowledge)

The core tenet of Humanity Ledger is privacy by default, achieved through Zero-Knowledge (ZK) proofs.

## How it Works
ZK proofs allow one party (the prover) to prove to another party (the verifier) that a statement is true without revealing any information beyond the validity of the statement itself.

## Application in Humanity Ledger
When you send Quantum Dots (QDs) on the Aztec Mainnet, your device generates a ZK proof locally. This proof mathematically guarantees that you have sufficient balance and that the transaction is valid, without ever revealing your balance or the transaction amount to the network nodes.
`,
  "p2p-routing": `
# Secure P2P Routing

To prevent metadata analysis and IP tracking, Humanity Ledger implements advanced routing techniques.

## 1. Onion Routing
Similar to the Tor network, messages in Ledger Chat can be routed through multiple relay nodes. Each node only knows the immediate predecessor and successor, completely obfuscating the path from sender to receiver.

## 2. WebRTC for Video
Video and audio calls are established via **WebRTC**. Signaling is handled securely over XMTP, and the media streams are peer-to-peer, encrypted end-to-end via DTLS-SRTP, bypassing centralized servers entirely.
`,
  "app-hub": `
# App Hub

The App Hub is your gateway to the decentralized ecosystem within Humanity Ledger.

It provides a curated, secure environment to interact with verified mini-apps (like Ledger Chat and the Sovereign Portfolio) that natively support our ZK identity and privacy standards. Future expansions will include third-party integrations, all operating under our strict Zero-Trust security model.
`,
  "identity": `
# Digital Identity (DID)

Your identity on Humanity Ledger is entirely self-sovereign and cryptographic.

## Sign-In With Ethereum (SIWE)
We use SIWE (EIP-4361) for authentication. Your public wallet address is your identity. By signing a specific message with your private key, you prove ownership without ever transmitting a password or exposing your private key to our servers.

## Aztec Identity
Behind the scenes, your EVM address deterministically generates an Aztec Schnorr identity, enabling you to transact privately on the L2 network while maintaining a single, unified point of access.
`,
  "audits": `
# Security Audits

Transparency and rigorous security testing are paramount.

## Architecture
Our entire infrastructure is built on the **Aztec Mainnet**, which has undergone extensive peer review and professional audits by leading blockchain security firms.

## Internal Audits
Humanity Ledger conducts continuous internal security audits, automated CI/CD security scanning, and strict dependency management to ensure the integrity of the application layer.

*(Formal external audit reports for the Humanity Ledger application layer will be published here upon completion).*
`,
  "transparency": `
# Transparency Report

We believe in absolute transparency regarding our operations, infrastructure, and any governmental requests.

As a non-custodial, zero-knowledge platform, we do not possess plaintext user data, transaction histories, or private keys. Therefore, we are technically incapable of complying with data requests seeking this information, regardless of jurisdiction.

To date, Humanity Ledger has received **0** requests for user data.
`,

  "overview": `
# Humanity Ledger — Platform Overview
*Version 1.0 | Production | January 2027*

---

## What is Humanity Ledger?

Humanity Ledger is the world's first **sovereign identity and private communication ecosystem** built on the Aztec Mainnet (Zero-Knowledge Layer 2). It combines cryptographic messaging, private asset management, and decentralized identity into a single, seamless application — with zero surveillance, zero data harvesting, and zero dependency on traditional servers.

---

## Core Pillars

### 1. Sovereign Identity
Your identity is your Ethereum wallet address, extended with an Aztec Schnorr key pair. No username, no email, no phone number.

### 2. Ledger Chat
End-to-end encrypted messaging via XMTP v5.3.0, with WebRTC peer-to-peer audio and video calls, Quantum Dot micropayments, polls, and self-destructing messages.

### 3. Private Finance
All financial interactions run on the **Aztec Mainnet** using zk-SNARKs. Transaction amounts, senders, and receivers are never exposed to the public blockchain.

### 4. App Hub
A curated dashboard of decentralized applications that natively support the Humanity Ledger ZK identity standard.

---

## Technology Stack

| Layer | Technology |
|---|---|
| L2 Blockchain | Aztec Mainnet (zk-Rollup) |
| Messaging | XMTP v5.3.0 (MLS) |
| Authentication | SIWE (EIP-4361) |
| Encryption | AES-256-GCM + Double Ratchet |
| Frontend | Next.js 15 / React 19 |
| Database | PostgreSQL + Prisma ORM |
| Hosting | Railway (Production) |

---

## Mainnet Status

Humanity Ledger is **live on Aztec Mainnet** as of January 2027. All transactions, identities, and messages are real and permanent.
`,
  "quantum-dots": `
# Quantum Dots (QD) — The Native Token

*Mainnet | Aztec Network | January 2027*

---

## What are Quantum Dots?

**Quantum Dots (QD)** are the native utility token of the Humanity Ledger ecosystem. They are issued, transferred, and burned entirely on the **Aztec Mainnet** using Zero-Knowledge proofs — meaning all balances and transfers are private by default.

---

## Utility

| Function | Cost |
|---|---|
| Send a Ledger Chat message | 0.0001 QD |
| Create a poll | Free |
| Send QD to a peer | Variable |
| Sovereign Node staking | 100–10,000 QD |
| Airdrop eligibility | ≥ 1 QD |

---

## Distribution

- **Monthly Airdrop**: Every wallet with an active Sovereign Identity receives **10 QD** on the 1st of every month, from January 2027 to December 2100.
- **Community Quests**: Earn QD by completing social verification tasks.
- **Sovereign Node Yield**: Stake QD to earn additional yield.

---

## Privacy Architecture

All QD balances and transfers use Aztec's **Fully Homomorphic Encryption (FHE)**-compatible zk-SNARK circuits. Your balance is never readable by any third party — including Humanity Ledger.

---

## Anti-Sybil Mechanism

Each wallet is limited to one airdrop per month. The system uses:
- **ZK Identity Hashing** (not raw addresses)
- **IP-based deduplication** (SHA-256 hashed, non-reversible)
- **On-chain nullifiers** to prevent replay attacks

---

## Contract Information

The QD token logic is embedded in the Aztec L2 contract suite. There is no ERC-20 equivalent — QD exists purely in the ZK state tree. Public Aztec contract addresses are published in the Transparency Report.
`,
  "changelog": `
# Changelog

All notable changes to Humanity Ledger are documented here.

---

## v1.0.0 — January 2027 (Production Launch)

### Added
- **Ledger Chat**: Full XMTP v5.3.0 end-to-end encrypted messaging
- **WebRTC Calls**: Peer-to-peer audio and video via PeerJS with deterministic peer IDs
- **Quantum Dots**: Native token on Aztec Mainnet with monthly airdrop system
- **Sovereign Identity**: Aztec Schnorr key pair derived from EVM address
- **Poll System**: Create and respond to in-chat polls with XMTP signal protocol
- **QD Pay**: Send Quantum Dots directly inside Ledger Chat
- **Presence System**: Network-backed online/offline/last seen status
- **App Hub**: Unified dashboard for all Humanity Ledger applications
- **TuringShield Gate**: Anti-bot gate for Ledger Chat access
- **Onion Router**: Experimental multi-hop message routing for metadata privacy
- **Self-Destructing Messages**: Burn-on-read with configurable timers
- **GIF Support**: Tenor-powered GIF search and sharing
- **Voice Notes**: In-chat audio recording and playback
- **Reactions**: Emoji reactions on any message
- **Message Quoting**: Reply to specific messages
- **Message Scheduling**: Send messages at a future time
- **Read Receipts**: Optional delivery and read confirmation
- **Contact Book**: Local encrypted address book
- **Message Search**: Full-text search across conversation history
- **ZK Governance**: On-chain proposal voting system
- **Product Passport**: GS1-compatible provenance system

### Security
- All session management uses asymmetric SIWE signatures
- AES-256-GCM local vault with PBKDF2 key derivation (600,000 iterations)
- Zero raw IP storage — all identity hashing is non-reversible SHA-256

---

## Upcoming

- Formal external security audit publication
- Bug Bounty Program launch (see [Bug Bounty](/docs/bug-bounty))
- Aztec Mainnet contract verification
- iOS and Android native applications
`,
};

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = CONTENT_MAP[slug];
  if (!content) {
    notFound();
  }
  return (
    <DocsShell currentSlug={slug}>
      <article className="prose prose-zinc max-w-none prose-headings:font-black prose-h1:text-3xl prose-h2:text-xl prose-p:text-zinc-600 prose-p:leading-relaxed prose-li:text-zinc-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </DocsShell>
  );
}
