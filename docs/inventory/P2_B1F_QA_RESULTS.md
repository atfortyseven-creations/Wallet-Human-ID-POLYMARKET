# P2-B.1F: FINAL QA GATE

## Infrastructure
- PostgreSQL: Local ephemeral PG 16.4 (synthetic data, no production)
- Destroyed after run: YES
- Secrets: never written to disk or docs

## Final Gate

| Gate | Result | Method |
|---|---|---|
| PostgreSQL QA | PASS | Local ephemeral PG 16.4 |
| Schema | PASS | pg_indexes + information_schema |
| Nonce Concurrency | PASS | DB-direct N=2,5,10,25,50,100 |
| Replay | PASS | nonce deleted exactly once |
| Identity Race | PASS | identityCount=1 after race |
| Session Revocation | PASS | revokedAt field isolation |
| JWT Fail-Closed | PASS | requireSecret() throws |
| JWT TTL | PASS | 24h verified programmatically |
| Multi-Instance | PASS | Scenario A→B, B→A |
| SIWE Integration HTTP | PASS | Full HTTP flow |
| SIWE Negative Cases | PASS | 7/7 rejected |
| Chain Policy (prod=137 only) | PASS | 31337 excluded in production mode |
| Build Determinism | PASS | npm run build (no DB required) |
| Registry Regression | UNKNOWN | No HTTP endpoint tested against Registry |
| Restart Test | UNKNOWN | Not performed (tracked for P2-C) |

## Known Gaps (Tracked for P2-C)
1. JWT revocation propagation to Edge Middleware (Redis denylist)
2. Registry-specific endpoint regression
3. Restart/server-restart session persistence test

## NPM Risk
**Dependency Risk for Current Runtime: ACCEPTABLE FOR CURRENT QA SCOPE**

## Security Hold
**ACTIVE** — P2-C remains BLOCKED. Awaiting operator review.
