import { prisma } from '@/lib/prisma';
import { portfolioService } from '@/lib/blockchain/PortfolioService';
import { ChainId } from '@/lib/blockchain/BlockchainService';
import { TransactionType, TransactionStatus } from './transactions';

/**
 * HISTORY SYNC SERVICE
 * 
 * Responsible for:
 * 1. Fetching deep on-chain history from Alchemy
 * 2. Deduplicating identifying existing transactions
 * 3. Persisting new transactions to the database
 * 4. Ensuring data integrity across chains
 */

export const historySyncService = {

    /**
     * Perform a full historical sync for a user
     * @param authUserId The internal user ID
     * @param walletAddress The blockchain address
     */
    async syncHistoricalTransactions(authUserId: string, walletAddress: string) {
        console.log(`[HistorySync] Starting full sync for ${walletAddress}`);
        
        // 1. Define chains to scan (Mainnet, Base, Optimism, Arbitrum, Polygon)
        const chains = [
            ChainId.MAINNET, 
            ChainId.BASE, 
            ChainId.OPTIMISM, 
            ChainId.ARBITRUM, 
            ChainId.POLYGON,
            ChainId.WORLDCHAIN
        ];

        let totalSynced = 0;

        for (const chainId of chains) {
            try {
                // 2. Fetch history from Alchemy via PortfolioService
                const history = await portfolioService.getAssetHistory(chainId, walletAddress);
                
                if (!history || history.length === 0) continue;

                console.log(`[HistorySync] Found ${history.length} txs on chain ${chainId}`);

                // 3. Process and persist each transaction
                for (const tx of history) {
                    await this.saveTransaction(authUserId, tx, chainId, walletAddress);
                }

                totalSynced += history.length;

            } catch (error) {
                console.error(`[HistorySync] Failed to sync chain ${chainId}:`, error);
                // Continue to next chain even if one fails
            }
        }

        console.log(`[HistorySync] Completed. Total synced: ${totalSynced}`);
        return totalSynced;
    },

    /**
     * Persist a single transaction to the database
     * Handles deduplication via unique hash
     */
    async saveTransaction(authUserId: string, tx: any, chainId: number, walletAddress: string) {
        try {
            // Map Alchemy/Etherscan type to our enum
            let type = TransactionType.SEND;
            if (tx.direction === 'IN' || tx.to?.toLowerCase() === walletAddress.toLowerCase()) {
                type = TransactionType.RECEIVE;
            }
            if (tx.category === 'erc721' || tx.category === 'erc1155') {
                type = TransactionType.NFT_TRANSFER;
            }

            // Upsert: Create if new, update if exists (e.g. status change)
            await prisma.transaction.upsert({
                where: { txHash: tx.hash },
                create: {
                    authUserId,
                    txHash: tx.hash,
                    type,
                    status: TransactionStatus.CONFIRMED, // Historical is always confirmed
                    amount: typeof tx.value === 'string' ? parseFloat(tx.value) : Number(tx.value || 0),
                    token: tx.asset || 'ETH',
                    fromAddress: tx.from,
                    toAddress: tx.to || "",
                    timestamp: tx.timestamp ? new Date(tx.timestamp) : new Date(),
                    
                    chainId,
                    value: String(tx.value || 0),
                    tokenSymbol: tx.asset || 'ETH',
                    blockNumber: tx.blockNum ? BigInt(tx.blockNum) : undefined,
                    metadata: {
                        category: tx.category,
                        source: 'ALCHEMY_SYNC',
                        syncedAt: new Date()
                    }
                },
                update: {
                    // Update metadata if needed, but respect existing user notes
                }
            });
        } catch (error) {
            // Ignore unique constraint violations (race conditions)
            console.error(`[HistorySync] Error saving tx ${tx.hash}:`, error);
        }
    }
};

