# P2-B.1F: Session Revocation & Multi-Instance Results

## DB-Level Revocation: PASS

| Scenario | Expected | Result |
|---|---|---|
| B revoked → A still valid | A=valid, B=revoked | PASS |
| A revoked → A invalid | A=revoked | PASS |

## JWT vs DB Authority

| Layer | Mechanism | Status |
|---|---|---|
| Cryptographic JWT | 24h expiry (HS256) | WORKING — verified programmatically |
| DB Revocation | HumanitySession.revokedAt | WORKING — isolated per session |
| Edge Propagation | Redis cache → JWT denylist | GAP — tracked for P2-C |

## Conclusion
A revocation in PostgreSQL does NOT automatically invalidate the JWT token. Routes that query DB revocation will deny access. JWT tokens remain cryptographically valid until expiry. The gap between DB revocation and JWT invalidation is a known security item for P2-C.
