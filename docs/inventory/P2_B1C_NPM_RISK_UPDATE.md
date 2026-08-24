# P2-B.1C: NPM VULNERABILITY RISK UPDATE

## Status: REQUIRES WORK (but safely scoped for P2-B.1A progression)

The codebase has 177 NPM advisories. A surgical analysis of the critical and high advisories affecting the authentication and core Next.js packages was conducted.

### 1. next-auth (v4.24.14)
**Advisories:**
- **CVE-2024-52001 (High):** OAuth PKCE not provider-bound.
- **CVE-2024-51197 (High):** Email normalizer homoglyph bypass (`@` vs `＠`).
- **CVE-2024-55555 (High):** DoS via malformed Bearer token in `getToken()`.

**Reachability Analysis:**
- **Email Bypass:** NOT REACHABLE. Email provider is completely purged from `lib/auth.ts`.
- **DoS getToken():** NOT REACHABLE. Codebase scan confirms `getToken` from `next-auth/jwt` is never imported or used.
- **PKCE:** POTENTIALLY REACHABLE for the Google Provider used in the Status/Subscriptions portal, but the impact is scoped to that specific OAuth flow, not the core SIWE identity system.

**Remediation Plan:** Upgrade to `4.24.15+` is safe and non-breaking. However, it does not block the empirical PostgreSQL QA since the SIWE system is independent.

### 2. @auth/prisma-adapter (v2.11.2)
**Advisory:** High severity via `@auth/core` transitive dependency.
**Reachability Analysis:** The Prisma adapter is currently NOT used by `next-auth` in `lib/auth.ts` (the database interaction is handled manually in the `jwt` and `session` callbacks). Thus, the vulnerability within the adapter's built-in session methods is **NOT REACHABLE**.

### 3. next (v15.5.19)
**Advisory:** Multiple High advisories patched in v15.5.21+.
**Remediation Plan:** Routine minor version bump required. No immediate blockers for SIWE QA.

### 4. ethers vs @flashbots/ethers-provider-bundle
**Conflict:** `ethers` is locked at `6.16.0`, but Flashbots requires `6.7.1`.
**Status:** The current `npm overrides` approach remains an **ACCEPTED TEMPORARY SECURITY DEBT**. Refactoring this into a microservice is explicitly rejected unless operational requirements dictate it, as introducing a new boundary adds unnecessary complexity.

## Conclusion
The critical vulnerabilities in NPM packages related to authentication are either structurally **unreachable** due to our custom `lib/auth.ts` implementations or safely isolated. 

**Decision:** We can proceed to P2-B.1A Empirical QA without blindly executing `npm audit fix --force`. Dependency upgrades will be batched into a standard maintenance PR after P2-B validation.
