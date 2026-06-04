import { NextRequest } from "next/server";
import { ethers } from "ethers";
import { getPriceCached } from '@/lib/price-cache';

// Force dynamic execution for SSE
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration for serverless environments (if applicable)

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();
    
    // We stream standard SSE
    const stream = new ReadableStream({
        async start(controller) {
            // Priority: Alchemy env var -> Infura ENV var -> Public node fallback
            let wsUrl = 'wss://ethereum-rpc.publicnode.com';
            if (process.env.ALCHEMY_API_KEY) {
                wsUrl = `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
            } else if (process.env.INFURA_API_KEY) {
                wsUrl = `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;
            }

            try {
                const provider = new ethers.WebSocketProvider(wsUrl, 1);
                
                // Catch internal provider errors to prevent process crash
                provider.on('error', (err) => console.error("Mempool stream Provider Error:", err.message || err));
                
                // Throttle control: We don't want to choke the browser with 5000 tx/sec.
                // We'll queue them and process a batch, or just emit a percentage of the mempool 
                // to visualize the "Cosmic Dust", and highlight the heavy ones.
                
                let txCount = 0;
                let ethPriceUSD = 3000; // Fallback
                
                // Fetch real ETH price background task using centralized cache
                const updateEthPrice = async () => {
                    try {
                        ethPriceUSD = await getPriceCached('ethereum', 'ETH');
                    } catch (e) {
                        console.error("Failed to fetch ETH price", e);
                    }
                };
                updateEthPrice();
                const priceInterval = setInterval(updateEthPrice, 60000); // Update every minute
                
                provider.on("pending", async (txHash) => {
                    txCount++;
                    // Basic rate limiting to not overwhelm the UI with dust
                    const isPassedFilter = txCount % 10 === 0;

                    if (isPassedFilter) {
                        // Forward 10% of tx hashes as "dust" visualization  value is unknown until fetched
                        const payload = {
                            hash: txHash,
                            timestamp: Date.now(),
                            value: null,    // Real value unknown for dust  don't simulate it
                            type: 'dust',
                            gasPrice: null  // Real gasPrice unknown for dust  don't simulate it
                        };
                        try {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
                        } catch(e) { }
                    }

                    // Deterministic deep-dive filter: every 5th tx  no Math.random()
                    if (txCount % 5 === 0) {
                        try {
                            const tx = await provider.getTransaction(txHash);
                            if (tx && tx.value > 0n) {
                                const ethValue = Number(ethers.formatEther(tx.value));
                                const valueUSD = ethValue * ethPriceUSD;
                                
                                // WHALE THRESHOLD: > $500,000 USD
                                if (valueUSD > 500000) {
                                    // Also check if this address is tracked in Prisma
                                    // Requires Prisma client but we won't import it here to avoid breaking SSE Edge functions limits.
                                    // In a full implementation, you'd trigger a background pub/sub here.
                                    
                                    const payload = {
                                        hash: txHash,
                                        timestamp: Date.now(),
                                        value: ethValue, // Real value
                                        type: 'whale',
                                        gasPrice: tx.gasPrice ? Number(ethers.formatUnits(tx.gasPrice, 'gwei')) : 25,
                                        from: tx.from,
                                        to: tx.to
                                    };
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
                                }
                            }
                        } catch (e) {
                            // Tx not found yet or RPC rate limited
                        }
                    }
                });
                
                // Keep-alive ping every 15s to keep the SSE connection open
                const pingInterval = setInterval(() => {
                    try {
                        controller.enqueue(encoder.encode(`: ping\n\n`));
                    } catch(e) {
                        clearInterval(pingInterval);
                    }
                }, 15000);

                req.signal.addEventListener("abort", () => {
                    clearInterval(pingInterval);
                    clearInterval(priceInterval); // Fix memory leak
                    provider.removeAllListeners();
                    provider.destroy();
                });

            } catch (err) {
                console.error("Mempool Socket Error:", err);
                controller.error(err);
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}

