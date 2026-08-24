# P2-B.1D: SESSION REVOCATION & MULTI-INSTANCE

## Session Revocation
- **Scenario:** Authenticate → Access → Revoke Session → Access again.
- **Expected:** Read-only endpoints may serve from Edge (O(1) crypto valid), but sensitive mutations must reject the request by checking `HumanitySession.revokedAt`.
- **Result:** UNKNOWN (Blocked by missing PostgreSQL environment).

## Multi-Instance Consistency
- **Scenario:** Two distinct application processes (Instance A and Instance B). Authenticate on A, revoke on B, attempt access on A.
- **Expected:** Instance A respects the revocation executed on B (via shared PostgreSQL state).
- **Result:** UNKNOWN (Blocked by missing PostgreSQL environment).

## Server Restart
- **Scenario 1 (Valid):** Authenticate → Restart Server → Reuse Session. Expected: Access Granted.
- **Scenario 2 (Revoked):** Authenticate → Revoke → Restart Server → Reuse Session. Expected: Access Denied.
- **Result:** UNKNOWN (Blocked by missing PostgreSQL environment).

**Final Status:** UNKNOWN
