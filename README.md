# HUMANITY LEDGER

![HUMANITY LEDGER](docs/logo.png)

A purely deterministic enclave for humanity. Zero-knowledge cryptographic circuits ensure absolute sovereignty. No marketing. No tracking. Pure mathematics.

**Humanity Ledger** is a hybrid Web2.5 intelligence platform and Mini-App ecosystem. It provides robust tools for real-world asset tracking (Studio Provenance), un-censorable peer-to-peer communication (Whale Chat via XMTP), and sovereign financial tracking.

While the system is preparing for a full migration to an L2 ZK-rollup ecosystem settled on the Aztec Network, current cryptographic features (such as ZK proofs) are either simulated or rely on standard Web2 cryptography and SIWE (Sign-In with Ethereum). 

> **"a For the definitive, evidence-based status of all decentralization, ZK, and smart contract features, see the [Humanity Ledger Capability Matrix](docs/STATUS.md).**

---

## 🏛 Architecture & Protocol Design

The Humanity Ledger architecture is designed under a strict **Zero-Knowledge by Default** paradigm. Our infrastructure rejects the traditional Web3 model of centralized indexing servers (e.g., The Graph) and transparent state execution. Instead, the protocol enforces localized execution environments where users derive their own state client-side.

### 1. Cryptographic Sovereignty
All state transitions, messaging payloads, and identity assertions are cryptographically signed using EIP-191 standards. The resulting Zero-Knowledge proofs (powered by **Noir** circuits) are submitted to the Aztec L2 sequencer. This ensures that the global state tree can be updated without ever revealing the underlying transaction data, balances, or communication metadata.

### 2. Quantum Defence Shield (QDS) Tokenomics
Anticipating the eventual degradation of elliptical curve cryptography (ECDSA), the protocol integrates a forward-looking mitigation framework via QDS. This governance and utility token facilitates decentralized network routing, staking for Validator Nodes, and acts as the economic engine for post-quantum cryptographic transitions within the ecosystem.

### 3. The Universal Session Handshake (Mobile-to-PC Link)
A cornerstone of our security architecture is the **Cross-Device Cryptographic Handshake**. We have completely eliminated the need for vulnerable browser extensions on desktop environments. 

**The Flow:**
1. The Desktop Terminal generates an ephemeral X25519 keypair and a deterministic visual PIN, rendering them via an optical QR code.
2. The user's sovereign mobile device scans the code, establishing a secure out-of-band ECDH (Elliptic-Curve Diffie-Hellman) channel.
3. The mobile hardware enclave signs the authentication payload, which is encrypted and tunneled back to the desktop.
4. **Result:** The desktop terminal is granted temporary, read-only session access to the user's sovereign state, without private keys ever leaving the physical mobile device.

---

## 📱 Ecosystem Applications (The Hub)

The Humanity Ledger operates as a decentralized operating system, housing a suite of deterministic applications:

*   **Portfolio Terminal**
    A multi-chain asset tracker that calculates balances entirely locally. No centralized indexing server parses your addresses; your API keys remain encrypted in your local browser storage.
*   **Whale Chat**
    Peer-to-peer, E2E encrypted messaging utilizing the XMTP protocol wrapped in Aztec ZK logic. Features include timed burning messages, stealth payments, and WebRTC-encrypted video/voice calls that bypass traditional signaling relays.
*   **Studio Provenance**
    A decentralized registry for Real-World Assets (art, real estate, intellectual property). Generates un-forgeable cryptographic passports (certificates of provenance) verified via L2 proofs without revealing the owner's identity.
*   **Identity (Sovereign ZK Layer)**
    Claim and manage your unique human credential on-chain. Prevent Sybil attacks natively through zero-knowledge human-verification circuits.
*   **Markets**
    Private DeFi position tracking and on-chain market data aggregation, obfuscated from third-party analytics firms.
*   **QDS Token & Governance**
    The central portal for staking QDS, voting on protocol upgrades, and monitoring network economics.
*   **Registry & Network**
    Explore global node coverage, verified asset passports, and network health data through a decentralized lens.
*   **Academy**
    A doctoral-level deep dive into the protocol's cryptography, network economics, and architectural thesis.

---

## 🛠 Getting Started

### Prerequisites
- Node.js >= 18.x
- pnpm >= 8.x
- Git

### Build & Initialization
```bash
# Clone the repository
git clone https://github.com/humanityledger/Humanity-Ledger.git

# Enter the isolated directory
cd Humanity-Ledger

# Install dependencies using strictly locked versions
pnpm install

# Initialize the local development server
pnpm dev
```

---

## 🔒 Security & Privacy

We believe privacy is a fundamental human right. Our architecture is designed to withstand nation-state level surveillance and adversarial on-chain analysis. 

Please review our [SECURITY.md](SECURITY.md) for our vulnerability reporting matrix, responsible disclosure guidelines, and details regarding our upcoming Bug Bounty program.

## 🤝 Contributing

We welcome contributions from protocol engineers, cryptographers, and designers who align with our brutalist aesthetic. Read our [CONTRIBUTING.md](CONTRIBUTING.md) to understand our strict code standards and pull request workflows.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
