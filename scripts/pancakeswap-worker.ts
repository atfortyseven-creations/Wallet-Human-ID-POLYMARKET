/**
 *  WHALE ALERT MONITORING: PANCAKESWAP V3 (BSC)
 * Core Engine for Real-Time Elite Settlement Observation
 * 
 * Mastered by: Antigravity Systems
 * Version: 2.1.0 (Whale Elite Edition)
 */

import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getRealTimePrice } from "../lib/priceHelper";
import { addWhaleToQueue } from "../lib/queues/whaleQueue";
import { bscResilientProvider } from "../lib/blockchain/ResilientProvider";

dotenv.config();

const prisma = new PrismaClient();

// --- CONFIGURATION ---
const WHALE_THRESHOLD_USD = 50000; // Lowered to 50k for testing visibility, normally 100k+
const V3_SWAP_TOPIC = "0x19b47279447a12f1da31edcc137f8152e3796593a8d9a18ceb7875b058c422c5";

// Elite Asset Layer Cache
const BSC_TOKENS: Record<string, { symbol: string, decimals: number }> = {
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": { symbol: "WBNB", decimals: 18 },
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56": { symbol: "BUSD", decimals: 18 },
    "0x55d398326f99059fF775485246999027B3197955": { symbol: "USDT", decimals: 18 },
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": { symbol: "USDC", decimals: 18 },
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c": { symbol: "BTCB", decimals: 18 },
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8": { symbol: "ETH", decimals: 18 },
};

const tokenCache = new Map<string, { symbol: string, decimals: number }>();

/**
 * CORE MONITORING ENGINE
 */
async function startPancakeWorker() {
    console.log("\n[SYSTEM]  INITIATING WHALE PANCAKESWAP MONITOR");
    console.log(`[SYSTEM] Threshold: $${WHALE_THRESHOLD_USD.toLocaleString()} USD`);
    
    let lastProcessedBlock: number;
    try {
        lastProcessedBlock = await bscResilientProvider.call(p => p.getBlockNumber());
        console.log(`[SYSTEM] BSC Connected. Nexus established at block: ${lastProcessedBlock}`);
    } catch (err: any) {
        console.error(" [CRITICAL] Connection failed:", err.message);
        return;
    }

    // MISSION-CRITICAL EVENT LOOP
    while (true) {
        try {
            const currentBlock = await bscResilientProvider.call(p => p.getBlockNumber());
            
            if (currentBlock > lastProcessedBlock) {
                const startBlock = lastProcessedBlock + 1;
                const endBlock = Math.min(currentBlock, startBlock + 49);
                
                // Silent scanning for Elite flow
                const logs = await bscResilientProvider.call(p => p.getLogs({
                    fromBlock: startBlock,
                    toBlock: endBlock,
                    topics: [V3_SWAP_TOPIC]
                }));

                for (const log of logs) {
                    try {
                        await handleV3Swap(log);
                    } catch (e) {
                        // Resilient catch for individual log anomalies
                    }
                }

                lastProcessedBlock = endBlock;
            }
            
            // Heartbeat: Output to stdout without flooding logs
            process.stdout.write(`\r[HEARTBEAT] Block: ${currentBlock} | Active Scanners: 1 | Cache: ${tokenCache.size + Object.keys(BSC_TOKENS).length}`);
            
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error: any) {
            console.error("\n[RECOVERY] Cycle anomaly detected:", error.message);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

/**
 * High-Precision Swap Processor
 */
async function handleV3Swap(log: ethers.Log) {
    const poolAddress = log.address.toLowerCase();
    const provider = bscResilientProvider.getProvider();
    
    // Pool Info (Token0 / Token1)
    const poolContract = new ethers.Contract(poolAddress, [
        "function token0() view returns (address)",
        "function token1() view returns (address)"
    ], provider);

    const [t0Addr, t1Addr] = await Promise.all([
        poolContract.token0(),
        poolContract.token1()
    ]);

    // Decode Multi-Leg Swap data
    const iface = new ethers.Interface([
        "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
    ]);
    const decoded = iface.decodeEventLog("Swap", log.data, log.topics);
    
    const amount0 = BigInt(decoded.amount0.toString());
    const amount1 = BigInt(decoded.amount1.toString());

    // Whale Token Resolution
    const [t0, t1] = await Promise.all([
        resolveToken(t0Addr, provider),
        resolveToken(t1Addr, provider)
    ]);

    // Elite Price Discovery
    const [p0, p1] = await Promise.all([
        getRealTimePrice(t0.symbol),
        getRealTimePrice(t1.symbol)
    ]);

    const absAmount0 = amount0 < 0n ? -amount0 : amount0;
    const absAmount1 = amount1 < 0n ? -amount1 : amount1;

    const val0Usd = (Number(absAmount0) / Math.pow(10, t0.decimals)) * (p0 || 0);
    const val1Usd = (Number(absAmount1) / Math.pow(10, t1.decimals)) * (p1 || 0);

    const eliteUsdValue = Math.max(val0Usd, val1Usd);

    if (eliteUsdValue >= WHALE_THRESHOLD_USD) {
        const from = decoded.sender;
        const to = decoded.recipient;
        const mainToken = val0Usd > val1Usd ? t0.symbol : t1.symbol;
        const mainAmount = val0Usd > val1Usd 
            ? (Number(absAmount0) / Math.pow(10, t0.decimals)) 
            : (Number(absAmount1) / Math.pow(10, t1.decimals));

        await processWhaleSwap({
            hash: log.transactionHash,
            from,
            to,
            asset: mainToken,
            amount: mainAmount,
            usdValue: eliteUsdValue,
            blockNumber: log.blockNumber,
            chain: 'BSC',
            metadata: {
                dex: 'PancakeSwap V3',
                pool: poolAddress,
                token0: t0.symbol,
                token1: t1.symbol,
                chartUrl: `https://dexscreener.com/bsc/${poolAddress}`
            }
        });
    }
}

/**
 * Metadata Resolution Layer
 */
async function resolveToken(address: string, provider: ethers.Provider) {
    const addr = ethers.getAddress(address);
    if (BSC_TOKENS[addr]) return BSC_TOKENS[addr];
    if (tokenCache.has(addr)) return tokenCache.get(addr)!;

    try {
        const contract = new ethers.Contract(addr, [
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
        ], provider);
        
        const [symbol, decimals] = await Promise.all([
            contract.symbol(),
            contract.decimals()
        ]);
        
        const info = { symbol, decimals };
        tokenCache.set(addr, info);
        return info;
    } catch {
        return { symbol: "Unknown", decimals: 18 };
    }
}

/**
 * Persistence & Distribution Layer
 */
async function processWhaleSwap(data: any) {
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: data.hash } });
    if (exists) return;

    console.log(`\n[WHALE DETECTED] $${data.usdValue.toLocaleString()} USD | ${data.asset} swap on BSC`);

    try {
        await (prisma.whaleActivity as any).create({
            data: {
                walletAddress: data.from,
                type: "SWAP",
                token: data.asset,
                amount: String(data.amount),
                usdValue: String(data.usdValue),
                fromAddress: data.from,
                toAddress: data.to,
                transactionHash: data.hash,
                blockNumber: BigInt(data.blockNumber),
                chain: data.chain,
                metadata: data.metadata,
                timestamp: new Date(),
            }
        });

        await addWhaleToQueue({
            ...data,
            blockNumber: data.blockNumber.toString(),
            type: 'SWAP'
        });
    } catch (e: any) {
        console.error("[DATABASE] Persistence error:", e.message);
    }
}

// --- BOOTSTRAP ---
startPancakeWorker().catch(err => {
    console.error("[FATAL] Whale Engine failure:", err);
    process.exit(1);
});
