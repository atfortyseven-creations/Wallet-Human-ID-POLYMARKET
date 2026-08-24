# P2-B.1: NPM RISK MATRIX & SECURITY DEBT

## Overview
- **Total Advisories:** 176
- **Critical Reachable:** 1 (`@auth/prisma-adapter`)
- **High Reachable:** 3 (`@ledgerhq/*`)
- **High Unreachable (Dev-only):** 6 (`@nomicfoundation/*`, `eslint-plugin-next`)
- **Dependency Causing Conflict:** `ethers@6.16.0` vs `@flashbots/ethers-provider-bundle`
- **Mitigation Status:** Frozen (Accepted Temporary Debt)

## Detailed Risk Matrix

| Package | Vulnerability | Severity | Reachability | Affected Component | Candidate Fix | Resolution Action |
|---------|---------------|----------|--------------|--------------------|---------------|-------------------|
| `@auth/prisma-adapter` | CSRF/Session Hijack | CRITICAL | Reachable | Legacy NextAuth (`/api/auth/[...nextauth]`) | `npm install @auth/prisma-adapter@latest` | P0. Isolate and upgrade independently. |
| `@auth/core` | Signature Bypass | CRITICAL | Transitive | Legacy NextAuth | Await `next-auth` patch | Monitor. SIWE migration will deprecate this. |
| `@ledgerhq/hw-app-eth` | Payload Injection | HIGH | Reachable | Client Wallet connect | `npm update @ledgerhq/*` | P1. Upgrade. |
| `@nomicfoundation/*` | Arbitrary Code Execution | HIGH | Unreachable (Dev) | Local Hardhat | `npm update` (dev) | P2. Upgrade safely. |
| `ethers` (transitive clash) | Flashbots peering | HIGH | Reachable | `humanity-indexer.ts` | Fork Flashbots | ACCEPTED DEBT. |

## Flashbots Ethers Conflict (ADR Extension)
- **Current Version:** The root `package.json` forces `ethers@6.16.0` for modern Web3 components.
- **Conflict:** `@flashbots/ethers-provider-bundle` strictly relies on `ethers@6.7.1` for MEV transaction bundling.
- **Architectural Isolation:** Flashbots is only used by the `workers/humanity-indexer.ts` for MEV extraction/protection. It does NOT touch the SIWE auth pipeline or Registry.
- **Target Resolution:** Fork the flashbots bundle, update its peer dependency, and link it locally; OR isolate the MEV worker into a separate microservice with its own `package.json` bounded to `ethers@6.7.1`.
