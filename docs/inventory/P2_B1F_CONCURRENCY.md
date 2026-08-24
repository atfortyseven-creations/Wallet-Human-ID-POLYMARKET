# P2-B.1F: Concurrency Race Invariant Results

**Method:** Direct Prisma.siweNonce.delete() + identity upsert + session create
**Database:** PostgreSQL 16.4 (ephemeral, QA only, synthetic data)

## Race Invariant Under Test
```
N concurrent attempts → 1 SUCCESS, N-1 REJECTED
→ 1 nonce consumed (unique delete)
→ 1 HumanityIdentity
→ 1 HumanitySession
```

## Results

| N | Successes | Rejected | Identities | Sessions | Nonces Left | Result |
|---|---|---|---|---|---|---|
| 2 | 1 | 1 | 1 | 1 | 0 | ✓ PASS |
| 5 | 1 | 4 | 1 | 1 | 0 | ✓ PASS |
| 10 | 1 | 9 | 1 | 1 | 0 | ✓ PASS |
| 25 | 1 | 24 | 1 | 1 | 0 | ✓ PASS |
| 50 | 1 | 49 | 1 | 1 | 0 | ✓ PASS |
| 100 | 1 | 99 | 1 | 1 | 0 | ✓ PASS |

## Verdict: **PASS**

The PostgreSQL `siweNonce` unique constraint + Prisma delete-throws-on-missing ensures exactly one winner.
