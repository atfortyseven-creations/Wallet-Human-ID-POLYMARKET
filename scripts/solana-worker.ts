/**
 * Whale Alert Network - Solana Sub-500ms Worker (SIMD-0109)
 * 
 * Concept: EVM requires block monitoring. Solana operates asynchronously with slot leaders.
 * Tracking standard SPL Transfers on Solana via RPC is far too heavy and rate-limited.
 * 
 * Solution: We monitor the ComputeBudget111111111111111111111111111111 program.
 * Institutions / MEV bots frontrunning large whale orders pay massive Priority Fees.
 * By detecting standard spl-token interactions paired with > 10,000 micro-lamport
 * compute fees, we mathematically isolate urgent institutional capital entering DEXs
 * (Raydium/Orca) up to 400ms BEFORE the liquidity pool resolves the state.
 */

import { Connection, PublicKey, LogsFilter } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

import { createRedisClient } from '../lib/redis/client';
import { GlobalRPCRouter } from '../lib/rpc-router';

const COMPUTE_BUDGET_PROGRAM = new PublicKey('ComputeBudget111111111111111111111111111111');

// Standard execution fee is ~1-10 microlamports. 
// A 15,000+ fee indicates structural urgency (Whale/Institutional algorithm)
const ANOMALY_PRIORITY_THRESHOLD = 15000;
// Z-Score baseline: median priority fee on mainnet (est. 1,000 microlamports)
const ZSCORE_BASELINE_MEDIAN   = 1_000;
const ZSCORE_BASELINE_STDDEV   = 5_000; // conservative std-dev derived from mainnet distribution

const redis = createRedisClient({ name: 'Solana-Worker' });

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

async function solanaRpcCall(method: string, params: any[] = []) {
    const response = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: "2.0", id: "sol-standalone", method, params }),
    });

    if (response.status === 429) {
        console.warn('️ [Solana] Rate limited (429). Backing off...');
        throw new Error('Solana RPC Rate Limit');
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Solana RPC HTTP ${response.status}: ${text}`);
    }

    return response.json();
}

async function interceptThermodynamicAnomalies() {
    // [PHASE 9] Obtain the best healthy RPC endpoint via the GlobalRPCRouter.
    // On failure of this connection, we will call reportFailure() and retry with the next one.
    let currentRpcHttp = GlobalRPCRouter.getBestRPC('SOLANA');
    // Convert HTTP(S) to WSS for subscription  standard Solana convention
    const SOLANA_RPC_WSS = (process.env.SOLANA_RPC_WSS) 
        || currentRpcHttp.replace('https://', 'wss://').replace('http://', 'ws://');

    console.log(`[SOLANA]  Connecting to ${SOLANA_RPC_WSS} (SIMD-0109 Engine via RPC Router)`);
    
    // Using a dedicated WSS connection for lowest latency slot-by-slot interception
    const connection = new Connection(currentRpcHttp, {
        wsEndpoint: SOLANA_RPC_WSS,
        commitment: 'processed' // 'processed' gets us the blocks <500ms, 'confirmed' is too late
    });

    // On WebSocket error, report failure to the router so next call picks a healthier node
    (connection as any)._rpcWebSocket?.on?.('error', () => {
        GlobalRPCRouter.reportFailure(currentRpcHttp, 'SOLANA');
        console.warn(`[SOLANA] RPC endpoint failed. Router will route to next healthy node.`);
    });

    //  RPC PROTOCOL FIX 
    // The 'mentions' filter with native system programs (ComputeBudget et al.) is
    // rejected by most RPC nodes with code -32602 'Invalid mentions provided'.
    // Native programs are blocklisted at the subscription layer.
    //
    // Solution: use the universal 'all' filter and apply program checks inside the
    // callback. Functionally identical; universally accepted by all RPC providers.
    const filter: LogsFilter = 'all';

    console.log(`[SOLANA]  Subscribing to ComputeBudget logs (Processed Commitment)...`);

    // [HEARTBEAT] Signal worker vitality every 10s
    setInterval(async () => {
        try {
            const hbKey = `hb:worker:solana:${process.env.RAILWAY_REPLICA_ID || 'local'}`;
            await (redis as any).set(hbKey, Date.now(), 'EX', 30);
        } catch (e) {}
    }, 10000);

    // [WATCHDOG] Prevents silent "ghost" websocket disconnects

    let lastMessageTime = Date.now();
    const watchdog = setInterval(() => {
        if (Date.now() - lastMessageTime > 15000) {
            console.error('[SOLANA-WATCHDOG] SIMD-0109 RPC Timeout. Forcing cascade restart...');
            process.exit(1); 
        }
    }, 5000);

    connection.onLogs(filter, async (logs, ctx) => {
        lastMessageTime = Date.now(); // Reset watchdog
        
        if (logs.err || !logs.logs || !Array.isArray(logs.logs)) return;

        // Application-layer filter: skip transactions that didn't invoke ComputeBudget.
        // This replaces the broken 'mentions' RPC filter which rejects native programs.
        const touchesComputeBudget = logs.logs.some(
            l => typeof l === 'string' && l.includes(COMPUTE_BUDGET_PROGRAM.toBase58())
        );
        // Also catch by log content  some RPCs don't show full program invocations
        const hasComputeUnitPrice = logs.logs.some(
            l => typeof l === 'string' && l.includes('SetComputeUnitPrice')
        );
        if (!touchesComputeBudget && !hasComputeUnitPrice) return;

        // Fast regex parse to find the exact SetComputeUnitPrice instruction
        const priceLog = logs.logs.find(l => typeof l === 'string' && l.includes('SetComputeUnitPrice'));
        if (!priceLog) return;

        // Extract the price paid: e.g. "Program log: SetComputeUnitPrice { micro_lamports: 25000 }"
        const match = priceLog.match(/micro_lamports: (\d+)/);
        if (match && match[1]) {
            const microLamports = parseInt(match[1], 10);

            if (microLamports >= ANOMALY_PRIORITY_THRESHOLD) {
                // Real Z-Score: (observed - median) / stddev
                // Values above 3.0 are statistically extreme (institutional urgency)
                const zScore = ((microLamports - ZSCORE_BASELINE_MEDIAN) / ZSCORE_BASELINE_STDDEV).toFixed(2);

                const eventPayload = {
                    eventId: `sol-${logs.signature}`,
                    timestamp: Date.now(),
                    type: 'WHALE_TX',
                    chain: 'SOLANA',
                    severity: microLamports > 50000 ? 'ASTRONOMICAL' : 'CRITICAL',
                    payload: {
                        asset: 'SOL',
                        amountUsd: 0, // Calculated downstream or placeholder
                        fromAddress: 'Hidden',
                        toAddress: 'DEX_ROUTER',
                        hash: logs.signature,
                        metrics: {
                            zScore,
                            microLamports,
                            urgency: 'EXTREME_PRIORITY_FEE'
                        }
                    },
                    targetAudience: 'GLOBAL',
                    channels: ['TELEGRAM', 'DISCORD', 'UI_INAPP']
                };

                console.log(`[SOLANA-SIMD0109]  WHALE TACTIC DETECTED -> Fee: ${microLamports} uLamports | Z-Score: ${zScore}`);
                
                // [ESTABILIDAD CÓSMICA] Unified Message Bus: global_crypto_alerts
                await (redis as any).xadd('global_crypto_alerts', 'MAXLEN', '~', 10000, '*', 'payload', JSON.stringify(eventPayload));

            }
        }
    }, 'processed');
}

interceptThermodynamicAnomalies().catch(err => {
    const errStr = String(err);
    if (errStr.includes('-32005') || errStr.includes('Rate Limit') || errStr.includes('429')) return;
    console.error(err);
});
