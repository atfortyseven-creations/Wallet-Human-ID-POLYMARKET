# P2-C.1 Studio Mutations & Operations

## 1. Mutations (STUDIO_MUTATION_MAP)
*   **Create Passport**: **mutation** (`POST /api/passport`) — Commits core passport fields and nested schemas to the database.
*   **Spend Quantums (QDs)**: **financial** (`spendQDs(5)`) — Submits ledger deduction of internal QD tokens before allowing operations.
*   **Anchor Request**: **mutation** (`POST /api/aztec/anchor`) — Invokes permanent on-chain network binding state.
*   **Update Registration**: **mutation** (`PATCH /api/passport/[slug]/anchor`) — Associates generated cryptographic values to an existing record.
*   **Event Logging**: **write** (`POST /api/provenance/log`) — Appends event telemetry to the provenance indexer securely.
*   **Register Webhook**: **write** (`POST /api/premium/webhooks`) — Injects webhook hooks for callback automation.
*   **Generate ZK Proof**: **cryptographic** (`POST /api/premium/prover`) — Computes cryptographic zero-knowledge proofs.
*   **Authorize Gas Sponsorship**: **financial** (`POST /api/premium/paymaster`) — Allocates protocol funds for user transaction execution.

## 2. Taxonomy & Risk
- **CREATE/UPDATE (Passports, Anchor):** High Risk. Will require DB-level authoritative session checks (`requireActiveSession()`).
- **FINANCIAL (Spend QDs, Paymaster):** Critical Risk. Must occur in the same PostgreSQL transaction boundary where session authority is verified to prevent revocation race conditions.
- **CRYPTOGRAPHIC (ZK Prover):** High Risk (Compute). Requires authority check to prevent DoS via expensive off-chain proof delegation.

## 3. Idempotency Analysis
- **Create Passport:** Must use an idempotency key derived from payload entropy to prevent duplicate creations if the client times out and retries.
- **Spend QDs:** Ledger operations must check for double-spends or replay within the same transaction.
- **Anchor Request:** Idempotent by design if tracked via `txHash` state in the passport record.
