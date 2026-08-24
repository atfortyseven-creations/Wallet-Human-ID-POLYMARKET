# P2-B.1A: FINAL STATUS REPORT

**Date:** 2026-08-20  
**Phase:** P2-B.1A — Adversarial QA (Ephemeral PostgreSQL Environment)

---

## PostgreSQL Environment Discovery

| Test | Result |
|---|---|
| `postgres -V` | NOT FOUND |
| `psql -V` | NOT FOUND |
| Port 5432 probe | `ECONNREFUSED` — no server |
| Windows services (postgres*) | None |
| `C:\Program Files\PostgreSQL` | Does not exist |
| Docker | NOT INSTALLED |
| Chocolatey postgresql | 0 packages installed |
| winget | Available (v1.29.280) |

**PostgreSQL QA: BLOCKED**

---

## Empirical Tests — Full Status

| Test | Status | Reason |
|---|---|---|
| Nonce Concurrency (2 requests) | BLOCKED | No PostgreSQL |
| Nonce Concurrency (5 requests) | BLOCKED | No PostgreSQL |
| Nonce Concurrency (10 requests) | BLOCKED | No PostgreSQL |
| Nonce Concurrency (25 requests) | BLOCKED | No PostgreSQL |
| Nonce Concurrency (50 requests) | BLOCKED | No PostgreSQL |
| Nonce Concurrency (100 requests) | BLOCKED | No PostgreSQL |
| Identity Race (same wallet concurrent) | BLOCKED | No PostgreSQL |
| Session Revocation (cookie reuse after revoke) | BLOCKED | No PostgreSQL |
| Server Restart Persistence | BLOCKED | No PostgreSQL |
| Multi-Instance (A auth → B verify → B revoke → A reject) | BLOCKED | No PostgreSQL |
| Database Invariants (duplicates, orphans) | BLOCKED | No PostgreSQL |

---

## Static Analysis — Completed

| Analysis | Status | Key Findings |
|---|---|---|
| NPM audit (real data, 177 advisories) | COMPLETED | See P2_B1A_NPM_RISK_MATRIX.md |
| JWT algorithm, expiration, cookie flags | ANALYZED | HS256, HttpOnly, Secure=prod, SameSite=lax |
| JWT hardcoded fallback key | GAP FOUND | `VOID_SECRET_*` in source — must not be used in production |
| JWT missing audience/issuer claims | GAP FOUND | `aud` and `iss` not set |
| JWT subject placement | GAP FOUND | `sessionId` in custom claim, not `sub` |
| Session revocation at edge middleware | GAP FOUND | JWT not invalidated — revocation is eventual (within JWT TTL) |
| SIWE URI validation | GAP FOUND | Not compared to server expected URI |
| SIWE chain ID allowlist | GAP FOUND | No allowlist — any chain accepted |
| SIWE domain validation | ANALYZED | Correct — `siwe.verify({ domain })` |
| SIWE signature | ANALYZED | Correct — ECDSA recovery via siwe library |
| Feature flag as security boundary | ANALYZED | CORRECT — flag is NOT a security boundary; backend routes are independent |
| Identity uniqueness constraint | ANALYZED | Correct via `@unique`; error handling for concurrent creation incomplete |
| Revocation endpoint existence | GAP FOUND | No `DELETE /api/auth/siwe/session` endpoint implemented |
| TypeScript compilation | FAIL — pre-existing errors | 55 errors; NONE in new SIWE code (see below) |

---

## Gaps Found (Summary)

| # | Gap | Severity | File | Status |
|---|---|---|---|---|
| G-1 | Hardcoded JWT_SECRET fallback in production code | HIGH | `verify/route.ts:100` | Unfixed — needs env enforcement |
| G-2 | JWT missing `aud` and `iss` claims | MEDIUM | `verify/route.ts:101-109` | Unfixed |
| G-3 | `sessionId` not in standard JWT `sub` claim | LOW | `verify/route.ts:102` | Unfixed |
| G-4 | Session revocation not enforced at edge middleware | HIGH | `middleware.ts` | Architectural — requires KV store or short TTL |
| G-5 | SIWE `uri` not validated against server expected URI | MEDIUM | `verify/route.ts:38-42` | Unfixed |
| G-6 | No chain ID allowlist | MEDIUM | `verify/route.ts:56-75` | Policy decision needed |
| G-7 | Identity creation race condition returns HTTP 500 | LOW | `verify/route.ts:67` | Unfixed — no P2002 handler |
| G-8 | No session revocation API endpoint | HIGH | — | Not implemented |
| G-9 | `next-auth@4.24.14` → DoS via malformed Bearer header (GHSA-xmf8-cvqr-rfgj) | HIGH | `app/api/auth/[...nextauth]` | Not upgraded |
| G-10 | `next@15.5.19` → multiple HIGH advisories (fix: 15.5.21) | HIGH | `package.json` | Not upgraded |

---

## FINAL REPORT

```
PostgreSQL QA          = BLOCKED
Nonce Concurrency      = UNKNOWN (blocked)
Replay Protection      = UNKNOWN (blocked)
Identity Race          = UNKNOWN (blocked)
Session Revocation     = UNKNOWN (blocked)
JWT Security           = ANALYZED (gaps found — see G-1 through G-4)
Multi-Instance         = UNKNOWN (blocked)
Restart Persistence    = UNKNOWN (blocked)
SIWE Validation        = ANALYZED (gaps found — see G-5, G-6)
Identity Consistency   = UNKNOWN (blocked)
Registry Regression    = UNKNOWN (typecheck in progress)
NPM Risk               = REQUIRES WORK (critical/high advisories on runtime packages)
Security Hold          = ACTIVE
```

---

## Required to proceed to empirical tests

Choose one:

**Option A (Chocolatey — requires admin):**
```powershell
choco install postgresql17 --params '/Password:qa_ephemeral_only_not_for_production'
```

**Option B (Neon/Supabase free tier — cloud):**
- Create project at https://neon.tech (free)
- Set `DATABASE_QA_URL` in a local `.env.qa` (do NOT commit)
- I will execute the full battery immediately

**Option C (WSL2):**
- Confirm WSL2 is installed: `wsl --status`
- I will install and configure PostgreSQL in WSL

**P2-C remains blocked.**
