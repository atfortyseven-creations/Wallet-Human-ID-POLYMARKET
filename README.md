# Whale Network: Official Platform Documentation & Aztec Integration Manual

Whale Network is an advanced cryptographic terminal and digital asset management ecosystem. Designed for institutional and retail operations alike, the platform integrates cross-device synchronization, zero-knowledge proofs, and multi-chain analytics into a single unified architecture.

This documentation provides an exhaustive, highly technical operational guide. It is specifically tailored to provide clarity to auditors, institutional partners, and the **Aztec Network engineering team** regarding how Whale Network leverages private execution environments, client-side proving, and zero-knowledge primitives across its 12 terminal modules and underlying infrastructure.

---

## 1. Dual Architecture: PC (Wagmi) vs. Mobile (Handshake)

Whale Network operates on a unique **Dual Architecture** running seamlessly on the same domain, dynamically adapting its operational mode based on the user's device and connection environment. The system allows users to seamlessly link their sessions across both environments without compromising security.

### 1.1 PC Zone: Extension Wagmi Users
For desktop users, the platform leverages the **Wagmi** ecosystem to connect directly to standard browser extension wallets (e.g., MetaMask, Rabby). 
- **Direct Execution**: Transactions, zero-knowledge proof generation, and smart contract interactions are handled directly via the injected Web3 provider.
- **Local Prover**: The Aztec Noir WASM prover runs directly in the desktop browser, utilizing the machine's full computational power to generate zero-knowledge proofs locally.

### 1.2 Mobile Zone: Handshake Users
Mobile browsers lack reliable extension support. To solve this, Whale Network implements a secure **Handshake Architecture** for mobile users.
- **Out-of-Band Device Synchronization (X25519 ECDH)**: The desktop terminal generates an ephemeral Curve25519 public key. The mobile application scans this key via QR code (or deeplink) and establishes an ECDH shared secret.
- **Enclave Routing**: The mobile device acts as a secure enclave. When a mobile user needs to sign a transaction or generate a proof, the request is securely routed via the encrypted handshake to a linked desktop or trusted environment, or managed via native mobile secure enclaves.
- **Session Linking**: Users can seamlessly link their PC Wagmi session with their Mobile Handshake session, allowing them to monitor their portfolio, read encrypted chats, and view status on mobile, while keeping the heavy execution and key management strictly secured.

---

## 2. Terminal Ecosystem Capabilities (Tab Architecture)

The core interface operates through twelve dedicated modules. Below is the architectural explanation of how we achieved the functionality for each tab:

### Dashboard
The central command center. We achieved this by aggregating data from our internal indexers and public RPCs.
- **Global Portfolio Tracking**: Evaluates aggregate balances across public EVM states and private Aztec states. Net worth is calculated in real-time.
- **Transaction History**: Monitors recent incoming and outgoing on-chain transfers.

### Studio
A dedicated environment for digital asset provenance and registration.
- **Zero-Knowledge Anchoring**: We achieved this using Aztec Network integration. The platform generates a proof of origin and ownership without revealing the asset's specific supply chain data.

### Markets
Institutional-grade analytics for tracking token metrics and market movements.
- **Deep Analytics**: Accesses advanced metrics including market capitalization and 24-hour volume using indexed on-chain data and decentralized oracles.

### Roadmap
An interactive visualization of protocol development.
- **Technical Milestones**: Built using dynamic state tracking to show backend integrations, ranging from database indexing structures to smart contract audit statuses and Noir circuit optimizations.

### Identity
The user's zero-knowledge cryptographic passport.
- **Aztec Network Integration**: Generates client-side proofs to verify identity criteria (e.g., uniqueness, compliance) without exposing public addresses or transaction history. This is achieved by compiling Noir circuits to WASM in the browser.

### TOKEN
Utility and subscription management interface.
- **Tier Upgrades**: We implemented smart contracts that verify token holdings to unlock advanced platform tiers, API limits, and expanded clearances.

### MAP
A geographic and infrastructural visualization of the network.
- **Connectivity Mapping**: Built using WebGL and real-time WebSocket feeds to visualize the routing of encrypted traffic and Aztec sequencer nodes globally.

### Chat
An encrypted, peer-to-peer communication layer.
- **Secure Messaging**: We integrated the **XMTP protocol** to allow end-to-end encrypted messages directly between EVM addresses, without central servers storing plaintext.

### Portfolio
A granular breakdown of the user's financial holdings.
- **Asset Allocation**: Uses indexing subgraphs to pull historical data and present detailed charts representing the distribution of wealth across different tokens.

### Community
The center for governance and user support.
- **Governance Proposals**: Smart contract integrations allow users to review and vote on protocol upgrades securely.

### STATUS
Live telemetry and health monitoring of the underlying infrastructure.
- **System Health**: A dedicated microservice pings RPC nodes, Aztec Provers, and Paymaster relays to provide real-time uptime metrics and latency reports.

### PRIVACY
Transparent oversight of local session data and cryptographic routing.
- **Session Logs**: Achieved by storing a detailed, localized audit trail strictly in the browser's IndexedDB, ensuring users can manually purge local caches and ephemeral keys.

---

## 3. Documentation Architecture

Our documentation is strictly categorized to serve different stakeholders, ensuring complete transparency and regulatory compliance.

### PRODUCT
- **Architecture**: Deep technical documentation detailing the integration between the Next.js 15 App Router frontend, PostgreSQL (Prisma), and Web3 infrastructure.
- **Registry**: The smart contract index utilized by the platform to resolve verified token addresses and protocols across supported networks.
- **Whitepaper**: The foundational academic document outlining our mission, cryptographic models, and tokenomic structure.

### DEVELOPERS
- **API Docs**: Comprehensive integration guidelines for third-party developers, covering RESTful endpoints and WebSockets.
- **ZK Sandbox**: An interactive testing environment allowing developers to compile Noir circuits and simulate zero-knowledge proofs in the browser.
- **Architecture**: Code-level diagrams and state machine specs for the full L1–L2 stack.
- **GitHub**: Our open-source repositories for community peer review.

### COMPANY
- **Vision**: A strategic outline of our long-term goals, future expansion plans, and our objective of merging Aztec-powered privacy with decentralized finance.

### REGULATORY
- **Compliance Docs**: Detailed documentation outlining adherence to international financial regulations and jurisdictional standards.
- **Aztec Transparency**: A breakdown explaining the mathematics of zero-knowledge proofs and the limits of privacy guarantees.
- **Terms & Conditions**: The legally binding agreement dictating rules and acceptable use policies.
- **Privacy Policy**: A strict data handling manifesto explaining local browser storage and our absolute commitment to non-tracking.

---
© 2026 Humanity Ledger S.L. · All rights reserved
Aztec Native · MiCA Compliant
Legal & Compliance
