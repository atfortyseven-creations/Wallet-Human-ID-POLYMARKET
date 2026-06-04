import 'dotenv/config';
import { walletAnalyticsService } from '../lib/wallet/WalletAnalyticsService';

const USER_ADDRESS = '0x78831c25c86eA2a78A6127fC2Ccb95E612D87b4a';

async function testUserDebug() {
    try {
        console.log(`[DEBUG] Starting analysis for ${USER_ADDRESS}...`);
        
        // 1. Get Singleton
        // const analyticsService = WalletAnalyticsService.getInstance(); // No longer needed
        
        // 2. Fetch Full Analytics
        console.log('[DEBUG] Fetching full analytics...');
        const data = await walletAnalyticsService.getFullAnalytics(USER_ADDRESS);
        
        // 3. Log Results
        console.log('\n[DEBUG] === PORTFOLIO RESULTS ===');
        console.log(`Total Value: $${data.totalValue.toFixed(2)}`);
        console.log(`Active Networks: ${data.networksActive?.join(', ') || 'None'}`);
        
        // Check breakdown if available
        if (data.totalValue > 0) {
            // We need to fetch the underlying portfolio to see the specific items if not exposed detailed enough in summary
            // But we can approximate from what we have or log the breakdown if available
            // Note: WalletAnalytics interface might not expose the raw token list directly in the top level response 
            // depending on the implementation, but let's check what we get.
            // Actually, getWalletAnalytics returns a WalletAnalytics object which has `yieldPositions`, `dappActivities` etc.
            // but the raw token list is usually inside the mapped `portfolio` object which isn't fully returned in the public interface
            // unless we modify the service or rely on logs. 
            // HOWEVER, we can call PortfolioService directly to get the token breakdown.
        }
        
    } catch (e) {
        console.error('[DEBUG] Failed:', e);
    }
}

// 4. Detailed Portfolio Check
import { portfolioService } from '../lib/blockchain/PortfolioService';
import { ChainId } from '../lib/blockchain/BlockchainService';

async function deepDive() {
    await testUserDebug();

    console.log('\n[DEBUG] === DETAILED CHAIN BREAKDOWN ===');
    const chains = [ChainId.MAINNET, ChainId.OPTIMISM, ChainId.BASE, ChainId.POLYGON, ChainId.WORLDCHAIN];
    
    for (const chain of chains) {
        console.log(`[DEBUG] Checking Chain ${chain}...`);
        try {
            const result = await portfolioService.getFullPortfolio(chain, USER_ADDRESS);
            if (result && result.tokens && result.tokens.length > 0) {
                 const nonZero = result.tokens.filter((t: any) => parseFloat(t.balance) > 0);
                 if (nonZero.length > 0) {
                     console.log(`[DEBUG] Chain ${chain} has ${nonZero.length} assets:`);
                     nonZero.forEach((t: any) => {
                         console.log(`   - ${t.symbol}: ${t.balance} ($${t.valueUsd?.toFixed(2)})`);
                     });
                 }
            }
        } catch (e: any) {
            console.log(`[DEBUG] Chain ${chain} error: ${e.message}`);
        }
    }
}

deepDive();
