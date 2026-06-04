import { ethers } from "ethers";
// FIX: Use the global Prisma singleton  prevents connection pool exhaustion
// when multiple workers (EVM + SOL + BTC + BSV) run simultaneously.
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { initializeWebSocket } from "../lib/websocket/server";
import { getRealTimePrice } from "../lib/priceHelper";
import { addWhaleToQueue } from "../lib/queues/whaleQueue";
import { baseResilientProvider, ethereumResilientProvider, bscResilientProvider, ResilientProvider } from "../lib/blockchain/ResilientProvider";
import { redisClient } from "../lib/redis/client";
import { startEvmWorker } from "../services/scanner/evm-worker";
import { startBtcWorker } from "../services/scanner/btc-worker";
import { startSolanaWorker } from "../services/scanner/sol-worker";

dotenv.config();

// Fix ESM path resolution
const __filename = fileURLToPath(import.meta.url);


// Configuration  GetBlock BTC primary endpoint takes priority over legacy BITCOIN_RPC_URL
const BTC_RPC_URL = process.env.GETBLOCK_BTC_RPC || process.env.BITCOIN_RPC_URL;
const WHALE_THRESHOLD_USD = Number(process.env.WHALE_THRESHOLD_USD) || 50000;

// Global Exception Handlers for Maximum Stability
process.on('uncaughtException', (err: any) => {
  const msg = err?.message || '';
  const code = err?.code || '';
  
  const lethalWSPatterns = [
    'Unexpected server response',
    'WebSocket',
    '403',
    '429',
    'ECONNRESET',
    'ETIMEDOUT',
    '401',
    '402',
    'ENOTFOUND',       // DNS resolution failure
    'ECONNREFUSED',    // Remote host refused connection
    'EHOSTUNREACH',    // No route to host
    'getaddrinfo',     // DNS lookup failure prefix
    'UNKNOWN_ERROR',   // ethers catch-all
    'connection timeout exceeded',
    'NETWORK_ERROR',
    '-32005',          // RPC Quota Exhaustion
    'rate limit',      // RPC Rate Limiting
    'quota'            // RPC Quota Limit
  ];

  if (lethalWSPatterns.some(p => msg.includes(p) || code.includes(p))) {
    console.warn(`️ [WS-SHIELD] Suppressed external network rejection: ${msg}. Auto-healing...`);
    return;
  }
  
  console.error(' [PROCESS] Uncaught Exception:', msg);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason: any, promise) => {
  const msg = reason?.message || '';
  const code = reason?.code || '';

  const lethalWSPatterns = [
    'Unexpected server response',
    'WebSocket',
    '403',
    '429',
    'ECONNRESET',
    'ETIMEDOUT',
    '401',
    '402',
    'ENOTFOUND',       // DNS resolution failure
    'ECONNREFUSED',    // Remote host refused connection
    'EHOSTUNREACH',    // No route to host
    'getaddrinfo',     // DNS lookup failure prefix
    'UNKNOWN_ERROR',   // ethers catch-all
    'connection timeout exceeded',
    'NETWORK_ERROR',
    '-32005',          // RPC Quota Exhaustion
    'rate limit',      // RPC Rate Limiting
    'quota'            // RPC Quota Limit
  ];

  if (lethalWSPatterns.some(p => msg.includes(p) || code.includes(p))) {
    console.warn(`️ [WS-SHIELD] Suppressed unhandled network rejection: ${msg}. Auto-healing...`);
    return;
  }
  
  if (reason && reason.reasonCode === 'UNKNOWN_ID') return;
  
  console.error(' [PROCESS] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Helper to check for active users (CU Optimization)
async function getActiveClients(): Promise<number> {
    try {
        if (!redisClient || redisClient.__isMock) return 1; // Default to active in mock/dev
        const count = await redisClient.get('WHALE_MONITOR_CLIENTS');
        return parseInt(count || '0');
    } catch {
        return 1; // Safety fallback
    }
}

// Comprehensive Token Configuration is now managed within the specific scanner modules
// (evm-worker.ts) to ensure modularity and high-fidelity isolation.

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

async function startWorker() {
    try {
        console.log(" [Whale Worker] Starting with Elite Resilience & CU Optimization...");
        
        // Initialize Standalone WebSocket Server on port 3001
        const httpServer = createServer();
        initializeWebSocket(httpServer);
        
        const PORT = process.env.PORT || process.env.WS_PORT || 3001;
        let currentPort = Number(PORT);

        const startServer = () => {
            httpServer.listen(currentPort, '0.0.0.0', () => {
                console.log(` [Data Hub] WebSocket Server running on port ${currentPort}`);
            }).on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    if (process.env.NODE_ENV === 'production') {
                        console.error(` [WebSocket] FATAL: Port ${currentPort} in use. Railway container must exit.`);
                        process.exit(1);
                    }
                    console.warn(`[Whale Worker] Port ${currentPort} is busy, trying ${currentPort + 1}...`);
                    currentPort++;
                    startServer();
                } else {
                    console.error(' [WebSocket] Server error:', err);
                }
            });
        };

        startServer();

        //  GRACEFUL SHUTDOWN (Railway / Docker containers) 
        const shutdown = async (signal: string) => {
            console.log(`\n [SHUTDOWN] Received ${signal}. Terminating System Workers gracefully...`);
            httpServer.close(() => console.log(' [WebSocket] Server closed.'));
            try { await prisma.$disconnect(); console.log(' [DB] Prisma disconnected.'); } catch {}
            if (redisClient) { try { await redisClient.quit(); console.log(' [Redis] Disconnected.'); } catch {} }
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));


        // Use Resilient Providers with WebSocket Push support
        // Calling startEvmWorker from the hardened services/scanner microservices
        startEvmWorker(baseResilientProvider, 'BASE').catch(e => console.error(" [BASE Worker] Failed:", e));
        startEvmWorker(ethereumResilientProvider, 'ETHEREUM').catch(e => console.error(" [ETH Worker] Failed:", e));
        startEvmWorker(bscResilientProvider, 'BSC').catch(e => console.error(" [BSC Worker] Failed:", e));

        if (BTC_RPC_URL) {
            startBtcWorker().catch(e => console.error(" [BTC Worker] Failed:", e));
        }

        // Add Authentic Solana worker
        startSolanaWorker().catch(e => console.error(" [SOL Worker] Failed:", e));

    } catch (err: any) {
        console.error(" [Whale Worker] Initialization FATAL Error:", err);
    }
}

export { startWorker, startEvmWorker, startBtcWorker, startSolanaWorker };

// Only run if called directly (CLI)
const isMain = process.argv[1] && (
    process.argv[1].toLowerCase().includes('whale-worker') || 
    process.argv[1].toLowerCase().endsWith('whale-worker.ts') ||
    process.argv[1].toLowerCase().endsWith('whale-worker.js')
);

if (isMain || process.env.WHALE_WORKER_FORCE_START === 'true') {
  startWorker().catch((err: any) => {
    console.error(" [Whale Worker] Fatal error during startup:", err);
  });
}



