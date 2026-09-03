import { ALL_DOC_SLUGS } from '@/components/docs/DocsData';
import { DocsShell } from '@/components/docs/DocsShell';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CONTENT_MAP: Record<string, string> = {
  "ledger-chat": 
# Ledger Chat: The Sovereign Communication Protocol
*First Release: 01/01/2027*

Ledger Chat represents a paradigm shift in digital communication. By moving away from centralized servers and phone number-based identity, we have created the world's first mathematically guaranteed private messaging ecosystem.

## 1. Decentralized Identity (DID)
Unlike legacy messaging applications (WhatsApp, Telegram, Signal) that bind your identity to a vulnerable SIM card or phone number, Ledger Chat utilizes **Ethereum-based Sign-In (SIWE)** and **Sovereign Identity Profiles**. Your public key is your identity; your private key is your absolute sovereignty. 

## 2. End-to-End Encryption (E2EE) via XMTP
All messages, payloads, and voice notes are secured using the **Extensible Message Transport Protocol (XMTP)**. 
- **Double Ratchet Algorithm**: Perfect Forward Secrecy (PFS) ensures that if a key is compromised in the future, past messages remain cryptographically secure.
- **Off-Chain Storage**: Messages are routed through decentralized node networks and stored securely on IPFS/Arweave clusters, encrypted uniquely for the recipient's wallet address.

## 3. Burn-on-Read & Ephemeral State
Our proprietary **Zero-Knowledge State Channels** allow users to initiate *Burn-on-Read* messages. Once the recipient's wallet decrypts the payload and renders the UI, a cryptographic proof is generated to permanently sever the IPFS link. The message is annihilated from the decentralized storage layer, leaving zero trace.

## 4. Quantum Dot Micro-Transactions
Ledger Chat is natively integrated with the Humanity Ledger EVM portfolio. Users can stream **Quantum Dots (QDs)** or send stablecoins instantaneously within the chat UI. There are no payment processors, no banks, and no intermediaries.

## 5. Mathematical Authenticity
Every single message is signed via ECDSA (Elliptic Curve Digital Signature Algorithm). When you receive a message, the UI automatically verifies the signature against the sender's public wallet address. Spoofing is mathematically impossible.
,
  "architecture": 
# System Architecture & Infrastructure

The Humanity Ledger ecosystem is engineered with abysmal complexity on the backend, yet presented with absolute simplicity on the frontend. 

## 1. The Zero-Trust Security Model
At the core of our infrastructure lies the **Zero-Trust Enclave**. The backend completely distrusts the frontend. Every state modification, payload decryption, and transaction request must carry a verifiable cryptographic signature.

### Backend Infrastructure
- **High-Concurrency Node.js Services**: Operating across clustered AWS/Vercel environments.
- **PostgreSQL / Prisma ORM**: For maintaining off-chain analytics, fiat-to-crypto bridging states, and encrypted user metadata.
- **Redis Pub/Sub**: Powering zero-latency WebSocket connections for real-time portfolio synchronization.

## 2. The Cryptographic Handshake (TuringShield)
When a user attempts to access the desktop application via a mobile device (QR Link), the system executes a complex handshake:
1. Mobile wallet scans the ephemeral QR code.
2. Mobile generates an **AES-GCM-256** payload, secured by a Server-Signed JWT.
3. The server validates the signature, ensuring no client-side forgery.
4. The desktop UI receives the decryption key via WebSockets and unlocks the local vault.

## 3. Zero-Knowledge Proofs (Aztec Network)
We leverage the **Aztec Network (Noir Programming Language)** for privacy-preserving Smart Contracts.
- **State Shielding**: Users can bridge their public ERC-20 assets into shielded UTXOs (Unspent Transaction Outputs).
- **Client-Side Proving**: Using WASM, the browser generates a zk-SNARK proof of transaction validity without ever revealing the amount or the recipient to the RPC node.

## 4. Multi-Chain Aggregation
The Portfolio engine connects simultaneously to Ethereum Mainnet, Polygon, Arbitrum, and Optimism via distributed RPC nodes (Alchemy / Infura). Balances are indexed, cached, and served in real-time, completely bypassing traditional Web2 latency.
,
  "privacy": 
# Privacy Redefined: The Sovereign Manifesto

For too long, corporations have harvested user data under the guise of "free" services. Humanity Ledger terminates surveillance capitalism through applied cryptography.

## 1. Data Minimization
We do not ask for your name. We do not ask for your email (unless you specifically request Web2 recovery). We do not ask for your phone number. Your wallet address is your absolute identity. 

## 2. No Tracking, No Analytics
Humanity Ledger strips all generic Web2 tracking pixels. There is no Google Analytics, no Meta Pixel, no behavioral tracking. The code executing in your browser is strictly isolated.

## 3. Cryptographic Obfuscation
When executing transactions on the public blockchain, our privacy mixer (powered by Aztec) obfuscates the origin and destination of your capital. Financial privacy is a fundamental human right.

## 4. Local-First Vault
Your private keys never touch our servers. They are encrypted locally in your browser's IndexedDB or Secure Enclave using **AES-256-GCM** derived from a high-entropy PBKDF2 hash (600,000 iterations). We literally cannot access your funds or read your Ledger Chat messages, even if compelled by law enforcement.

## 5. Open Source Verification
Trust is not assumed; it is verified. Critical components of our encryption and wallet derivation algorithms are available for public audit.
,
  "terms": 
# Terms of Service
Last Updated: January 1, 2027

Welcome to Humanity Ledger. By accessing or using our protocol, you agree to be bound by these Terms of Service.

## 1. Decentralization
Humanity Ledger operates as a decentralized cryptographic protocol. You maintain sole ownership and control over your cryptographic keys, your identity, and your data. 

## 2. No Custody
We are a non-custodial software provider. We do not store, possess, or have access to your private keys. 

## 3. Limitation of Liability
The software is provided "AS IS" without warranty of any kind. Under no circumstances shall Humanity Ledger or its contributors be liable for any direct or indirect damages.

};

export default function DocPage({ params }: { params: { slug: string } }) {
  const content = CONTENT_MAP[params.slug];
  if (!content) {
    notFound();
  }
  return (
    <DocsShell activeSlug={params.slug}>
      <article className="prose prose-zinc max-w-none prose-headings:font-black prose-h1:text-3xl prose-h2:text-xl prose-p:text-zinc-600 prose-p:leading-relaxed prose-li:text-zinc-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </DocsShell>
  );
}
