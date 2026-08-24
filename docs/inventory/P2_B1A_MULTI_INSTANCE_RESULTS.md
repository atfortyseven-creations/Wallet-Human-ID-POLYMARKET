# P2-B.1A: MULTI-INSTANCE & RESTART RESULTS

## Status: BLOCKED — PostgreSQL Required

Multi-instance and server restart tests require:
1. A live PostgreSQL database (BLOCKED — see P2_B1A_POSTGRES_QA.md)
2. Two running Next.js instances with shared DATABASE_URL

---

## Design Analysis (Not Empirical)

### Server Restart Test — Expected behavior

**Authentication flow:**
1. Client POSTs SIWE message → `/api/auth/siwe/verify`
2. Server deletes nonce from `SiweNonce` (DB)
3. Server creates `HumanitySession` in DB
4. Server creates JWT containing `{ sessionId, identityId, walletAddress }`
5. Server sets `humanity_session` cookie with JWT value

**After server restart:**
- The JWT cookie in the client is unchanged
- The `HumanitySession` row in PostgreSQL is unchanged
- The `HumanityIdentity` row in PostgreSQL is unchanged
- When the client makes a new request:
  - Edge middleware verifies the JWT signature (uses `JWT_SECRET` env var)
  - `GET /api/auth/siwe/session` verifies JWT, looks up `HumanitySession` in DB

**Expected result:** Authentication survives restart. The identity is DB-persistent.

**Precondition for this to hold:** `JWT_SECRET` must be the same after restart (env var). If `JWT_SECRET` changes between deployments, all existing JWTs become invalid (this is actually desirable for forced logout on secret rotation, but must be a conscious decision).

### Multi-Instance Test — Expected behavior

**Two instances (A and B) with shared `DATABASE_URL` and `JWT_SECRET`:**

- Login on Instance A → JWT signed with shared `JWT_SECRET`, `HumanitySession` in shared DB
- Request on Instance B → JWT verified with same `JWT_SECRET`, `HumanitySession` found in same DB → SUCCESS
- Revoke on Instance B → `HumanitySession.revokedAt` set in shared DB
- Request on Instance A → JWT still valid at middleware (gap identified in P2_B1A_SESSION_RESULTS.md), but `GET /api/auth/siwe/session` would return `authenticated: false`

**Gap:** Instance A's edge middleware does not see the revocation until the JWT expires (24h). This is the same session revocation gap documented in SESSION_RESULTS.

### Requirement to run empirical test

```bash
# Terminal 1 (Instance A)
DATABASE_URL=$DB_QA PORT=3000 npm run dev

# Terminal 2 (Instance B)  
DATABASE_URL=$DB_QA PORT=3001 npm run dev

# Test script
node scripts/p2_b1_adversarial_qa.ts
```

**Currently: BLOCKED — No PostgreSQL and no DATABASE_URL.**

---

## Database Invariants — Design Analysis

After all tests, the following invariants must hold:

| Invariant | Mechanism | Verified? |
|---|---|---|
| `HumanityIdentity.walletAddress` is unique | `@unique` constraint in Prisma schema | DESIGN — empirical BLOCKED |
| No orphan `HumanitySession` (sessionId without valid identityId) | FK relation with `onDelete: Cascade` | DESIGN — empirical BLOCKED |
| Consumed nonces do not remain in `SiweNonce` | Atomic DELETE on verify | DESIGN — empirical BLOCKED |
| Expired `SiweNonce` rows are cleaned up | Async cleanup in nonce route | DESIGN — async, not guaranteed |
| `HumanitySession.revokedAt` not null after revocation | Application sets it | No revocation endpoint exists yet — GAP |

**Missing component:** There is no `DELETE` or `PATCH /api/auth/siwe/session` endpoint to trigger revocation. Revocation can only be done directly via database at this point. This must be implemented before the pilot goes live.
