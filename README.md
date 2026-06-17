![Humanity Ledger](https://github.com/humanityledger.png)

# Whale Network: Official Platform Documentation & Aztec Integration Manual

Whale Network is an advanced terminal ecosystem for the comprehensive management of digital assets and zero knowledge identities. Designed to meet the demands of institutional operations and retail users alike, the platform unites cross device state synchronisation, client side zero knowledge proof generation, and omnichannel network telemetry into a singular architecture.

This document serves as the platform's main operational manual and architectural guide. It has been structured to provide absolute transparency to independent auditors, corporate grade institutional partners, and the core engineering team at Aztec Network. Within this manual, we detail how Whale Network orchestrates private execution environments, implements zero knowledge primitives without friction, and deploys its terminal modules atop an underlying infrastructure that prioritises privacy and cryptographic integrity.

## 1. The Unified Domain Dual Architecture: PC and Mobile Symbiosis

Whale Network operates under the paradigm of a Unified Domain Dual Architecture. The web ecosystem dynamically adapts its execution and compilation layers to the cryptographic topology of the device from which access is requested. The system enables a symbiotic session linking mechanism between both environments, guaranteeing full state continuity securely.

### 1.1 PC Zone: Wagmi Extension Infrastructure

For users accessing the platform from desktop environments, the system establishes a high computation channel by coupling directly to the Wagmi ecosystem and to standard browser extension wallets (e.g. MetaMask, Rabby, Frame).

*   **Direct and Synchronous Execution**: Transaction signatures, on chain state reads, and direct interactions with EVM layer smart contracts are all managed via injected Web3 providers, delivering native execution without third party intermediaries.
*   **Client Side Prover (Noir WASM Engine)**: Upon detecting a desktop environment, Whale Network downloads and compiles the Barretenberg execution environment into WebAssembly (WASM). This enables the user's browser to leverage the full computational power of the local processor to generate the complex zero knowledge proofs demanded by Noir circuits. Private data never leaves the local memory; only the resulting cryptographic proof and its public inputs are dispatched to the Aztec sequencer. Witness generation, circuit execution, and proof construction are wholly client side operations.

### 1.2 Mobile Zone: Handshake Enclave Architecture

Mobile browsers lack support for Web3 extension injection and lack the sustained computational capacity required to run intensive ZK provers. To resolve this, Whale Network has engineered the Handshake Enclave Architecture.

*   **Out of Band Device Synchronisation**: The desktop terminal generates an ephemeral public key. The user's mobile device scans this public vector via QR code to establish a forward secret shared secret. This key exchange ensures that the encrypted session channel is secure from interception.
*   **Enclave Routing and Cryptographic Delegation**: The mobile device operates as a secure authorisation enclave. When a user wishes to interact with a smart contract or attest a state transition on Aztec whilst away from their workstation, the mobile interface asynchronously routes the encrypted request through secure WebSocket tunnels to the linked PC session. The desktop session then executes the computationally intensive ZK proof generation and transaction signing, returning the attested confirmation to the mobile device.
*   **Omnipresent Session Continuity**: The user experiences an absolute fusion of their environments. They may audit their portfolio and observe global network state from their mobile device, whilst all critical operations remain entrenched within the desktop layer.

## 2. The Terminal Ecosystem: Tab Architecture

The core interface is partitioned into five dedicated modules. Each tab responds to an independent technical sub architecture, optimised for distinct cryptographic, analytical, and telemetric processes. 

### 1. Roadmap

An immersive and interactive visualisation charting the technical evolution and developmental trajectory of the ecosystem. This dynamically reflects the integration status of database indexing structures, the progression of Noir circuit optimisations, and the deployment cadence of new infrastructure microservices, providing a living, verifiable record of protocol maturity.

### 2. Identity

The core of the project and the primary reason for the Aztec Network integration. The Identity tab empowers users to attest complex compliance criteria using a locally compiled Noir circuit. The smart contract on L1 or L2 accepts this proof and grants the pertinent permissions, whilst ensuring that the user's public address, balance, transaction history, and personally identifying information are never associated on chain. Uniqueness is proved; identity is never revealed.

### 3. Token

The governance and utility layer for the platform's native token infrastructure. Employing static calls to the governance smart contract, the platform confirms the user's token holdings. Validation of these holdings dynamically unlocks advanced interfaces, expanded API quotas, and elevated cryptographic clearances within the client application.

### 4. Network Map

An advanced interface for the real time supervision of global network infrastructure. Employing WebGL and GPU acceleration, the Map renders the geospatial distribution of the network's infrastructure in real time, fed by low latency WebSocket streams. It surfaces the active state of Aztec sequencers, Ethereum L1 validators, and distributed storage cluster nodes.

### 5. Privacy

The ultimate safeguard, returning absolute control of the local environment to the user. This module provides an exhaustive breakdown of precisely which ephemeral keys, ZK state caches, and session logs currently reside within the browser's local storage layers. It exposes cryptographically secure deletion routines capable of purging every local trace upon the conclusion of a session, guaranteeing that the local environment is restored to an entirely sterile state.

## 3. Documentation Topology

The knowledge structure and operational directives of Whale Network have been segmented to serve the precise requirements of distinct institutional profiles, from core protocol engineers to regulatory compliance officers.

### PRODUCT

*   **Architecture**: A deployment of network topology diagrams, class diagrams, and data flow schematics. It documents precisely how the Next.js App Router interweaves with the Prisma ORM and the Web3 infrastructure, maintaining a separation of concerns between public data indexing and private client side proof generation.
*   **Registry**: The immutable census of verified smart contract addresses. It details core contracts, proxy patterns, and all supported protocols across integrated networks.
*   **Whitepaper**: The foundational academic document. It dissects the underlying mathematical formulae, the economic incentive models, and the cryptographic primitives that underpin and validate the entire Whale Network cryptographic stack.

### DEVELOPERS

*   **API Docs**: The definitive integration reference for third party services and developers. It documents JSON schemas, standardised HTTP error codes, rate limiting tiers, and WebSocket stream protocols.
*   **ZK Sandbox**: An in browser, in memory isolated testing environment. It provides the developer community with a pre configured IDE for writing, simulating, and compiling Noir circuits, enabling the validation of complex state transitions against the proving system without incurring any mainnet risk.
*   **GitHub**: The single source of truth. Full access to the open source frontend repositories, infrastructure modules, and governance contracts, openly inviting peer review and independent security scrutiny from the global cryptographic engineering community.

### REGULATORY

*   **Compliance Docs**: Robust legal documentation certifying the platform's alignment with applicable international financial regulatory frameworks. The AML prevention architectures, implemented under ZK compliant schemes, are detailed here.
*   **Aztec Transparency**: This document mathematically decomposes the true guarantees and the precise technical boundaries of Aztec's privacy model, explaining with meticulous accuracy which metadata remains concealed and what cryptographic footprints are inevitably produced.
*   **Terms and Conditions**: The legal clauses governing the ecosystem. They delineate liability exculpations pertaining to decentralised software, the user's exclusive obligations regarding private key custody, and the acceptable use policies for the terminal and all associated APIs.
*   **Privacy Policy**: Our data privacy manifesto. It legally stipulates that Humanity Ledger S.L. is technically incapable of decrypting any user state, documenting that all encryption, attestation, and secret storage operations function purely within a local Zero Knowledge context within the user's own browser or mobile device.

---

**© 2026 Humanity Ledger S.L. All rights reserved.**
Institutional Grade Identity Terminal and Cryptographic Analytics Ecosystem.
Aztec Native Architecture. MiCA Compliant. W3C Verifiable Credentials Certified.
Humanity Ledger S.L. — Registered in Spain.
