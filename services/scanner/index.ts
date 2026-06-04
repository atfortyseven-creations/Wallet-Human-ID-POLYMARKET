import dotenv from "dotenv";
import { startEvmWorker } from "./evm-worker";
import { startBtcWorker } from "./btc-worker";
import { startSolanaWorker } from "./sol-worker";
import { baseResilientProvider, ethereumResilientProvider, bscResilientProvider, polygonResilientProvider } from "../../lib/blockchain/ResilientProvider";

dotenv.config();

// 
// Enterprise SCANNER CLUSTER  Multi-chain parallel ingestion engine
// Architecture:
//   - EVM Mesh: Ethereum, Base, BSC, Polygon (via ResilientProvider multiplexer)
//   - Bitcoin Sentinel: BTC L1
//   - Solana Pulse: Solana
// Each worker is independently fault-isolated: a crash in BTC never kills ETH.
// Heartbeats are published to Redis every 30s for health endpoint verification.
// 

const REPLICA_ID = process.env.RAILWAY_REPLICA_ID || 'local';
const HEARTBEAT_INTERVAL_MS = 30_000;

//  System Ignition Protocol 
// Validates critical environment before booting workers.
// Fails fast with actionable error messages instead of silent degradation.
async function systemIgnitionCheck() {
    const required = ['DATABASE_URL'];
    const missing  = required.filter(k => !process.env[k]);
    if (missing.length) {
        console.error(` [Ignition] CRITICAL: Missing required env vars: ${missing.join(', ')}`);
        process.exit(1);
    }
    console.log(` [Ignition] Environment validated. Replica: ${REPLICA_ID}`);
    console.log(` [Ignition] Database: ${process.env.DATABASE_URL ? 'CONFIGURED' : 'MISSING'}`);
    console.log(` [Ignition] Redis: ${process.env.REDIS_URL ? 'CONFIGURED' : 'NOT SET (polling fallback active)'}`);
    console.log(` [Ignition] BTC Worker: ${process.env.BITCOIN_RPC_URL ? 'ENABLED' : 'DISABLED (set BITCOIN_RPC_URL to enable)'}`);
}

//  Redis Heartbeat Publisher 
// Publishes worker alive timestamps to Redis every 30s.
// Health endpoint at /api/health reads these keys to detect live workers.
async function startHeartbeatLoop() {
    try {
        const { redisClient } = await import('../../lib/redis/client');
        if (!redisClient || (redisClient as any).__isMock) {
            console.warn(`️ [Heartbeat] Redis unavailable  heartbeats disabled. Health endpoint will show workers as DEGRADED.`);
            return;
        }

        const publishBeat = async () => {
            const now = Date.now().toString();
            await Promise.all([
                redisClient.set(`hb:worker:mesh:${REPLICA_ID}`,   now, { EX: 60 }),
                redisClient.set(`hb:worker:solana:${REPLICA_ID}`, now, { EX: 60 }),
            ]).catch(e => console.warn(`️ [Heartbeat] Redis write failed:`, e.message));
        };

        // Initial beat on boot
        await publishBeat();
        console.log(` [Heartbeat] Publishing to Redis every ${HEARTBEAT_INTERVAL_MS / 1000}s (key: hb:worker:mesh:${REPLICA_ID})`);

        // Recurring interval
        setInterval(publishBeat, HEARTBEAT_INTERVAL_MS);
    } catch (e: any) {
        console.warn(`️ [Heartbeat] Failed to initialize:`, e.message);
    }
}

//  System Scanner Main 
async function main() {
    console.log(" [Scanner Cluster] ");
    console.log(" [Scanner Cluster] Enterprise MULTI-CHAIN INGESTION ENGINE");
    console.log(" [Scanner Cluster] ");

    await systemIgnitionCheck();

    // Start heartbeat loop (non-blocking)
    startHeartbeatLoop().catch(e => console.warn('[Heartbeat] Init error:', e.message));

    // 1. EVM Mesh: 4 chains, each independently fault-isolated
    // Each worker catches its own errors  no cross-chain crash propagation
    startEvmWorker(ethereumResilientProvider, 'ETHEREUM').catch(e => console.error(" [ETH Scanner] Fatal:", e.message));
    startEvmWorker(baseResilientProvider,     'BASE').catch(e    => console.error(" [BASE Scanner] Fatal:", e.message));
    startEvmWorker(bscResilientProvider,      'BSC').catch(e     => console.error(" [BSC Scanner] Fatal:", e.message));
    startEvmWorker(polygonResilientProvider,  'POLYGON').catch(e => console.error(" [POLYGON Scanner] Fatal:", e.message));

    console.log(" [EVM Mesh] 4 chains activated: ETHEREUM, BASE, BSC, POLYGON");

    // 2. Bitcoin Sentinel (optional  requires BITCOIN_RPC_URL)
    if (process.env.BITCOIN_RPC_URL) {
        startBtcWorker().catch(e => console.error(" [BTC Scanner] Fatal:", e.message));
        console.log(" [BTC Sentinel] Bitcoin L1 scanner activated");
    } else {
        console.log(" [BTC Sentinel] DISABLED (set BITCOIN_RPC_URL to enable)");
    }

    // 3. Solana Pulse
    startSolanaWorker().catch(e => console.error(" [SOL Scanner] Fatal:", e.message));
    console.log(" [SOL Pulse] Solana scanner activated");

    console.log(" [Scanner Cluster] All workers launched. Monitoring for system events...");

    process.on('SIGTERM', () => {
        console.log(" [Scanner Cluster] SIGTERM received. Graceful shutdown initiated.");
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log(" [Scanner Cluster] SIGINT received. Shutting down.");
        process.exit(0);
    });
}

main().catch(err => {
    console.error(" [Scanner Cluster] CRITICAL STARTUP ERROR:", err);
    process.exit(1);
});
