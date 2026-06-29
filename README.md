# Whale Network

*Privacy is a fundamental right. Architecture is a declaration of values.*

Whale Network is a sovereign-grade identity terminal and cryptographic analytics ecosystem built natively for the **Aztec Network**. It provides absolute user state privacy, data siloing, and mathematically provable censorship resistance via Zero-Knowledge (ZK) cryptography.

This system is structurally incapable of collecting user state. Data is sealed via SNARKs *before* reaching any network layer.

> [!NOTE]
> **Aztec Foundation Grant Acknowledgement:**
> Humanity Ledger & Whale Network are built as public goods for the Zero-Knowledge ecosystem. This repository is proudly fully open-source (MIT License) and architected to meet the strictest cypherpunk requirements of the Aztec Foundation Grant program.

## The Cypherpunk Mandate

We embrace the Aztec Cypherpunk manifesto. In an era of pervasive telemetry and centralized tracking, Whale Network represents a hard cryptographic boundary.
- **No Analytics:** There is no Google Analytics, no Vercel Analytics, no tracking cookies.
- **No IP Logging:** The routing layer employs zero-metadata onion-like IP obfuscation (SHA-256 hashes with environmental salts).
- **Absolute Data Siloing:** Cross-contamination of smart contract state is mathematically prevented via strict PXE (Private Execution Environment) proxy isolation.

## Architecture & Cryptographic Stack

Whale Network is built on a "Privacy by Design" foundation, leveraging the Noir language and the Aztec Protocol.

### 1. Zero-Knowledge Execution (Noir WASM)
Client-side provers compile the Barretenberg execution environment into WebAssembly (WASM). Complex Zero-Knowledge proofs are generated entirely within the user's local hardware (browser). Witness generation, circuit execution, and proof construction never leave the local memory enclave.

### 2. PXE Siloing & Data Isolation
The `getSiloedPXE` architecture generates a strict, memory-isolated PXE proxy that forces all queries and decryption attempts to be hard-bound to a specific contract address. This mathematically prevents one frontend module (e.g., Whale Chat) from reading the notes of another (e.g., Humanity Ledger).

### 3. Handshake Enclave & Off-Grid Routing
For mobile devices or low-computation environments lacking ZK prover capacity, Whale Network employs an Out-of-Band device synchronization protocol. The mobile device operates as an encrypted authorization enclave, asynchronously routing requests through secure tunnels to the desktop session, which performs the intensive proof generation.

### 4. Sovereign Killswitch
The terminal implements a `nuclearDisconnect` procedure. Initiating this sequence performs a forensic purge of `localStorage`, `sessionStorage`, `IndexedDB`, active WebSockets, and `httpOnly` cookies. The proxy and all session keys are irreversibly evicted from volatile memory.

### 5. Censorship Resistance & Fallback
The frontend is built to operate under adversarial network conditions.
- **Offline Read-Only Mode:** If the Aztec Sequencer goes offline or is censored, the local PXE fallback allows continuous, read-only access to synced state.
- **IPFS / Arweave Ready:** The terminal supports purely static exports (`output: 'export'`), ensuring it can be hosted on decentralized, unstoppable storage networks without server-side dependencies.
- **Tor/I2P Awareness:** Running the node locally will trigger a recommendation to route traffic through Tor or I2P for maximum privacy.

## Documentation Topology

- **Identity**: The core of the project. Attest complex criteria using locally compiled Noir circuits. Uniqueness is proved; identity is never revealed.
- **Network Map**: Real-time supervision of the global network topology, including Aztec sequencers and Ethereum L1 validators.
- **Whale Chat**: Peer-to-Peer encrypted communications using Perfect Forward Secrecy (ephemeral X25519 keys) and zero-metadata routing.

## Development & Deployment

### Run Locally (Tor/I2P Recommended)
```bash
npm install
npm run dev
```

### IPFS Distributed Build
```bash
npm run build:ipfs
```
*Generates a 100% static bundle ready for decentralized hosting.*

---
**Humanity Ledger S.L.**
*Aztec Native Architecture. ZKP Secured. Cypherpunk Aligned.*
