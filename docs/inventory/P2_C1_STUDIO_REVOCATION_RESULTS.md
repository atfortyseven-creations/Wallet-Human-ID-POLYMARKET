# P2-C.1 Studio Revocation Results

> Status: PENDING (baseline section filled after qa_studio_baseline.ts runs)

---

## Legacy Revocation Behavior (Baseline)

| Test | Result |
|---|---|
| Mutation BEFORE revoke | _PENDING_ |
| Mutation AFTER DB revoke | _PENDING_ |
| Finding | _PENDING_ |

**Expected finding:** Legacy `whale_session` has NO DB revocation lookup.  
A revoked identity can continue executing mutations for up to 24h (JWT TTL).

---

## Option D Revocation Behavior (Post-Migration)

> To be filled after Step 4 (Authoritative Session Check) and Step 5 (Mutation Testing).

### Revocation Race Test
```
T0  valid session
T1  mutation begins (passport create)
T2  session revoked in DB
T3  mutation attempts commit
```

| Scenario | Expected | Actual |
|---|---|---|
| Revoke before tx starts | BLOCKED (401) | UNKNOWN |
| Revoke inside tx window (ms) | May complete (documented gap) | UNKNOWN |
| Revoke after tx completes | Irrelevant | N/A |

---

## Comparison: Legacy vs Option D

| | Legacy (Baseline) | Option D (Post-Migration) |
|---|---|---|
| Revocation mechanism | JWT expiry only (up to 24h) | DB `revokedAt` lookup in same tx |
| Revocation latency | Up to 24h | Milliseconds (tx duration) |
| Mutation after revoke | Allowed (critical gap) | Blocked (PASS expected) |
