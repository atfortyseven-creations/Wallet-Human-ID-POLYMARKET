# P2-B.1F: Multi-Instance Test Results

## Method
Two HumanityIdentity + HumanitySession pairs created in PostgreSQL QA (synthetic wallets only).

## Scenarios Tested
| Scenario | A State | B State | Result |
|---|---|---|---|
| B revoked by operator | valid | revoked | PASS |
| A revoked by operator | revoked | revoked | PASS |

## Conclusion
Revocation is correctly isolated — revoking session B does not affect session A.
