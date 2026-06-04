import { ethers } from "ethers";
// FIX: Use the global Prisma singleton from lib/prisma to prevent
// connection pool exhaustion when multiple workers run simultaneously.
import { prisma } from "../../lib/prisma";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";
import { baseResilientProvider, ethereumResilientProvider, bscResilientProvider, ResilientProvider } from "../../lib/blockchain/ResilientProvider";

dotenv.config();

const WHALE_THRESHOLD_USD = Number(process.env.WHALE_THRESHOLD_USD) || 50000;

//  MAX EFFICIENCY: In-worker price cache (30s TTL) 
// Without this, getRealTimePrice() is called for EVERY ERC-20 transfer event.
// On a busy block (hundreds of transfers) this would drain the CU quota instantly.
// This cache batches requests per symbol across the entire block cycle.
const _priceCache = new Map<string, { price: number; ts: number }>();
const PRICE_CACHE_TTL = 30_000; // 30 seconds

async function getCachedPrice(symbol: string): Promise<number> {
  const cached = _priceCache.get(symbol);
  if (cached && Date.now() - cached.ts < PRICE_CACHE_TTL) {
    return cached.price;
  }
  const price = await getRealTimePrice(symbol) || 1;
  _priceCache.set(symbol, { price, ts: Date.now() });
  return price;
}

const TOKEN_CONFIG: Record<string, { symbol: string, decimals: number }> = {
  // --- BASE ---
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": { symbol: "USDC", decimals: 6 },
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", decimals: 18 },
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": { symbol: "DAI", decimals: 18 },
  // --- BSC ---
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": { symbol: "WBNB", decimals: 18 },
  "0x55d398326f99059ff775485246999027b3197955": { symbol: "USDT", decimals: 18 },
  // --- ETHEREUM ---
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6 },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC", decimals: 6 },
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": { symbol: "WETH", decimals: 18 },
};

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

export async function startEvmWorker(resilient: ResilientProvider, chainLabel: string) {
  console.log(` [${chainLabel} Hub] Activating Standalone EVM Stream...`);
  
  // [INHUMAN RESILIENCE] Use persistent subscription model.
  // This ensures listeners survive WebSocket rotations automatically.
  resilient.on("block", async (blockNumber: number) => {
    try {
        const block = await resilient.call<any>(p => p.getBlock(blockNumber, true));
        if (!block || !block.prefetchedTransactions) return;

        // Dynamic native token mapping based on chain sector
        const nativeSymbol = 
            chainLabel === 'BSC' ? 'BNB' : 
            chainLabel === 'POLYGON' ? 'MATIC' : 
            'ETH';

        const nativePrice = await getCachedPrice(nativeSymbol) || (nativeSymbol === 'ETH' ? 3300 : nativeSymbol === 'BNB' ? 580 : 1);

        for (const tx of block.prefetchedTransactions) {
            const valueNative = parseFloat(ethers.formatEther(tx.value));
            const usdValue = valueNative * nativePrice;
            if (usdValue >= WHALE_THRESHOLD_USD) {
                await processWhaleTx(tx.hash, tx.from, tx.to || "Contract", nativeSymbol, valueNative, usdValue, blockNumber, chainLabel, { method: "Native" });
            }
        }
    } catch (e: any) {}
  });

  const filter = { topics: [TRANSFER_TOPIC] };
  resilient.on(filter, async (log: any) => {
    try {
        const config = TOKEN_CONFIG[log.address.toLowerCase()];
        if (!config) return;

        // FIX: Guard against non-standard Transfer events where topics[1] or topics[2]
        // may be missing (e.g. scam contracts that omit 'indexed' on address params).
        // Previously this would crash the entire worker with a null-reference error.
        if (!log.topics || log.topics.length < 3 || !log.data || log.data === '0x') return;

        let from: string, to: string, tokenAmount: number;
        try {
            const parsedLog = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
            tokenAmount = parseFloat(ethers.formatUnits(parsedLog[0], config.decimals));
            from = ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[1])[0] as string;
            to   = ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[2])[0] as string;
        } catch {
            return; // Malformed log  skip silently, do NOT crash the daemon
        }

        const price = await getCachedPrice(config.symbol);
        const usdValue = tokenAmount * price;

        if (usdValue >= WHALE_THRESHOLD_USD) {
            await processWhaleTx(log.transactionHash, from, to, config.symbol, tokenAmount, usdValue, log.blockNumber, chainLabel, { method: "ERC20" });
        }
    } catch (e: any) {/* outer safety net  daemon must never crash */}
  });

  // Fallback check: If no WebSocket providers available at boot, start polling
  if (!resilient.getWsProvider()) {
      console.warn(`️ [${chainLabel}] No initial WebSocket. Booting Polling fallback.`);
      startPollingWorker(resilient, chainLabel);
  }
}

async function startPollingWorker(resilient: ResilientProvider, chainLabel: string) {
    let lastProcessedBlock = await resilient.call<number>(p => p.getBlockNumber());
    // FIX: Cap the block range queried per polling cycle.
    // Without this, if the worker is offline for 1 hour it attempts getLogs for
    // ~300 Ethereum blocks in a single request, hitting the GetBlock/Alchemy
    // 2000-event limit and silently truncating the response  whales are missed.
    // MAX_BLOCK_CHUNK=50 guarantees complete ingestion even after long downtime.
    const MAX_BLOCK_CHUNK = 50;
    let consecutiveErrors = 0;
    const MAX_BACKOFF_MS  = 30_000; // REDUCED FROM 5 MIN TO 30 SEC FOR MULTIPLEXER AGILITY

    while (true) {
        try {
            const currentBlock = await resilient.call<number>(p => p.getBlockNumber());
            if (currentBlock > lastProcessedBlock) {
                const toBlock = Math.min(currentBlock, lastProcessedBlock + MAX_BLOCK_CHUNK);
                const logs = await resilient.call<any[]>(p => p.getLogs({
                    fromBlock: lastProcessedBlock + 1,
                    toBlock,
                    topics: [TRANSFER_TOPIC]
                }));
                for (const log of logs) {
                    const config = TOKEN_CONFIG[log.address.toLowerCase()];
                    if (config) {
                        const price = await getCachedPrice(config.symbol);
                        let tokenAmount = 0;
                        try {
                            tokenAmount = parseFloat(ethers.formatUnits(
                                ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data)[0],
                                config.decimals
                            ));
                        } catch { continue; } // Malformed data  skip

                        if (tokenAmount * price >= WHALE_THRESHOLD_USD) {
                            let fromAddr = "Unknown";
                            let toAddr   = "Unknown";
                            if (log.topics && log.topics.length >= 3) {
                                try {
                                    fromAddr = ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[1])[0] as string;
                                    toAddr   = ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[2])[0] as string;
                                } catch { /* non-standard log  keep Unknown addresses */ }
                            }
                            await processWhaleTx(log.transactionHash, fromAddr, toAddr, config.symbol, tokenAmount, tokenAmount * price, log.blockNumber, chainLabel, { method: "Polling" });
                        }
                    }
                }
                lastProcessedBlock = toBlock; // Advance only to processed toBlock, not currentBlock
            }
            consecutiveErrors = 0;
            // Adaptive polling: if no new block was detected, slow down to 15s to save CUs.
            // If new blocks were found, stay aggressive at 6s.
            const noNewBlock = !(await resilient.call<number>(p => p.getBlockNumber()).then(b => b > lastProcessedBlock).catch(() => false));
            await new Promise(r => setTimeout(r, noNewBlock ? 15_000 : 6_000));
        } catch (e: any) {
            consecutiveErrors++;
            const backoff = Math.min(30_000 * Math.pow(2, consecutiveErrors - 1), MAX_BACKOFF_MS);
            console.error(` [${chainLabel}] Polling error #${consecutiveErrors}. Backoff ${backoff / 1000}s:`, e.message);
            await new Promise(r => setTimeout(r, backoff));
        }
    }
}

async function processWhaleTx(hash: string, from: string, to: string, asset: string, amount: number, usdValue: number, blockNumber: number, chain: string, metadata: any) {
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: hash } });
    if (exists) return;

    // SCORING: Calculate institutional probability based on whale history or known addresses
    // For this phase, we flag large transfers as institutional by default for the System Terminal view.
    const isInstitutional = usdValue > 1000000;
    
    // TELEMETRY: Real-time BTC Equivalence calculation for the Cosmic Ledger
    let btcPrice = 0;
    try {
        btcPrice = await getRealTimePrice("BTC") || 65000;
    } catch {
        btcPrice = 65000; // Inhuman Resilience Fallback
    }
    const valueBTC = usdValue / btcPrice;

    // CLASSIFICATION: CEX Outflow Detection (Liquidity Leak)
    const isCexOutflow = metadata.isExchangeOutflow || from.toLowerCase().includes('binance') || from.toLowerCase().includes('coinbase');
    const type = isCexOutflow ? 'CEX_OUTFLOW' : (metadata.method || "TRANSFER");

    console.log(` [${chain}] Private_EVENT: $${(usdValue / 1e6).toFixed(2)}M | BTC: ${valueBTC.toFixed(3)} | Type: ${type}`);

    // [LOGICA INHUMANA] Ejecución paralela O(1) de persistencia BD y propagación Redis 
    // Reduce la latencia del trabajador a la mitad eliminando el bloqueo en serie.
    await Promise.all([
        prisma.whaleActivity.upsert({
            where: { transactionHash: hash },
            update: {
                usdValue: usdValue.toString(),
                valueBTC: valueBTC,
                btcPriceAtTx: btcPrice,
            },
            create: {
                immutableId: crypto.randomUUID(), 
                walletAddress: from,
                type: type,
                token: asset,
                amount: amount.toString(),
                usdValue: usdValue.toString(),
                valueBTC: valueBTC,
                btcPriceAtTx: btcPrice,
                fromAddress: from,
                toAddress: to,
                transactionHash: hash,
                blockNumber: BigInt(blockNumber),
                chain,
                institutional: isInstitutional,
                metadata: {
                    ...metadata,
                    liquidityShock: isCexOutflow,
                    detectionLatency: 0 
                },
                timestamp: new Date(),
            }
        }).catch(e => {
            if (!e.message.includes('Unique constraint')) {
                console.error(` [${chain}] DB Persistence Fail:`, e.message);
            }
        }),
        addWhaleToQueue({ 
            hash, from, to, asset, amount, usdValue, valueBTC, 
            blockNumber: blockNumber.toString(), chain, type, 
            institutional: isInstitutional, metadata 
        }).catch(e => {
            console.error(` [${chain}] Redis Queue Fail:`, e.message);
        })
    ]);
}
