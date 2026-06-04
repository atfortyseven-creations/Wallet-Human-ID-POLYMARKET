import { WebSocket } from 'ws';
import { ethers } from 'ethers';

const ALCHEMY_WS_URL = process.env.ALCHEMY_WS_URL || 'wss://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY';
const MIN_WHALE_TX_ETH = 100; // 100 ETH minimum to flag as whale in mempool

export class SystemMempoolListener {
    private ws: WebSocket | null = null;
    private provider: ethers.WebSocketProvider;
    private isRunning = false;

    constructor() {
        this.provider = new ethers.WebSocketProvider(ALCHEMY_WS_URL);
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        console.log('[SystemMempool] Initializing Bare-Metal WebSocket to Global Mempool...');

        // Using direct ethers.js subscription for robustness instead of raw wss
        this.provider.on('pending', async (txHash: string) => {
            try {
                // Fetch full transaction details from the mempool
                const tx = await this.provider.getTransaction(txHash);
                
                if (tx && tx.value) {
                    const ethValue = parseFloat(ethers.formatEther(tx.value));
                    
                    if (ethValue >= MIN_WHALE_TX_ETH) {
                        console.log(`[SystemMempool]  WHALE DETECTED IN MEMPOOL (-12s advantage)`);
                        console.log(`Hash: ${tx.hash}`);
                        console.log(`Value: ${ethValue} ETH`);
                        console.log(`From: ${tx.from}`);
                        console.log(`To: ${tx.to}`);
                        
                        // Here we could emit to Redis pub/sub for frontend consumption
                        // redisClient.publish('mempool:whale', JSON.stringify({ ...tx }));
                    }
                }
            } catch (err) {
                // Silent fail on individual tx fetch errors (common in mempool as txs drop)
            }
        });

        (this.provider.websocket as any).onclose = () => {
            console.error('[SystemMempool] WebSocket Connection Lost. Reconnecting in 5s...');
            this.isRunning = false;
            setTimeout(() => this.start(), 5000);
        };
    }

    public stop() {
        console.log('[SystemMempool] Terminating Neural Link.');
        this.isRunning = false;
        this.provider.removeAllListeners('pending');
        if (this.provider.websocket) {
            (this.provider.websocket as any).close();
        }
    }
}

// Singleton export
export const globalMempoolListener = new SystemMempoolListener();
