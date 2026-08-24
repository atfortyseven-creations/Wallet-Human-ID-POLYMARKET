# P2-B.1D: SIWE INTEGRATION & SECURITY NEGATIVE TESTING

## SIWE Validation (Extended Dynamic Testing)
The static pure-logic tests pass (`test/auth/siwe.test.ts`), but dynamic integration tests against the live API (`/api/auth/siwe/verify`) remain untested.

| Test Case | Expected | Result |
|---|---|---|
| Valid domain/URI/chain | HTTP 200 | UNKNOWN |
| Wrong domain | HTTP 401 | UNKNOWN |
| Wrong URI | HTTP 401 | UNKNOWN |
| Wrong scheme | HTTP 401 | UNKNOWN |
| Wrong host/port | HTTP 401 | UNKNOWN |
| Wrong chain | HTTP 401 | UNKNOWN |
| Wrong signature | HTTP 401 | UNKNOWN |
| Expired / Future-dated | HTTP 401 | UNKNOWN |

## Security Negative Testing (Integration)
| Scenario | Expected | Result |
|---|---|---|
| Tampered JWT | Denied | UNKNOWN |
| Reused nonce | Denied | UNKNOWN |
| Missing Secret | 500 Fail Closed | UNKNOWN |
| Unauthorized permission | 403 Forbidden | UNKNOWN |
| Duplicate Session | Blocked by DB | UNKNOWN |

## Configuration Policy
- `NEXT_PUBLIC_APP_URL`: Used strictly as a server-side comparison baseline against client-supplied `uri` and `domain`. It is NOT used as an implicitly trusted client value.
- **Chain Policy (`ALLOWED_CHAIN_IDS`):**
  - `137` (Polygon): Production Network.
  - `31337` (Hardhat): Development Network.
  - Currently hardcoded as `[137, 31337]`. This must be extracted to an environment-aware variable before launch to prevent `31337` acceptance in production.

**Final Status:** UNKNOWN (Blocked by missing PostgreSQL environment for integration tests).
