# Humanity Ledger Architecture

## 1. Top-Level Design
The Humanity Ledger is designed as a modular ecosystem of "Mini-Apps" operating on a shared core identity layer.

- **Identity Layer (P2):** Currently migrating to `HumanityIdentity` (SIWE-based) using a Hybrid Edge JWT + DB Revocation pattern (Option D).
- **Core Dependencies:** PostgreSQL (Canonical state), Upstash Redis (Ephemeral state), Aztec Mainnet (ZK Data).

## 2. P2-C Migration
The current phase focuses on unifying all Mini-Apps under the SIWE identity.
- **Pilot 1:** `Registry` - Proved Edge Auth & Read APIs.
- **Pilot 2:** `Studio Provenance` - Proving Authoritative Mutations, Shared Storage, and ZK Provenance.

Detailed architectural mappings for the frontend and backend can be found in:
- `docs/inventory/ARCHITECTURE_MAP_FRONTEND.md`
- `docs/inventory/DATA_INVENTORY.md`
- `docs/inventory/P2_C_DESIGN.md`
- `docs/inventory/P2_C1_STUDIO_ARCHITECTURE.md`
