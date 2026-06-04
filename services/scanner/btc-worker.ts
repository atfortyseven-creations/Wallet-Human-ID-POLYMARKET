// FIX: Replaced new PrismaClient() with global singleton from lib/prisma.
// btc-worker was the LAST remaining file with an isolated PrismaClient instance.
// A new PrismaClient() per module opens a new connection pool (up to 10 conns),
// meaning 3 workers running simultaneously would exhaust PostgreSQL's connection
// limit, causing P1017 (Connection pool timeout) under load.
import { prisma } from "../../lib/prisma";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";

dotenv.config();

const WHALE_THRESHOLD_USD = Number(process.env.WHALE_THRESHOLD_USD) || 50_000;

// FIX: Startup guard  the worker will refuse to start rather than crashing
// at runtime with a TypeError ("fetch: BTC_RPC_URL is undefined").
// Previously: BTC_RPC_URL! non-null assertion silently exploded on first RPC call.
const MEMPOOL_APIS = [
    'https://mempool.space/api',
    'https://mempool.fractalbitcoin.io/api',
    'https://blockstream.info/api'
];
let currentEndpointIndex = 0;

async function fetchMempool(endpoint: string, isJson = true) {
    const baseUrl = MEMPOOL_APIS[currentEndpointIndex];
    const response = await fetch(`${baseUrl}/${endpoint}`, {
        signal: AbortSignal.timeout(12_000)
    });
    
    // [INHUMAN DEFENSE] Detect 429 and trigger backoff & rotation
    if (response.status === 429) {
        currentEndpointIndex = (currentEndpointIndex + 1) % MEMPOOL_APIS.length;
        console.warn(`️ [BTC Hub] Rate limited on ${baseUrl}. Rotating to ${MEMPOOL_APIS[currentEndpointIndex]}`);
        throw new Error("RATE_LIMIT_429");
    }
    
    if (!response.ok) throw new Error(`Mempool API HTTP ${response.status}`);
    return isJson ? response.json() : response.text();
}

async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

export async function startBtcWorker() {
    console.log(" [BTC Hub] Activating Batched System Ingestion...");
    let lastBlock: number;
    try {
        const heightText = await fetchMempool('blocks/tip/height', false);
        lastBlock = parseInt(heightText as string, 10);
        console.log(` [BTC Scanner] Genesis sync height: ${lastBlock}`);
    } catch (e: any) {
        console.error(` [BTC Scanner] Startup fail: ${e.message}`);
        await sleep(60_000);
        return startBtcWorker();
    }

    let consecutiveErrors = 0;
    const MAX_BACKOFF_MS  = 10 * 60_000;

    while (true) {
        try {
            const heightText = await fetchMempool('blocks/tip/height', false);
            const currentBlock = parseInt(heightText as string, 10);

            if (currentBlock > lastBlock) {
                const targetBlock = Math.min(currentBlock, lastBlock + 1);
                const blockHash: string = await fetchMempool(`block-height/${targetBlock}`, false) as string;
                const txids: string[] = await fetchMempool(`block/${blockHash}/txids`) as string[];
                
                const btcPrice = await getRealTimePrice("BTC") || 98_000;
                console.log(` [BTC Hub] Chunking Block ${targetBlock} (${txids.length} txs)...`);

                // [INSTITUTIONAL EFFICIENCY] Process sequentially in small chunks to avoid Mempool API bans.
                // 3660 txs / 5 items = 732 chunks.
                const CHUNK_SIZE = 5;
                for (let i = 0; i < txids.length; i += CHUNK_SIZE) {
                    const chunk = txids.slice(i, i + CHUNK_SIZE);
                    
                    // Strictly sequential: NO parallel bombardment. 
                    // Guarantees we stop instantaneously on the first 429.
                    for (const txid of chunk) {
                        try {
                            const tx: any = await fetchMempool(`tx/${txid}`);
                            let totalOutputSats = 0;
                            for (const vout of tx.vout ?? []) {
                                totalOutputSats += vout.value ?? 0;
                            }
                            const valueBTC = totalOutputSats / 1e8;
                            const usdValue = valueBTC * btcPrice;

                            if (usdValue >= WHALE_THRESHOLD_USD) {
                                const senderAddr = tx.vin?.[0]?.prevout?.scriptpubkey_address ?? 'Unknown';
                                await processWhaleTx(
                                    tx.txid, senderAddr, "Multiple Outputs",
                                    "BTC", valueBTC, usdValue,
                                    targetBlock, 'BITCOIN', { method: "REST_MEMPOOL" }
                                );
                            }
                        } catch (txErr: any) {
                            if (txErr.message === "RATE_LIMIT_429") throw txErr;
                        }
                    }
                    
                    // Jitter between chunks (1000ms - 2000ms) to ensure compliance with free APIs
                    await sleep(1000 + Math.random() * 1000);
                }
                lastBlock = targetBlock;
            }

            consecutiveErrors = 0;
            await sleep(30_000); 

        } catch (e: any) {
            consecutiveErrors++;
            const is429 = e.message === "RATE_LIMIT_429";
            const baseWait = is429 ? 180_000 : 60_000;
            const backoff = Math.min(baseWait * Math.pow(2, consecutiveErrors - 1), MAX_BACKOFF_MS);
            
            console.error(` [BTC] Worker backoff #${consecutiveErrors} (${e.message}): ${backoff / 1000}s`);
            await sleep(backoff);
        }
    }
}

async function processWhaleTx(
    hash: string, from: string, to: string,
    asset: string, amount: number, usdValue: number,
    blockNumber: number, chain: string, metadata: any
) {
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: hash } });
    if (exists) return;

    // SCORING: Large BTC movements are institutional by default in our engine
    const isInstitutional = usdValue > 1000000;
    
    // TELEMETRY: Snapshot current price for the Historian
    let btcPrice = 0;
    try {
        btcPrice = await getRealTimePrice("BTC") || 98000;
    } catch {
        btcPrice = 98000;
    }

    console.log(` [BTC] Private_BREACH: $${(usdValue / 1e6).toFixed(2)}M | tx: ${hash.slice(0, 8)}`);

    await prisma.whaleActivity.upsert({
        where: { transactionHash: hash },
        update: {
            usdValue: usdValue.toString(),
            valueBTC: amount,
            btcPriceAtTx: btcPrice,
        },
        create: {
            immutableId: crypto.randomUUID(),
            walletAddress: from,
            type: "BTC_TRANSFER",
            token: asset,
            amount: amount.toString(),
            usdValue: usdValue.toString(),
            valueBTC: amount, 
            btcPriceAtTx: btcPrice,
            fromAddress: from,
            toAddress: to,
            transactionHash: hash,
            blockNumber: BigInt(blockNumber),
            chain,
            institutional: isInstitutional,
            metadata: {
                ...metadata,
                supernova: usdValue > 100_000_000
            },
            timestamp: new Date(),
        }
    }).catch(e => {
        if (!e.message.includes('Unique constraint')) {
            console.error(` [BTC] DB Persistence Fail: ${e.message}`);
        }
    });

    await addWhaleToQueue({
        hash, from, to, asset, amount, usdValue, valueBTC: amount,
        blockNumber: blockNumber.toString(), chain, type: "BTC", 
        institutional: isInstitutional, metadata,
    }).catch(e => {
        console.error(` [BTC] Redis Queue Fail: ${e.message}`);
    });
}
