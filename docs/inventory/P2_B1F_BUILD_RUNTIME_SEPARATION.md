# P2-B.1F: Build & Runtime Separation Contract

## Infrastructure Requirements per Phase

| Phase | DB Required | Secrets Required | Notes |
|---|---|---|---|
| LINT | No | No | Static analysis only |
| TYPECHECK | No | No | tsc --noEmit |
| UNIT TESTS | No | No | Vitest, pure logic |
| BUILD | No | No | prisma generate + next build |
| INTEGRATION | Yes (QA PG) | QA secrets | Empirical DB tests |
| E2E | Yes (QA PG) | QA secrets | Playwright + HTTP |
| DB MIGRATION | Yes (target DB) | Target DB URL | prisma migrate deploy |
| PRODUCTION | Yes (prod DB) | Full prod secrets | Runtime |

## Verified Build Determinism
- `npm run build` without DB: **PASS** (verified in P2-B.1E)
- `npm run build` with QA DB: **PASS** (identical artifact)

## Fallback Semantics

| Route | Context | Fallback Behavior | Verdict |
|---|---|---|---|
| /academy | SSG build phase | Prisma error → empty courses (explicit catch) | OK — SSG only |
| /api/auth/siwe/verify | Runtime | No fallback — throws to outer catch → 500 | FAIL CLOSED |
| /api/auth/studio | Runtime | requireSecret() throw → 500 | FAIL CLOSED |

## CI Architecture Contract

```
PR → lint → typecheck → unit → build → security
   → provision QA PG → migrate → integration → E2E → destroy QA
```
