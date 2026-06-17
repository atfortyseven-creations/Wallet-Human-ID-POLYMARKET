# Whale Network: Official Platform Documentation & Aztec Integration Manual

**Whale Network** represents the pinnacle of applied cryptographic engineering for data sovereignty, constituting an advanced terminal ecosystem for the comprehensive management of digital assets and zero-knowledge identities. Designed with uncompromising rigour to meet the demands of high-calibre institutional operations and elite retail users alike, the platform amalgamates cross-device state synchronisation, client-side zero-knowledge proof generation, and omnichannel network telemetry into a singular, unified architecture.

This document serves as the platform's master operational manual and architectural manifesto. It has been drafted and structured with the utmost technical precision to provide absolute and granular transparency to consortia of independent auditors, corporate-grade institutional partners, and, most pre-eminently, to the **core engineering team at Aztec Network**. Within this manifesto, we decompose at atomic resolution how Whale Network orchestrates private execution environments, implements zero-knowledge primitives without friction, and deploys its constellation of twelve terminal modules atop an underlying infrastructure that permits no concessions with regard to privacy or cryptographic integrity.

---

## 1. The Unified-Domain Dual Architecture: PC/Mobile Symbiosis

Whale Network does not depend upon fragmented, siloed applications. It operates under the paradigm of a **Unified-Domain Dual Architecture**, meaning that the very same web ecosystem (`app.humanidfi.com`) dynamically mutates and restructures its execution and compilation layers, adapting to the cryptographic topology of the device from which access is requested. The system enables a symbiotic session-linking mechanism between both environments, guaranteeing full state continuity without the slightest compromise to security.

### 1.1 PC Zone: Wagmi Extension Infrastructure

For users accessing the platform from desktop environments, the system establishes a high-computation channel by coupling directly to the **Wagmi** ecosystem and to standardised browser-extension wallets (e.g., MetaMask, Rabby, Frame).

- **Direct and Synchronous Execution**: Transaction signatures, on-chain state reads, and direct interactions with EVM-layer smart contracts are all managed via injected Web3 providers, delivering native, low-latency execution without third-party intermediaries.
- **Client-Side Prover (Noir WASM Engine)**: Upon detecting a desktop environment, Whale Network downloads and compiles the **Barretenberg** execution environment into WebAssembly (WASM). This enables the user's browser to leverage the full multi-core computational power of the local processor to generate the complex zero-knowledge proofs demanded by Noir circuits. Private data never leaves the local memory bus; only the resulting cryptographic proof and its public inputs are dispatched to the Aztec sequencer. Witness generation, circuit execution, and proof construction are wholly client-side operations.

### 1.2 Mobile Zone: Handshake Enclave Architecture

Mobile browsers reliably lack support for Web3 extension injection and lack the sustained computational capacity required to run intensive ZK provers. To resolve this architectural chasm, Whale Network has engineered the **Handshake Enclave Architecture**.

- **Out-of-Band Device Synchronisation (X25519 ECDH)**: The desktop terminal, or a trusted secure node, generates an ephemeral public key over the Curve25519 elliptic curve. The user's mobile device scans this public vector (via QR code or deep link) and executes a Diffie-Hellman handshake (ECDH) to establish a perfect, forward-secret shared secret. This out-of-band key exchange ensures that the encrypted session channel is immune to replay attacks and man-in-the-middle interception.
- **Enclave Routing and Cryptographic Delegation**: The mobile device subsequently operates as a passive viewer and a secure authorisation enclave. When a user wishes to interact with a smart contract or attest a state transition on Aztec whilst away from their workstation, the mobile interface asynchronously routes the encrypted request through secure WebSocket tunnels to the linked PC session. The desktop session then executes the computationally intensive ZK proof generation and transaction signing, returning the attested confirmation to the mobile device within milliseconds.
- **Omnipresent Session Continuity**: The user experiences an absolute fusion of their environments. They may audit their portfolio, decrypt messages from the communications layer, and observe global network state from their mobile device, whilst all critical operations — Aztec spending key management, Noir circuit compilation, and WASM proving — remain entrenched within the Wagmi desktop layer.

---

## 2. The Terminal Ecosystem: Tab Architecture

The core interface is partitioned into twelve dedicated modules. This division is not merely cosmetic; each tab responds to an independent technical sub-architecture, optimised for distinct cryptographic, analytical, and telemetric processes. Detailed below is the engineering rationale underpinning each vertical.

### 1. Dashboard — Global Command Centre

The neuralgic core of the user experience. Its operation is not predicated upon simple RPC calls but rather upon a sophisticated parallel indexing engine.

- **L1/L2/L3 State Confluence**: The Dashboard simultaneously evaluates the user's global balance by consolidating liquidity visible across public EVM chains (Ethereum, Base, Arbitrum) and liquidity concealed within Aztec's private state. The aggregate net worth figure is computed in real time across all layers without exposing individual holdings to the public ledger.
- **Hybrid History Engine**: The module asynchronously monitors incoming on-chain transfers via dedicated subgraphs, whilst simultaneously and passively decrypting incoming Aztec notes (Incoming Notes) using the user's locally held Viewing Key. This dual-stream process assembles a unified, private ledger within the client's memory — a comprehensive financial record that no external observer can access or reconstruct.

### 2. Studio — Provenance & Structural Anchoring

The Studio module is a sterile-room environment for the registration of digital assets and institutional identities.

- **Aztec Zero-Knowledge Anchoring**: Leveraging the cryptographic power of the Aztec Network, Studio enables creators and institutions to generate a **Proof of Origin** for any dataset, physical asset, or digital artefact. The network irrevocably attests that a user possessed and registered a specific piece of metadata at a given point in time, without publicly revealing the content of that metadata, the identity of the registrant, or any transactional relationship between parties.
- **Real-Time Noir Circuit Compilation**: Every asset registration invokes a dedicated Noir circuit that mathematically guarantees the integrity of the underlying data's cryptographic hash against the original emitter's signature. Tampering with any field of the registration post-anchoring renders the proof invalid, providing immutable forensic provenance.

### 3. Markets — Institutional-Grade Deep Analytics

Whilst the platform is strictly removed from any order-execution mechanics, it provides premier macroeconomic intelligence for the analysis of institutional on-chain capital flows.

- **Quantitative Analytics Oracles**: Through integration with deterministic data sources, including Chainlink price feeds and proprietary on-chain oracles, advanced metrics are indexed — market capitalisation, 24-hour settlement volumes, and liquidity depths across Automated Market Makers — and presented with institutional precision.
- **Graph Database Processing**: Internally, the architecture extracts on-chain data flows and processes them through graph-oriented databases. This facilitates the identification of macro-correlations between assets and capital movements at an analytical depth unavailable to conventional block explorers, without ever cross-referencing individual wallet identities.

### 4. Roadmap — Protocol Cartography

An immersive and interactive visualisation charting the technical evolution and developmental trajectory of the ecosystem.

- **Dynamic Backend State Tracking**: This is not a static presentation layer. The Roadmap is directly linked to the telemetry of GitHub repositories and to the phased audit schedules of deployed smart contracts. It dynamically reflects the integration status of database indexing structures, the progression of Noir circuit optimisations, and the deployment cadence of new infrastructure microservices, providing a living, verifiable record of protocol maturity.

### 5. Identity — Sovereign Cryptographic Passport

The existential nucleus of the project and the primary raison d'être for the Aztec Network integration.

- **Zero-Knowledge Verifiable Credentials**: The Identity tab empowers users to attest complex compliance criteria — for instance, *"I am a verified, unique user belonging to jurisdiction X"* or *"I have completed the investor accreditation process to the required standard"* — using a locally compiled Noir circuit. The attestation is generated entirely on-device.
- **Verification Without Exposure**: The local prover generates an irrefutable mathematical proof of validity. The smart contract on L1 or L2 accepts this proof and grants the pertinent permissions and clearances, whilst ensuring that the user's public address, balance, transaction history, and personally identifying information are never associated on-chain. Uniqueness is proved; identity is never revealed.

### 6. TOKEN — Economic Sovereignty Module

The governance and utility layer for the platform's native token infrastructure.

- **Subscription Tier Smart Contract Verification**: Employing static calls to the governance smart contract, the platform confirms the user's token holdings. Validation of these holdings dynamically unlocks, within the client application, advanced interfaces, expanded API quotas, and elevated cryptographic clearances — all enforced through the WhaleFortress edge middleware, ensuring that no privilege escalation is possible outside of the verified on-chain state.

### 7. MAP — Geospatial Node Telemetry

An advanced, immersive interface for the real-time supervision of global network infrastructure.

- **WebGL Network Rendering**: Employing WebGL and GPU acceleration, the MAP renders the geospatial distribution of the network's infrastructure in real time, fed by low-latency WebSocket streams. It surfaces the active state of Aztec sequencers, Ethereum L1 validators, and distributed storage cluster nodes (IPFS/Arweave), providing an unobstructed view of the physical and logical topology upon which Whale Network's privacy guarantees rest.

### 8. Chat — Encrypted P2P Communications Layer

An asynchronous, entirely private peer-to-peer messaging channel.

- **XMTP Protocol Integration**: Displacing all centralised messaging servers, this tab is built atop the **XMTP protocol**, guaranteeing end-to-end encryption (E2EE) for every message. Communications can only be decrypted using the private key of the destination wallet. The architecture ensures absolute immutability and confidentiality of the conversational record, rendering any data mining by the platform or any third-party observer technically impossible and cryptographically unfeasible.

### 9. Portfolio — Patrimonial Analytical Breakdown

A financial microscope into the user's full cryptographic asset state.

- **Private State Tree Reconstruction**: Through the aggregation of dedicated subgraphs and the iterative scanning of the user's private Aztec state tree (PXE tree), the Portfolio renders advanced charts depicting wealth distribution, historical asset performance across configurable time horizons, and net exposure balances across integrated DeFi protocol positions — all without transmitting unencrypted financial data to any server.

### 10. Community — Participative Governance Centre

The digital agora for decentralised, community-driven decision-making.

- **On-Chain Consensus**: The module implements Snapshot voting modules and direct integrations with DAO governance smart contracts. It enables users to cryptographically sign, submit, and vote upon architectural upgrade proposals, protocol parameter adjustments, and audit commission mandates, ensuring that all governance actions are transparent, traceable, and resistant to sybil manipulation via on-chain identity verification.

### 11. STATUS — Holistic Health Monitor

The operations dashboard for real-time infrastructure audit and reliability assessment.

- **Sentinel Microservice Architecture**: A cluster of backend watchdog microservices performs continuous health checks — pinging RPC nodes, Paymaster relayers, and the Aztec Prover network. Uptime metrics, response latencies, and network throughput bottlenecks are displayed without censorship, providing atomic-grade operational visibility and enabling near-instant incident response.

### 12. PRIVACY — Cryptographic Hygiene Console

The ultimate safeguard, returning absolute control of the local environment to the user.

- **Strict IndexedDB Audit**: This module provides an explicit, exhaustive breakdown of precisely which ephemeral keys, ZK state caches, and session logs currently reside within the browser's local storage layers (IndexedDB / LocalStorage), mapped by timestamp and operation type.
- **Atomic Purge Routine**: It exposes cryptographically secure zero-fill deletion routines capable of purging every local trace upon the conclusion of a session on a shared terminal, guaranteeing that the local environment is restored to an entirely sterile and immaculate state, leaving no exploitable data residue.

---

## 3. Documentation Topology

The knowledge structure and operational directives of Whale Network have been meticulously segmented to serve the precise requirements of distinct institutional profiles — from core-protocol engineers to regulatory compliance officers — ensuring a standard of clarity befitting a mission-critical operational environment.

### PRODUCT — Functional Specifications

- **Architecture**: A monumental deployment of network topology diagrams, class diagrams, and data flow schematics. It documents precisely how the Next.js 15 App Router interweaves with the Prisma ORM, the WhaleFortress security engine (edge middleware), and the Web3 infrastructure, maintaining a surgical separation of concerns between public data indexing and private client-side proof generation.
- **Registry**: The immutable census of verified smart contract addresses. It details core contracts, proxy patterns, and all supported protocols across integrated networks, ensuring the client exclusively interacts with authenticated, audited vectors.
- **Whitepaper**: The foundational academic tome. It dissects the underlying mathematical formulae, the economic incentive models, and the ZK-SNARK/ZK-STARK primitives that underpin and validate the entire Whale Network cryptographic stack.

### DEVELOPERS — Integration Kits and Core Code

- **API Docs**: The definitive integration reference for third-party services and developers. It documents JSON schemas, standardised HTTP error codes, rate-limiting tiers, HMAC request signing patterns, and WebSocket stream protocols for programmatic telemetric extraction.
- **ZK Sandbox**: An in-browser, in-memory isolated testing environment. It provides the developer community with a pre-configured IDE for writing, simulating, and compiling Noir circuits (Aztec's domain-specific language), enabling the validation of complex state transitions against the proving system without incurring any mainnet risk or gas expenditure.
- **Architecture (Code-Level)**: Parallel documentation embedded directly alongside the repository source tree — TypeScript documentation, JSDoc annotations — detailing design patterns employed (Singletons, Factory Methods, Observer Patterns) and the finite state machines governing core cryptographic workflows.
- **GitHub**: The single source of truth. Full access to the open-source frontend repositories, infrastructure modules, and governance contracts, openly inviting incessant peer review and independent security scrutiny from the global cryptographic engineering community.

### COMPANY — Institutional Directives

- **Vision**: The project's magnetic north. A strategic document projecting the five-year expansion of Whale Network, detailing institutional partnership roadmaps, planned B2B integrations, and the inevitable total convergence of the platform towards absolute, Aztec-powered privacy layers as the foundational standard for digital identity and asset management.

### REGULATORY — Legal and Compliance Framework

- **Compliance Docs**: Robust legal documentation certifying the platform's alignment with applicable international financial regulatory frameworks. The AML (Anti-Money Laundering) prevention architectures, implemented under ZK-compliant schemes, are detailed here — demonstrating adherence to institutional normatives without compromising the on-chain anonymity of the user.
- **Aztec Transparency**: A letter of technological honesty. This document mathematically decompose the true guarantees — and the precise technical boundaries — of Aztec's privacy model, explaining with meticulous accuracy which metadata remains concealed and what cryptographic footprints are inevitably produced, pre-empting and eradicating any false narrative of magical anonymity.
- **Terms & Conditions**: The hermetic legal clauses governing the ecosystem. They delineate liability exculpations pertaining to decentralised software, the user's exclusive obligations regarding private key custody, and the acceptable use policies for the terminal and all associated APIs.
- **Privacy Policy**: Our data sanctity manifesto. It legally stipulates that Humanity Ledger S.L. is technically incapable of decrypting any user state, exhaustively documenting that all encryption, attestation, and secret storage operations function purely within a local Zero-Knowledge context — within the user's own browser or mobile device — and that no personally identifying information is ever transmitted to, or retained by, our servers in an unencrypted or intelligible form.

---

**© 2026 Humanity Ledger S.L. · All rights reserved.**
*Institutional-Grade Identity Terminal and Cryptographic Analytics Ecosystem.*
**Aztec Native Architecture** · MiCA Compliant · W3C Verifiable Credentials Certified.
*Humanity Ledger S.L. — Registered in the Kingdom of Spain.*
