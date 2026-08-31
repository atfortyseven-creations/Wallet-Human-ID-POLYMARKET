import { ALL_DOC_SLUGS } from '@/components/docs/DocsData';
import { DocsShell } from '@/components/docs/DocsShell';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Pre-generated documentation content
const CONTENT_MAP: Record<string, string> = {
  "terms": `
# Terms of Service

Last Updated: January 1, 2027

Welcome to Humanity Ledger. By accessing or using our protocol, applications (including Ledger Chat and the App Hub), or any related services, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.

---

## 1. Decentralization and Wallet Identity

Humanity Ledger operates as a decentralized cryptographic protocol. You maintain sole ownership and control over your cryptographic keys, your identity, and your data. We do not store, possess, or have access to your private keys or recovery phrases.

If you lose your keys or recovery phrase, your data cannot be recovered by Humanity Ledger or any third party. It is your sole responsibility to back up your recovery phrase in a safe and secure location.

---

## 2. No Custody or Control

We are a non-custodial software provider. We do not hold assets, messages, or metadata on your behalf. The network relies on standard WebRTC for real-time communication and XMTP for decentralized message transport.

---

## 3. Acceptable Use

You agree not to use the protocol to:

- Violate any applicable local, national, or international law or regulation.
- Distribute malware, attempt to exploit network vulnerabilities, or launch attacks against other participants or third parties.
- Harass, threaten, impersonate, or attempt to reveal the identity of other participants without their consent.
- Conduct any activity that could disrupt or degrade the performance and availability of the network for other users.

---

## 4. Intellectual Property

The Humanity Ledger software, design, and associated documentation are protected by applicable copyright and intellectual property laws. Open-source components are licensed under their respective open-source licenses.

---

## 5. Limitation of Liability

The software is provided "AS IS", without warranty of any kind, express or implied. Under no circumstances shall Humanity Ledger, its contributors, or its licensors be liable for any direct, indirect, incidental, punitive, or consequential damages arising from the use of or inability to use the protocol.

---

## 6. Amendments

We reserve the right to modify these terms at any time. Continued use of the protocol after changes are published constitutes your acceptance of the revised terms. We will make reasonable efforts to notify users of material changes.

---

## 7. Governing Law

These terms are governed by and construed in accordance with the laws of the European Union, without regard to its conflict of law provisions.
`,
  "privacy": `
# Privacy Policy

Last Updated: January 1, 2027

Humanity Ledger is designed with privacy as a foundational principle. This policy explains what data we process, why, and how we protect it.

---

## Our Core Privacy Principles

1. **Minimum data collection** — We only process the information strictly necessary to operate the network.
2. **No central data stores** — Your messages and call content are never stored on our servers.
3. **Transparency** — We are explicit about everything we do and do not process.

---

## What We Do Not Collect

- The content of your messages or attachments.
- Audio or video call streams.
- Your private keys or wallet balances.
- Your physical location or persistent IP address.
- Advertising identifiers or behavioral tracking data.

---

## What We Process for Network Operation

To facilitate peer discovery and real-time call setup, temporary signaling metadata (such as connection negotiation packets) is briefly processed by our relay servers. This data:

- Is processed only in working memory, never written to permanent storage.
- Is automatically destroyed when your session ends.
- Cannot be linked to your real-world identity.

---

## Local Storage

Some application data (such as your settings, contact list, and message history) is stored locally on your device in an encrypted form. This data never leaves your device unless you explicitly transfer it.

---

## Third Parties

We do not share any data with third-party advertising networks or analytics providers. We may use open-source infrastructure providers to operate our servers, and these providers are bound by strict data processing agreements.

---

## Your Rights

You have the right to access, correct, or request the deletion of any personal data we hold. Because we hold virtually no personal data, the most effective way to exercise these rights is to disconnect your wallet, which terminates your session.

---

## Changes to this Policy

We may update this policy to reflect changes in our practices. We will notify you of significant changes via a notice within the application.

Contact: privacy@humanityledger.com
`,
  "cookies": `
# Cookie Policy

Last Updated: January 1, 2027

---

## Essential Session Tokens Only

We use secure session tokens, stored in your browser's local or session storage, to confirm your identity within our applications. These tokens are necessary for the application to function correctly.

---

## What We Do Not Use

- Advertising cookies.
- Third-party tracking pixels.
- Analytics cookies from platforms such as Google Analytics.
- Any persistent identifier that tracks you across websites.

---

## Your Control

You may clear your session tokens at any time by disconnecting your wallet or clearing your browser's local storage. This will terminate your active session.

---

## Updates

We review this policy periodically. Any changes will be reflected here with an updated date.
`,
  "aml-kyc": `
# AML and KYC Framework

Last Updated: January 1, 2027

---

## Overview

Humanity Ledger is a non-custodial communication protocol. We do not process, transfer, or hold financial assets on behalf of users. As such, we are not classified as a financial service provider or money transmitter under most regulatory frameworks.

---

## Cryptographic Identity Verification

Our network uses cryptographic wallet signatures as the basis for identity. Each participant controls a unique cryptographic key pair, ensuring that each account is tied to a unique identity without requiring government-issued identification for communication purposes.

---

## Abuse Prevention

We have implemented technical measures to prevent network abuse:

- **Rate limiting** on message sending to prevent spam.
- **Reputation scoring** based on on-chain attestations.
- **Content moderation** tools for encrypted group channels.

---

## Regulatory Compliance

We are committed to complying with applicable laws in all jurisdictions in which we operate. Any future features that involve regulated financial activity (such as on-chain transfers) will include their own, independent compliance layers that satisfy applicable local regulations.

---

## Reporting

If you believe that illegal activity is occurring on the network, you can report it to us at legal@humanityledger.com. We will review all reports and cooperate with law enforcement agencies as required by law.
`,
  "disclaimer": `
# Risk Disclaimer

Last Updated: January 1, 2027

Please read this disclaimer carefully before using Humanity Ledger.

---

## Experimental Technology

Humanity Ledger integrates modern cryptographic systems, decentralized networking protocols, and blockchain technology. While we apply rigorous engineering practices, this technology is still evolving.

---

## Technical Risks

Even with thorough auditing, all software carries inherent risk. The following risks are specific to using decentralized protocols:

- **Key Loss Risk:** If you lose your wallet private key or recovery phrase, your account and any associated data are permanently inaccessible. There is no password reset.
- **Software Risk:** Despite our testing, software bugs may exist that could affect functionality.
- **Network Risk:** The decentralized nature of the network means that no single entity can guarantee 100% uptime or message delivery.
- **Device Risk:** If your physical device is compromised, the security of your local data may be affected regardless of network-level protections.

---

## No Financial Advice

Nothing within the Humanity Ledger platform constitutes financial, investment, or legal advice. All interactions involving digital assets are your sole responsibility.

---

## Assumption of Risk

By using Humanity Ledger, you acknowledge that you understand these risks and assume full responsibility for your participation in the network.
`,
  "architecture": `
# Architecture Overview

The Humanity Ledger stack is composed of three primary layers working together to provide a secure, decentralized communication experience.

---

## Layer 1: Transport and Messaging

**Protocol:** XMTP (Extensible Message Transport Protocol)

Messages are delivered via XMTP, an open, decentralized messaging network. XMTP uses the established Double Ratchet algorithm for end-to-end encryption, ensuring that only the sender and recipient can read a message. No central server stores message content.

**Real-time Communication:** WebRTC

Audio and video calls are established using WebRTC — the same open standard used by applications like Google Meet and Discord. All call streams are encrypted using DTLS and SRTP. Our TURN servers are used only for relay when direct peer connections are not possible, and they cannot decrypt the audio or video content.

---

## Layer 2: Identity and Authentication

**Primary Identity:** Ethereum Wallet (EIP-4361)

Your Ethereum wallet address serves as your global, portable identity. You authenticate by signing a challenge message with your wallet's private key — a process known as Sign-In with Ethereum (SIWE). No password is ever transmitted to our servers.

**Session Management**

After a successful sign-in, a short-lived session token is issued. This token is stored as an HTTP-only cookie, making it inaccessible to client-side scripts, protecting against certain classes of attacks.

---

## Layer 3: Application Interface

**Framework:** Next.js 15 (React)

The client application is a standard web application built with Next.js. It communicates directly with the decentralized XMTP network. There is no central database storing your messages or profile. Your settings and contact list are stored locally on your device in an encrypted format.

**Mobile:** Capacitor

The same web codebase is packaged into a native iOS and Android application using Capacitor, providing a native-quality experience on mobile devices.

---

## Infrastructure

Our infrastructure runs on Railway, with automatic deployments from the main branch. For high availability, we use multiple geographically distributed TURN server regions for WebRTC relay.
`,
  "cryptography": `
# Encryption Systems

Humanity Ledger uses established, peer-reviewed cryptographic standards throughout the stack. We do not invent our own cryptography.

---

## Cryptographic Standards Used

| Component | Standard | Purpose |
|---|---|---|
| **Message Encryption** | X3DH + Double Ratchet | Perfect forward secrecy for messages. Each message uses a new key. |
| **Audio and Video Calls** | DTLS 1.2 and SRTP | Encrypted real-time media streams. |
| **Wallet Identity** | ECDSA (secp256k1) | Root identity verification tied to your Ethereum wallet. |
| **Privacy Proofs** | Zero-Knowledge Proofs (ZKPs) | Verify identity or asset ownership without revealing sensitive information. |
| **Local Data** | AES-256-GCM | Strong symmetric encryption for all data stored on your device. |
| **Session Tokens** | HMAC-SHA256 | Tamper-proof session authentication. |

---

## Perfect Forward Secrecy

The Double Ratchet algorithm ensures that if one message's encryption key is ever compromised, past and future messages remain secure. A new key is derived for each message, meaning there is no single key to steal that would unlock your message history.

---

## Why No Custom Cryptography?

Inventing new cryptographic algorithms is extremely risky. Subtle implementation errors or theoretical weaknesses can take years to discover. We deliberately use only battle-tested, publicly audited cryptographic standards — the same ones used by Signal, WhatsApp, and other leading secure communication platforms.
`,
  "zero-knowledge": `
# Privacy Systems

Humanity Ledger uses zero-knowledge proof technology to provide enhanced privacy for network participants.

---

## What are Zero-Knowledge Proofs?

A zero-knowledge proof (ZKP) is a method by which one party can prove to another that a statement is true, without revealing any information beyond the fact that the statement is true.

**Example:** You can prove that you are over 18 years old without revealing your exact date of birth or showing any government ID.

---

## How We Use ZKPs

1. **Private Attestations:** Users can prove properties about their identity or on-chain assets (e.g., "I hold at least 1 ETH") without disclosing their wallet balance or specific transaction history.

2. **Anonymous Authentication:** Future protocol versions will allow users to authenticate to the network without linking their session to their wallet address, providing a layer of anonymity.

3. **Private Transactions:** Quantum Dots (QD) transfers within Ledger Chat are processed via the Aztec Network — a Layer 2 protocol that uses ZKPs to shield the sender, recipient, and amount of every transaction from public view.

---

## Current Status

Zero-knowledge features are actively being developed and refined. The network is currently operating in a hybrid mode, with on-chain privacy features being progressively enabled as the underlying protocols finalize their mainnet launches.

---

## Further Reading

- [Aztec Network Documentation](https://aztec.network/docs)
- [Introduction to ZK-SNARKs](https://z.cash/technology/zksnarks/)
`,
  "p2p-routing": `
# Secure Routing

Humanity Ledger protects your connection metadata using a combination of industry-standard relay servers and an optional multi-hop routing system.

---

## WebRTC and TURN Relay

When you make an audio or video call, Ledger Chat first attempts to establish a direct, peer-to-peer connection between your device and the recipient's device. If this is not possible (due to firewalls or network restrictions), the call is routed through our TURN (Traversal Using Relays around NAT) servers.

Crucially, our TURN servers relay encrypted streams — they cannot decrypt or inspect the audio or video content. They only see encrypted packets with source and destination addresses.

---

## Onion Routing (IP Masking)

For users who want an additional layer of privacy, Ledger Chat supports routing message signaling traffic through multiple relay nodes — a technique similar to Tor (The Onion Router).

You can configure the number of hops in **Settings > Privacy Engine > Onion Routing**:

- **1 Hop (Direct):** Fastest. Your connection goes directly from your device to the network.
- **3 Hops (Standard):** A good balance of privacy and speed for most users.
- **5 Hops (Maximum):** Highest privacy. More latency is expected.

---

## What Is Protected

- **Your IP address** is hidden from other chat participants.
- **Your physical location** cannot be inferred from your signaling traffic.

---

## What Is Not Protected

Network-level routing does not protect message content — that is handled by end-to-end encryption. If a user's device is physically compromised, routing protections at the network level do not apply.
`,
  "ledger-chat": `
# Ledger Chat

Ledger Chat is the flagship application of Humanity Ledger — a secure, end-to-end encrypted messaging and calling network built on open standards.

---

## Core Features

### Secure Messaging
Every message you send is end-to-end encrypted using the Double Ratchet algorithm via XMTP. Messages can only be read by you and your recipient. No server, no relay, and not even Humanity Ledger can access the content of your conversations.

### Audio and Video Calls
Make encrypted, high-quality audio and video calls directly from your browser or mobile app. Calls are established over WebRTC with mandatory encryption (DTLS/SRTP). When a direct connection is not possible, traffic is relayed through our TURN servers, which cannot decrypt the call content.

### File Sharing
Share files, images, and documents securely. Attachments are uploaded to a secure storage endpoint, and the download link is shared only within the encrypted message thread.

### Voice Notes
Record and send voice notes directly from the chat interface. Voice notes are processed as secure audio attachments.

### Message Controls
- **Edit messages** after sending.
- **Delete messages** for both yourself and the recipient.
- **Pin important messages** in a conversation.
- **Quote and reply** to specific messages in a thread.
- **Timed messages** that automatically delete after a set period.

### Stickers and Reactions
Express yourself with emoji reactions and an integrated sticker pack system.

---

## Privacy Settings

Ledger Chat includes a comprehensive set of privacy controls accessible from the settings panel:

- **Read receipts** — Choose whether to let senders know you have read their message.
- **Last seen** — Control who can see when you were last online.
- **IP masking** — Route your connection through relay nodes to hide your IP address.
- **Burn on Read** — Set messages to automatically delete a few seconds after the recipient opens them.

---

## Getting Started

1. Connect your Ethereum wallet at the /connect page.
2. Open Ledger Chat from the App Hub.
3. Start a new conversation by entering the wallet address of your contact.
4. Your first message will prompt the network to verify your recipient can receive messages.
`,
  "app-hub": `
# App Hub

The App Hub is the central dashboard of Humanity Ledger, providing access to all available applications and network tools.

---

## Available Applications

### Ledger Chat
The flagship secure messaging application. Send encrypted messages, make private audio and video calls, and manage your contacts — all from a single, unified interface.

### Portfolio
A private portfolio tracker that connects directly to your wallet to display your on-chain asset balances and transaction history. No data leaves your device.

---

## Navigation

The App Hub uses a persistent navigation sidebar on desktop and a bottom navigation bar on mobile. All core features are accessible within two taps or clicks.

---

## Network Status

The top of the App Hub displays your current network status, including:

- **Wallet connection status** — Whether your wallet is connected and your session is active.
- **XMTP network status** — Whether the messaging network is reachable.
- **Quantum Dots balance** — Your current balance of Quantum Dots (QD), the in-app utility token.

---

## Upcoming Features

We are actively building additional modules for the App Hub, including:

- **Ledger Academy** — Educational content on cryptography, privacy, and decentralized networks.
- **Network Explorer** — A real-time view of network activity and statistics.
- **Developer Sandbox** — Tools for developers building on top of the Humanity Ledger protocol.
`,
  "identity": `
# Digital Identity

Humanity Ledger uses your Ethereum wallet as your global, portable identity. No email address or phone number is required.

---

## How It Works

Your Ethereum wallet generates a unique cryptographic key pair: a public key and a private key. Your **wallet address** (derived from your public key) is your unique identifier on the network. Think of it as your username, but one that is mathematically verified and cannot be duplicated or impersonated.

When you log in, you prove ownership of your wallet by **signing a message** with your private key. This signature is verifiable by anyone but can only be created by the holder of the private key. Your private key never leaves your device.

---

## Your Profile

Your profile metadata — including your display name, biography, and avatar — is stored in the settings engine. This information is:

- Stored locally on your device in an encrypted format.
- Shared with the XMTP network to enable other users to find and identify you.
- Never stored on a Humanity Ledger server.

You can update your profile at any time from **Settings > My Profile > Edit Profile**.

---

## Recovery and Key Management

Your wallet's **recovery phrase** (also called a seed phrase or mnemonic) is a sequence of 12 or 24 words that can restore your wallet on any compatible device. It is the master key to your identity on the network.

> **Critical:** Write down your recovery phrase and store it offline in a secure location. Anyone with access to your recovery phrase has full control of your wallet. Humanity Ledger cannot recover it for you if it is lost.

---

## Changing Your Identity

Because your identity is tied to your wallet's cryptographic keys, changing your identity means generating a new wallet. You cannot transfer your message history between wallets.
`,
  "audits": `
# Security Audits

The security of the Humanity Ledger protocol is a continuous priority. We use multiple methods to maintain a high security standard.

---

## Automated Analysis

Every change to the codebase undergoes automated security scanning using industry-standard static analysis tools. These tools check for common vulnerabilities, dependency issues, and misconfigurations before any code is deployed to production.

---

## Dependency Auditing

All third-party libraries and dependencies are regularly audited using \`npm audit\` and Dependabot. Security updates are applied promptly. We maintain a minimal dependency footprint to reduce the attack surface.

---

## Manual Code Review

All significant features and security-sensitive changes undergo mandatory manual code review by at least one other engineer before being merged. Changes to authentication, encryption, or key management require review by a senior engineer familiar with cryptographic systems.

---

## Third-Party Audits

As the protocol approaches mainnet and scales, we are committed to commissioning independent third-party security audits from recognized security research firms. Audit reports will be published publicly upon completion.

---

## Responsible Disclosure

We maintain a responsible disclosure policy. If you discover a security vulnerability, please report it privately to security@humanityledger.com before disclosing it publicly. We commit to acknowledging your report within 48 hours and working with you to resolve the issue promptly.
`,
  "bug-bounty": `
# Bug Bounty Program

Last Updated: August 2026

---

## Program Status: Coming Soon

We are currently finalizing our formal Bug Bounty Program. The program is **not yet active** and no paid rewards are being offered at this time.

---

## Responsible Disclosure (Active Now)

While the formal bounty program is being established, we actively encourage responsible disclosure of security vulnerabilities.

**How to report:**

1. Send your findings to **security@humanityledger.com**
2. Include a clear description of the vulnerability and steps to reproduce.
3. Do **not** disclose publicly until we have confirmed resolution with you.
4. We will acknowledge your report within 48 hours.

---

## What to Report

We are particularly interested in:
- Authentication bypass or session hijacking
- Cryptographic implementation weaknesses
- API endpoints exposing user data without authorization
- Cross-site scripting (XSS) or injection attacks
- Smart contract interaction vulnerabilities

---

## Scope

The following are in scope:
- **Ledger Chat** (web application at humanidfi.com)
- **Authentication and session management** (/api/auth/*)
- **Encryption implementations** (lib/xmtp, lib/web-crypto)
- **The Humanity Ledger public API**

---

## Out of Scope

- Denial-of-service attacks
- Social engineering of Humanity Ledger staff
- Vulnerabilities in third-party services we do not control
- Issues requiring physical access to a user's device

---

## Future Program

When the formal program launches, it will include structured reward tiers. Researchers who submitted valid reports during this pre-launch period will be recognized in the Hall of Fame.

Follow our [GitHub](https://github.com/humanityledger/Humanity-Ledger) or [Changelog](/docs/changelog) for the official launch announcement.
`,
  "transparency": `
# Transparency Report

Humanity Ledger is committed to full transparency about how our systems operate and how user data is handled.

---

## Data Requests

As a decentralized, non-custodial protocol, we hold virtually no user data. We have never received a legally enforceable request for user communication data because such data does not exist on our servers.

| Metric | Count (All Time) |
|---|---|
| User message content handed over to authorities | 0 |
| User IP addresses logged to disk | 0 |
| Backdoors or interception mechanisms installed | 0 |
| Government requests for user data received | 0 |

---

## Infrastructure Transparency

Our server infrastructure runs on Railway. Our application code is open for review on GitHub. We use no closed-source, proprietary components in the critical path of message delivery or encryption.

---

## Open Source Commitment

The core communication components of Humanity Ledger are built on open-source protocols:

- **XMTP** — Open-source, decentralized message transport.
- **WebRTC** — Open standard for real-time peer-to-peer communication.
- **wagmi and viem** — Open-source Ethereum tooling.

We are committed to progressively open-sourcing more of our codebase as the protocol matures.

---

## Updates to This Report

This report is updated on a rolling basis. Last updated: January 1, 2027.
`
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

  const content = CONTENT_MAP[slug] || "# Content under construction\n\nThis section is currently being updated.";

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
