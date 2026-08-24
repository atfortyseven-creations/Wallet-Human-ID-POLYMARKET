# P2-B.1E: ENVIRONMENT DEFINITIONS

## Lifecycle Environments

### BUILD
- **Database:** NOT REQUIRED
- **Secrets:** NOT REQUIRED (lazy validation deferred to request time)
- **Script:** `npm run build`
- **What runs:** `prisma generate` (generates TypeScript client from schema — no DB needed), `next build` (compile, bundle, static analysis)
- **What does NOT run:** `prisma db push`, `prisma migrate`, any HTTP server

### DEVELOPMENT
- **Database:** Developer's local PostgreSQL OR Railway dev branch
- **Secrets:** Local `.env.local` (never committed)
- **Script:** `npm run dev`
- **Prisma:** `npm run db:sync` run manually when schema changes

### QA / INTEGRATION TESTING
- **Database:** Isolated, ephemeral PostgreSQL — no production data
- **Secrets:** Ephemeral `DATABASE_QA_URL` set in shell only (never committed)
- **Script:** `npm run test:integration` (to be created)
- **Bootstrap:** `scripts/qa_bootstrap.ts` — provision → migrate → seed → test → destroy
- **Constraint:** Credentials revoked/destroyed after test run

### PRODUCTION
- **Database:** Managed Railway/Supabase/Neon production PostgreSQL
- **Secrets:** Railway environment variables — never in source
- **Schema changes:** Via `prisma migrate deploy` (versioned migrations, NOT `db push`)
- **Zero downtime:** Migration strategy documented separately

---

## Chain Policy (Environment-Aware)

`ALLOWED_CHAIN_IDS` is currently hardcoded as `[137, 31337]` in `app/api/auth/siwe/verify/route.ts`. This is a build-time constant and does NOT respect environment context. This is a gap.

### Required Configuration Design

```typescript
// app/api/auth/siwe/verify/route.ts — proposed
function getAllowedChainIds(): number[] {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    return [137]; // Polygon Mainnet ONLY
  }
  if (process.env.APP_ENV === 'qa') {
    return [80002]; // Polygon Amoy testnet
  }
  // development / local
  return [137, 80002, 31337]; // + Hardhat local
}
```

**Mapping:**
| ID | Network | Environment |
|---|---|---|
| `137` | Polygon Mainnet | PRODUCTION only |
| `80002` | Polygon Amoy (testnet) | QA / staging |
| `31337` | Hardhat local | DEVELOPMENT only — must NEVER reach production |

**Current Gap:** `31337` is included without environment guard. Must be fixed before production deploy.

---

## `NEXT_PUBLIC_APP_URL` Security Note

`NEXT_PUBLIC_APP_URL` is a **server-configured** value used as the expected origin. Although it is a `NEXT_PUBLIC_*` variable (injected into client bundles at build time), it is NOT trusted as a client-controlled input. Its value is read on the **server side** in `verify/route.ts` to compare against `siweMessage.uri`.

Security boundary: the SIWE signature itself binds the origin. A client cannot change `siweMessage.uri` after signing without invalidating the ECDSA signature. `NEXT_PUBLIC_APP_URL` provides the server's policy — the SIWE library enforces it cryptographically.

---

## `prisma db push` Audit

| Script | Uses `db push` | Purpose | Risk |
|---|---|---|---|
| `build` | **NO** (fixed in P2-B.1E) | Compilation | None |
| `db:sync` | YES (intentional) | Schema sync — dev only | Must not run against production accidentally |
| `build:railway` | YES (still present) | Railway deploy | Railway should use `prisma migrate deploy` |

**Recommendation:** Replace `build:railway` with:
```
prisma generate && prisma migrate deploy && next build
```
Do NOT execute this change now — requires creating a `prisma/migrations/` history first.

---

## CI Future Target Architecture

```
PR
 ↓
format (prettier --check)
 ↓
lint (eslint)
 ↓
typecheck (tsc --noEmit)
 ↓
unit tests (vitest run)
 ↓
build (npm run build) ← no DB required
 ↓
security scan (npm audit --json)
 ↓
[if branch = main or staging]
  ↓
  provision QA PostgreSQL (Neon ephemeral branch or GitHub Actions service)
  ↓
  prisma migrate deploy
  ↓
  schema verification
  ↓
  seed deterministic data
  ↓
  integration tests (adversarial battery)
  ↓
  E2E tests (playwright)
  ↓
  destroy QA branch
```
