# P2-B.1F: SIWE Integration Results

## End-to-End HTTP Test: PASS

Flow: wallet keygen → SiweMessage → sign → HTTP POST /api/auth/siwe/verify → HumanityIdentity → HumanitySession → JWT cookie

Identity and session created in PostgreSQL QA. JWT cookie issued with 24h TTL.

## Negative Cases: 7 PASS / 0 FAIL

| Case | Result |
|---|---|
| Wrong domain | REJECTED |
| Wrong URI host | REJECTED |
| Wrong URI port | REJECTED |
| Wrong URI scheme | REJECTED |
| Wrong chain (31337 in QA mode) | REJECTED |
| Non-existent nonce | REJECTED |
| Wrong signature | REJECTED |

## JWT TTL
- **Configured:** 24h (verified programmatically in step 3)
- **Session DB:** expiresAt = now + 86400s
- **Previous claim "1 hour": INCORRECT** — actual TTL is 24h
