# P2-B.1E: BUILD DETERMINISM

## Root Cause Analysis

`npm run build` previously had this script:
```
prisma generate && prisma db push --accept-data-loss && next build
```

`prisma db push` connects to the database URL at build time to synchronize schema. This hardcoded a database dependency into the build pipeline, violating the separation of concerns between compile-time and runtime.

**Additionally**, the P2-B.1C remediation introduced a module-level `throw` in `app/api/auth/studio/route.ts`:
```typescript
const JWT_SECRET = process.env.JWT_VERIFICATION_SECRET;
if (!JWT_SECRET) throw new Error('CRITICAL: JWT_VERIFICATION_SECRET missing'); // ← BREAKS BUILD
```

Next.js eagerly evaluates all route module exports during `next build` → `Collecting page data`. This evaluation runs **without production secrets injected** (secrets are only available at container runtime on Railway/Vercel). The throw executes during build, not at request time.

## Fixes Applied

### 1. Removed `prisma db push` from `build` script
```diff
- "build": "... && prisma db push --accept-data-loss && next build"
+ "build": "... && next build"
```

`db push` moved exclusively to `db:sync` script for intentional schema sync operations.

### 2. Moved secret validation inside handler (lazy pattern)
```typescript
// BEFORE (breaks build)
const JWT_SECRET = process.env.JWT_VERIFICATION_SECRET;
if (!JWT_SECRET) throw new Error('...');

// AFTER (build-safe, fail-closed at request time)
function getStudioSecret(): string {
  const s = process.env.JWT_VERIFICATION_SECRET;
  if (!s) throw new Error('[SECURITY FATAL] JWT_VERIFICATION_SECRET is not set.');
  return s;
}
// called only inside GET handler
```

This pattern is already used correctly in `lib/jwt.ts`, `lib/session.ts` and `middleware.ts`.

## Build/DB Contract

| Phase | Database Required | Secret Required | Notes |
|---|---|---|---|
| `npm run build` | **NO** | **NO** (lazy validation) | Only `prisma generate` runs — generates client types, no DB connection needed |
| `npm run db:sync` | **YES** | YES (`DATABASE_URL`) | Intentional schema push — run only against QA or production deliberately |
| `npm run test:unit` | **NO** | Minimal (test setup) | Pure logic, no DB |
| `npm run test:integration` | **YES** | YES (`DATABASE_QA_URL`) | Requires isolated QA PostgreSQL |
| `npm run dev` | **YES** | YES (`DATABASE_URL`) | Standard development server |
| Production deploy | **YES** | YES (all secrets) | Managed database, full secrets injected at runtime |

## Build Anti-Patterns (Prohibited)

- `prisma db push` in `build` script
- Module-level `throw` on missing env vars in route files
- `process.env.SECRET || 'hardcoded-fallback'` (replaced with lazy getters)
- `try/catch` that silently swallow missing secrets
- SQLite or in-memory DB fallbacks at build time

## Current Build Status

After fixes: `npm run build` passes `prisma generate` and proceeds to Next.js compilation.
Build blockers remaining:
- Pre-existing TypeScript errors (55 errors, all pre-existing before P2-B work)
- Pre-existing module warnings (`encoding` not found in `@metamask/sdk`)

These are **pre-existing issues** unrelated to P2-B.1E and are documented in `P2_B1D_REGRESSION.md`.
