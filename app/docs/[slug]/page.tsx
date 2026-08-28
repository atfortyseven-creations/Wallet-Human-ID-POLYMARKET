import { ALL_DOC_SLUGS } from '@/components/docs/DocsData';
import { DocsShell } from '@/components/docs/DocsShell';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Pre-generated markdown content
const CONTENT_MAP: Record<string, string> = {
  "terms": "\n# Terms of Service\n\nLast Updated: January 1, 2027\n\nWelcome to Humanity Ledger. By accessing or using our protocol, applications (including Ledger Chat and App Hub), or related services, you agree to be bound by these Terms of Service.\n\n## 1. Decentralization & Sovereign Identity\nHumanity Ledger operates as a decentralized cryptographic protocol. You maintain sole ownership and control over your cryptographic keys, identity parameters, and data. We do not store, possess, or have access to your private keys or seed phrases. If you lose your keys, your data cannot be recovered by Humanity Ledger or any third party.\n\n## 2. No Custody or Control\nWe are a non-custodial software provider. We do not hold assets, messages, or metadata on your behalf. The network relies on WebRTC, XMTP, and Aztec L2 for peer-to-peer and decentralized routing.\n\n## 3. Acceptable Use\nYou agree not to use the protocol to:\n- Violate any applicable local, national, or international law.\n- Distribute malware, exploit network vulnerabilities, or engage in malicious sybil attacks.\n- Harass, abuse, or dox other participants.\n\n## 4. Limitation of Liability\nThe software is provided \"AS IS\", without warranty of any kind. Under no circumstances shall Humanity Ledger be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the protocol.\n",
  "privacy": "\n# Privacy Policy\n\nHumanity Ledger is designed with absolute privacy as its foundational pillar. We collect the absolute minimum data required to facilitate network connections.\n\n## Zero-Knowledge by Default\nYour messages, calls, and interactions are secured using End-to-End Encryption (E2EE) and Zero-Knowledge proofs. We cannot read your messages or listen to your calls. \n\n## Data We Do Not Collect\n- Message contents or attachments (E2EE via XMTP).\n- Audio/Video call streams (E2EE via WebRTC DTLS/SRTP).\n- Your private keys or wallet balances.\n- Your physical location or IP addresses (mitigated via Onion Routing and TURN servers).\n\n## Data Required for Operation\nTo facilitate peer discovery, temporary signaling metadata (such as ephemeral connection IDs) is processed by our relay servers. This data is strictly kept in memory and is automatically destroyed upon session termination. No logs are written to disk.\n",
  "cookies": "\n# Cookie Policy\n\nWe employ a strict \"Zero-Tracking\" cookie policy.\n\n## Essential Cookies Only\nWe use cryptographic session tokens (e.g., `system_handshake`) stored in local or session storage to authorize your decentralized identity within the App Hub and Terminal. These are not used for tracking, advertising, or analytics.\n\n## No Third-Party Trackers\nThere are no Google Analytics, Facebook Pixels, or third-party marketing trackers anywhere within the Humanity Ledger protocol. We respect your sovereign attention.\n",
  "aml-kyc": "\n# AML & KYC Framework\n\n## Sybil Resistance Without Compromise\nHumanity Ledger enforces strict sybil resistance via cryptographic uniqueness (1 Wallet = 1 Identity) rather than intrusive physical KYC. \n\n## Regulatory Compliance\nOur architecture separates the social layer (Ledger Chat) from regulated financial layers. Any future DeFi integrations on the Aztec L2 will require independent cryptographic compliance proofs that preserve your anonymity while satisfying localized regulatory requirements via Zero-Knowledge attestations.\n",
  "disclaimer": "\n# Risk Disclaimer\n\n## Experimental Technology\nHumanity Ledger integrates bleeding-edge cryptographic systems including Zero-Knowledge rollups, WebRTC mesh networking, and decentralized message transport. \n\n## Cryptographic Risks\nWhile audited, the nature of decentralized software involves inherent risks. Smart contract bugs, protocol exploits, or local device compromises could result in the loss of data or assets. You assume all risks associated with cryptographic network participation.\n",
  "architecture": "\n# System Architecture\n\nThe Humanity Ledger stack is composed of three sovereign layers:\n\n## 1. Transport Layer\nUtilizes a decentralized mesh network backed by libp2p and WebRTC. For messaging, we leverage the XMTP protocol for robust, decentralized delivery. For real-time A/V calls, we use strict peer-to-peer WebRTC with mandatory DTLS/SRTP encryption.\n\n## 2. Identity Layer\nPowered by Zero-Knowledge proofs and ECDSA signatures. Your Ethereum/EVM wallet acts as the root of trust. Sessions are established using Sign-In with Ethereum (SIWE) and ephemeral session keys.\n\n## 3. Application Layer\nThe client interface (App Hub, Ledger Chat) is a static, sterile React/Next.js bundle. It connects directly to the decentralized network, meaning there is no centralized database storing your application state.\n",
  "cryptography": "\n# Cryptography Matrix\n\n| Component | Standard | Purpose |\n|---|---|---|\n| **Message Transport** | X3DH / Double Ratchet | Perfect Forward Secrecy for messages |\n| **A/V Calls** | DTLS 1.2 / SRTP | End-to-end encrypted voice & video |\n| **Identity Proofs** | ECDSA (secp256k1) | Root identity verification |\n| **Zero-Knowledge** | UltraPlonk (Aztec) | Private state transitions (Pending) |\n| **Local Vault** | AES-256-GCM | Encrypted local storage |\n",
  "zero-knowledge": "\n# Zero-Knowledge Proofs\n\nWe utilize Zero-Knowledge (ZK) cryptography to ensure that you can prove statements about your identity or assets without revealing the underlying data.\n\nCurrently, ZK circuits are simulated using highly secure HMAC attestations while the Aztec network prepares for mainnet. Once migrated, all state transitions will be verified via SNARKs, ensuring absolute privacy for financial and social graphs.\n",
  "p2p-routing": "\n# P2P Onion Routing\n\nTo protect your IP address during real-time calls, Humanity Ledger routes signaling traffic through a localized Onion Routing protocol.\n\nWhen establishing a connection, traffic is bounced through decentralized relay nodes (TURN servers) ensuring that your ISP and the recipient cannot definitively map your physical location.\n",
  "ledger-chat": "\n# Ledger Chat\n\nLedger Chat is the flagship application of Humanity Ledger. It is a completely decentralized, end-to-end encrypted social network.\n\n## Features\n- **Uncensorable Messaging:** Powered by XMTP.\n- **Crystal Clear A/V Calls:** Low-latency WebRTC.\n- **Sovereign Vault:** Local encrypted file storage.\n- **Burn-on-Read:** Ephemeral messaging that leaves no trace.\n",
  "app-hub": "\n# The App Hub\n\nThe App Hub is your sovereign launchpad. It acts as the gateway to the Humanity Ledger ecosystem.\n\nCurrently, the App Hub provides access to Ledger Chat, Portfolio, and ZK Sandbox. Other modules are strictly locked down under cryptographic seals until global release.\n",
  "identity": "\n# Sovereign Identity\n\nYour identity is strictly your own. \n\nYou do not need an email, phone number, or government ID to join Humanity Ledger. Your ECDSA keypair is your absolute identity. Your profile metadata (Name, Avatar, Bio) is encrypted and distributed, accessible only by those you explicitly authorize.\n",
  "audits": "\n# Security Audits\n\nThe Humanity Ledger protocol undergoes continuous, extreme adversarial auditing. \n\nWe employ static analysis, fuzzing, and manual cryptographic review by industry-leading security researchers. Audit reports for the core smart contracts and signaling servers will be published upon mainnet release.\n",
  "bug-bounty": "\n# Bug Bounty Program\n\nWe believe in open security. If you find a vulnerability in the Humanity Ledger protocol, we want to know.\n\nOur bug bounty program offers substantial rewards for critical vulnerabilities, especially those related to key extraction, sybil exploits, or encryption bypasses.\n",
  "transparency": "\n# Transparency Report\n\nAs a sovereign protocol, we cannot comply with data requests because we do not hold the data.\n\nSince inception:\n- User Data Handed Over: 0 Bytes\n- Backdoors Installed: 0\n- IP Addresses Logged: 0\n"
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
