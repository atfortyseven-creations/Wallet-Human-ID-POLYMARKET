# Whale Network: Official Platform Documentation & Aztec Integration Manual

Whale Network is an advanced cryptographic terminal and digital asset management ecosystem. Designed for institutional and retail operations alike, the platform integrates cross-device synchronization, zero-knowledge proofs, and multi-chain analytics into a single unified architecture. 

This documentation provides an exhaustive, highly technical operational guide. It is specifically tailored to provide clarity to auditors, institutional partners, and the **Aztec Network engineering team** regarding how Whale Network leverages private execution environments, client-side proving, and zero-knowledge primitives across its 12 terminal modules and underlying infrastructure.

---

## 1. Zero-Knowledge Infrastructure & Aztec Integration

Whale Network is built from the ground up to respect user privacy through the implementation of zero-knowledge rollups and client-side proof generation. We heavily utilize the Aztec Network ecosystem to ensure that state transitions can be verified without exposing underlying transactional data.

### 1.1 Local Private Execution Environment (PXE)
The platform integrates the Aztec Local PXE directly into the client-side architecture.
- **Client-Side Key Management**: Users' viewing keys and spending keys never leave their local device. All decryption of incoming note data occurs in the browser.
- **State Synchronization**: The local PXE periodically polls the L2 RPC to fetch encrypted event logs. It attempts trial decryption locally to construct the user's private state tree.

### 1.2 Noir Circuits & Client-Side Proving (WASM)
- **Zero-Knowledge State Transitions**: Every private action on the platform (from transferring tokens to verifying identity criteria) is executed via Noir circuits.
- **WASM Provers**: The compilation and execution of these circuits occur via WebAssembly directly in the user's browser (or on their mobile device via the ECDH out-of-band handshake). This ensures that witnesses are generated and proofs are constructed locally, sending only the resulting ZK proof and public inputs to the network sequencer.

### 1.3 Out-of-Band Device Synchronization (X25519 ECDH)
To mitigate the security risks of browser-based key injection, Whale Network utilizes a mobile-to-desktop bridging mechanism.
- The desktop terminal generates an ephemeral Curve25519 public key.
- The mobile application scans this key via QR code and establishes an ECDH shared secret.
- The desktop terminal can safely query public network states, but any operation requiring a Noir witness generation or a transaction signature is routed symmetrically to the secure mobile enclave via the established encrypted channel.

---

## 2. Terminal Ecosystem Capabilities

The core interface operates through twelve dedicated modules. Each module is designed to orchestrate complex cryptographic and financial actions securely while interacting with the underlying Web3 and Aztec infrastructure.

### Dashboard
The central command center for account oversight.
- **Global Portfolio Tracking**: Evaluates aggregate balances across public EVM states (Ethereum, Base, Polygon) and private Aztec states. Net worth is calculated in real-time.
- **Transaction History**: Monitors recent incoming and outgoing on-chain transfers, differentiating between public L1/L2 transfers and private Aztec note commitments.
- **Quick Actions**: Provides rapid execution pathways for sending, receiving, or swapping assets across supported networks.

### Studio
A dedicated environment for digital asset provenance and registration.
- **Asset Minting**: Register new physical or digital assets on-chain with customized metadata.
- **Provenance Tracking**: Review the chronological lifecycle and transfer history of registered assets.
- **Zero-Knowledge Anchoring**: Assets are anchored securely using Aztec Network integration. The platform generates a proof of origin and ownership without revealing the asset's specific supply chain data to public observers.

### Markets
Institutional-grade analytics for tracking token metrics and market movements.
- **Live Price Feeds**: Monitors real-time valuations across a wide range of digital assets.
- **Deep Analytics**: Accesses advanced metrics including market capitalization, 24-hour volume, and circulating supply.
- **Filtering and Sorting**: Isolates assets by specific blockchain networks or sorts by performance indicators.

### Roadmap
An interactive visualization of protocol development and ecosystem progression.
- **Phase Tracking**: Reviews current, completed, and upcoming architectural deployments.
- **Technical Milestones**: Accesses detailed descriptions of backend integrations, ranging from database indexing structures to smart contract audit statuses and Noir circuit optimizations.

### Identity
The user's zero-knowledge cryptographic passport.
- **Aztec Network Integration**: Generates client-side proofs to verify identity criteria (e.g., uniqueness, age verification, or geographical compliance) without exposing public addresses or transaction history.
- **Airdrop Claims**: Securely claim network incentives (such as the 10 QD token genesis airdrop) utilizing local cryptographic signatures verified against Aztec smart contracts.
- **Access Tiering**: Reviews current subscription tiers and cryptographic clearances assigned to the wallet.

### Token
Utility and subscription management interface.
- **Tier Upgrades**: Subscribe to advanced platform tiers using supported digital assets.
- **Utility Tracking**: Monitor the specific benefits, API limits, and expanded clearances associated with the current subscription level.

### Map
A geographic and infrastructural visualization of the network.
- **Node Distribution**: Observes the global distribution of active network validators, Aztec sequencers, and provers.
- **Connectivity Mapping**: Visualizes the real-time routing of encrypted traffic across the decentralized infrastructure.

### Chat
An encrypted, peer-to-peer communication layer utilizing the XMTP protocol.
- **Secure Messaging**: Send and receive end-to-end encrypted messages directly to other EVM addresses.
- **Address Book Management**: Save, block, or manage frequent contacts.
- **Audio and Media Support**: Transmit encrypted voice memos and file attachments securely to peers.

### Portfolio
A granular breakdown of the user's financial holdings.
- **Asset Allocation**: View detailed charts representing the distribution of wealth across different tokens and networks.
- **Historical Performance**: Analyze the growth or depreciation of the portfolio over custom timeframes.
- **Yield Tracking**: Monitor passive income generation from staked assets or liquidity provision in both public and private AMMs.

### Community
The center for governance and user support.
- **Support Ticketing**: Open direct communication lines with platform maintainers for technical assistance.
- **Governance Proposals**: Review and vote on upcoming protocol upgrades or parameter adjustments securely.

### Status
Live telemetry and health monitoring of the underlying infrastructure.
- **RPC Latency**: Monitors the response times of the various blockchain nodes the platform relies on.
- **System Health**: Checks the operational status of secondary services, including the Aztec Prover network and Paymaster relays.

### Privacy
Transparent oversight of local session data and cryptographic routing.
- **Session Logs**: Reviews a detailed, localized audit trail of all actions, logins, and signatures performed during the current session.
- **Data Clearing**: Manually purge local caches, ephemeral keys, and local PXE databases to maintain absolute device hygiene.

---

## 3. Product Architecture & Repositories

### Architecture Overview
Deep technical documentation detailing the integration between the Next.js 15 App Router frontend, the PostgreSQL database (managed via Prisma ORM), and the Web3 infrastructure. This section outlines the strict separation of concerns between public data indexing and private client-side execution.

### Registry
The smart contract index utilized by the platform to resolve verified token addresses, decentralized exchanges, and bridging protocols across all supported networks.

### Whitepaper
The foundational academic and technical document outlining the mission, cryptographic models, and tokenomic structure of the Whale Network.

---

## 4. Developers & Infrastructure

### API Docs
Comprehensive integration guidelines for third-party developers, covering RESTful endpoints, WebSocket streams, and authentication requirements for interacting with Whale Network's public data feeds.

### ZK Sandbox
An interactive testing environment allowing developers to compile Noir circuits, simulate zero-knowledge proofs, and test cross-chain state verifications directly within the browser without risking mainnet funds.

### GitHub
Open-source repositories providing full access to the platform's client-side components, UI libraries, and public smart contracts. We encourage community peer review of all cryptographic implementations.

---

## 5. Company Vision
A strategic outline of the long-term goals for Whale Network. This section covers future expansion plans, institutional partnerships, and the broader objective of merging robust, Aztec-powered privacy layers with mainstream decentralized finance.

---

## 6. Regulatory & Legal Framework

### Compliance Docs
Detailed documentation outlining the platform's adherence to international financial regulations, KYC/AML frameworks (where applicable), and jurisdictional operating standards.

### Aztec Transparency
A transparent breakdown of how the Aztec Network integration functions. This documentation explains the mathematics of zero-knowledge proofs, the limits of privacy guarantees, and ensures users and auditors understand exactly how their data is protected and verified.

### Terms & Conditions
The legally binding agreement dictating the rules, limitations of liability, and acceptable use policies for all users accessing the Whale Network ecosystem.

### Privacy Policy
A strict data handling manifesto explaining exactly what data is stored locally within the browser, what encrypted telemetry is relayed to our servers, and the platform's absolute commitment to non-tracking and user data protection.
