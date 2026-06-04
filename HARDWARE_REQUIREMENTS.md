# Hardware Requirements

The **Whale Alert Network** (System Vault) processes significant volumes of data to deliver institutional-grade analytics without delegating computation to centralized servers. Because everything runs locally to maintain your privacy, there are standard hardware requirements.

## 1. Optimal Specifications (Full Indexing)
Recommended for users tracking Ethereum Mainnet, Base, and maintaining 90-day heuristics analysis.
- **CPU**: 4 Cores / 8 Threads (e.g., Intel Core i5/i7 10th Gen+, AMD Ryzen 5+)
- **Memory (RAM)**: 8 GB minimum
- **Storage**: 50 GB Free Space (SSD strongly recommended due to Neo4j and Prisma database read/writes)
- **Network**: Stable broadband connection (at least 50 Mbps down/up) to keep WebSocket streams open.

## 2. Minimum Specifications (Lite Mode)
If you run the app on constrained hardware, you must use the `LITE_MODE=true` environment variable to throttle indexers and prune the graph continuously.
- **CPU**: 2 Cores
- **Memory (RAM)**: 4 GB
- **Storage**: 20 GB Free Space
- **Network**: 10 Mbps

> [!WARNING]  
> If you encounter "Out of Memory" (OOM) errors in Node.js on constrained systems, please increase the V8 heap size using: `export NODE_OPTIONS="--max-old-space-size=4096"` before starting the vault.

## Current Optimization Goals
We are actively optimizing the Prisma Global Singleton and Neo4j pruning to bring the full node requirements closer to 4GB of RAM (refer to the `IMPLEMENTATION_PLAN.md`).
