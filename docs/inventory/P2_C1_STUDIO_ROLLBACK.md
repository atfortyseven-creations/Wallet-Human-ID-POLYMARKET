# P2-C.1 Studio Rollback Design

## 1. Goal
Ensure the migration to `HumanityIdentity` in Studio can be cleanly aborted and reversed in production without data corruption or loss of provenance.

## 2. Feature Flag Control
`NEXT_PUBLIC_IDENTITY_SIWE_STUDIO_ENABLED` (boolean)

## 3. Rollback Procedure
If a critical vulnerability is detected in production:
1. Flip the feature flag to `false`.
2. The `ProvenanceSessionGate` component reverts to Legacy extraction priority.
3. The API routes fallback to mapping legacy users.

## 4. Rollback Verification Criteria
A successful rollback test must prove that:
- Passports created during the SIWE pilot are still accessible by the user (data survives).
- Subscriptions and Rate Limits (3 free passports) remain accurate.
- On-chain txHashes and coreEntropy remain unmodified and verifiable.
- Identities do not split into duplicates upon reverting to legacy login.
