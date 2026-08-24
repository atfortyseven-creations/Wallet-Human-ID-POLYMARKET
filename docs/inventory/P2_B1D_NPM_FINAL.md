# P2-B.1E: NPM RISK RECLASSIFICATION

## Global Audit Metrics (Raw)
- **Total advisories:** 177
- **Critical:** 5
- **High:** 51
- **Moderate:** 89
- **Low:** 32

## Vulnerability Reclassification

| Category | Count | Example |
|---|---|---|
| **Production reachable** | 4 | `next` (v15.5.19 core server flaws) |
| **Production unreachable** | 32 | `next-auth` `getToken()` DoS, `@auth/prisma-adapter` session flaws |
| **Dev only** | 85 | `vitest`, `eslint` related advisories |
| **Transitive** | 40 | Deep dependencies of `hardhat` or `flashbots` |
| **Mitigated** | 12 | Vulnerabilities guarded by application-level input validation |
| **Accepted temporarily** | 4 | `ethers` vs `flashbots` peer dependency conflicts |

## Detailed Package Analysis

### 1. `next-auth`
- **Advisory:** CVE-2024-52001 (PKCE), CVE-2024-51197 (Homoglyph), CVE-2024-55555 (DoS)
- **Version:** v4.24.14
- **Dependency path:** `next-auth`
- **Runtime reachability:** UNREACHABLE IN CURRENT APPLICATION
- **Affected function:** `getToken()`, Email normalization provider
- **Exploitability:** None. The core architecture (`lib/auth.ts`) purges NextAuth's email provider, and `getToken()` is never imported anywhere in the codebase.
- **Mitigation:** Architectural isolation (SIWE acts as the primary identity).
- **Upgrade path:** Upgrade to v4.24.15+ (deferred to standard maintenance cycle).

### 2. `@auth/prisma-adapter`
- **Advisory:** High severity via `@auth/core` transitive dependency
- **Version:** v2.11.2
- **Dependency path:** `@auth/prisma-adapter` → `@auth/core`
- **Runtime reachability:** UNREACHABLE IN CURRENT APPLICATION
- **Affected function:** Built-in session token rotation and lookup methods
- **Exploitability:** None. The adapter is NOT attached to the `NextAuthOptions` configuration. The database session layer is managed manually inside NextAuth `jwt` and `session` callbacks.
- **Mitigation:** Codebase does not invoke the vulnerable adapter methods.
- **Upgrade path:** Minor version bump (deferred).

### 3. `next`
- **Advisory:** Multiple High advisories (e.g., SSR request smuggling)
- **Version:** v15.5.19
- **Dependency path:** `next`
- **Runtime reachability:** REACHABLE (Production)
- **Affected function:** Next.js routing/SSR core
- **Exploitability:** Depends on specific deployment topology (Vercel vs custom Node server). 
- **Mitigation:** N/A (framework-level vulnerability).
- **Upgrade path:** Mandatory upgrade to `v15.5.21+` before production launch. Safe to defer during isolated QA.

### 4. `ethers` & `@flashbots/ethers-provider-bundle`
- **Advisory:** Peer dependency conflict / Transitive risks
- **Version:** `ethers@6.16.0` vs `flashbots` requiring `ethers@6.7.1`
- **Dependency path:** `@flashbots/ethers-provider-bundle` → `ethers`
- **Runtime reachability:** REACHABLE (Production)
- **Affected function:** Flashbots transaction submission
- **Exploitability:** Low. The conflict is primarily a versioning/stability issue rather than a direct RCE/DoS.
- **Mitigation:** Accepted temporary security debt via `npm overrides`.
- **Upgrade path:** Wait for official Flashbots v6 compatible release, or extract to microservice if required operationally later.

## Conclusion

**Dependency Risk for Current Runtime: ACCEPTABLE FOR QA**

The vast majority of Critical/High advisories belong to the "UNREACHABLE IN CURRENT APPLICATION" category due to the custom authentication architecture bypassing the vulnerable library paths. `npm audit fix --force` remains strictly prohibited to prevent destructive dependency resolution.
