# HUMANITY LEDGER — ZK, CONTRACTS & SECURITY INVENTORY
**Phase 0 — Security & Web3 Audits**
**Date:** 20 August 2026

---

## 1. BLOCKCHAIN & CONTRACT INVENTORY

### Reality Check: On-Chain vs Off-Chain
**Finding:** Despite being marketed as a "ZK-rollup ecosystem settled on Aztec", **there are exactly ZERO deployed smart contracts on any network (Mainnet, L2, or testnet)**.
- `hardhat.config.js` contains definitions for Base, Optimism, Polygon, and World Chain.
- `contracts/` contains 17 Solidity files (AegisCircuitBreaker, LedgerPass, HumanTimeLock, DeadMansSwitch, etc.)
- **No `ignition/deployments/` exists.** No addresses are hardcoded in the frontend except for standard ERC20 tokens (USDC, WETH, WBTC) and a deprecated Aztec Connect Rollup Processor address (`0xFF1F2B4ADb9dF6FC8eAFecDcbF96A2B351680455`).

### Contract Status
| Contract | Purpose | Status | Deployments |
|---|---|---|---|
| `CoreAirdrop.sol` | QDS Airdrop | NOT DEPLOYED | None |
| `CoreLedger.sol` | QDS Ledger | NOT DEPLOYED | None |
| `LedgerPass.sol` | NFT Membership | NOT DEPLOYED | None |
| `HumanTimeLock.sol` | Vault | NOT DEPLOYED | None |
| `DeadMansSwitch.sol`| Inheritance | NOT DEPLOYED | None |
| `SystemForumAnchor.sol`| Forum sync | NOT DEPLOYED | None |

---

## 2. ZK (ZERO KNOWLEDGE) INVENTORY

### Reality Check: ZK Claims vs Code
**Finding:** The platform claims to use Aztec PXE and Noir circuits for identity and messaging. **In reality, ZK proofs are being simulated with HMAC-SHA256 signatures.**

1. **Noir Circuits (`noir-projects/circuits/`)**
   - 19 circuit directories exist (e.g., `ledger_chat`, `forum-zk-auth`, `zk-dna-biometrics`).
   - None of them are compiled (`target/` missing) or integrated into the Next.js app.
   - The CI workflow compiles them but does not deploy verifiers.

2. **The "Silent Mock" (`app/api/zk/prove/route.ts`)**
   - **Severity:** CRITICAL
   - **Code:** Computes a SHA-256 hash of a payload, signs it with a server-side HMAC secret, and returns it as a "proofId" labeled `backend: 'UltraHonk/Barretenberg'`.
   - **Implication:** The app tells users it is generating zero-knowledge proofs, but it is actually using symmetric server-side encryption. This is a severe architectural contradiction.

3. **`lib/snark.ts`**
   - Uses `snarkjs` to load `/circuits/universalAttestation.wasm`.
   - The `.wasm` and `.zkey` files do not exist in the repo.
   - Fallback logic: `proof = new Uint8Array([0x0])`.
   - **Implication:** Silent fallback to an empty byte array if the proving key is missing.

---

## 3. SECURITY INVENTORY & VULNERABILITIES

### Critical Vulnerabilities
1. **Hardcoded Credentials:**
   - `workers/indexer.ts` contains hardcoded GetBlock WebSocket URLs with API keys: `wss://shared.us-east-1.getblock.io/d53ccda1da9f451999b60cd4e0871a27`.
2. **NPM Audit:**
   - GitHub reports **176 vulnerabilities (3 critical, 76 high)**. The `security.yml` action should be blocking on these, suggesting `main` is either bypassing CI or ignoring the audit step.
3. **Mock Cryptography:**
   - As stated above, the ZK proofs are HMAC simulations. If a user relies on this for privacy (e.g., in LedgerChat), the server can actually read the metadata.
4. **No Database Reorg Handling:**
   - The indexers (`humanity-indexer.ts`) push directly to PostgreSQL without handling blockchain reorganizations. If a reorg occurs, the local database is permanently corrupted relative to the chain.

### Defensive Audit (Auth & Sessions)
- **Strengths:** The QR handoff protocol (`app/api/auth/qr-*`) is robust, utilizing ephemeral keys and polling to bridge a mobile enclave to a desktop session without passing private keys.
- **Weaknesses:** Multiple parallel identity systems (SIWE, JWT, NextAuth) exist without a unified source of truth.

---

## 4. DATA SOURCES OF TRUTH

| Datastore | Classification | Reality |
|---|---|---|
| PostgreSQL (Prisma) | Canonical | Actually stores 100% of user data, forum posts, and "blockchain" events. |
| Blockchain | External Source | Read-only. The system reads balances from Ethereum but writes nothing back. |
| Redis | Ephemeral | Used correctly for WebSockets, chat queues, and BullMQ. |
| Neo4j | Prototype | Schema exists, but not wired to production data paths. |
