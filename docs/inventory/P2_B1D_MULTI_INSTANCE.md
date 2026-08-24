# P2-B.1D: MULTI-INSTANCE SYNCHRONIZATION

## Multi-Instance Consistency Test
- **Scenario:** Two distinct application processes (Instance A and Instance B) running simultaneously.
  1. Login on Instance A.
  2. Access protected resource on Instance B.
  3. Revoke session on Instance B.
  4. Access protected resource on Instance A.
- **Expected Behavior:** Instance A must respect the revocation executed on B (via shared PostgreSQL state).
- **Empirical Result:** UNKNOWN (Blocked by missing PostgreSQL environment. Cannot spin up test instances without a shared database).

**Final Status:** UNKNOWN
