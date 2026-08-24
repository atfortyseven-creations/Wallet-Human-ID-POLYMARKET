# P2-B.1A: CONCURRENCY RESULTS

## Status: BLOCKED — PostgreSQL Required

All tests in this document require a live PostgreSQL instance.

### Why PostgreSQL cannot be substituted

The critical security property under test is whether `prisma.siweNonce.delete()` prevents duplicate consumption under concurrent requests.

The mechanism that provides this guarantee in PostgreSQL is:
- `DELETE FROM "SiweNonce" WHERE nonce = $1` is executed as an **atomic statement** under PostgreSQL's default `READ COMMITTED` isolation level
- PostgreSQL acquires a **row-level exclusive lock** on the target row before executing the DELETE
- If two concurrent transactions attempt to DELETE the same row:
  - Transaction A acquires the lock, deletes the row, commits → row is gone
  - Transaction B, when it acquires the lock after A releases it, finds **no row** (it was deleted) and returns 0 rows affected
  - Prisma interprets 0 rows affected as `RecordNotFound` and throws `P2025`
- This is **NOT** application-level locking. It is **database-level atomic DELETE** enforced by the PostgreSQL lock manager.

This behavior **cannot be reproduced** by:
- SQLite (different isolation and locking semantics)
- In-memory data structures (no persistence, no cross-process atomicity)
- Mocked ORM (does not invoke the real DB engine)

### What must be verified empirically

```
Test Concurrencies:   2, 5, 10, 25, 50, 100 concurrent requests
Expected result:      exactly 1 SUCCESS, N-1 REJECTED
Mechanism verified:   PostgreSQL atomic DELETE + P2025 error handling
Full invariant:       1 auth → 1 identity → 1 session (no duplicates)
```

### Bootstrap script (ready to execute when DB is available)

See: `scripts/p2_b1_adversarial_qa.ts`

To run once DATABASE_QA_URL is set:
```bash
DATABASE_URL=$DATABASE_QA_URL npx ts-node scripts/p2_b1_adversarial_qa.ts
```

### Blocking conditions
- PostgreSQL not installed (confirmed via `probe_port.js`: ECONNREFUSED on :5432)
- Docker not available
- No DATABASE_URL defined

### Resolution options
See: `docs/inventory/P2_B1A_POSTGRES_QA.md` for the 4 options to provision PostgreSQL.

---

## Nonce Mechanism — Design Precision

To avoid using imprecise locking terminology, here is the exact mechanism:

| Layer | Mechanism | Database feature |
|---|---|---|
| Application | `prisma.siweNonce.delete({ where: { nonce } })` | Issues `DELETE ... WHERE nonce = $1` |
| ORM | Prisma maps 0-rows-affected → throws `P2025` | Error propagation |
| Database | PostgreSQL exclusive lock on the target row | Row-level locking during DELETE |
| Isolation | Default `READ COMMITTED` — each statement sees committed data | Statement-level snapshot |

**The security guarantee comes from:**
1. The `UNIQUE` constraint on `SiweNonce.nonce` (prevents two rows with same nonce)
2. PostgreSQL's atomic `DELETE` with row-level locking (prevents two concurrent DELETEs from both returning a row)
3. `P2025` thrown by Prisma when DELETE affects 0 rows (used to reject replay)

**NOT from:** application-level mutexes, in-memory sets, or ORM-level deduplication.

**This design is correct. Empirical verification is pending.**
