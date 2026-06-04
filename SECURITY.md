# Security Model & Timelock Policy

## 1. Zero-Trust Architecture

Humanity Ledger is built on the **Aztec Network**, ensuring that privacy is a foundational architectural component, not an optional overlay.

- **Client-Side Proving:** Zero-knowledge proofs (Noir circuits) are generated exclusively on the user's local hardware. No raw, unencrypted state is ever transmitted to the sequencer.
- **Encrypted UTXOs:** All asset balances (QDs) and reputational scores are maintained as encrypted UTXOs. Sequencers cannot censor or front-run operations because payloads are fully opaque.
- **Decentralized Sequencer Network:** While transaction ordering is decentralized, the privacy guarantees rely solely on cryptography, not sequencer honesty.

## 2. Timelock Policy

To protect institutional and retail capital against malicious governance upgrades or compromised administrative keys, all protocol smart contracts enforce a strict **Timelock Policy**.

### Timelock Specifications
- **Delay Period:** 7 Days (168 hours)
- **Scope:** All upgrades to the core Token Contract, Ledger Contract, and Circuit Verifiers.
- **Emergency Pause:** A multisig of 3/5 trusted security council members can pause specific functions (e.g., cross-chain bridging) instantly in the event of an actively exploited CVE, but they **cannot** upgrade logic or move funds without the 7-day timelock.

### Upgrade Process
1. A transaction proposing an upgrade is submitted to the Timelock contract.
2. The 7-day delay period begins. The transaction hash and plaintext payload are broadcast via our public `/changelog`.
3. Users have 7 days to evaluate the new circuits/contracts and, if they disagree, withdraw their liquidity back to Ethereum L1 via the canonical bridge.
4. After 168 hours, the upgrade can be executed.

## 3. Web Application Firewall (WAF) & Rate Limiting

The application edge employs a distributed rate limiter (Upstash) and an OWASP-compliant WAF:
- **Rate Limits:** Enforced per-IP and per-Session via a sliding window algorithm to defeat Layer 7 DDoS attacks.
- **CSP & Anti-Tampering:** A dynamic, nonce-based Content Security Policy (CSP) restricts `script-src` and `frame-src`. All inline scripts and `eval()` are strictly prohibited.
- **Replay Protection:** All state-mutating POST requests require a cryptographic nonce and timestamp (`x-system-nonce`, `x-system-timestamp`) enforced within a 60-second validity window.


