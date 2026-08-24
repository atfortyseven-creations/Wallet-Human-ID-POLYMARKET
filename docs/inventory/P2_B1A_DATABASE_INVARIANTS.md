# P2-B.1A: DATABASE INVARIANTS

## Status: BLOCKED — PostgreSQL Required

All database invariants require a live PostgreSQL instance to verify empirically.

---

## Schema Invariants (from `prisma/schema.prisma`)

### `HumanityIdentity`
| Constraint | Prisma definition | PostgreSQL enforcement |
|---|---|---|
| Primary key | `id String @id @default(uuid())` | `PRIMARY KEY` |
| Wallet uniqueness | `walletAddress String @unique` | `UNIQUE` index |
| Chain binding | `chainId Int` | NOT NULL |

### `HumanitySession`
| Constraint | Prisma definition | PostgreSQL enforcement |
|---|---|---|
| Primary key | `sessionId String @id @default(uuid())` | `PRIMARY KEY` |
| Foreign key to identity | `identity HumanityIdentity @relation(...)` with `onDelete: Cascade` | `FOREIGN KEY` + `ON DELETE CASCADE` |
| Expiration field | `expiresAt DateTime` | NOT NULL |
| Revocation field | `revokedAt DateTime?` | NULLABLE — null means active |
| Index on identityId | `@@index([identityId])` | B-tree index |
| Index on expiresAt | `@@index([expiresAt])` | B-tree index |

### `SiweNonce`
| Constraint | Prisma definition | PostgreSQL enforcement |
|---|---|---|
| Primary key | `id String @id @default(uuid())` | `PRIMARY KEY` |
| Nonce uniqueness | `nonce String @unique` | `UNIQUE` index — this is what prevents concurrent consumption |
| Expiration | `expiresAt DateTime` | NOT NULL |

---

## Invariants to verify empirically (once PostgreSQL available)

```sql
-- Duplicate identities (must = 0)
SELECT walletAddress, COUNT(*) FROM "HumanityIdentity" 
GROUP BY walletAddress HAVING COUNT(*) > 1;

-- Orphan sessions (must = 0)
SELECT s.* FROM "HumanitySession" s
LEFT JOIN "HumanityIdentity" i ON s."identityId" = i.id
WHERE i.id IS NULL;

-- Consumed nonces still present (must = 0 after test run)
-- All SiweNonce rows should be deleted (consumed) or expired
SELECT COUNT(*) FROM "SiweNonce" WHERE "expiresAt" < NOW();

-- Duplicate sessions per wallet in same time window
SELECT i."walletAddress", COUNT(s."sessionId") as session_count
FROM "HumanitySession" s
JOIN "HumanityIdentity" i ON s."identityId" = i.id
WHERE s."revokedAt" IS NULL AND s."expiresAt" > NOW()
GROUP BY i."walletAddress"
HAVING COUNT(s."sessionId") > 1;
```

**All queries: BLOCKED pending PostgreSQL.**

---

## Missing Component — Revocation Endpoint

The database schema supports revocation (`revokedAt` field) but there is currently no API endpoint to trigger it. Revocation can only be done via direct DB manipulation.

**Required before pilot go-live:**
```
DELETE /api/auth/siwe/session
→ sets HumanitySession.revokedAt = NOW()
→ does NOT invalidate JWT immediately (gap documented in SESSION_RESULTS)
→ prevents session from being used at the session introspection endpoint
```
