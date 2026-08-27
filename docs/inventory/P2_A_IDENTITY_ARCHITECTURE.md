# P2-A: IDENTITY ARCHITECTURE & SIWE MIGRATION DESIGN
**Status:** REQUIRED REVIEW GATE (Security Hold Active)

## 1. IDENTITY ARCHITECTURE MAP

### Current Identity Flow (Fragmented)
```text
User 
 ├─> NextAuth (Email/Pass) -> AuthUser -> JWT Session -> Academy/Admin
 ├─> SIWE (Incomplete) -> SiweNonce -> JWT Session -> Portfolio
 └─> Aztec Mock -> ZkNullifier -> UI State -> Chat
```

### Proposed Canonical SIWE Flow (P2 Target)
```text
User
 ↓
Wallet (Client EOA/Smart Account)
 ↓
Nonce (Server-generated, DB-tracked, 5m TTL)
 ↓
Signature (EIP-4361, SIWE payload)
 ↓
Session (Server-verified, cryptographically bound)
 ↓
Identity (Canonical HumanityIdentity mapping)
 ↓
Authorization (PermissionSet evaluation)
 ↓
Mini-App (Consumes standardized Capability)
```

**Verification Path:**
- **File:** `app/api/auth/verify-siwe/route.ts` (To be created)
- **Component:** `SiweProvider` (Frontend)
- **Service:** `lib/auth/siwe-validator.ts`
- **Schema:** `HumanityIdentity`, `SiweNonce`, `Session`
- **Persistence:** PostgreSQL (Prisma)
- **Security:** `ethers.verifyMessage` server-side, exact domain matching.
- **Expiration:** 24h JWT bound to `identityId`.
- **Replay Protection:** Atomic DB nonce deletion on consumption.
- **Dependency:** `viem` / `ethers`.

---

## 2. SESSION SECURITY MODEL

- **Authentication vs Authorization:** Authentication only proves control of a private key. Authorization (admin rights, premium access) is evaluated against the `HumanityIdentity.permissions` relation.
- **Session Binding:** Sessions will record the `ipAddress` and `userAgent`. An anomaly (e.g., session used from a new continent within 10 minutes) triggers a silent invalidation and requires re-signing.
- **Revocation:** Centralized in `/api/auth/logout`. Deletes the DB session and clears the secure HTTP-only cookie.
- **Cross-Domain Flaws:** The SIWE domain parameter will be strictly validated against `process.env.NEXT_PUBLIC_APP_URL` to prevent phishing relays.

---

## 3. SHARED PRIMITIVE REGISTRY (Initial Targets)

To prevent creating abstractions for the sake of abstractions, these primitives are validated by having multiple consumers:

1. **`IdentityPrimitive`** (Consumers: Hub, Portfolio, Forum, Chat)
2. **`PermissionPrimitive`** (Consumers: Admin, VIP Analytics, Studio)
3. **`NetworkPrimitive`** (Consumers: Portfolio, Ledger Intelligence)

---

## 4. MIGRATION STRATEGY & COMPATIBILITY LAYER

We will not replace identity in one massive PR.

**Phase 1: Pilot Mini-App (Registry)**
- The Registry Mini-App will be switched to consume `IdentityPrimitive`.
- **Before:** Registry uses legacy `useSession` from NextAuth.
- **Migration:** If user has legacy session, an ephemeral `HumanityIdentity` proxy is passed to Registry. If user has SIWE session, native `HumanityIdentity` is passed.
- **Verification:** Golden path (Registering an asset) must work for both session types.
- **Rollback:** Revert Registry component to `useSession`.

**Phase 2: Identity Core Sync**
- All SIWE logins create/update `HumanityIdentity`.
- Legacy logins trigger a prompt: "Link your wallet to upgrade to full Web3 sovereignty."

---

## 5. SECURITY & REGRESSION STOP CONDITIONS

The migration will be HALTED immediately if any of the following occur during Phase 1:
- A consumed nonce can be used a second time.
- A signature from Chain A is accepted while the user acts on Chain B.
- A wallet binding fails (User A logs in, sees User B's portfolio).
- XMTP message decryption fails due to identity object structural changes.
