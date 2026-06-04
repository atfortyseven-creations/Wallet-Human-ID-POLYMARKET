import { prisma } from '@/lib/prisma';
import { portfolioService } from '../blockchain/PortfolioService';
import { ChainId } from '../blockchain/BlockchainService';

// ----------------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------------


const SYNC_COOLDOWN_MS = 30000; // 30s Cooldown to prevent RPC spam
const lastSyncMap: Record<string, number> = {};
const lastResultMap: Record<string, any> = {}; //  Store last successful results

// ----------------------------------------------------------------------------
// DEPOSIT WATCHER SERVICE
// ----------------------------------------------------------------------------

export class DepositWatcher {
    
    constructor() {
        console.log(`[DepositWatcher] Initialized via PortfolioService Bridge.`);
    }

    /**
     * SYNCHRONIZE a specific user's wallet state.
     * Formula: Free Balance = Real On-Chain Balance - Locked in Orders
     */
    async syncUserBalance(userId: string, walletAddress: string) {
        const now = Date.now();
        const lastSync = lastSyncMap[walletAddress] || 0;
        
        //  FIX: Return cached data during cooldown instead of just {skipped: true}
        if (now - lastSync < SYNC_COOLDOWN_MS) {
            const cachedResult = lastResultMap[walletAddress];
            if (cachedResult) {
                console.log(`[DepositWatcher] Sync skipped (Cooldown), returning cached data for ${walletAddress}`);
                return cachedResult; // Return actual balance data
            } else {
                console.log(`[DepositWatcher] Sync skipped (Cooldown) for ${walletAddress}, no cache available`);
                return { skipped: true }; // Only skip if no cache exists
            }
        }

        try {
            console.log(`[DepositWatcher]  Universal Sync initiated for ${walletAddress}...`);
            
            //  Fetch ALL assets across ALL supported chains (including Worldchain for AUTH)
            const portfolio = await portfolioService.getMultiChainPortfolio(walletAddress, [
                ChainId.MAINNET,
                ChainId.BASE,
                ChainId.POLYGON,
                ChainId.ARBITRUM,
                ChainId.OPTIMISM,
                ChainId.WORLDCHAIN //  CRITICAL: AUTH tokens are native on Worldchain
            ]);

            if (!portfolio || !portfolio.tokens) {
                throw new Error("Failed to fetch portfolio data");
            }

            const results: Record<string, any> = {};

            // 1. Process each token found in the real portfolio
            // We group by symbol for the exchange view
            for (const token of portfolio.tokens) {
                const asset = token.symbol.toUpperCase();
                const realBalance = token.balanceNumeric;

                const internalState = await prisma.exchangeBalance.findUnique({
                    where: { userId_asset: { userId, asset } }
                });

                const locked = internalState ? Number(internalState.locked) : 0;
                let newFree = realBalance - locked;
                if (newFree < 0) newFree = 0;

                await prisma.exchangeBalance.upsert({
                    where: { userId_asset: { userId, asset } },
                    update: { free: newFree },
                    create: {
                        userId,
                        asset,
                        free: newFree,
                        locked: 0
                    }
                });

                results[asset] = { real: realBalance, free: newFree, locked };
            }

            lastSyncMap[walletAddress] = now;
            lastResultMap[walletAddress] = results; //  Cache successful result
            console.log(`[DepositWatcher]  Sync complete for ${walletAddress}. ${portfolio.tokens.length} assets synced.`);
            return results;
        } catch (error) {
            console.error(`[DepositWatcher]  Sync failed for ${walletAddress}:`, error);
            return null;
        }
    }


    /**
     * Run a full cycle for all users in parallel
     */
    async runCycle() {
        const users = await prisma.user.findMany({
            select: { walletAddress: true }
        });

        console.log(`[DepositWatcher] Starting sync cycle for ${users.length} users...`);
        const startTime = Date.now();

        // Use Promise.all with chunking to avoid overwhelming RPCs but maximize speed
        const chunkSize = 25;
        for (let i = 0; i < users.length; i += chunkSize) {
            const chunk = users.slice(i, i + chunkSize);
            await Promise.all(chunk.map(user => 
                this.syncUserBalance(user.walletAddress, user.walletAddress)
            ));
        }

        const duration = Date.now() - startTime;
        console.log(`[DepositWatcher] Cycle completed in ${duration}ms for ${users.length} users.`);
    }

    /**
     * Start the continuous sync engine (Real-Time Ledger Connectivity)
     */
    start() {
        console.log(`[DepositWatcher] Engine STARTED. Monitoring 100+ users.`);
        setInterval(() => {
            this.runCycle().catch(err => console.error('[DepositWatcher] Cycle Error:', err));
        }, 30000); // 30s cycle for ledger stability
    }
}

// Export singleton
export const cashier = new DepositWatcher();

