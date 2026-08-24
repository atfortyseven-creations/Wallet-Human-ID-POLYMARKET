# P2-B.1E: QA INFRASTRUCTURE

## Status Summary

| Provisioning Method | Attempted | Result |
|---|---|---|
| Port 5432 (existing) | YES | ECONNREFUSED |
| Docker | YES | NOT INSTALLED |
| WSL2 | YES | NOT INSTALLED |
| PowerShell + EDB ZIP download | YES | FAILED — Windows MAX_PATH (260-char) limit truncated extraction; `initdb.exe` unreachable |
| `choco install postgresql 16.3.0` | YES | FAILED — version not found on community source |
| `choco install postgresql16` | IN PROGRESS | Awaiting result |

## Critical Infrastructure Constraints

The local execution machine (Windows, no admin elevation, no Docker, no WSL2) presents a systemic provisioning barrier.

### What Is Required for Empirical QA

A real, isolated PostgreSQL instance accessible via `postgresql://user:pass@host:port/db` string.

Constraints:
- NOT production
- NOT committed to Git
- NOT using real data
- Ephemeral / destroyable after tests
- Compatible with Prisma v6.19.3

### Viable Options Remaining

**Option A (User Action Required) — Cloud Free Tier**
The fastest path with no admin privilege requirement:
1. Create a free project at [https://neon.tech](https://neon.tech) or [https://console.neon.tech/signup](https://console.neon.tech/signup) (no credit card required)
2. Copy the connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)
3. Set it as `DATABASE_QA_URL` in a local `.env.qa` file (NOT committed)
4. Agent runs full `P2-B.1D` battery immediately

**Option B (User Action Required) — Chocolatey with Admin**
Run PowerShell as Administrator:
```powershell
choco install postgresql16 -y
# Then set environment variable:
$env:DATABASE_QA_URL = "postgresql://postgres:postgres@localhost:5432/humanity_qa"
```

**Option C (User Action Required) — Winget install**
```powershell
winget install -e --id PostgreSQL.PostgreSQL.16
```

## Automated Bootstrap Script (Ready to Execute)

Script at `scripts/qa_bootstrap.ts` will execute the full bootstrap sequence once `DATABASE_QA_URL` is provided:

```
connect → verify schema → seed → run battery → destroy
```

## Confirmed Blockers

```text
Local PostgreSQL install = BLOCKED (no admin, no Docker, no WSL2, zip extraction fails)
Cloud PostgreSQL = WAITING FOR OPERATOR (no DATABASE_QA_URL provided)
```

## Action Required from Operator

Choose one provisioning path and either:
- Provide `DATABASE_QA_URL` as an environment variable, OR
- Run the Chocolatey install with administrator privileges and confirm completion

The agent cannot proceed with empirical testing without a live PostgreSQL connection.
This is a hard infrastructure requirement — no workarounds, mocks, or SQLite substitutes.
