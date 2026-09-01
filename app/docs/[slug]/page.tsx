import { ALL_DOC_SLUGS } from '@/components/docs/DocsData';
import { DocsShell } from '@/components/docs/DocsShell';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Pre-generated documentation content
const CONTENT_MAP: Record<string, string> = {
  "terms": \
# Terms of Service

Last Updated: January 1, 2027

Welcome to Humanity Ledger. By accessing or using our protocol, applications (including Ledger Chat and the App Hub), or any related services, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.

---

## 1. Decentralization and ZK-Identity

Humanity Ledger operates as a decentralized cryptographic protocol utilizing Aztec Network's zero-knowledge proofs. You maintain sole ownership and control over your cryptographic keys, your identity, and your data. We do not store, possess, or have access to your private keys or recovery phrases.

If you lose your keys or recovery phrase, your data cannot be recovered by Humanity Ledger or any third party. It is your sole responsibility to back up your recovery phrase in a safe and secure location.

## 2. No Custody or Control

We are a non-custodial software provider. We do not hold assets, messages, or metadata on your behalf. The network relies on Aztec for ZK state transitions and XMTP for decentralized message transport. Quantum Dots (QDs) are utility tokens for network usage, not financial instruments.

## 3. Acceptable Use

You agree not to use the protocol to:

- Violate any applicable local, national, or international law or regulation.
- Distribute malware, attempt to exploit network vulnerabilities, or launch DDoS / Sybil attacks.
- Harass, threaten, impersonate, or attempt to reveal the identity of other participants without their consent.
- Conduct any activity that could disrupt or degrade the performance and availability of the network for other users.

## 4. Intellectual Property

The Humanity Ledger software, design, and associated documentation are protected by applicable copyright and intellectual property laws. Open-source components are licensed under their respective open-source licenses.

## 5. Limitation of Liability

The software is provided "AS IS", without warranty of any kind, express or implied. Under no circumstances shall Humanity Ledger, its contributors, or its licensors be liable for any direct, indirect, incidental, punitive, or consequential damages arising from the use of or inability to use the protocol.

## 6. Amendments

We reserve the right to modify these terms at any time. Continued use of the protocol after changes are published constitutes your acceptance of the revised terms. We will make reasonable efforts to notify users of material changes.
\,
  "privacy": \
# Privacy Policy

Last Updated: January 1, 2027

Humanity Ledger is designed with privacy as a foundational principle. This policy explains what data we process, why, and how we protect it using Zero-Knowledge cryptography.

---

## Our Core Privacy Principles

1. **Zero-Knowledge Architecture** - We leverage the Aztec Network to ensure transactions and state changes are mathematically verifiable without revealing the underlying data.
2. **End-to-End Encryption** - All communications via Ledger Chat are E2EE using the XMTP protocol.
3. **No central data stores** - Your messages and call content are never stored unencrypted on our servers.

## What We Do Not Collect

- The content of your messages, voice notes, or attachments.
- Audio or video call streams.
- Your private keys or wallet balances.
- Your physical location or persistent IP address.
- Advertising identifiers or behavioral tracking data.

## What We Process for Network Operation

To facilitate peer discovery and real-time call setup, temporary signaling metadata (such as presence heartbeats via Redis) is briefly processed by our relay servers. This data:
- Is processed only in Redis working memory, and auto-expires (TTL) rapidly.
- Cannot be linked to your real-world identity, only to your derived Sovereign ZK-Identity.

## Local Storage & Vaults

Application data (such as settings, contact lists, and message history) is stored locally on your device in an encrypted IndexedDB/LMDB Vault. This data never leaves your device unless you explicitly export it.

## Third Parties

We do not share any data with third-party advertising networks or analytics providers. We use secure edge caching (Cloudflare) to deliver UI assets, but no personal data is routed through third-party analytics.

Contact: privacy@humanityledger.com
\,
  "cookies": \
# Cookie & Storage Policy

Last Updated: January 1, 2027

---

## Secure Session Tokens & Vaults

We use secure session tokens, stored in your browser's \\\localStorage\\\ and \\\sessionStorage\\\, to confirm your cryptographic identity (SIWE - Sign-In with Ethereum). 
We also utilize local IndexedDB to power the Secure Vault which stores your encrypted chat history and preferences. These are strictly necessary for the application to function correctly.

## What We Do Not Use

- Advertising cookies.
- Third-party tracking pixels (e.g., Meta Pixel).
- Analytics cookies from platforms such as Google Analytics.
- Any persistent identifier that tracks you across websites.

## Your Control

You may clear your session tokens at any time by disconnecting your wallet or clearing your browser's local storage. This will terminate your active session and lock your Secure Vault.
\,
  "aml-kyc": \
# Sybil Resistance & AML Framework

Last Updated: January 1, 2027

---

## Overview

Humanity Ledger is a non-custodial communication protocol. We do not process, transfer, or hold fiat financial assets on behalf of users. Quantum Dots (QDs) are strictly utility tokens used to meter network usage and prevent spam.

## Cryptographic Identity Verification & Anti-Sybil

Our network uses cryptographic wallet signatures as the basis for identity. To prevent Sybil attacks (bot farming), we enforce a rigorous multi-layered defense:
1. **Global Cap:** A maximum number of Genesis Identities can be minted on the Aztec network.
2. **IP & Hardware Fingerprinting Thresholds:** Our Redis Anomaly Detector prevents a single physical location from mass-generating wallets.
3. **Zero-Knowledge Proofs:** Aztec rollups ensure identity uniqueness without exposing public ledgers of user activity.

## Abuse Prevention & Wash Trading

We have implemented strict technical measures to prevent network abuse:
- **Rate limiting** on message sending and QD transfers via Redis sliding windows.
- **Wash Trading Prevention:** QD rewards for network activity are algorithmically capped per 24h period between any specific pair of users.
- **Minimum Fees:** Every transaction burns a minimum fee, mathematically draining attackers attempting database bloat.

## Reporting

If you believe that illegal activity is occurring on the network, you can report it to us at legal@humanityledger.com.
\,
  "disclaimer": \
# Risk Disclaimer

Last Updated: January 1, 2027

---

## Software Status

The Humanity Ledger protocol and its associated applications are currently in **Beta (Mainnet Genesis)**. 
While extensive security audits and penetration testing have been conducted, the software is provided "AS IS". 
Unexpected behaviors, downtime, or network congestion may occur.

## Cryptographic Risks

By utilizing Aztec ZK-Rollups and the XMTP protocol, you are interacting with cutting-edge cryptographic systems. 
You acknowledge that vulnerabilities in underlying zero-knowledge circuits, smart contracts, or the Ethereum Virtual Machine (EVM) could result in loss of access to your identity or utility tokens (QDs).

## No Financial Advice

Nothing in the Humanity Ledger platform constitutes financial, legal, or tax advice. Quantum Dots (QDs) are utility tokens intended solely for accessing network bandwidth and premium features. They are not an investment vehicle.
\,
  "architecture": \
# Architecture Overview

Humanity Ledger is built on a highly resilient, privacy-first technical stack designed for true decentralization and zero-knowledge execution.

---

## The Four Pillars

1. **Identity & State (Aztec Network)**
   All identities are hashed and verified via Zero-Knowledge proofs on the Aztec Layer 2 rollup. State mutations, including Quantum Dot (QD) tokenomics, are verified on-chain without exposing user behavior.

2. **Decentralized Messaging (XMTP)**
   Ledger Chat does not use central databases for messages. It utilizes the Extensible Message Transport Protocol (XMTP), routing end-to-end encrypted payloads through a decentralized node network.

3. **High-Velocity Edge Caching (Redis/Cloudflare)**
   Real-time presence, chat typing indicators, and anomaly detection (Sybil defenses) are handled by a hyper-fast Redis caching layer and edge-computed routes.

4. **Local Secure Vaults (LMDB/IndexedDB)**
   Decrypted messages, aesthetic settings, and application states are exclusively stored on the client device in an AES-256 encrypted Local Vault.
\,
  "cryptography": \
# Encryption Systems

All data transmitted within Humanity Ledger relies on military-grade, verifiable cryptography.

---

## End-to-End Encryption

Every message sent through Ledger Chat is encrypted using **X25519 Diffie-Hellman Key Exchange** and **AES-256-GCM**.
- The sender encrypts the payload locally using the recipient's public key.
- Only the recipient's private key, stored securely in their wallet, can decrypt the payload.
- Our relay servers transport the ciphertext but have zero capacity to decrypt it.

## Key Management

Your master identity is your Ethereum wallet (e.g., MetaMask). 
When you sign in via SIWE (Sign-In with Ethereum), you authorize a temporary session key that manages encryption for a maximum of 7 days, after which re-authentication is mathematically required.
\,
  "zero-knowledge": \
# Privacy Systems (ZK)

Humanity Ledger utilizes **Zero-Knowledge Proofs (ZKPs)** via the Aztec Network to guarantee absolute data privacy while maintaining verifiable network rules.

---

## How it works

A ZKP allows one party (your device) to prove to another party (the network) that a statement is true, without revealing any information beyond the validity of the statement itself.

For example, when you transfer Quantum Dots (QDs) to another user, your device generates a proof that you have sufficient balance and authorizes the transfer. The network verifies the mathematics of this proof and updates the state, but the network never learns *who* you are, *who* you sent it to, or *what* your remaining balance is.

## Sovereign Identity

Your Aztec ZK-Identity is cryptographically derived from your EVM address signature but is distinct and untraceable to your public EVM history.
\,
  "p2p-routing": \
# Secure Routing

To protect users from IP tracking and metadata analysis, Humanity Ledger employs advanced routing obfuscation.

---

## WebRTC and IP Masking

Voice and video calls use WebRTC. By default, peer-to-peer WebRTC exposes IP addresses to both parties. Humanity Ledger's **Privacy Engine** allows users to route calls through TURN relays, masking their IP addresses from the recipient entirely.

## Onion Routing

We are actively testing experimental integration with Onion routing protocols to further obfuscate the origin of HTTP requests to our Edge API, making traffic correlation mathematically infeasible.
\,
  "ledger-chat": \
# Ledger Chat

**Ledger Chat** is our flagship application: a decentralized, end-to-end encrypted communication terminal.

---

## Features

- **E2EE Messaging:** All text, images, and voice notes are fully encrypted.
- **Tone Translation:** An on-device AI sentiment filter that can automatically rephrase hostile messages into professional dialogue.
- **Self-Destruct:** "Burn-on-Read" timers that cryptographically delete messages after a designated time.
- **Delivery Receipts:** Redis-backed receipts showing precisely when a message was delivered and read, without exposing network metadata.

## Micro-Fees

To prevent network congestion and spam, every message burns a microscopic amount of Quantum Dots (QDs). This makes large-scale spam attacks economically ruinous for attackers.
\,
  "app-hub": \
# App Hub Overview

The Humanity Ledger **App Hub** is your central command center for interacting with the decentralized web.

---

## Core Modules

- **Ledger Chat** - XMTP-powered, end-to-end encrypted messaging with voice notes, file sharing, and integrated QD transfers.
- **Sovereign Identity** - Manage your Aztec ZK-Identity, view your QD balance, and monitor your network reputation.
- **System Settings** - Configure your privacy engine, sound packs, self-destruct timers, and aesthetic preferences.

## Dashboard Indicators

The top status bar provides real-time information:
- **Network Status** - Connection health to Aztec RPC nodes and XMTP relays.
- **System Sync** - Status of your Secure Vault and background sync processes.
- **QDs Balance** - Real-time reflection of your utility tokens on the Aztec network.
\,
  "identity": \
# Sovereign ZK-Identity

Humanity Ledger uses the **Aztec Network** to provide you with a privacy-preserving Sovereign Identity.

---

## How It Works

Instead of traditional usernames and passwords, your identity is derived from your Ethereum wallet signature (SIWE). 
This signature is deterministically hashed to generate your **Aztec ZK-Identity**.

Because Aztec utilizes Zero-Knowledge proofs, you can prove you own a specific identity and balance without revealing your entire transaction history to the public.

## Quantum Dots (QDs)

QDs are the native utility token of the Humanity Ledger network. They are used to:
- Prevent network spam (micro-fees per message).
- Unlock premium storage and AI features (e.g., Tone Translation).
- Reward active, constructive network participants.

## Recovery and Key Management

Your wallet's **recovery phrase** (or your email OTP logic if using an embedded wallet) is the master key to your identity. 
> **Critical:** If you lose access to your originating Ethereum wallet or email, you lose access to your Aztec ZK-Identity and all associated QDs. Humanity Ledger cannot recover it for you.
\,
  "audits": \
# Security Audits & Architecture

The security of the Humanity Ledger protocol is uncompromising. We employ a multi-layered defense architecture.

---

## 1. Zero-Knowledge Cryptography (Aztec)
All state transitions regarding identities and QDs are executed via Noir smart contracts on the Aztec network. This ensures data is mathematically verifiable while remaining completely private.

## 2. End-to-End Encryption (XMTP)
Ledger Chat utilizes the Extensible Message Transport Protocol (XMTP). Messages are encrypted on your device using X25519 key pairs and decrypted only on the recipient's device. Relay servers cannot read message contents.

## 3. Real-Time Anomaly Detection
Our Edge infrastructure utilizes advanced Redis-backed sliding windows to monitor for Sybil attacks, DDoS attempts, and API abuse. Suspicious IP addresses and wallet signatures are temporarily blackholed at the Edge.

## 4. Local Secure Vaults
Browser storage (IndexedDB/LMDB) is encrypted locally before being written to disk, ensuring that physical access to your device does not immediately compromise your chat history.
\,
  "bug-bounty": \
# Bug Bounty Program

Last Updated: January 1, 2027

---

## Program Status: ACTIVE

With the launch of the Humanity Ledger Mainnet Genesis, our formal Bug Bounty Program is now active. We encourage responsible disclosure of security vulnerabilities.

## How to report:

1. Send your findings to **security@humanityledger.com**. PGP encryption is preferred (key available on request).
2. Include a clear description of the vulnerability, a Proof of Concept (PoC), and steps to reproduce.
3. Do **not** disclose publicly until we have confirmed resolution with you.
4. We will acknowledge your report within 24 hours.

## Scope

The following are in scope for bounties:
- Cryptographic bypasses in ZK-Identity generation or Aztec integration.
- Unauthorized state mutation or QD minting vulnerabilities.
- XMTP encryption implementation flaws leading to message decryption.
- Critical authentication bypasses in SIWE.
- Cross-site scripting (XSS) leading to Vault key extraction.

## Out of Scope
- Denial-of-service attacks against our edge infrastructure.
- Social engineering.
- Vulnerabilities in third-party libraries (unless specifically how we implemented them).
\,
  "transparency": \
# Transparency Report

Humanity Ledger is committed to full transparency about how our systems operate and how user data is handled.

---

## Data Requests

As a decentralized, non-custodial protocol featuring Zero-Knowledge architecture and E2EE, we hold virtually no readable user data. We cannot provide message contents or financial histories to third parties because we do not possess them.

| Metric | Count (All Time) |
|---|---|
| User message content handed over to authorities | 0 |
| User IP addresses logged to disk permanently | 0 |
| Backdoors or interception mechanisms installed | 0 |
| Government requests for user data fulfilled | 0 |

## Open Source Commitment

The core communication and state components of Humanity Ledger are built on open-source protocols:
- **Aztec Network** - Open-source ZK-Rollup architecture.
- **XMTP** - Open-source, decentralized message transport.
- **Wagmi / Viem** - Open-source Ethereum tooling.

We are committed to progressively open-sourcing more of our frontend and relay codebase as the protocol matures.
\
};

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