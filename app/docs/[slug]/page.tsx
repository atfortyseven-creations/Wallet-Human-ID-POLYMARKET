import { ALL_DOC_SLUGS } from "@/components/docs/DocsData";
import { DocsShell } from "@/components/docs/DocsShell";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Pre-generated documentation content — all slugs fully populated
const CONTENT_MAP: Record<string, string> = {
  "terms": `
# Terms of Service

Last Updated: January 1, 2027

Welcome to Humanity Ledger. By accessing or using our protocol, applications (including Ledger Chat and the App Hub), or any related services, you agree to be bound by these Terms of Service.

---

## 1. Decentralization and ZK-Identity

Humanity Ledger operates as a decentralized cryptographic protocol utilizing Aztec Network zero-knowledge proofs. You maintain sole ownership and control over your cryptographic keys, your identity, and your data. We do not store, possess, or have access to your private keys or recovery phrases.

## 2. No Custody or Control

We are a non-custodial software provider. The network relies on Aztec for ZK state transitions and XMTP for decentralized message transport. Quantum Dots (QDs) are utility tokens for network usage, not financial instruments.

## 3. Acceptable Use

You agree not to use the protocol to violate any applicable law, distribute malware, launch DDoS or Sybil attacks, harass or impersonate other participants, or disrupt network performance.

## 4. Intellectual Property

The Humanity Ledger software, design, and documentation are protected by applicable copyright and intellectual property laws.

## 5. Limitation of Liability

The software is provided "AS IS" without warranty of any kind. Under no circumstances shall Humanity Ledger or its contributors be liable for any direct, indirect, incidental, or consequential damages.

## 6. Amendments

We reserve the right to modify these terms at any time. Continued use constitutes acceptance of revised terms.

## 7. Governing Law

These terms are governed by the laws of the European Union.
`,
  "privacy": `
# Privacy Policy

Last Updated: January 1, 2027

Humanity Ledger is designed with privacy as a foundational principle.

---

## Core Privacy Principles

1. **Zero-Knowledge Architecture** - We leverage Aztec Network to ensure transactions are verifiable without revealing underlying data.
2. **End-to-End Encryption** - All Ledger Chat communications are E2EE via XMTP.
3. **No central data stores** - Messages are never stored unencrypted on our servers.

## What We Do Not Collect

- Message contents, voice notes, or attachments.
- Audio or video call streams.
- Private keys or wallet balances.
- Physical location or persistent IP address.
- Advertising identifiers or behavioral tracking data.

## What We Process for Network Operation

Temporary Redis presence heartbeats (90s TTL) are processed in working memory only. These cannot be linked to your real-world identity.

## Local Storage and Vaults

Application data is stored locally on your device in an encrypted IndexedDB/LMDB Vault. This data never leaves your device unless you explicitly export it.

Contact: privacy@humanityledger.com
`,
  "cookies": `
# Cookie and Storage Policy

Last Updated: January 1, 2027

---

## Secure Session Tokens and Vaults

We use secure session tokens stored in your browser localStorage and sessionStorage to confirm your cryptographic identity (SIWE). We also utilize local IndexedDB to power the Secure Vault. These are strictly necessary for the application to function.

## What We Do Not Use

- Advertising cookies.
- Third-party tracking pixels (e.g., Meta Pixel).
- Analytics cookies (e.g., Google Analytics).
- Any persistent identifier that tracks you across websites.

## Your Control

Disconnect your wallet or clear browser local storage to terminate your session and lock your Secure Vault.
`,
  "aml-kyc": `
# Sybil Resistance and AML Framework

Last Updated: January 1, 2027

---

## Overview

Humanity Ledger is a non-custodial communication protocol. We do not hold fiat financial assets. Quantum Dots (QDs) are strictly utility tokens.

## Anti-Sybil Defense

1. **Global Cap** - A maximum number of Genesis Identities can be minted on the Aztec network.
2. **IP and Hardware Fingerprinting** - Our Redis Anomaly Detector prevents mass-wallet generation from a single location.
3. **Zero-Knowledge Proofs** - Aztec rollups ensure identity uniqueness without exposing user activity.

## Abuse Prevention

- Rate limiting on messages and QD transfers via Redis sliding windows.
- Wash Trading Prevention - QD rewards are capped per 24h between specific user pairs.
- Minimum Fees - Every transaction burns a minimum fee to deter spam.

## Reporting

Report illegal activity to legal@humanityledger.com.
`,
  "disclaimer": `
# Risk Disclaimer

Last Updated: January 1, 2027

---

## Software Status

Humanity Ledger is in **Beta (Mainnet Genesis)**. The software is provided "AS IS". Unexpected behaviors, downtime, or network congestion may occur.

## Cryptographic Risks

By utilizing Aztec ZK-Rollups and XMTP, you are interacting with cutting-edge cryptographic systems. Vulnerabilities in zero-knowledge circuits, smart contracts, or the EVM could result in loss of access to your identity or QDs.

## No Financial Advice

Nothing in Humanity Ledger constitutes financial, legal, or tax advice. Quantum Dots (QDs) are utility tokens for accessing network bandwidth and premium features. They are not an investment vehicle.
`,
  "architecture": `
# Architecture Overview

Humanity Ledger is built on a highly resilient, privacy-first technical stack.

---

## The Four Pillars

### 1. Identity and State - Aztec Network
All identities are verified via Zero-Knowledge proofs on the Aztec Layer 2 rollup. QD tokenomics are verified on-chain without exposing user behavior.

### 2. Decentralized Messaging - XMTP
Ledger Chat uses the Extensible Message Transport Protocol (XMTP), routing E2EE payloads through a decentralized node network. Our servers never access message contents.

### 3. High-Velocity Edge Caching - Redis
Real-time presence, typing indicators, and Sybil defenses are handled by a Redis caching layer. Presence keys auto-expire at 90 seconds TTL.

### 4. Local Secure Vaults - IndexedDB
All decrypted messages and settings are stored exclusively on the client device in an AES-256-GCM encrypted Local Vault. Key material is derived from your wallet signature and never transmitted.
`,
  "cryptography": `
# Encryption Systems

All data transmitted within Humanity Ledger relies on military-grade, verifiable cryptography.

---

## End-to-End Encryption

Every message is encrypted using **X25519 Diffie-Hellman Key Exchange** and **AES-256-GCM**:

- The sender encrypts the payload locally using the recipient XMTP public key.
- Only the recipient private key can decrypt the payload.
- Our relay servers transport ciphertext with zero ability to decrypt.

## QR Handshake Session Pairing

Mobile-to-desktop pairing uses **X25519 ECDH** to derive a shared secret. A 4-digit visual PIN provides out-of-band authentication, preventing QR relay attacks.

## Session Key Management

When you sign in via SIWE, you authorize a temporary session key valid for a maximum of 7 days, after which re-authentication is required.
`,
  "zero-knowledge": `
# Privacy Systems (ZK)

Humanity Ledger uses **Zero-Knowledge Proofs (ZKPs)** via the Aztec Network.

---

## How ZK Proofs Work

A ZKP lets one party (your device) prove to the network that a statement is true, without revealing any information beyond the statement validity.

**Example - QD Transfer:** When you transfer QDs, your device generates a ZK proof that you have sufficient balance. The network verifies the mathematics and updates state. It never learns who you are, who you sent to, or your remaining balance.

## Sovereign ZK-Identity

Your Aztec ZK-Identity is cryptographically derived from your EVM address signature but is untraceable to your public EVM transaction history.

## Privacy Mode

Maximum Privacy Mode in System Settings routes all XMTP metadata through additional anonymity layers and suppresses delivery receipts.
`,
  "p2p-routing": `
# Secure Routing

Humanity Ledger employs advanced routing obfuscation to protect users from IP tracking.

---

## WebRTC and IP Masking

Voice and video calls use WebRTC routed through TURN relays by default, masking IP addresses from recipients entirely.

## Edge API Routing

All client-to-server API calls are routed through Cloudflare edge nodes. Our origin server IPs are never exposed to clients, and client IPs are normalized at the edge.

## Onion Routing (Experimental)

We are testing experimental Tor-compatible onion routing for HTTP requests, making traffic correlation mathematically infeasible. This is opt-in via System Settings.
`,
  "ledger-chat": `
# Ledger Chat

**Ledger Chat** is our flagship application: a decentralized, end-to-end encrypted communication terminal.

---

## Features

- **E2EE Messaging** - All text, images, voice notes, and files are fully encrypted via XMTP.
- **Tone Translation** - On-device AI filter that rephrases hostile messages into professional dialogue.
- **Self-Destruct** - "Burn-on-Read" timers that cryptographically delete messages after a designated time.
- **Delivery Receipts** - Redis-backed receipts showing exactly when messages were delivered and read.
- **QD Transfers** - Send Quantum Dots directly within a conversation, settled on the Aztec network.
- **Voice Notes** - Encrypted audio messages with waveform visualization.

## Micro-Fees

Every message burns a microscopic amount of QDs. This makes spam attacks economically ruinous while being imperceptible to legitimate users.

## Presence System

Humanity Ledger uses a dual-layer presence system: Local BroadcastChannel (near-instant cross-tab sync) and Server Redis with 90s TTL (cross-device presence heartbeat).
`,
  "app-hub": `
# App Hub Overview

The Humanity Ledger **App Hub** is your central command center for the decentralized web.

---

## Core Modules

- **Ledger Chat** - XMTP-powered E2EE messaging with voice notes, file sharing, and integrated QD transfers.
- **Sovereign Identity** - Manage your Aztec ZK-Identity, view your QD balance, and monitor network reputation.
- **System Settings** - Configure your privacy engine, sound packs, self-destruct timers, and aesthetic preferences.

## Dashboard Indicators

- **Network Status** - Connection health to Aztec RPC nodes and XMTP relays.
- **System Sync** - Status of your Secure Vault and background sync processes.
- **QDs Balance** - Real-time reflection of your utility tokens on the Aztec network.

## Navigation

The App Hub uses a persistent navigation sidebar on desktop and a bottom navigation bar on mobile. All core features are accessible within two taps or clicks.
`,
  "identity": `
# Sovereign ZK-Identity

Humanity Ledger uses the **Aztec Network** to provide you with a privacy-preserving Sovereign Identity.

---

## How It Works

Your identity is derived from your Ethereum wallet signature (SIWE), which is deterministically hashed to generate your **Aztec ZK-Identity**. Because Aztec uses Zero-Knowledge proofs, you can prove ownership without revealing your full transaction history.

## Quantum Dots (QDs)

QDs are the native utility token of Humanity Ledger:

- Prevent network spam (micro-fees per message).
- Unlock premium storage and AI features (e.g., Tone Translation).
- Reward active, constructive network participants.

## Recovery and Key Management

Your wallet recovery phrase (or email OTP for embedded wallets) is the master key to your identity.

> **Critical:** If you lose access to your originating wallet or email, you lose access to your Aztec ZK-Identity and all associated QDs. Humanity Ledger cannot recover it for you.
`,
  "audits": `
# Security Audits and Architecture

The security of Humanity Ledger is uncompromising. We employ a multi-layered defense architecture.

---

## 1. Zero-Knowledge Cryptography (Aztec)

All state transitions for identities and QDs are executed via Noir smart contracts on Aztec. Data is mathematically verifiable while remaining completely private.

## 2. End-to-End Encryption (XMTP)

Ledger Chat uses the XMTP protocol. Messages are encrypted using X25519 key pairs and decrypted only on the recipient device.

## 3. Real-Time Anomaly Detection

Redis-backed sliding windows monitor for Sybil attacks, DDoS attempts, and API abuse. Suspicious IPs and wallet signatures are temporarily blackholed at the Edge.

## 4. Local Secure Vaults

Browser storage (IndexedDB/LMDB) is encrypted locally before being written to disk, protecting your chat history even if your device is physically accessed.

## 5. SIEM Audit Log

All sensitive operations (logins, transfers, settings changes) are written to an append-only SIEM audit log with cryptographic signatures, enabling forensic reconstruction of any incident.
`,
  "bug-bounty": `
# Bug Bounty Program

Last Updated: January 1, 2027

---

## Program Status: ACTIVE

With the launch of Humanity Ledger Mainnet Genesis, our Bug Bounty Program is now active.

## How to Report

1. Email **security@humanityledger.com** (PGP encryption preferred).
2. Include a clear vulnerability description, a Proof of Concept (PoC), and reproduction steps.
3. Do **not** disclose publicly until we confirm resolution.
4. We will acknowledge your report within 24 hours.

## In Scope

- Cryptographic bypasses in ZK-Identity generation or Aztec integration.
- Unauthorized QD minting vulnerabilities.
- XMTP encryption flaws leading to message decryption.
- Critical authentication bypasses in SIWE.
- XSS leading to Vault key extraction.

## Out of Scope

- DDoS attacks against edge infrastructure.
- Social engineering.
- Vulnerabilities in third-party libraries not caused by our specific implementation.
`,
  "transparency": `
# Transparency Report

Humanity Ledger is committed to full transparency about how our systems operate.

---

## Data Requests

As a decentralized, non-custodial protocol with Zero-Knowledge architecture and E2EE, we hold virtually no readable user data.

| Metric | Count (All Time) |
|---|---|
| User message content handed over to authorities | 0 |
| User IP addresses logged to disk permanently | 0 |
| Backdoors or interception mechanisms installed | 0 |
| Government requests for user data fulfilled | 0 |

## Open Source Commitment

- **Aztec Network** - Open-source ZK-Rollup architecture.
- **XMTP** - Open-source, decentralized message transport.
- **Wagmi / Viem** - Open-source Ethereum tooling.

We are committed to progressively open-sourcing more of our frontend and relay codebase as the protocol matures.

Last updated: January 1, 2027.
`,
};

export function generateStaticParams() {
  return ALL_DOC_SLUGS.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!ALL_DOC_SLUGS.find((d) => d.slug === slug)) {
    notFound();
  }

  const content =
    CONTENT_MAP[slug] ||
    "# Content under construction\n\nThis section is currently being updated.";

  return (
    <DocsShell currentSlug={slug}>
      <div className="prose prose-sm sm:prose-base prose-zinc max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </DocsShell>
  );
}
