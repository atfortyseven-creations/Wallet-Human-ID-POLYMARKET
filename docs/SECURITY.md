# Humanity Ledger Security Architecture

## 1. Zero Trust Identity (SIWE)
- **Canonical Identity**: Users authenticate exclusively via SIWE (Sign-In with Ethereum). 
- **Fail Closed**: Missing required environment variables (e.g. `JWT_SECRET`) cause the application to crash immediately in production, preventing default or predictable secret usage.
- **URI & Domain Validation**: SIWE requests are strongly bound to `NEXT_PUBLIC_APP_URL` and `ALLOWED_CHAIN_IDS`.
- **Hybrid Revocation (Option D)**: Edge middleware performs O(1) cryptographic verification for spam protection (up to 24h JWT TTL). Sensitive mutations (e.g. Studio Provenance anchoring, airdrop claims, transfers) must explicitly query PostgreSQL `HumanitySession.revokedAt` in the same transaction block to ensure 0ms revocation enforcement.
- **Studio Pilot (P2-C.1)**: Mutations in the Studio app act as the strict test-bed for Option D architecture under concurrent load.

## 2. Secrets Management
- Fallback secrets are banned in production.
- `requireSecret()` from `lib/security/env-assert.ts` enforces fail-closed initialization.
- Cryptographic domains are separated (e.g. JWT signing vs Enclave PIN hashing).

## 3. NPM Risk Mitigation
- We acknowledge critical dependencies in upstream `ethers` and `next-auth` packages but maintain strict isolation:
- `next-auth` is strictly limited to Google OAuth for the Status dashboard and does NOT invoke reachable vulnerable paths like `getToken()`.
- Upgrade strategies favor surgical patches and isolation over destructive `npm audit fix --force`.

## 4. Ephemeral Postgres QA
- Core identity invariants (no duplicate addresses, atomic nonce consumption) require dynamic QA verification against a real, ephemeral PostgreSQL instance prior to major application refactoring.
