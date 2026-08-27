# MINI-APP INVENTORY
**Phase 0 — Route Classification**
**Date:** 20 August 2026

---

## CLASSIFICATION CRITERIA

A route is classified as a **Mini-App** only if it satisfies ALL of:
1. Represents a coherent, self-contained user capability
2. Has dedicated frontend components (not just a page shell)
3. Has dedicated backend services or API routes
4. Has a distinct purpose separable from the platform shell

A route is classified as a **Page** if it is primarily informational or a single-screen flow.
A route is a **Dashboard Tab** if it lives inside the Hub shell without independent routing.
A route is **Marketing** if it has no user functionality.

---

## CONFIRMED MINI-APPS (8)

### MA-01: Portfolio Terminal
| Field | Value |
|---|---|
| ID | MA-01 |
| Name | Portfolio Terminal |
| Route | `/portfolio` |
| Status | **BETA** |
| Frontend | `components/portfolio/`, `components/wallet/`, `components/rainbow/` |
| Backend | `app/api/wallet/portfolio/`, `app/api/wallet/onchain-balances/`, `app/api/wallet/tokens/` |
| Services | Alchemy SDK, CoinGecko, price cache |
| Workers | None dedicated |
| Database | Prisma: `ExchangeBalance`, `Transaction`, `WalletAnalytics` |
| Blockchain | Multi-chain read (EVM) via Alchemy |
| Contracts | None (read-only) |
| ZK | None active |
| External deps | Alchemy, CoinGecko, MoonPay, Moralis |
| Permissions | Wallet address (read-only) |
| Identity | SIWE or QR session |
| Tests | `test/portfolio-onchain.test.ts`, `test/unit/audit/portfolio-core.test.ts` |
| Deployment | LIVE on Railway |
| Production evidence | Route exists, API routes serve data |
| Known gaps | Portfolio history uses external APIs; swap execution unclear if live or simulated |
| Documentation | Mentioned in README, whitepaper |

---

### MA-02: Ledger Chat
| Field | Value |
|---|---|
| ID | MA-02 |
| Name | Ledger Chat |
| Route | `/chat` |
| Status | **BETA** |
| Frontend | `components/terminal/LedgerChat.tsx`, `WhaleProShell.tsx`, `LedgerChatSettings.tsx` |
| Backend | `app/api/chat/` (12 routes), `app/api/auth/qr-*` |
| Services | XMTP browser SDK, Socket.IO, WebRTC (PeerJS) |
| Workers | None dedicated |
| Database | Prisma: `PendingChatMessage`, `ChatContact`, `Session` |
| Blockchain | XMTP network (wallet-to-wallet) |
| Contracts | None deployed |
| ZK | Architecture document claims Aztec PXE for identity — **NOT CONFIRMED CONNECTED** |
| External deps | `@xmtp/browser-sdk`, `peerjs`, `socket.io` |
| Permissions | Wallet, signing, messaging |
| Identity | SIWE |
| Tests | `test/whale_chat_audit.test.ts`, `test/onion/OnionChat.test.ts` |
| Deployment | LIVE |
| Production evidence | API routes exist, XMTP SDK installed |
| Known gaps | Aztec PXE identity claimed but not verified connected. Onion routing exists in test but status unclear. |
| Documentation | Whitepaper (`WHALE_NETWORK_WHITEPAPER.md`) |

---

### MA-03: Studio Provenance
| Field | Value |
|---|---|
| ID | MA-03 |
| Name | Studio Provenance |
| Route | `/studio` |
| Status | **PARTIAL** |
| Frontend | `components/provenance/ProvenanceStudioContent.tsx`, `SightInsightTab.tsx` |
| Backend | `app/api/assets/`, `app/api/akashic/`, `app/api/akashic/verify/` |
| Services | Provenance service (`lib/provenance/`) |
| Workers | None |
| Database | Prisma: `ProductPassport`, `ProvenanceEvent` |
| Blockchain | Referenced but no deployed contracts |
| Contracts | None deployed |
| ZK | Referenced but not connected |
| External deps | IPFS (`lib/ipfs/`) |
| Permissions | Identity, asset-data |
| Identity | SIWE |
| Tests | `test/unit/audit/provenance-studio.test.ts` |
| Deployment | UI exists, backend partial |
| Production evidence | Passport models in DB. API routes exist. |
| Known gaps | No on-chain anchoring (no deployed contracts). ZK passport verification not live. |
| Documentation | README mentions it |

---

### MA-04: Governance
| Field | Value |
|---|---|
| ID | MA-04 |
| Name | Governance |
| Route | `/hub` (tab within hub) |
| Status | **PARTIAL** |
| Frontend | `components/` (governance tabs in hub) |
| Backend | `app/api/governance/proposals/`, `propose/`, `vote/` |
| Services | Snapshot integration (`hooks/useSnapshotProposals.ts`) |
| Workers | None |
| Database | Prisma: `MarketProposal`, `ProposalVote` |
| Blockchain | Snapshot (off-chain), no on-chain governance contract deployed |
| Contracts | None deployed |
| ZK | `hooks/useGaslessVote.ts`, `useGaslessProposal.ts` — gasless execution, not ZK |
| External deps | Snapshot API |
| Permissions | Wallet, signing |
| Identity | SIWE |
| Tests | None identified |
| Deployment | UI exists, off-chain proposals work |
| Production evidence | API routes for proposals/voting exist |
| Known gaps | No on-chain vote settlement. Governance contracts not deployed. |
| Documentation | README mentions QDS token/governance |

---

### MA-05: Whale Intelligence / Network
| Field | Value |
|---|---|
| ID | MA-05 |
| Name | Whale Intelligence |
| Route | `/terminal`, `/sovereign-intel`, `/vip` |
| Status | **LIVE** |
| Frontend | `components/terminal/GalacticDashboard.tsx`, `components/network/whale/` |
| Backend | `app/api/whale/`, `app/api/v1/whale/`, `app/api/whale-events/`, `app/api/whales/` |
| Services | `lib/smartMoneyAnalyzer.ts`, `lib/vossAnalyticsEngine.ts`, `lib/neural-segregator.ts` |
| Workers | `workers/indexer.ts`, `workers/sentimentEngine.ts`, `workers/syndicateDaemon.ts` |
| Database | Prisma: `WhaleActivity`, `GlobalWhaleEvent`, `OnChainEntity`, `IntelItem`, `AlertRule` |
| Blockchain | Ethereum Mainnet (read), Base (read) |
| Contracts | None — read-only indexing |
| ZK | None |
| External deps | Alchemy, GetBlock WebSocket, Grok/xAI API |
| Permissions | Public data (no wallet required for reading) |
| Identity | Optional |
| Tests | `test/unit/intelligence/zscore-engine.property.test.ts` |
| Deployment | LIVE |
| Production evidence | Workers exist. API routes exist. Z-Score engine referenced. Grok integration active. |
| Known gaps | No reorg handling in indexers. GetBlock credentials hardcoded in worker (security risk). |
| Documentation | `STATE_OF_WHALE_NETWORK_2026.md` |

---

### MA-06: Registry
| Field | Value |
|---|---|
| ID | MA-06 |
| Name | Registry |
| Route | `/registry`, `/gold-registry` |
| Status | **PARTIAL** |
| Frontend | `components/` (registry views) |
| Backend | `app/api/` (registry-related) |
| Services | Scan API (`lib/scan-api.ts`) |
| Workers | None |
| Database | Prisma: `BRCStandard`, `GoldRegistryAudit`, `KYCRecord` |
| Blockchain | Referenced |
| Contracts | None deployed |
| ZK | Not connected |
| External deps | Unknown |
| Permissions | Identity, KYC |
| Identity | SIWE + KYC |
| Tests | `test/unit/scan/parseScanPayload.test.ts` |
| Deployment | UI exists |
| Production evidence | Route exists, DB models exist |
| Known gaps | No on-chain anchoring. KYC not fully wired. |
| Documentation | README mentions it |

---

### MA-07: Academy
| Field | Value |
|---|---|
| ID | MA-07 |
| Name | Academy |
| Route | `/academy` |
| Status | **LIVE** |
| Frontend | `app/academy/` page |
| Backend | `app/api/academy/progress/`, `submissions/`, `sync/` |
| Services | None |
| Workers | None |
| Database | Prisma: `Course`, `Lesson`, `UserProgress`, `AcademySubmission`, `MentoringMessage` |
| Blockchain | None |
| Contracts | None |
| ZK | None |
| External deps | None |
| Permissions | Identity |
| Identity | Any auth |
| Tests | None identified |
| Deployment | LIVE |
| Production evidence | Routes + DB models confirmed |
| Known gaps | Content management unclear |
| Documentation | README mentions it |

---

### MA-08: Forum (Whale Post)
| Field | Value |
|---|---|
| ID | MA-08 |
| Name | Forum / Whale Post |
| Route | `/forum`, `/whalepost` |
| Status | **LIVE** |
| Frontend | Forum components |
| Backend | `app/api/forum/` (20+ routes) |
| Services | Forum moderation |
| Workers | None dedicated |
| Database | Prisma: `ForumCategory`, `ForumTopic`, `ForumPost`, `ForumLike`, `ForumNotification`, `ForumTelemetry` |
| Blockchain | `SystemForumAnchor.sol` referenced — NOT DEPLOYED |
| Contracts | None deployed |
| ZK | `noir-projects/circuits/forum-zk-auth` — NOT CONNECTED |
| External deps | None |
| Permissions | Identity |
| Identity | SIWE |
| Tests | None identified |
| Deployment | LIVE |
| Production evidence | 20+ API routes, rich DB schema |
| Known gaps | On-chain anchoring not live. ZK anonymous auth not live. |
| Documentation | None specific |

---

## ROUTES CLASSIFIED (NOT MINI-APPS)

### Marketing / Informational Pages
`/`, `/manifesto`, `/whitepaper`, `/vision`, `/story`, `/open-letter`, `/how-it-works`,
`/product`, `/use-cases`, `/roadmap`, `/company`, `/partnership`, `/faq`, `/contact`,
`/news`, `/voss-supremacy`, `/architecture`, `/developer`, `/developers`, `/api-docs`

### System / Auth Pages
`/login`, `/sign-up`, `/connect`, `/clearance`, `/scan`, `/settings`

### Documentation Pages
`/legal`, `/terms`, `/privacy`, `/security`, `/changelog`, `/docs`

### Partial/Experimental
`/bridge` — PARTIAL (bridge UI exists, backend unclear)
`/qds` — PARTIAL (QDS token page, no contract deployed)
`/passport` — PARTIAL (passport UI, no on-chain)
`/predictions` — PARTIAL (prediction markets, Gnosis CTF referenced)
`/cosmic-forge` — DEMO (experimental game mechanics)
`/zk-sandbox` — DEMO (ZK exploration UI)
`/mobile-kyc` — PARTIAL (KYC flow)
`/infrastructure` — PARTIAL (node health UI)
`/ledger` — PARTIAL (institutional view)
`/vip` — LIVE (premium analytics)
`/demo` — DEMO

### Admin Surfaces
`/admin` — Admin login and controls
`/admin/login`

---

## HUB INVENTORY

`app/hub/page.tsx` is a **single file** that renders all Hub tabs.
The Hub is **a single-page shell, not a routing system**.
All Hub "apps" are rendered as components within one page — they are Dashboard Tabs, not routed Mini-Apps.

Hub currently shows: Dashboard, LedgerChat, Markets, Studio, Governance, Identity, Network, Academy, Registry, QDS Token.

