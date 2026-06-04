# Enterprise ARCHITECTURE CONTRIBUTING PROTOCOL

> [!WARNING]
> **STRICT PROCEDURAL MANDATE**
> The System Terminal is an institutional-grade codebase. We do not accept casual contributions, unverified logic modifications, or superficial UI tweaks. Every pull request is subjected to rigorous academic peer review and mathematical scrutiny. If you cannot abide by these Draconian standards, do not attempt to contribute.

## 1. Architectural Philosophy & Zero-Simulation

Before writing a single line of code, you must internalize the philosophical tenets of the System Architecture:
1. **The Zero-Simulation Mandate:** Absolutely no mock data, stubbed APIs, or synthetic rendering states. All UI components must ingest live, deterministic telemetry.
2. **Absolute Separation of Concerns:** The Next.js frontend must remain blissfully ignorant of cryptographic hashing logic. The Node.js indexing workers must never touch UI rendering paths.
3. **Graceful Degradation:** If an external system fails (e.g., Neo4j graph latency spikes), your code must degrade elegantly to an in-memory grid without crashing the main Event Loop.

## 2. The Pull Request Crucible

If you believe your optimization or feature is worthy of inclusion in the System Core, follow this exact sequence:

### 2.1 Branch Nomenclature
Branches must reflect the absolute precision of the work contained within.
* **Cryptography/Security:** `grid/crypto-enhancement-[descriptor]`
* **High-Frequency Backend:** `engine/telemetry-optimization-[descriptor]`
* **Institutional Frontend:** `terminal/ui-refinement-[descriptor]`
* **Example:** `engine/eip1153-transient-storage-parser`

### 2.2 Cryptographic Commit Signatures
**Unsigned commits will be automatically rejected by the pipeline.** 
You must cryptographically sign every single commit using a verified GPG/PGP key tied to your identity. Non-repudiation is a fundamental axiom of this repository.

### 2.3 The Peer Review Payload
Your Pull Request description must be structured as a formal technical monograph:
1. **Abstract:** What mathematical or engineering problem does this solve?
2. **Algorithmic Complexity:** Provide Big-O notation analysis for any new iteration loops or database queries.
3. **Thermodynamic Impact:** Does this increase client-side CPU load or server-side memory consumption? Provide hard metrics.
4. **Architectural Verification:** Prove that your code does not violate the Zero-Trust `TitaniumGate` middleware.

## 3. Code Standards & Maximum Perfection

This codebase demands a level of perfection rarely seen outside of mission-critical aerospace systems.

* **Type Safety:** `any` is strictly prohibited. You must define exhaustive, rigorous TypeScript interfaces.
* **Error Handling:** Silent failures are forbidden. Use the `InstitutionalErrorBoundary` and emit verifiable logs for all exceptions.
* **Asynchronous Integrity:** Race conditions must be mathematically eliminated using state locks or singleton patterns. Never assume a promise will resolve sequentially.
* **Aesthetics:** If touching the frontend, your code must respect the existing hyper-premium, high-fidelity UI constraints. We do not accept messy CSS.

## 4. Final Admonition

*"The attainment of absolute perfection transpires not when there remains nothing further to add, but when there is unequivocally nothing left to strip away."*

If your contribution adds unnecessary bloat, it will be discarded. If it refines the system closer to absolute mathematical truth, you will earn your place in the System ecosystem.
