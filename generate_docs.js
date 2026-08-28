const fs = require('fs');
const path = require('path');

const contentMap = {
  "terms": `
# Terms of Service

Last Updated: January 1, 2027

Welcome to Humanity Ledger. By accessing or using our protocol, applications (including Ledger Chat and App Hub), or related services, you agree to be bound by these Terms of Service.

## 1. Decentralization & Sovereign Identity
Humanity Ledger operates as a decentralized cryptographic protocol. You maintain sole ownership and control over your cryptographic keys, identity parameters, and data. We do not store, possess, or have access to your private keys or seed phrases. If you lose your keys, your data cannot be recovered by Humanity Ledger or any third party.

## 2. No Custody or Control
We are a non-custodial software provider. We do not hold assets, messages, or metadata on your behalf. The network relies on WebRTC, XMTP, and Aztec L2 for peer-to-peer and decentralized routing.

## 3. Acceptable Use
You agree not to use the protocol to:
- Violate any applicable local, national, or international law.
- Distribute malware, exploit network vulnerabilities, or engage in malicious sybil attacks.
- Harass, abuse, or dox other participants.

## 4. Limitation of Liability
The software is provided "AS IS", without warranty of any kind. Under no circumstances shall Humanity Ledger be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the protocol.
`,
  "privacy": `
# Privacy Policy

Humanity Ledger is designed with absolute privacy as its foundational pillar. We collect the absolute minimum data required to facilitate network connections.

## End-to-End Encryption by Default
Your messages, calls, and interactions are secured using End-to-End Encryption (E2EE) and cryptographic proofs. We cannot read your messages or listen to your calls. 

## Data We Do Not Collect
- Message contents or attachments (E2EE via XMTP).
- Audio/Video call streams (E2EE via WebRTC DTLS/SRTP).
- Your private keys or wallet balances.
- Your physical location or IP addresses (mitigated via Onion Routing and TURN servers).

## Data Required for Operation
To facilitate peer discovery, temporary signaling metadata (such as ephemeral connection IDs) is processed by our relay servers. This data is strictly kept in memory and is automatically destroyed upon session termination. No logs are written to disk.
`,
  "cookies": `
# Cookie Policy

We employ a strict "Zero-Tracking" cookie policy.

## Essential Cookies Only
We use cryptographic session tokens (e.g., \`system_handshake\`) stored in local or session storage to authorize your decentralized identity within the App Hub and Terminal. These are not used for tracking, advertising, or analytics.

## No Third-Party Trackers
There are no Google Analytics, Facebook Pixels, or third-party marketing trackers anywhere within the Humanity Ledger protocol. We respect your sovereign attention.
`,
  "aml-kyc": `
# AML & KYC Framework

## Sybil Resistance Without Compromise
Humanity Ledger enforces strict sybil resistance via cryptographic uniqueness (1 Wallet = 1 Identity) rather than intrusive physical KYC. 

## Regulatory Compliance
Our architecture separates the social layer (Ledger Chat) from regulated financial layers. Any future DeFi integrations on the Aztec L2 will require independent cryptographic compliance proofs that preserve your anonymity while satisfying localized regulatory requirements via localized attestations.
`,
  "disclaimer": `
# Risk Disclaimer

## Experimental Technology
Humanity Ledger integrates bleeding-edge cryptographic systems including decentralized networking, WebRTC mesh networking, and decentralized message transport. 

## Cryptographic Risks
While audited, the nature of decentralized software involves inherent risks. Smart contract bugs, protocol exploits, or local device compromises could result in the loss of data or assets. You assume all risks associated with cryptographic network participation.
`,
  "architecture": `
# Architecture Overview

The Humanity Ledger stack is composed of three sovereign layers:

## 1. Transport Layer
Utilizes a decentralized mesh network backed by libp2p and WebRTC. For messaging, we leverage the XMTP protocol for robust, decentralized delivery. For real-time A/V calls, we use strict peer-to-peer WebRTC with mandatory DTLS/SRTP encryption.

## 2. Identity Layer
Powered by cryptographic proofs and ECDSA signatures. Your Ethereum/EVM wallet acts as the root of trust. Sessions are established using Sign-In with Ethereum (SIWE) and ephemeral session keys.

## 3. Application Layer
The client interface (App Hub, Ledger Chat) is a static, sterile React/Next.js bundle. It connects directly to the decentralized network, meaning there is no centralized database storing your application state.
`,
  "cryptography": `
# Encryption Systems

| Component | Standard | Purpose |
|---|---|---|
| **Message Transport** | X3DH / Double Ratchet | Perfect Forward Secrecy for messages |
| **A/V Calls** | DTLS 1.2 / SRTP | End-to-end encrypted voice & video |
| **Identity Proofs** | ECDSA (secp256k1) | Root identity verification |
| **Privacy Engine** | UltraPlonk (Aztec) | Private state transitions (Pending) |
| **Local Vault** | AES-256-GCM | Encrypted local storage |
`,
  "zero-knowledge": `
# Privacy Engine

We utilize cryptographic proofs to ensure that you can prove statements about your identity or assets without revealing the underlying data.

Currently, privacy circuits are simulated using highly secure HMAC attestations while the network prepares for mainnet. Once migrated, all state transitions will be verified via local computation, ensuring absolute privacy for financial and social graphs.
`,
  "p2p-routing": `
# Decentralized Routing

To protect your IP address during real-time calls, Humanity Ledger routes signaling traffic through a localized decentralized routing protocol.

When establishing a connection, traffic is bounced through decentralized relay nodes (TURN servers) ensuring that your ISP and the recipient cannot definitively map your physical location.
`,
  "ledger-chat": `
# Ledger Chat

Ledger Chat is the flagship application of Humanity Ledger. It is a completely decentralized, end-to-end encrypted social network.

## Features
- **Uncensorable Messaging:** Powered by XMTP.
- **Crystal Clear A/V Calls:** Low-latency WebRTC.
- **Sovereign Vault:** Local encrypted file storage.
- **Burn-on-Read:** Ephemeral messaging that leaves no trace.
`,
  "app-hub": `
# The App Hub

The App Hub is your sovereign launchpad. It acts as the gateway to the Humanity Ledger ecosystem.

Currently, the App Hub provides access to Ledger Chat, Portfolio, and our infrastructure sandboxes. Other modules are strictly locked down under cryptographic seals until global release.
`,
  "identity": `
# Wallet Identity

Your identity is strictly your own. 

You do not need an email, phone number, or government ID to join Humanity Ledger. Your ECDSA keypair is your absolute identity. Your profile metadata (Name, Avatar, Bio) is encrypted and distributed, accessible only by those you explicitly authorize.
`,
  "audits": `
# Security Audits

The Humanity Ledger protocol undergoes continuous, extreme adversarial auditing. 

We employ static analysis, fuzzing, and manual cryptographic review by industry-leading security researchers. Audit reports for the core smart contracts and signaling servers will be published upon mainnet release.
`,
  "bug-bounty": `
# Bug Bounty Program

We believe in open security. If you find a vulnerability in the Humanity Ledger protocol, we want to know.

Our bug bounty program offers substantial rewards for critical vulnerabilities, especially those related to key extraction, sybil exploits, or encryption bypasses.
`,
  "transparency": `
# Transparency Report

As a sovereign protocol, we cannot comply with data requests because we do not hold the data.

Since inception:
- User Data Handed Over: 0 Bytes
- Backdoors Installed: 0
- IP Addresses Logged: 0
`
};

const outputContent = \`import { ALL_DOC_SLUGS } from '@/components/docs/DocsData';
import { DocsShell } from '@/components/docs/DocsShell';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Pre-generated massive markdown content
const CONTENT_MAP: Record<string, string> = \${JSON.stringify(contentMap, null, 2)};

export function generateStaticParams() {
  return ALL_DOC_SLUGS.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (!ALL_DOC_SLUGS.find(d => d.slug === slug)) {
    notFound();
  }

  const content = CONTENT_MAP[slug] || "# Content under construction\\n\\nThis section is currently being updated.";

  return (
    <DocsShell currentSlug={slug}>
      <div className="prose prose-sm sm:prose-base prose-zinc max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </DocsShell>
  );
}
\`;

fs.writeFileSync(path.join(__dirname, 'app/docs/[slug]/page.tsx'), outputContent);
console.log('Docs generated.');
