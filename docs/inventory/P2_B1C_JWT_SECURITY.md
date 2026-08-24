# P2-B.1C: JWT SECURITY & REVOCATION ARCHITECTURE

## 1. The Edge Revocation Gap — Current Flow

**The exact flow today:**
1. User authenticates via SIWE → `HumanitySession` created in PostgreSQL (Active).
2. Server mints an Edge-compatible JWT containing `sessionId` and signs it with `JWT_SECRET`.
3. Client stores JWT in HttpOnly cookie `humanity_session`.
4. Client requests a protected route.
5. `middleware.ts` (Edge) extracts cookie, verifies signature via `jose.jwtVerify()`.
6. Middleware extracts `sessionAddress` from payload and allows the request, injecting `x-verified-session-address`.
7. Route handler executes based on the injected header.

**What happens on Revocation?**
If `HumanitySession.revokedAt` is set to `NOW()` in PostgreSQL, the DB state is revoked. **However**, if the client still possesses the JWT cookie, `middleware.ts` will continue to validate the cryptographic signature successfully until the JWT naturally expires (currently 24 hours). 

**Conclusion:** `JWT cryptographic validity != session revocation state`. The current architecture exhibits a "best-effort revocation" gap of up to 24 hours for routes protected solely by Edge middleware.

---

## 2. Alternatives for Correct Revocation Design

We must solve this without overloading the database at the Edge, respecting Vercel serverless constraints (connection pooling, latency, regional execution).

### Alternative A: Short-lived access JWT + server-side session introspection
- **Mechanism:** JWT TTL reduced to 5-15 minutes. Client silently refreshes it via an API endpoint that checks `HumanitySession.revokedAt`.
- **Security:** High (max 15m revocation latency).
- **Latency:** Edge is fast O(1), refresh is slow but infrequent.
- **Database Load:** Low (DB hit only on refresh every 15m).
- **Complexity:** Medium (requires frontend refresh logic and interceptors).

### Alternative B: Opaque session identifier + Edge KV lookup
- **Mechanism:** Replace JWT with an opaque `sessionId`. Middleware checks `Vercel KV` (Redis) for session validity on every request.
- **Security:** Maximum (instant revocation).
- **Latency:** Low (KV read at Edge is ~10-20ms).
- **Database Load:** Near zero (DB syncs to KV on write).
- **Complexity:** High (requires maintaining DB ↔ KV consistency, adds Redis dependency).

### Alternative C: JWT + Revocation/Version Mechanism (Selected)
- **Mechanism:** JWT payload includes `sessionVersion` or `issuedAt`. When a session is revoked globally or per-user, a timestamp `user.tokensValidAfter` is updated in the DB.
- **Problem:** Edge middleware still cannot read `tokensValidAfter` from the DB. This does not solve the Edge isolation problem.

### Alternative D: Hybrid Edge/API Authorization
- **Mechanism:** Edge middleware does O(1) JWT signature verification to block unauthenticated spam and DDoS (protecting compute). But **sensitive mutations** (e.g., claiming airdrop, transferring funds) require the API route handler to independently query `HumanitySession.findUnique()` to guarantee revocation state immediately before execution.
- **Security:** Maximum for sensitive actions. Eventual (JWT TTL) for read-only/non-sensitive views.
- **Latency:** Zero impact on static/read paths. One extra query on mutations.
- **Database Load:** Moderate, but manageable (only hits DB on mutation).
- **Complexity:** Low (no KV store needed, no complex frontend refresh).

---

## 3. Selected Architecture: Alternative D (Hybrid Authorization) + Short-lived TTL

**Evidence-based Decision:**
- **Why not B?** Introducing Redis (KV) adds operational burden, cost, and a new failure mode (KV out of sync with Postgres).
- **Why not A purely?** A 15-minute gap on a critical mutation (e.g. withdrawing funds after an account was flagged stolen) is unacceptable.

**The Implementation Plan:**
1. **Reduce TTL:** Reduce JWT expiration from 24h to 1h to limit the window for read-only replay.
2. **Edge spam filter:** `middleware.ts` continues to do O(1) crypto verification.
3. **Critical Mutation Guard:** Introduce a utility `assertSessionNotRevoked(sessionId)` that queries PostgreSQL directly. This must be called inside the route handlers for all sensitive actions (e.g. `POST /api/aztec/*`).
4. **Failure mode:** If DB is down, mutations fail closed (503). Reads continue serving from Edge cache.

**Status:** DESIGN VERIFIED. Implementation pending P2-C.
