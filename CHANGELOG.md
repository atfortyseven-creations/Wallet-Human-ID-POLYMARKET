# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.0.0] — 2026-07-07 — "Immersive Landing & Aztec Testnet Integration"

### Phase 8: Sovereign Landing & Aztec Production Readiness

#### Landing Page — Complete Immersive Redesign
- `feat(landing/desktop)`: Full immersive manifesto landing page (`ImmersiveManifestoLanding.tsx`) with Framer Motion scroll animations, hero section, value proposition, how-it-works, integration cards, global registry map, FAQ, and final CTA — all in a clean, minimalist white-on-white aesthetic
- `feat(landing/mobile)`: Premium mobile landing page (`MobileManifesto.tsx`) with iOS/Android safe-area insets, `100dvh` dynamic viewport, hero section with appkit-button native wallet connection, Whale Chat dark section, and Aztec partnership section
- `feat(landing/router)`: `SmartLandingRouter` SSR-aware device detection — UA-based routing to mobile/desktop versions, eliminates 3s blank white screen flash on mobile
- `feat(landing/nav)`: `ClientRootRouter` desktop landing with `ImmersiveManifestoLanding` + `SystemFooter` composition
- `feat(landing/appkit)`: Replaced all `/connect` redirect links on both desktop and mobile landing with native `<appkit-button />` — wallet connection works directly on landing page without page change, for iOS, Android, and desktop browsers
- `feat(landing/map)`: Real-time `RealWorldMap` SVG coverage map with hover country details and live data feed
- `feat(landing/network)`: `NetworkMapPanel` embedded in Architecture section — live Aztec sequencer topology visualisation

#### Aztec Testnet Integration
- `fix(aztec/rpc)`: `NetworkStats.tsx` — changed hardcoded `localhost:8080` to `https://v5.testnet.rpc.aztec-labs.com` (public Aztec Alpha Testnet), confirmed by @joshc [AZTC] 2026-07-07
- `fix(aztec/rpc)`: `lib/aztec/client.ts` — canonical `AZTEC_TESTNET_NODE` = `https://v5.testnet.rpc.aztec-labs.com`, SponsoredFPC address `0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7` (rc.2 canonical)
- `fix(aztec/build)`: `NetworkStats.tsx` — converted static `@aztec/aztec.js` import to dynamic `await import()` inside `useEffect` — webpack no longer rejects the package path (v4.3.1 does not export its root path)
- `fix(aztec/build)`: `GoldTicketPanel.tsx` — same dynamic import fix applied
- `feat(aztec/pxe)`: `lib/aztec/client.ts` — `getPXEClient()`, `getRelayerWallet()`, `deriveSecretKeyFromEvm()` utilities ready for production PXE sidecar on Railway
- `feat(aztec/contract)`: `lib/aztec/qds-contract.ts` — QDs token wrapper with `rawToQds()`/`qdsToRaw()` helpers and `getQDsBalance()`

#### Build & Infrastructure
- `fix(build)`: Resolved all TS errors across 11 files in pre-push cleanup (Phase 3 cleanup)
- `fix(ui/layout)`: Resolved infinite layout shift / scrollbar jitter on desktop landing page
- `fix(ui/layout)`: Eliminated missing asset black voids; all images now use `loading="lazy"` with proper aspect ratios
- `fix(ui/layout)`: `globals.css` — `overflow-x: hidden` on `html` prevents Windows scrollbar phantom overflow
- `feat(ui/footer)`: `SystemFooter.tsx` — clean white footer with PRODUCT / DEVELOPERS / COMPANY / REGULATORY nav columns, GDPR statement, MiCA compliance badge
- `feat(ui/wallpaper)`: `UniversalEliteWallpaper` — `fixed inset-0` white background layer, dark mode overlay support, `/connect` bypass

#### Mobile Wallet Connection — iOS & Android
- `feat(mobile/wallet)`: `<appkit-button />` native component replaces all custom connect flows on landing pages — single source of truth for wallet connection across all devices
- `fix(mobile/viewport)`: `DvhPolyfill` — `--vh` and `--dvh-100` CSS custom properties set on mount and updated on `resize`/`orientationchange` — fixes iOS Safari collapsible chrome viewport bug
- `fix(mobile/safe-area)`: Hero section uses `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for Dynamic Island and home indicator compatibility

---

## [3.0.0]  2026-04-09  "Sovereign Hardening & System Array"

### Phase 7: System Array (Q3/Q4 2026)
- `feat(avs)`: Eigenlayer AVS Architecture: `WhaleAVS.sol` and `WhaleZKVerifier.sol` establishing cryptographically verified thermodynamic signals.
- `feat(solana)`: Solana SIMD-0109 Engine: Ultralow latency websocket module intercepting `ComputeBudget` priorities <500ms before AMM state reflection.
- `feat(mesh)`: System Mesh P2P: Decentralized DGRAM/UDP multicast networking entirely replacing external Redis dependencies for cluster-wide node sync.
- `feat(mica)`: MiCA Attestation Suite: GDPR Article 72 Right to Be Forgotten architecture isolating PII wipe commands from immutable ledger telemetry.
- `docs(audit)`: Cryptographic Audit Dossier generated and `slither` static analysis integrated into pipeline.

### Phase 6: Cryptographic & Kubernetes
- `feat(k8s)`: Full Kubernetes production manifests  Namespace, ConfigMap, 3 Deployments (app/scanner/telegram), Service, HPA (210 pods, CPU+memory triggers), PodDisruptionBudget (minAvailable:1), ServiceAccount (no auto-token), NGINX Ingress with cert-manager TLS, SSE proxy-buffering disabled
- `feat(k8s)`: Helm chart for sovereign one-command deploy (`helm install whale-alert`) with full values.yaml surface
- `feat(cryptographic)`: `/api/cryptographic`  4-tier feature grid (COMMUNITY/PRO/CRYPTOGRAPHIC/Cryptographic) with SLA guarantees and pricing
- `feat(cryptographic)`: `/api/cryptographic/contact`  inquiry handler with Telegram admin notification and reference ID generation
- `docs(cryptographic)`: `CRYPTOGRAPHIC.md`  complete cryptographic guide including air-gapped deployment option
- `chore(semver)`: Bumped version to 3.0.0; added npm scripts for K8s, Helm, and system contract deployment

### Phase 5: Analytics & Analytics Commons
- `feat(dune)`: `/api/analytics/dune/export`  CSV/JSON export for Dune Analytics upload; usd_value_bucket bucketization, Content-Disposition download header
- `feat(dune)`: `/api/analytics/dune/queries`  6 production-ready Dune SQL queries (volume by chain, mega whale timeline, token concentration, hourly flow, repeat wallets, EVM Thermodynamics Z-Score)
- `feat(community)`: `/api/leaderboard/hall-of-fame`  GET/POST; on-chain verified detection submissions; WATCHERGRAND SENTINEL badge system
- `feat(community)`: `/api/ambassador`  4-tier ambassador program (520% commission), automatic referral code, WorldID gating
- `feat(ecosystem)`: `/api/powered-by`  dApp integration registry with embed snippet and badge Markdown generation
- `security(telegram)`: Removed hardcoded BOT_TOKEN from `scripts/telegram-worker.ts`; process.exit(1) if missing
- `docs(academic)`: `Private_WHITEPAPER.md`  completed academic paper: EVM Thermodynamics formal model G(t)/E(t)/Z(t), EIP-1153 TSTORE signal validation, Neo4j Cypher graph correlation, ZK-proof signal distribution, complete security threat model, 8 academic references
- `docs(report)`: `STATE_OF_WHALE_INTELLIGENCE_2026.md`  annual report: $4.7T volume, 842K detections, Z-Score calibration table, wallet behavioral taxonomy, 2027 outlook

### Phase 4: Governance & Smart Contracts
- `test(contracts)`: `test/WhaleDeadmanSwitch.test.ts`  21 test cases, 100% branch coverage: constructor, non-custodial ETH rejection, ping, 2-step backup + 72h cooldown, setTimeout, trigger (all paths), pause/unpause, view helpers
- `test(contracts)`: `test/HumanTimeLock.test.ts`  13 test cases, 100% branch coverage: lock accumulation, reverts, multi-user, withdraw timing, ETH balance, re-entrancy prevention
- `feat(api)`: `/api/contracts/status`  live on-chain state reader (view-only ethers calls); WhaleDeadmanSwitch + HumanTimeLock per wallet; ?chain=base|ethereum; returns daysRemaining/expiresAtIso
- `feat(scripts)`: `scripts/deploy-system.ts`  ethers v6, balance pre-check, confirmation blocks, post-deploy sanity assertions, Etherscan verification, JSON manifest
- `feat(api)`: `/api/market/signals`  System API Marketplace: 3-tier HMAC auth (FREE/PRO/SOVEREIGN), 30s replay protection, Redis rate limit, address masking
- `feat(ui)`: `SystemVault.tsx`  `OnChainStatusPanel`: SWR 30s refresh, DeadMansSwitch countdown bar + Basescan link, HumanTimeLock per-wallet, block number footer
- `ci(contracts)`: `.github/workflows/system-core.yml`  3-job workflow: contract tests, API typecheck, deploy dry-run

### Phase 3: Real-Time Backend & Streaming
- `feat(streaming)`: `app/api/whale-stream/route.ts`  SSE endpoint with Redis BLPOP primary path + Prisma polling fallback; anti-buffering headers for Railway/Nginx
- `feat(streaming)`: `context/WhaleStreamContext.tsx`  EventSource with exponential backoff (1s30s), 200-event rolling buffer, SSR-safe, isConnected state
- `feat(ui)`: `AlertsPanel.tsx`  replaced 3.5s polling loop with SSE subscription; $500K+ events auto-injected as TRIGGERED alert rules; footer reflects live stream status
- `feat(ui)`: `RadarFeed.tsx`  dual-source: primary WS + SSE secondary; connection dot in header
- `feat(infra)`: `Dockerfile`  multi-stage (builder/runner), non-root user 1001, HEALTHCHECK for Railway/K8s, Alpine + openssl/sharp
- `feat(infra)`: `.github/workflows/production-pipeline.yml`  4-job CI/CD: type-check, Slither SARIF, Next.js build with cache, auto-tag on merge
- `fix(config)`: `next.config.js`  `output: 'standalone'` conditional on NEXT_BUILD_EXTENSION env

### Phase 2: UX/UI Polish
- `feat(theme)`: Next-themes integration; flicker-free light/dark mode; all hardcoded dark hex values replaced with responsive Tailwind variables
- `feat(ui)`: Global Command Palette (Ctrl+K) with Framer Motion overlay; mapped to all real app routes
- `feat(ui)`: Dashboard drag-and-drop reordering (useDragOrder hook + localStorage persistence + Framer Motion Reorder)

---

## [0.1.0-Genesis]  2026-04-09

### Added
- `feat(vault)`: System Vault daemon (`SystemVault_RUN.bat`)  zero-trust local execution
- `feat(db)`: Neo4j graph analytics + Prisma PostgreSQL relational layer
- `feat(worker)`: Async mempool telemetry workers (whale-worker.ts)
- `feat(ui)`: Dual Hybrid UI  Framer Motion + Lenis physical scroll
- `feat(zk)`: ZK Circuit architecture (Aztec L2 + circomlibjs)
- `feat(auth)`: Identity IDKit + Sumsub anti-sybil verification
- `feat(contracts)`: Golden Ticket NFT validation engine

### Security
- `security(auth)`: Strict local env vars  no monolithic cloud vault
- `security(pwa)`: Service Worker strict cache rules

---

## [Pre-Genesis]  Architectural Exploration
- Monorepo initialization with Next.js 15.1.0 App Router
- Hardhat environment bootstrapped for deadman-switch and L2 aggregations
