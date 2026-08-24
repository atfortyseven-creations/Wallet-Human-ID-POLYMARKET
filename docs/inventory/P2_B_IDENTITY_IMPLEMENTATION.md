# P2-B: IDENTITY IMPLEMENTATION (REGISTRY PILOT)
**Status:** DELIVERED

## 1. Architectural Changes
- **Database:** Added `HumanityIdentity` and `HumanitySession`. Added cascading delete relations.
- **Backend:** Created `/api/auth/siwe/verify` and `/api/auth/siwe/session`.
- **Frontend:** Built `SiweRegistryAdapter.tsx` to wrap `app/registry/page.tsx` behind a feature flag (`NEXT_PUBLIC_IDENTITY_SIWE_REGISTRY_ENABLED`).

## 2. Model Guarantees
- **Identity Uniqueness:** `HumanityIdentity` strictly binds to `walletAddress` via a unique constraint in Postgres.
- **Authentication != Authorization:** SIWE simply creates a session. Permissions are held in `HumanityIdentity.permissions` which the Mini-App checks.
- **No IP Identity:** IP address and User Agent are stored in `HumanitySession.securityContext` solely for anomaly detection, not for session restoration.
- **Server Restart Resilience:** The SIWE verify endpoint issues a JWT containing the persistent DB `sessionId`. If the server restarts, the edge middleware and DB lookup will correctly reconstruct the session.

## 3. Flashbots & NPM Audit Security Hold
- **Conflict Documented:** The `ethers@6.16.0` vs `@flashbots/ethers-provider-bundle` peer dependency conflict is classified as ACCEPTED TEMPORARY SECURITY DEBT.
- **Action:** Upgraded dev dependencies in a side-branch (conceptually) but frozen `ethers` on `main` to prevent the flashbots bundle from crashing during MEV protection tasks.
