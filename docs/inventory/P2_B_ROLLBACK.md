# P2-B: ROLLBACK PLAN

## Trigger Condition
If the Registry Pilot exhibits identity collisions, lost sessions across multi-instance routing, or widespread SIWE signature failures.

## Rollback Procedure (Zero Downtime)
1. **Disable Feature Flag:** Set `NEXT_PUBLIC_IDENTITY_SIWE_REGISTRY_ENABLED=false` in Vercel/Railway environment variables.
2. **Result:** The `SiweRegistryAdapter` will immediately fall back to `<>{children}</>`, bypassing the SIWE interceptor.
3. **Legacy Identity:** The Registry will resume rendering its data publicly (as it did before the pilot), or relying on the legacy `middleware.ts` JWT block.

## Database Preservation
- Do NOT delete the `HumanityIdentity` or `HumanitySession` tables.
- Leave them intact so that engineering can inspect the failed pilot sessions and diagnose the issue without rushing destructive DB migrations.
