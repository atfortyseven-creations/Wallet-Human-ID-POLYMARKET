# ADR 002: Canonical Identity and SIWE Integration

**Status:** Proposed (Under P2 Security Hold)
**Date:** August 2026

## Context
Humanity Ledger currently suffers from identity fragmentation. The system uses NextAuth (Email/Password), an incomplete SIWE implementation, WorldID nullifiers, ZK mock tracking, and bespoke Social Verifications. This fragmentation causes permission incoherence across Mini-Apps and weakens the cryptographic baseline of the platform.

The system requires a single, canonical identity backbone that:
1. Derives from verifiable cryptography (EVM wallets via SIWE).
2. Serves as the single source of truth for all Mini-App authorizations.
3. Provides a compatibility layer for existing Web2 (NextAuth) users during migration.

## Decision
We will establish a **Canonical Humanity Identity** (`HumanityIdentity`) model and migrate the platform to a strict SIWE (Sign-In with Ethereum) authentication flow, acting as a facade over existing auth methods during a transition period.

### 1. Canonical Identity Model
The new single-source-of-truth model will be created in Prisma:
```prisma
model HumanityIdentity {
  id                 String    @id @default(uuid())
  walletAddress      String    @unique
  chainId            Int
  walletType         String    // EOA, SMART_ACCOUNT, MULTISIG
  verificationStatus String    // UNVERIFIED, SIWE_VERIFIED, ZK_VERIFIED
  createdAt          DateTime  @default(now())
  lastVerifiedAt     DateTime?
  
  // Relations to modular domain primitives
  permissions        PermissionSet?
  sessions           Session[]
  credentials        Credential[]
  passports          ProductPassport[]
}
```

### 2. SIWE Validation Requirements
The implementation will strictly adhere to EIP-4361. Server-side validation MUST independently verify:
- `domain` matches the server's expected origin.
- `uri` matches the login request.
- `address` is a valid EVM address and matches the signature.
- `chainId` matches the expected network.
- `nonce` matches the server-generated challenge and is unconsumed.
- `expirationTime` is in the future.
- `notBefore` is in the past (if present).
- Cryptographic signature via `verifyMessage` (ethers/viem).

### 3. Nonce System
Nonces will be tracked in the database (`SiweNonce`) and will:
1. Be generated cryptographically randomly (`crypto.randomBytes`).
2. Have a strict 5-minute expiration.
3. Be atomically invalidated (deleted) upon first verification attempt (success or failure) to prevent replay attacks.

### 4. Compatibility Layer (Migration)
To prevent breaking existing sessions:
1. `HumanityIdentity` will be created automatically for existing `AuthUser` records upon their first SIWE login.
2. Legacy JWTs will remain valid until expiration but will be tagged with `legacy: true`.
3. Mini-Apps will consume `Identity.permissions`. If a legacy user accesses a Mini-App, an ephemeral `HumanityIdentity` proxy will be generated in memory to satisfy the contract.

## Consequences
- **Positive:** Cryptographically verifiable identities. Unified permission model for all Mini-Apps. Replay attack elimination.
- **Negative:** Increased database writes for nonce generation and consumption. Requires careful orchestration during the migration to avoid locking out NextAuth users.

### 5. JWT Revocation Architecture
We implement a Hybrid Edge/API Authorization model. Edge middleware performs O(1) cryptographic verification of the JWT to block unauthenticated spam. Sensitive API route handlers must independently query HumanitySession.revokedAt in PostgreSQL to guarantee immediate revocation state. JWT TTL is reduced to limit read-only replay windows.
