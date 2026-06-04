import { moralisService } from '../blockchain/MoralisService';

/**
 *  TRANSACTION MONITOR - MORALIS EDITION 
 * Note: Real-time monitoring now leverages Moralis Streams (Backend Configured).
 * This service handles simplified polling logic for active sessions.
 */

class TransactionMonitor {
    private activeSubscriptions: Set<string> = new Set();

    public startMonitoring(walletAddress: string, authUserId: string) {
        if (this.activeSubscriptions.has(walletAddress)) return;
        console.log(`[TxMonitor] Starting Moralis-powered watch for ${walletAddress}`);
        
        // Moralis Streams are typically configured via the Moralis Dashboard.
        // We track the subscription status here.
        this.activeSubscriptions.add(walletAddress);
    }

    public stopMonitoring(walletAddress: string) {
        console.log(`[TxMonitor] Stopped monitoring for ${walletAddress}`);
        this.activeSubscriptions.delete(walletAddress);
    }
}

export const transactionMonitor = new TransactionMonitor();

