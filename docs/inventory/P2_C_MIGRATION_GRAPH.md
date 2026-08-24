# P2-C Migration Dependency Graph

## 1. Goal
Determine the mathematically and architecturally optimal migration order for the remaining Mini-Apps in the Humanity Ledger ecosystem. The order must minimize regression risk by migrating primitives first, consumers second, and isolating distinct architectural surfaces.

## 2. Dependency Evaluation

| Mini-App | Identity Coupling | Data Coupling | Security Risk | Migration Complexity | Dependency Depth |
|---|---|---|---|---|---|
| **Registry** | Low | Low | Low | Low | 0 (Primitive consumer) |
| **Studio** | High (mutations) | Medium | Medium | High | 1 (Relies on Identity) |
| **Portfolio** | High (financial) | High | High | Medium | 1 (Relies on Identity, ZK) |
| **Terminal** | Medium | Low | Low | Low | 2 (Relies on Studio) |
| **Admin Hub** | Very High | High | Critical | High | 3 (Relies on everything) |

## 3. Second Pilot Selection
**Selected: Studio**
- **Justification:** Registry (Pilot 1) proved the "Public Read" and "Anonymous/Authenticated Read" boundaries. Studio introduces heavy **State Mutations** (creating campaigns, uploading assets, generating ZK proofs).
- **Evidence value:** Migrating Studio will definitively prove the "Authoritative DB Session Revocation" mechanics in a real mutation environment, exercising the hardest parts of ADR 004.

## 4. Final Migration Sequence

1. **Registry** (Pilot 1 - Completed) - *Proves Edge Auth & Read APIs*
2. **Studio** (Pilot 2) - *Proves Authoritative Mutations & Shared Storage*
3. **Portfolio** - *Proves Financial Reads & Aztec ZK State Sync*
4. **Terminal** - *Proves Deep Integration & Cross-App routing*
5. **Admin Hub** - *Proves Role-Based Access Control (RBAC) & Privilege Escalation*

## 5. Execution Rule
Do not proceed to a subsequent tier until the previous tier has passed its respective Scorecard and E2E regression suite.
