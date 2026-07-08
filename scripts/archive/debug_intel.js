
const { walletAnalyticsService } = require('./lib/wallet/WalletAnalyticsService');

async function debug() {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
    console.log('Testing Legendary Analytics for:', address);
    try {
        const intel = await walletAnalyticsService.getFullAnalytics(address, true);
        console.log('--- INTELLIGENCE REPORT ---');
        console.log('Total Value:', intel.totalValue);
        console.log('TX Count:', intel.txCount);
        console.log('Heatmap Samples:', intel.transactionHeatmap?.filter(h => h.txCount > 0).length);
        console.log('Top Counterparties:', intel.topCounterparties?.length);
        console.log('Token Flows:', intel.tokenFlowAnalysis?.length);
        console.log('DApp Activities:', intel.dappActivities?.length);
        console.log('Error Status:', intel.error || 'NONE');
        if (intel.error) console.log('Error Message:', intel.errorMessage);
        
        // Detailed check
        if (intel.transactionHeatmap) {
            const hasData = intel.transactionHeatmap.some(h => h.txCount > 0);
            console.log(' Heatmap has data:', hasData);
        }
    } catch (e) {
        console.error('Debug failed:', e);
    }
}

debug();
