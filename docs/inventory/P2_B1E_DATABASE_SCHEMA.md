# P2-B.1E: DATABASE SCHEMA SPECIFICATION

## Status: STATIC ANALYSIS (Empirical PostgreSQL verification BLOCKED — awaiting DATABASE_QA_URL)

This document describes the expected schema as defined in `prisma/schema.prisma` and what PostgreSQL should enforce once the schema is applied.

---

## Tables

### `HumanityIdentity`
| Column | Type | Constraint | Purpose |
|---|---|---|---|
| `id` | `TEXT` (UUID) | PRIMARY KEY, DEFAULT uuid() | Canonical identity ID |
| `walletAddress` | `TEXT` | **UNIQUE**, NOT NULL | Prevents duplicate identities for the same wallet |
| `chainId` | `INTEGER` | NOT NULL | Network the wallet was verified on |
| `walletType` | `TEXT` | NULL | EOA / SMART_ACCOUNT / MULTISIG |
| `verificationStatus` | `TEXT` | NOT NULL | UNVERIFIED / SIWE_VERIFIED / ZK_VERIFIED |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Immutable creation timestamp |
| `lastVerifiedAt` | `TIMESTAMPTZ` | NULL | Updated on each SIWE re-authentication |
| `permissions` | `TEXT[]` | NOT NULL, DEFAULT `{}` | No elevated access by default |

**Critical constraint:** `walletAddress UNIQUE` — Prisma translates this to a PostgreSQL `UNIQUE INDEX`. Any concurrent `INSERT` for the same wallet address will fail with `UNIQUE VIOLATION (23505)`. The `upsert` operation handles this atomically.

### `HumanitySession`
| Column | Type | Constraint | Purpose |
|---|---|---|---|
| `sessionId` | `TEXT` (UUID) | PRIMARY KEY | Session identifier — also the JWT `sub` claim |
| `identityId` | `TEXT` | FOREIGN KEY → HumanityIdentity.id, NOT NULL, ON DELETE CASCADE | Orphan prevention |
| `authenticationMethod` | `TEXT` | NOT NULL | SIWE / LEGACY_JWT |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Session creation time |
| `expiresAt` | `TIMESTAMPTZ` | NOT NULL | Session expiration — checked at introspection |
| `revokedAt` | `TIMESTAMPTZ` | **NULL** | NULL = active session; NOT NULL = revoked |
| `lastSeenAt` | `TIMESTAMPTZ` | NULL | Updated on session introspection |
| `securityContext` | `JSONB` | NULL | Stores IP/UserAgent as telemetry (NOT as identity) |
| `version` | `INTEGER` | NULL | Future: session version for invalidation |

**Indexes:** `identityId` B-tree, `expiresAt` B-tree (for efficient cleanup queries).

**Revocation semantics:** A session is active if `revokedAt IS NULL AND expiresAt > NOW()`. Setting `revokedAt` to any timestamp marks it revoked. This check is NOT performed at the Edge middleware (Edge cannot access PostgreSQL). Sensitive API routes must query this directly.

### `SiweNonce`
| Column | Type | Constraint | Purpose |
|---|---|---|---|
| `id` | `TEXT` (UUID) | PRIMARY KEY | Row identifier |
| `nonce` | `TEXT` | **UNIQUE**, NOT NULL | The challenge nonce |
| `expiresAt` | `TIMESTAMPTZ` | NOT NULL | Nonce TTL (typically 10 minutes) |

**Replay protection mechanism:** The route deletes the nonce row atomically (`DELETE WHERE nonce = ?`). If two concurrent requests attempt to consume the same nonce:
- **Request A:** `DELETE` succeeds → returns the deleted row.
- **Request B:** `DELETE` finds no row → Prisma throws `P2025` (record not found) → route returns 400.

The mechanism that makes this safe is **PostgreSQL's row-level locking on the DELETE statement** combined with the `UNIQUE` constraint. The `DELETE` statement acquires an exclusive row lock. The second concurrent `DELETE` for the same `nonce` will block, then find the row already gone. This is NOT a "row-level lock" in the explicit `SELECT FOR UPDATE` sense — it is the **implicit exclusive lock acquired by any DML operation on a row**. The `UNIQUE` index ensures only one row can match.

---

## Schema Verification Queries (To Execute After Applying Schema)

```sql
-- Verify all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  AND tablename IN ('HumanityIdentity', 'HumanitySession', 'SiweNonce');

-- Verify unique constraints
SELECT indexname, indexdef FROM pg_indexes
  WHERE tablename IN ('HumanityIdentity', 'SiweNonce')
  AND indexdef LIKE '%UNIQUE%';

-- Verify foreign key from Session → Identity
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE constraint_name LIKE '%identityId%';

-- Verify revocation field (nullable)
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'HumanitySession' AND column_name = 'revokedAt';

-- Verify expiration field (not nullable)
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'HumanitySession' AND column_name = 'expiresAt';
```

**Status:** STATIC SPECIFICATION COMPLETE. Empirical verification = BLOCKED (no PostgreSQL).
