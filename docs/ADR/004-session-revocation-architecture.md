# ADR 004: Session Revocation Architecture

## Status
Approved

## Context
With the introduction of SIWE and canonical identities (P2), we establish a `HumanitySession` in the PostgreSQL database and issue a `humanity_session` JWT to the client. The gap identified in P2-B.1F is that while `HumanitySession.revokedAt` is set in the database upon logout/revocation, the JWT remains cryptographically valid until its expiration (TTL). 

This introduces a synchronization gap between the **authoritative session state** and the **authentication credential validity**. We must formalize a Revocation Architecture that addresses this gap based on the specific threat model of Humanity Ledger.

## Security Classification & Threat Model

Not all operations carry the same risk. We classify operations into strict categories to determine their revocation requirements:

| Operation Type | Description | Maximum Revocation Latency | Authority Required | Accept Cached JWT? |
|---|---|---|---|---|
| **PUBLIC READ** | Landing page, public metrics, anonymous assets | N/A | None | N/A |
| **AUTHENTICATED READ** | Dashboard layout, non-sensitive user profile | `SESSION_ACCESS_TTL` (24h) | Edge JWT | Yes |
| **SENSITIVE READ** | Portfolio balance, private messages, PII | Immediate (0ms) | DB Authoritative | No |
| **STATE MUTATION** | Updating profile, claiming public airdrops | Immediate (0ms) | DB Authoritative | No |
| **FINANCIAL OP.** | Transferring assets, trades, withdrawing | Immediate (0ms) | DB Authoritative | No |
| **ADMIN OP.** | Modifying system state, managing users | Immediate (0ms) | DB Authoritative | No |
| **SECURITY OP.** | Password reset, enclave pin reset, 2FA | Immediate (0ms) + Re-Auth | DB Authoritative | No |

### The Revocation Race Condition
**Scenario:**
- T0: Session valid
- T1: Request authenticated via Edge JWT
- T2: User session revoked by admin or user from another device
- T3: Sensitive operation executes

**Analysis:** If the sensitive operation relies *only* on the T1 Edge JWT validation, it will execute successfully despite the T2 revocation. For any operation classified as SENSITIVE READ or higher, this is **UNACCEPTABLE**. The authorization must be evaluated in the exact same transaction flow that protects the operation, by querying the authoritative `HumanitySession` state in PostgreSQL immediately before the action.

## Considered Options

### Option A: Short-lived JWT + Refresh Token
Issue a 5-minute JWT and a 7-day HTTP-only refresh token. The edge validates the JWT. The refresh endpoint checks the DB and issues a new JWT if the session isn't revoked.
- **Security:** Good. Max latency is 5 minutes.
- **Latency:** Edge reads are fast.
- **Complexity:** High. Requires robust token rotation, reuse detection (CSRF risks), and client-side refresh logic.

### Option B: Opaque Session Token + DB Authority
Issue an opaque UUID token. Every request queries PostgreSQL to validate the token and retrieve the session state.
- **Security:** Perfect. Absolute immediate revocation (0ms latency).
- **Latency:** High for reads. Adds DB roundtrip to every Edge request.
- **Scalability:** Poor. Can cause DB bottleneck during traffic spikes. Edge middleware cannot validate it.

### Option C: JWT + Session Version (Revocation Counter)
JWT contains `sessionVersion=1`. DB contains `currentVersion=1`. To revoke, DB increments `currentVersion=2`. Protected API checks if JWT version matches DB.
- **Security:** Good for state mutations (which check DB anyway).
- **Complexity:** Prevents storing a massive blacklist of revoked JWTs, but still requires a DB lookup to check the version. Essentially identical to Hybrid (Option D) but with integer comparison instead of boolean `revokedAt`.

### Option D: Hybrid Edge JWT + Authoritative Validation
Issue a standard JWT (`SESSION_ACCESS_TTL` = 24h). Edge middleware cryptographically validates the JWT for general access (Authenticated Read). For Sensitive Reads and Mutations, the protected API route must imperatively query PostgreSQL (`prisma.humanitySession.findUnique`) to assert `revokedAt === null` *before* executing the action.
- **Security:** 0ms latency for critical operations. 24h latency for non-sensitive reads.
- **Scalability:** Excellent. Public/Authenticated reads are served at Edge.
- **Complexity:** Low. No token rotation required. Explicit code boundary (devs must use `requireActiveSession()` for mutations).

## Decision
We select **Option D: Hybrid Edge JWT + Authoritative Validation**.

This satisfies the threat model efficiently:
- We don't overwhelm the database with reads for generic dashboard renders.
- Financial and Security operations will always perform a direct DB lookup to verify `revokedAt`, guaranteeing absolute immediate revocation.
- We establish a single source of truth for TTL: `SESSION_ACCESS_TTL = 24 * 60 * 60` (24h) centralized in `lib/session.ts`.

## Consequences
- **Code Contract:** All sensitive API routes must use an authoritative DB lookup wrapper (e.g., `getAuthoritativeSession(req)`) rather than just relying on `verifyJWT(req)`.
- **JWT Content:** The JWT will remain minimal (`sub`, `sid`, `iat`, `exp`, `iss`, `aud`), avoiding PII or compressed database state.
- **TTL Discrepancy Resolved:** The documentation and code strictly define expiration (24h) distinct from authoritative revocation (immediate).
- **Key Management:** Keys are rotated via environment variable changes. Invalidating a key immediately invalidates all JWTs, functioning as a system-wide logout.
