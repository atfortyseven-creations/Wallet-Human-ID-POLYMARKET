# P2-C.1 Studio E2E Testing Strategy

## 1. Goal
Define the Golden Path and Negative Auth testing matrix required to pass the Studio pilot.

## 2. Studio Baseline
Before migration, a script (`qa_studio_baseline.ts`) must capture the exact legacy behavior:
- `POST /api/passport` (legacy auth)
- `POST /api/aztec/anchor` (legacy auth)
- `GET /api/passport/mine`
- Database state (creation limits)

## 3. Negative Auth Matrix
The migrated routes must explicitly reject the following server-side:
```text
unauthenticated → HTTP 401
legacy identity → HTTP 401 (if SIWE enforced)
SIWE identity → HTTP 401 (if no permission)
valid identity → allowed mutation (HTTP 200)
revoked session → HTTP 401 (via DB authoritative check)
expired session → HTTP 401 (via JWT expiration check)
tampered JWT → HTTP 401 (crypto failure)
identity mismatch → HTTP 403 (trying to modify someone else's passport)
```

## 4. Concurrency & Race Tests
Must simulate:
- `N=5` duplicate creations for the same product to test Idempotency.
- **Revocation Race:** T0 (Auth) → T1 (Begin Anchor) → T2 (Revoke DB session) → T3 (Commit Anchor). The commit *must* fail if the authority check is executed in the same transaction block as the commit.

## 5. E2E Golden Path
1. Login via SIWE
2. Open Studio (`/studio/provenance`)
3. Create Passport (generates entropy)
4. Persist (DB commit)
5. Reopen (`GET /api/passport/mine`)
6. Publish/Anchor (Spend QD + Aztec Anchor)
7. Verify (ZK Proof / TX Hash saved)
