import { analyticsService } from '../lib/blockchain/AnalyticsService';

async function verifyAnalytics() {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik
    console.log(`Verifying Analytics Report for: ${address}`);

    try {
        const report = await analyticsService.getAnalyticsReport(address);
        console.log('Report Structure Verification:');
        console.log({
            address: report.address,
            transactionCount: report.transactionCount,
            dappActivitySample: report.dappActivity.slice(0, 1)
        });

        const activity = report.dappActivity[0];
        if (activity) {
            if ('volumeUsd' in activity && 'txnCount' in activity) {
                console.log(' SUCCESS: Properties standardized to volumeUsd and txnCount');
            } else {
                console.error(' FAILURE: Properties NOT standardized');
            }
        } else {
            console.warn('️ WARNING: No dApp activity found for this address.');
        }

    } catch (error) {
        console.error(' ERROR during verification:', error);
    }
}

verifyAnalytics();
