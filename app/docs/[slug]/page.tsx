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
};

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = CONTENT_MAP[slug];
  if (!content) {
    notFound();
  }
  return (
    <DocsShell activeSlug={slug}>
      <article className="prose prose-zinc max-w-none prose-headings:font-black prose-h1:text-3xl prose-h2:text-xl prose-p:text-zinc-600 prose-p:leading-relaxed prose-li:text-zinc-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </DocsShell>
  );
}
