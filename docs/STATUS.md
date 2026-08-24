# HUMANITY LEDGER CAPABILITY MATRIX
**Last Updated:** August 2026
**Status:** Living Document

This document represents the canonical source of truth for the platform's actual state of decentralización, integration, and deployment.

## Ecosytem Mini-Apps & Modules

| Module | Status | Deployment / Execution | Canonical Data Source | ZK Privacy |
|---|---|---|---|---|
| **Portfolio Terminal** | BETA | Client-side + Vercel/Railway | Ethereum (via Alchemy) | None |
| **Whale Chat** | BETA | Client-side XMTP Node | XMTP Network | **Simulated** (Auth) |
| **Studio Provenance** | PILOT | Client-side + Postgres (P2-C.1) | PostgreSQL | None |
| **Governance** | PARTIAL | Client-side | Snapshot (Off-chain) | None |
| **Whale Intelligence** | LIVE | Background Workers + Postgres | PostgreSQL | None |
| **Registry** | PILOT | Client-side + SIWE Auth (P2-B.1F) | PostgreSQL | None |
| **Academy** | LIVE | Next.js API | PostgreSQL | None |
| **Forum (Whale Post)** | LIVE | Next.js API | PostgreSQL | None |
| **Identity (SIWE)** | PILOT | PostgreSQL + Edge Middleware Hybrid | PostgreSQL (Canonical) | None |

## Cryptographic & Blockchain Infrastructure

| Capability | Status | Implementation Detail | Network |
|---|---|---|---|
| **EIP-191 Signatures** | LIVE | Used for SIWE and off-chain data integrity | Agnostic |
| **Aztec L2 Rollup** | PLANNED | Awaiting Aztec v5 Mainnet | None |
| **Noir Circuits** | PLANNED | Circuits exist in `noir-projects/` but are not connected | None |
| **ZK Proving** | **SIMULATED** | `/api/zk/prove` currently uses HMAC-SHA256 mocks | Off-chain |
| **Smart Contracts** | PLANNED | 17 contracts written in `contracts/`, none deployed | None |

## Data Layer (Sources of Truth)

| Data Store | Purpose | State |
|---|---|---|
| **PostgreSQL** | Primary source of truth for all application state, intelligence events, forums, and user profiles. | Canonical |
| **Redis (Upstash)** | Ephemeral state, queues, WebSockets, BullMQ. | Cache / Queue |
| **Neo4j** | Graph queries. (Schema defined, but disconnected). | Prototype |
| **Ethereum Mainnet** | Read-only source for balances and whale activity via indexers. | Read-Only |

## Legend
- **LIVE:** Fully implemented and running in production.
- **BETA:** Implemented and functional, but uses external APIs or may lack edge-case handling.
- **PARTIAL:** UI exists, backend stores data, but missing core advertised capabilities (e.g., missing on-chain anchoring).
- **DEMO:** Prototype or sandbox.
- **PLANNED:** Code exists in repo (e.g., contracts, circuits) but is explicitly not deployed or connected to production yet.
- **SIMULATED:** The application fakes the behavior (e.g., symmetric hashes masquerading as ZK proofs) pending the actual cryptographic implementation.
