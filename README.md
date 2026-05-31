
## Architecture Overview

Our infrastructure is built strictly on-chain, utilizing deterministic cryptographic verification and decentralized key custody to achieve a state of absolute integration. Every module detailed below operates in a live production environment, strictly hardened to ensure maximum concurrency, omni-device state synchronization, and quantum-level execution integrity.

---

## Humanity Ledger

Humanity Ledger represents our proprietary Zero-Trust Authentication Bridge. It is designed to unify traditional Web3 wallet infrastructure with cutting-edge cryptographic session handshakes, providing an absolutely flawless user experience across Desktop, iOS, and Android platforms.

*   **Universal Authentication Bridge (Account Abstraction):** A meticulously engineered `useSystemAccount` controller seamlessly resolves dual-pathway authentication. It unifies traditional Web3 wallet infrastructure (Wagmi/WalletConnect) with the **Humanity Ledger QR Cryptographic Handshake**, granting frictionless access to secure endpoints. This abstracts away the complexity of managing Aztec account contracts (Schnorr/ECDSA verifiers) and enables universal forum interaction without exposing contract-level signatures to front-end vectors.
*   **iOS-Native Omni-Grid Architecture:** The mobile ecosystem (`MobileLanding`) employs a mathematically precise 4-column matrix, emulating native iOS rendering pipelines. Assets are dynamically composited via `mix-blend-multiply` against 60x60px viewports, guaranteeing flawless responsive scaling, perfect structural alignment, and strictly bounded memory allocations across all mobile edge devices.
*   **Redis-Backed Session Integrity:** System-critical session tracking is powered by a rigorously hardened Redis implementation. All payload interpolations and connection states operate under strict memory-safe constraints, ensuring deterministic execution during high-concurrency handshake resolutions.

---

## Aztec Network Privacy Architecture

Our integration with Aztec Network is deeply embedded and production-ready. The system leverages the private execution environment to process confidential logic directly on the user's edge device, emitting only zero-knowledge proofs to the network.

1.  **Noir Circuits & Smart Contracts:** All private protocol logic is compiled in Noir, Aztec's Rust-based DSL for Zero-Knowledge proofs. These circuits enforce the strict mathematical constraints required for valid state transitions. We utilize advanced circuit paradigms for custom note commitments, nullifier generation (strictly preventing double-spending on the Nullifier Tree), and private authorization witnesses.
2.  **Honk & UltraPlonk Cryptographic Proving:** The system leverages Aztec's cutting-edge proving backends. It supports highly optimized WebAssembly (WASM) proof generation directly in the browser, achieving ultra-fast verification times essential for seamless UX in a decentralized application.
3.  **Private Execution Environment (PXE) & Note Discovery:** Operating entirely client-side, the PXE maintains the private note database and manages key derivations (including incoming/outgoing viewing keys). It seamlessly syncs with the L2 RPC to fetch encrypted logs, decrypting only the notes associated with the user's viewing key. Private keys never leave the browser environment, enforcing absolute zero-trust execution.
4.  **Public/Private Composability:** Strict adherence to Aztec's L2 architecture, orchestrating seamless cross-domain calls between the private execution context and public state contracts (e.g., L2 AMMs and Oracle data registries), guaranteeing robust, cryptographically verifiable operations while mitigating MEV.

---

## Global Interoperability

*   **Real-Time Institutional Scanning:** Evaluates raw transaction logs to detect massive institutional capital flows without relying on centralized or delayed indexing registries.
*   **Encrypted Client-to-Client Messaging (Whale Chat):** Decentralized communication protocols orchestrating end-to-end encrypted messaging. The server architecture operates strictly as a blind relay; it can never decrypt or access plaintext payloads.
*   **Shielded Routing:** Transactions exceeding configurable thresholds are automatically obfuscated and routed through blocking private networks, neutralizing Maximal Extractable Value (MEV) attacks and front-running vectors.

---

## System Architecture Layers

1.  **Presentation Layer:** Impeccable institutional aesthetic, featuring exact iOS-app emulations for mobile zones and hyper-optimized React Server Components (Next.js 15).
2.  **Authentication Layer (Humanity Ledger):** Deterministic core, asymmetric QR handshake synchronization, local encrypted caching, and multi-account derivation.
3.  **Aztec Privacy Layer:** Noir compiler orchestration, note commitments, state privacy, and deep ZK-DeFi integration.
4.  **Execution & Protection Layer:** Shielded transaction routing, gasless sponsor paymasters, and atomic multi-transaction batching.
5.  **Analytics Layer:** Relational and graph database architectures designed for high-frequency, real-time capital flow detection.

---

## Contributing

We adhere to the strictest cybersecurity and code-hygiene standards. All contributions must pass comprehensive static analysis, boundary checks, and cryptographic logic audits.

1.  Fork the repository.
2.  Create a feature branch strictly bound to a single architectural upgrade.
3.  Ensure all cryptographic routines (especially within the Humanity Ledger handshake) are accompanied by mathematical proofs or exhaustive unit tests.
4.  Submit a Pull Request for rigorous peer review by the core engineering team.

---

## Security & Vulnerability Disclosure

Security is the foundational pillar of the Whale Network and Humanity Ledger. 

*   **Zero-Trust Enforcement:** We assume all networks are hostile. No private key or unencrypted PII is ever transmitted to our relay servers.
*   **Vulnerability Reporting:** If you discover a critical vulnerability (e.g., proof forgery, nullifier bypass, session hijacking), do NOT open a public issue. Contact the security team directly via encrypted channels (details provided upon request to the CEO).
*   **Bug Bounty:** We offer compensation for responsibly disclosed, high-severity vulnerabilities affecting the Aztec PXE integration or the Humanity Ledger authentication bridge.

---

## License

**MIT License**

Copyright (c) 2026 Stefan Antonio Cirisanu & Whale Network

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---
*Status: Deployed, Build Integrity: Verified.*
