# P2-C.1 Studio Security & Architecture Policy

## 1. Goal
Document the specific application of the P2-C.0 security and architecture policies (Option D Revocation, 24-h JWT, Authoritative checks) to the Studio Mini-App.

## 2. Option D Revocation in Studio
The P2-C.0 decision (ADR 004) enforces **Hybrid Edge JWT + Authoritative Validation**.
Studio applies this as follows:
- **General Reads:** Dashboard rendering and public provenance state rely on Edge JWT validation.
- **Sensitive Reads:** Loading private API keys or unreleased campaigns requires `requireActiveSession()`.
- **Mutations:** ALL mutations (creating campaigns, publishing assets, logging provenance) strictly require `requireActiveSession()` with DB lookup immediately prior to the transaction.

## 3. 24-Hour JWT Window Rule
Studio strictly observes the rule:
`24h de TTL NO significa 24h de autorización universal.`
Endpoints requiring authority implement:
`JWT valid + HumanitySession.revokedAt === null + permission valid`

## 4. ZK Security Hold & Classification
Studio ZK elements are explicitly classified to avoid "ZK-washing":
- **Circuits:** Existing Noir circuits are used as-is. No redesign in P2-C.1.
- **Proofs:** If a proof is generated but not validated by a smart contract on-chain, it must be marked `PARTIAL` or `DEMO`.
- **Inputs:** `public inputs` and `private inputs` are mapped to user session identities.

## 5. Concurrency & Idempotency
Studio mutations enforce strict concurrency controls:
- **Idempotency:** Operations like `Publish` and `Mint` use idempotency keys (derived from `session + nonce + payload`) to prevent duplicate resources on client retries.
- **Revocation Races:** A transaction `T0` (auth) → `T1` (start mutation) → `T2` (revoke) → `T3` (commit) will be mitigated by ensuring the session validation and the mutation share the same transactional context in PostgreSQL (`Prisma.$transaction`).
