# P2-C.1 Studio Permissions & Authorization

## 1. Goal
Document the current permission boundaries and the target state (P2-C.1 Option D policy) for the Studio Mini-App.

## 2. Current State (STUDIO_PERMISSION_MAP)
*   **Auth Gate Priority**: Server-side JWT (`ledger_session`) is prioritized; fallbacks to Wallet address verification (via `wagmi` or SIWE manual sign-in).
*   **Rate Limits / Quotas**: "Free Tier" users are strictly limited to `3` passports. Checked defensively on both frontend and backend.
*   **Role Requirements**: Operations require identity bindings (`validateSecureRequest`). Unauthenticated `/api/provenance/log` attempts are silently skipped (fixing `VULN-04` log injection).
*   **Sovereignty Setting**: EU mode boolean enforcing local localized European processing capabilities.

## 3. P2-C.1 Target Authorization Matrix
This matrix enforces the Option D (Hybrid) architecture:

| Operation | Authentication | Permission | DB authority (`requireActiveSession`) | Re-auth | Blockchain |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Read** (`/api/provenance/log` types) | optional | no | no | no | no |
| **Private Read** (`/api/passport/mine`) | yes | required | yes (Option D) | no | no |
| **Create Passport** | yes | required | yes (strict 0ms) | no | maybe |
| **Update Registration** (`/anchor`) | yes | required | yes (strict 0ms) | no | yes |
| **Financial** (`/api/premium/paymaster`) | yes | elevated | yes (strict 0ms) | consider | yes |
| **Sign/Prove** (`/api/premium/prover`) | yes | required | yes (strict 0ms) | yes if risky | maybe |
| **Admin** (`/api/auth/studio` SSO) | yes | admin | yes (strict 0ms) | yes | no |
