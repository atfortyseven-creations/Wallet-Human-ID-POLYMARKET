# P2-B: SECURITY TESTS & VALIDATION

## 1. Nonce Consumption (Concurrency / Race Conditions)
- **Constraint:** Nonce must be consumed exactly once.
- **Implementation:** `prisma.siweNonce.delete({ where: { nonce } })`.
- **Validation:** PostgreSQL enforces atomicity on `DELETE` via row-level locks. If two simultaneous requests hit `/api/auth/siwe/verify` with the same nonce, only one acquires the lock and deletes it. The second request receives a `P2025` RecordNotFound error and aborts, preventing Replay Attacks.

## 2. Server Restart & Multi-Instance Validation
- **Constraint:** Session must survive memory wipe.
- **Implementation:** Sessions are stored in Postgres `HumanitySession` and the client holds a stateless JWT containing the UUID `sessionId`.
- **Validation:** When Instance A signs the JWT and writes to DB, Instance B can immediately read the JWT from the cookie, decrypt it using the shared `JWT_SECRET`, and query the DB for the `sessionId`. Server restarts do not affect the DB.

## 3. SIWE Payload Validation
- **Constraint:** Domain, URI, and Chain must be strictly validated server-side.
- **Implementation:** `SiweMessage.verify()` is invoked with `{ domain: process.env.NEXT_PUBLIC_APP_URL, time: new Date().toISOString() }`.
- **Validation:** If the frontend passes a signature generated for `evil-domain.com`, the server rejects it. If `expirationTime` is reached, `siwe` throws.

## 4. Multi-Wallet Future-Proofing
- **Design:** `HumanityIdentity` has a 1:1 relation with `walletAddress` currently, but the `walletType` field is present. In the future, a `Credential` relational table can map multiple wallets to a single `identityId` without altering the core `Identity` abstraction.
