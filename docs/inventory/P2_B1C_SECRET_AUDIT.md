# P2-B.1C: SECRET MANAGEMENT AUDIT

## Methodology
Codebase scan for `process.env.*` related to JWT, cryptography, database, and RPC.
Identified variables with dangerous hardcoded fallbacks and analyzed their usage context.

## Audit Matrix

| Variable | Context | Classification | Status |
|---|---|---|---|
| `JWT_SECRET` | Primary JWT signing key, Edge session verification | **REQUIRED PRODUCTION SECRET** | FIXED (Fail closed implemented) |
| `JWT_VERIFICATION_SECRET` | Used in `/api/auth/studio` B2B SSO | **REQUIRED PRODUCTION SECRET** | FIXED (Fail closed implemented) |
| `ENCLAVE_PIN_SECRET` | Used in `/api/auth/enclave-pin` for local crypto | **REQUIRED PRODUCTION SECRET** | FIXED (Fail closed implemented) |
| `ADMIN_JWT_SECRET` | Used for `/api/admin/login` | **REQUIRED PRODUCTION SECRET** | DANGEROUS FALLBACK (`JWT_SECRET` fallback) |
| `ENCRYPTION_KEY` | Used in `lib/security/premium-security.ts` | **REQUIRED PRODUCTION SECRET** | DANGEROUS FALLBACK |
| `AUDIT_SECRET` | Used in `lib/audit/audit-trail.ts` | **REQUIRED PRODUCTION SECRET** | DANGEROUS FALLBACK |
| `NUKE_SALT` | Used in `/api/user/nuke` | **REQUIRED PRODUCTION SECRET** | DANGEROUS FALLBACK |
| `AZTEC_SECRET` | Used in Aztec blockchain scripts | **TEST-ONLY SECRET** | DANGEROUS FALLBACK |
| `AZTEC_RELAYER_SECRET_KEY` | Used in Aztec relayer deployment | **TEST-ONLY SECRET** | DANGEROUS FALLBACK |
| `DATABASE_URL` | Prisma PostgreSQL connection | **REQUIRED PRODUCTION SECRET** | OK (Prisma fails cleanly) |
| `NEXTAUTH_SECRET` | Legacy NextAuth.js key | **REQUIRED PRODUCTION SECRET** | OK (NextAuth requires it) |
| `NEXT_PUBLIC_APP_URL` | Public origin | **PUBLIC CONFIGURATION** | OK (Fallback to localhost in dev is safe) |

## Findings

1. **Dangerous Fallback Anti-Pattern:** The codebase heavily utilizes a pattern of falling back to a dev-only string or falling back to `JWT_SECRET` when a specific secret is missing (e.g., `process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-only-...'`).
2. **Key Reuse Risk:** Falling back to `JWT_SECRET` for encryption, enclave PIN hashing, or audit trailing means a compromise of one system compromises all of them. Cryptographic keys should have single-purpose scopes.
3. **Remediation Plan:** A global `requireSecret()` utility was added in `lib/security/env-assert.ts`. All critical routes (SIWE, Studio, Enclave) have been updated to use it. Remaining fallbacks in non-critical or legacy paths should be systematically replaced before P2-C.
