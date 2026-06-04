// FIX: Use global Prisma singleton  prevents DB connection pool exhaustion.
import { prisma } from "../../lib/prisma";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";

dotenv.config();

async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

//  RPC with timeout 
// FIX: Add AbortSignal.timeout() so a stalled Solana RPC node cannot block
// the worker loop indefinitely. Previously, a hung connection would freeze
// the entire while(true) loop with no recovery path.
async function solanaRpcCall(method: string, params: any[] = []) {
    const url = process.env.GETBLOCK_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: "2.0", id: "sol-standalone", method, params }),
        signal: AbortSignal.timeout(10000), // Institutional 10-second hard timeout 
    });
    
    // [INHUMAN DEFENSE] Explicitly handle 429 to trigger parent backoff
    if (response.status === 429) {
        throw new Error("RATE_LIMIT_429");
    }
    
    if (!response.ok) throw new Error(`Solana RPC HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(`Solana RPC error: ${JSON.stringify(data.error)}`);
    return data.result;
}

//  Wallet list 
async function getTargetWallets(): Promise<string[]> {
    try {
        const entities = await prisma.onChainEntity.findMany({
            where: { address: { startsWith: '' } }, 
            select: { address: true },
            take: 100,
        });

        const solanaAddrs = entities
            .map(e => e.address)
            .filter(a => !a.startsWith('0x') && a.length >= 32 && a.length <= 44);

        if (solanaAddrs.length > 0) return solanaAddrs;
    } catch {
        // DB unavailable  fall through to static fallback
    }

    return [
        "9WzDXwBbmxg8EXKFEV9sA4Ycdz975dGv9mC6xEqtXoGz",
        "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH", // Jump Crypto
        "GVV4pFGtBsHed4hLMh7BHqHMhgwkfBo1VuAr21jY5T9c", // Alameda remnant
    ];
}

export async function startSolanaWorker() {
    console.log(" [SOL Hub] Activating Adaptive Solana Surveillance...");
    let lastSignatures = new Map<string, string>();
    let consecutiveErrors = 0;
    const MAX_BACKOFF_MS  = 10 * 60 * 1000; // 10 minutes max for institutional patience

    while (true) {
        try {
            const targetWallets = await getTargetWallets();

            for (const wallet of targetWallets) {
                try {
                    // [JITTER] Inject small inter-wallet delay to avoid RPC bursts
                    await sleep(800 + Math.random() * 400);

                    const sigs = await solanaRpcCall("getSignaturesForAddress", [wallet, { limit: 5 }]);
                    if (!sigs || sigs.length === 0) continue;

                    const latest = sigs[0].signature;
                    if (lastSignatures.get(wallet) === latest) continue;

                    const tx = await solanaRpcCall("getTransaction", [latest, {
                        encoding: "jsonParsed",
                        maxSupportedTransactionVersion: 0,
                    }]);

                    if (tx) {
                        const postBal = tx.meta?.postBalances?.[0] ?? 0;
                        const preBal  = tx.meta?.preBalances?.[0]  ?? 0;
                        const solChange = Math.abs((postBal - preBal) / 1e9);
                        const price = await getRealTimePrice("SOL") || 140;

                        if (solChange * price >= 50000) {
                            await processWhaleTx(
                                latest, wallet, "Cluster", "SOL",
                                solChange, solChange * price,
                                tx.slot ?? 0, "SOLANA", { method: "SOL" }
                            );
                        }
                    }

                    lastSignatures.set(wallet, latest);
                    consecutiveErrors = 0; // Reset on successful wallet scan

                } catch (walletErr: any) {
                    if (walletErr.message === "RATE_LIMIT_429") {
                        // [CRITICAL SCALE] If we hit a 429, we must back off the ENTIRE worker immediately
                        console.warn(`[SOL] ️ Global Rate Limit detected on wallet ${wallet.slice(0, 5)}. Cooling down...`);
                        throw walletErr; // Re-throw to trigger outer backoff
                    }
                    console.warn(` [SOL] Wallet ${wallet.slice(0, 8)}... skipped: ${walletErr.message}`);
                }
            }

            consecutiveErrors = 0;
            await sleep(30_000); // Standard cycle sleep

        } catch (e: any) {
            consecutiveErrors++;
            // Exponential institutional backoff
            const baseWait = e.message === "RATE_LIMIT_429" ? 120_000 : 60_000;
            const backoff = Math.min(baseWait * Math.pow(2, consecutiveErrors - 1), MAX_BACKOFF_MS);
            
            const logPrefix = e.message === "RATE_LIMIT_429" ? "️ [SOL] Rate limit cooldown" : ` [SOL] Worker error`;
            console.error(`${logPrefix} #${consecutiveErrors} (${e.message}). Delay: ${backoff / 1000}s...`);
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

    // Calculate BTC Equivalence for the system view
    let btcPrice = await getRealTimePrice("BTC") || 65000;
    const valueBTC = usdValue / btcPrice;

    await prisma.whaleActivity.upsert({
        where: { transactionHash: hash },
        update: { usdValue: usdValue.toString() },
        create: {
            immutableId: `SOL-${hash.slice(0, 16)}`, 
            walletAddress: from,
            type: "SOL_TRANSFER",
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
            metadata,
            timestamp: new Date(),
        }
    }).catch(e => {
        if (!e.message.includes('Unique constraint')) {
            console.error(` [${chain}] Persistence Fail:`, e.message);
        }
    });

    await addWhaleToQueue({
        hash, from, to, asset, amount, usdValue, valueBTC,
        blockNumber: blockNumber.toString(), chain, type: "SOL", metadata,
    }).catch(e => {
        console.error(` [${chain}] Queue Fail:`, e.message);
    });
}
