import 'dotenv/config';
import { walletAnalyticsService } from '../lib/wallet/WalletAnalyticsService';

async function testWhale() {
    const address = 'vitalik.eth';
    console.log(`[TEST] Starting verification for ${address}...`);
    
    const start = Date.now();
    try {
        // Use the pre-instantiated singleton to avoid constructor resolution issues
        const intel = await walletAnalyticsService.getFullAnalytics(address, true);
        
        const duration = (Date.now() - start) / 1000;
        console.log(`[TEST]  Analytics fetched in ${duration.toFixed(2)}s`);
        console.log(`[TEST] Address: ${intel.address}`);
        console.log(`[TEST] Total Value: $${intel.totalValue.toLocaleString()}`);
        console.log(`[TEST] Token Count: ${intel.breakdown ? Object.keys(intel.breakdown).length : 0}`);
        console.log(`[TEST] Smart Money Score: ${intel.smartMoneyMetrics?.score || 'N/A'}`);
        
        if (intel.totalValue > 0) {
            console.log('[TEST] SUCCESS: Value is > $0');
        } else {
            console.error('[TEST] FAILURE: Value is $0');
        }
    } catch (e: any) {
        console.error(`[TEST] CRASH: ${e.message}`);
        if (e.stack) console.error(e.stack);
    }
}

testWhale();
