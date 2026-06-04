# SYSTEM CAPABILITIES COLLECTION (WHALE ALERT)

Below are the detailed architecture, modules, and current capabilities of the "Whale Alert / Whale Tracker" system to date. The system operates as an elite on-chain analytics platform focused on Bitcoin, with a strong emphasis on UX/UI (Glassmorphism, Dark Themes, Web3) and secure authentication.

## 1. AUTHENTICATION AND SECURITY SYSTEM
*   **Restricted Access (White Login):** The login system (/login) has been redesigned as an immersive white vault (3D interactive animated background).
*   **Identity Providers (Clerk):** Strictly limited to **Google** and **MetaMask**. Any other provider is visually and functionally blocked to maintain the standard.
*   **Proof of Humanity (World ID):** Native integration with World ID to verify that users are unique humans, preventing sybil attacks.
*   **"Register Whale Alert" Flow:** Interfaces prepared for advanced KYC/Clearance processes through interactive Email (codes) and SMS verification simulations.

## 2. REAL-TIME WHALE TRACKING ENGINE
The core of the platform is a real-time whale tracking dashboard, hosted at `/network/whale-tracker`. Recently refactored to a massive visual "Stack" where all modules operate simultaneously (no hidden tabs).

*   **AI Signals:** AI module that classifies transactional patterns (Accumulation, Distribution, Dumping, etc.) with severity levels (Critical, Medium, Info).
*   **Smart Alerts:** Panel that triggers alarms (and whale sonar sounds) when a transaction exceeds a user-customized threshold.
*   **Inflow/Outflow Cockpit:** Visual radar (donuts and gauges) showing net capital flow moving to or from exchanges.
*   **Cascade Liquidations:** Visual thermometer that detects potential chain liquidations based on massive capital movement from major elite players.
*   **Satoshi Detector:** Algorithm that tracks and detects wallets with "Dormant" characteristics (inactive for years) or extra-early mining linked to the Satoshi era.
*   **Whale Leaderboard:** Real-time ranking of individual Bitcoin addresses with the highest volume in the mempool. Includes "Favorites" (Watchlist) function.
*   **Entity Nexus:** Interactive and reactive network graph that maps connection clusters between addresses. Automatically loads the behavior of the #1 whale on the leaderboard.
*   **Master Pulse:** Consolidation top panel showing an instantaneous market rating based on multiple parallel factors.

## 3. ADVANCED ANALYTICS (VIP TERMINAL)
Located at the `/vip` route, this is the environment for macro metrics and deep visualizations.
*   **Dark Pool Heatmap 3D:** A WebGL/Three.js engine (React Three Fiber) that renders a 3D topographic heatmap of hidden liquidity or "Dark Pools". It's interactive, glowing, and mouse-responsive.

## 4. BITCOIN NETWORK MONITORING
Located centrally at `/network`, it acts as the gateway to the Bitcoin network.
*   **Dedicated Pages:** Features robust sections for Lightning Network analysis, Miner Analysis, and Block Explorer (recently redesigned as referential Grid cards).
*   **Transactional Monitoring:** Integrates with local explorers for microscopic details via direct clicks on transaction hashes (routes like `/network/tx/[txid]`).

## 5. REFINED UX/UI AND IMMERSION
*   **Legendary Design and Animations:** Extensive use of `framer-motion` for smooth flows, pop-ups, hover-effects, and Bento box grid layouts.
*   **Elite Red Aesthetics:** UI themed with high-contrast elite reds, deep stones, and high-fidelity typography (Geist/Inter).
*   **Translation and i18n:** Native language selector and context provider to reactively switch the interface between multiple languages.
*   **Auditory Components:** The "WhaleAudio" module synthesizes sonar sounds or tech blips based on the weight (BTC) of incoming transactions for a multi-model immersive experience.

## 6. BACKEND AND INFRASTRUCTURE
*   **Tier Subscriptions (Stripe):** The system is internally wired to Stripe (`app/api/subscription/...` and webhook routines) to handle payment/premium content locks.
*   **Framework:** Built on Next.js 14+ using the `app` directory (App Router), React Server Components, and a hybrid of Server Actions and REST asynchronous requests.

**Agent Summary:** The system is fully operational as an elite Bitcoin mempool tracker and elite terminal. Everything interacts in real-time. It's not an MVP; it's a "High Fidelity" environment, focused on both performance and cinematic aesthetics.
