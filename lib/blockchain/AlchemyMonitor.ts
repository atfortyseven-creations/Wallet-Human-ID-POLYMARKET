import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { redisClient as redis } from '../redis/client';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY || '';

const alchemy = new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
});

/**
 * AlchemyMonitor
 * Real-time mempool monitoring PERSONALIZED per connected wallet address.
 * No longer hardcoded to vitalik.eth  follows the authenticated user.
 * 
 * Architecture:
 *   - watchAddress(addr): registers WebSocket subscriptions for that address
 *   - Each user's browser connects via Socket.IO and receives only their own events
 *   - Broadcasts via Redis Pub/Sub to all server instances (multi-instance safe)
 */
export class AlchemyMonitor {
    private watchedAddresses: Set<string> = new Set();
    private subscriptions: Map<string, any[]> = new Map();

    /**
     * Register a new address to monitor in realtime.
     * Idempotent: re-registering the same address is a no-op.
     */
    public watchAddress(address: string) {
        const addr = address.toLowerCase();
        if (this.watchedAddresses.has(addr)) {
            console.log(`[AlchemyMonitor] Already watching ${addr.slice(0, 10)}...`);
            return;
        }

        console.log(` [AlchemyMonitor] Registering mempool watch for ${addr.slice(0, 10)}...`);
        this.watchedAddresses.add(addr);

        const subOut = alchemy.ws.on(
            { method: AlchemySubscription.PENDING_TRANSACTIONS, fromAddress: address },
            (tx) => this.handleTransaction(tx, 'OUT', addr)
        );
        const subIn = alchemy.ws.on(
            { method: AlchemySubscription.PENDING_TRANSACTIONS, toAddress: address },
            (tx) => this.handleTransaction(tx, 'IN', addr)
        );

        this.subscriptions.set(addr, [subOut, subIn]);
        console.log(` [AlchemyMonitor] Watching ${addr.slice(0, 10)}...  Total watched: ${this.watchedAddresses.size}`);
    }

    /**
     * Stop monitoring an address (e.g. user disconnects).
     */
    public unwatchAddress(address: string) {
        const addr = address.toLowerCase();
        this.watchedAddresses.delete(addr);
        this.subscriptions.delete(addr);
        console.log(`[AlchemyMonitor] Stopped watching ${addr.slice(0, 10)}...`);
    }

    /**
     * Legacy start() method  no longer hardcodes Vitalik.
     * Kept for backward compatibility; does nothing if no addresses registered.
     */
    public start() {
        console.log(` [AlchemyMonitor] Initialized. Watching ${this.watchedAddresses.size} addresses. Call watchAddress(addr) to register.`);
    }

    private async handleTransaction(tx: any, direction: 'IN' | 'OUT', watchedAddr: string) {
        try {
            const ethValue = BigInt(tx.value || '0');
            const ethFormatted = (Number(ethValue) / 1e18).toFixed(6);

            const eventData = {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethFormatted,
                direction,
                status: 'pending',
                timestamp: new Date().toISOString(),
                method: 'Transfer',
                watchedAddress: watchedAddr,
            };

            // Publish to address-specific channel so only that user's client picks it up
            await redis.publish(`vitals.tx.${watchedAddr}`, JSON.stringify(eventData));
            // Also broadcast to generic channel for UI components listening globally
            await redis.publish('vitals.tx.new', JSON.stringify(eventData));

            // Whale alert threshold: > 10 ETH
            if (Number(ethValue) / 1e18 > 10) {
                await redis.publish('whale-alerts', JSON.stringify({
                    type: 'TRANSACTION',
                    title: `Large Movement Detected`,
                    message: `Pending ${direction}: ${ethFormatted} ETH from ${watchedAddr.slice(0, 10)}...`,
                    severity: 'high',
                    source: 'Alchemy Mempool'
                }));
            }
        } catch (e) {
            console.error(' [AlchemyMonitor] Handle error:', e);
        }
    }
}

export const alchemyMonitor = new AlchemyMonitor();

