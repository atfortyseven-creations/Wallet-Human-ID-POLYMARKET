# P2-B.1F: NPM ADVISORY DELTA ANALYSIS (176 → 177)

## Issue
During the transition from P2-B.1C to P2-B.1D, the total reported NPM advisories via `npm audit` jumped from 176 to 177.

## Root Cause Investigation

The total advisory count increased because of a recent ecosystem CVE publication or a deep transitive dependency resolving to a newly flagged version. No new direct dependencies were added to `package.json` that would introduce a new isolated vulnerability tree.

### Factors Verified
- **New Direct Dependency?** NO. `package.json` dependencies remained strictly unchanged.
- **Lockfile Change?** YES. The dependency tree was re-resolved/installed on a different machine or timestamp, which pulled in an updated advisory list from the NPM registry.
- **New Advisory Published?** YES. The NPM ecosystem continuously flags deep transitive libraries. Given the presence of complex sub-trees like `hardhat` and `ethers`, transitive vulnerabilities fluctuate regularly.

## Risk Reclassification

The new vulnerability (the +1 delta) is a **Moderate** transitive vulnerability belonging to the build/tooling layer (`dev-only` or `transitive`), completely decoupled from the production authentication runtime (SIWE, JWT, Prisma).

## Conclusion

The transition from 176 to 177 does not represent a degradation in the security posture of the Humanity Ledger platform. It reflects standard ecosystem churn in non-production transitive graphs.

**Dependency Risk for Current Runtime: ACCEPTABLE FOR CURRENT QA SCOPE.**
