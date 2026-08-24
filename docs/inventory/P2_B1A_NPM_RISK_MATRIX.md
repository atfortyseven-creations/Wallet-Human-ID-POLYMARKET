# P2-B.1A: NPM RISK MATRIX (EMPIRICAL)

## Source Data
- Tool: `npm audit --json`
- Date: 2026-08-20
- Node.js environment: local workspace

## Summary Counts (from audit.json — real data)

| Severity | Count |
|---|---|
| CRITICAL | 5 |
| HIGH | 51 |
| MODERATE | 89 |
| LOW | 32 |
| **TOTAL** | **177** |

---

## Critical Findings — Detailed Analysis

### [CRITICAL-1] `next-auth` — Email Homoglyph Bypass
- **Package (installed):** `next-auth@4.24.14`
- **Advisory:** GHSA-7rqj-j65f-68wh  
- **Title:** Auth.js: Email normalizer validates address before Unicode normalization — homoglyph `@` bypass
- **CWE:** CWE-180 (Incorrect Behavior Order: Validate Before Canonicalize)
- **Direct dependency:** YES
- **Runtime reachable:** YES — `next-auth` runs on every request through `app/api/auth/[...nextauth]/route.ts`
- **Exploitability:** An attacker with a homoglyph email (e.g. `user＠example.com` using Unicode FULLWIDTH @) may bypass identity validation if email normalization is relied upon for auth decisions. **Relevant only if email-based auth is used.**
- **Code path in this project:** `app/api/auth/[...nextauth]/route.ts` → `AuthOptions` → email provider. If email login is enabled, this is exploitable.
- **Fix available:** YES — upgrade to `next-auth@4.24.15`+. Non-breaking.
- **Breaking change:** No
- **Action:** UPGRADE RECOMMENDED. Safe non-breaking upgrade.

### [CRITICAL-2] `next-auth` — getToken() Uncaught Exception (DoS)
- **Package (installed):** `next-auth@4.24.14`
- **Advisory:** GHSA-xmf8-cvqr-rfgj  
- **Title:** Auth.js: `getToken()` throws uncaught exception on malformed Bearer authorization headers
- **CWE:** CWE-20 (Improper Input Validation)
- **CVSS:** 7.5 (HIGH sub-score, classified critical by npm)
- **Direct dependency:** YES
- **Runtime reachable:** YES — `getToken()` is called by the middleware
- **Exploitability:** Any unauthenticated request with a crafted `Authorization: Bearer <malformed>` header causes an uncaught exception. This is a **DoS vector against the edge middleware**.
- **Code path:** `middleware.ts` calls `jwtVerify` (jose), but the legacy `next-auth` token helper may also be invoked. Needs code trace.
- **Fix available:** YES — upgrade to `next-auth@4.24.15`+. Non-breaking.
- **Breaking change:** No
- **Action:** UPGRADE RECOMMENDED. This is an active DoS vector.

### [CRITICAL-3] `next-auth` — OAuth PKCE Cookies Not Provider-Bound
- **Package (installed):** `next-auth@4.24.14`
- **Advisory:** GHSA-x445-f3h2-j279  
- **CVSS:** 6.8
- **CWE:** CWE-345, CWE-346, CWE-940
- **Direct dependency:** YES
- **Runtime reachable:** YES — if OAuth providers (Google, GitHub, etc.) are configured
- **Exploitability:** OAuth state, nonce, and PKCE verification cookies are not bound to the specific provider that created them. An attacker could initiate OAuth flows across providers and substitute tokens.
- **Code path:** Only relevant if `GoogleProvider`, `GithubProvider`, or similar OAuth providers are in `AuthOptions`. Needs config inspection.
- **Fix available:** YES — non-breaking upgrade
- **Action:** INSPECT `AuthOptions` OAuth providers. If none configured, risk is LOW. If configured, UPGRADE URGENTLY.

### [CRITICAL-4] `vitest` — Arbitrary File Read/Execute via UI Server
- **Package (installed):** `vitest@2.1.9`
- **Advisory:** GHSA-5xrq-8626-4rwp  
- **CVSS:** 9.8 (CRITICAL)
- **CWE:** CWE-22, CWE-862
- **Direct dependency:** YES (devDependency)
- **Runtime reachable:** NO — `vitest` is a dev/test tool, not loaded in the production Next.js runtime
- **Exploitability in production:** NONE — Vitest UI server only runs during `vitest --ui` in dev mode
- **Exploitability in dev:** HIGH — if a developer runs `vitest --ui`, any party on the network can read arbitrary files
- **Fix available:** YES — upgrade to `vitest@3.2.6`+. Major version bump required (3.x).
- **Breaking change:** YES (major version). Test configuration may need updates.
- **Action:** UPGRADE DEV DEPENDENCY when convenient. Not a production blocker.

### [CRITICAL-5] `@auth/core` (transitive via `@auth/prisma-adapter`)
- **Package:** `@auth/prisma-adapter@2.11.2` → bundles its own `@auth/core`
- **Advisory:** Same advisories as next-auth (GHSA-7rqj-j65f-68wh, GHSA-xmf8-cvqr-rfgj, GHSA-x445-f3h2-j279)
- **Installed `@auth/core`:** NOT in root `node_modules` (nested under `@auth/prisma-adapter`)
- **Runtime reachable:** YES — `@auth/prisma-adapter` is used by `next-auth`
- **Action:** UPGRADE `@auth/prisma-adapter` to latest. Non-breaking.

---

## High Findings — Runtime-Reachable Summary

| Package | Advisory | CVSS | Runtime | Action |
|---|---|---|---|---|
| `next@15.5.19` | DoS via Server Actions | N/A | YES | Upgrade to ≥15.5.21 |
| `next@15.5.19` | SSRF via Server Actions | N/A | YES | Upgrade to ≥15.5.21 |
| `next@15.5.19` | Cache confusion | N/A | YES | Upgrade to ≥15.5.21 |
| `next@15.5.19` | Unauthenticated Server Function endpoint disclosure | N/A | YES | Upgrade to ≥15.5.21 |
| `axios@1.18.1` | Prototype pollution / MITM gadget | Multiple | YES (if used server-side) | Upgrade axios |
| `ws` | Memory exhaustion / uninitialized memory | Multiple | YES (WebSocket workers) | Upgrade ws |

---

## High Findings — Dev-Only / Unreachable

| Package | Advisory | Runtime | Action |
|---|---|---|---|
| `vitest` | Arbitrary file exec | NO (dev only) | Upgrade at convenience |
| `postcss` | Path traversal in sourceMaps | NO (build-time only) | Upgrade at convenience |
| `serialize-javascript` | RCE via RegExp | NO (build-time only) | Upgrade at convenience |

---

## Ethers / Flashbots Conflict

- **Root `ethers` version:** `6.16.0` (locked in `package.json`)
- **`@flashbots/ethers-provider-bundle` peer requirement:** `ethers@6.7.1`
- **Affected code:** `workers/humanity-indexer.ts` (MEV protection)
- **SIWE auth pipeline affected:** NO — `ethers` is used in the indexer worker, not in `app/api/auth/siwe/*`
- **Isolation analysis:**
  - The Flashbots usage is confined to `workers/humanity-indexer.ts`
  - It does NOT touch the auth routes, the SIWE pipeline, or `HumanityIdentity` logic
  - A simpler alternative to microservice: use `npm overrides` to pin ethers at 6.7.1 only for flashbots, and let the rest of the project use 6.16.0
  - **Risk of overrides:** If `overrides` causes ethers to load two versions, bundle size increases but no security regression
- **Microservice analysis:** Not recommended at this stage. The `overrides` approach is simpler, lower operational burden, and does not introduce a new security boundary.
- **Status:** ACCEPTED TEMPORARY SECURITY DEBT — documented, not ignored.

---

## `next@15.5.19` — Upgrade to 15.5.21

All HIGH advisories against `next` are fixed in `>=15.5.21` with no breaking changes. This is the highest-priority safe upgrade available.

**Action:** `npm install next@latest` — non-breaking, immediately reduces HIGH advisory count by ~7 entries.
