# P2-A: NPM VULNERABILITY ANALYSIS & SECURITY HOLD
**Date:** 20 August 2026

## Executive Summary
A blind `npm audit fix --force` was explicitly rejected to prevent runtime destruction. The repository currently has 176 vulnerabilities (3 Critical, 76 High). 

## Detailed Analysis of High/Critical Vulns

### 1. Prisma Adapter (Critical)
- **Package:** `@auth/prisma-adapter`
- **Severity:** CRITICAL
- **Transitive/Direct:** Direct
- **Exploitability:** Requires specific malformed payloads during NextAuth session creation.
- **Affected Path:** `app/api/auth/[...nextauth]/route.ts`
- **Current Version:** Undefined (likely outdated beta).
- **Candidate Fix:** Upgrade to `@auth/prisma-adapter@latest`.
- **Breaking Change:** Low. The adapter schema hasn't changed drastically.
- **Action:** Upgrade in isolation. P0 Priority.

### 2. NextAuth Core (Critical)
- **Package:** `@auth/core`
- **Severity:** CRITICAL
- **Transitive/Direct:** Transitive (via `next-auth`)
- **Action:** Wait for NextAuth v5 stabilization or manual resolution. Mitigated by our move towards SIWE as the canonical primitive.

### 3. Flashbots vs Ethers Conflict (High - The Block)
- **Conflict:** `@flashbots/ethers-provider-bundle` strictly requires `ethers@6.7.1` (peer dependency). The root project forces `ethers@6.16.0`.
- **Severity:** HIGH
- **Runtime Impact:** Resolving this forcefully breaks either Flashbots (MEV protection) or general Web3 features relying on newer ethers.
- **Recommended Action:** ACCEPTED RISK temporarily. Flashbots bundle must be forked or updated, or we downgrade root `ethers` if no breaking features are used. Documented as a known compatibility decision, not ignored.

### 4. Hardhat Ecosystem (High)
- **Packages:** `@nomicfoundation/hardhat-*` (Chai matchers, ethers, ignition).
- **Severity:** HIGH
- **Transitive/Direct:** Direct
- **Runtime/Dev:** Dev-only.
- **Exploitability:** Local execution only. Does not affect the Next.js production runtime.
- **Recommended Action:** Upgrade devDependencies in a dedicated PR. P2 Priority.

### 5. Ledger SDKs (High)
- **Packages:** `@ledgerhq/hw-app-eth`, `@ledgerhq/evm-tools`, `@ledgerhq/domain-service`
- **Severity:** HIGH
- **Runtime/Dev:** Runtime (Client-side).
- **Exploitability:** If user connects a Ledger, malicious dApp data could be mishandled.
- **Recommended Action:** Upgrade in isolation. Test Ledger connection explicitly before merging. P1 Priority.

## Conclusion & Strategy
We will NOT perform a mass upgrade. The strategy is:
1. Upgrade `devDependencies` (Hardhat) to clear the noise.
2. Upgrade `@auth/prisma-adapter` and test NextAuth fallback logins.
3. Keep `ethers` frozen to satisfy Flashbots until a compatible bundle is released, accepting the risk as a known architectural constraint.
