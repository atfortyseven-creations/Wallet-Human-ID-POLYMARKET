import 'dotenv/config';
import { PriceService } from '../lib/blockchain/PriceService';

async function testPrice() {
    console.log('[TEST-PRICE] Starting...');
    const result = await PriceService.getBulkPrices([{ symbol: 'ETH', address: 'native', chainId: 1 }]);
    console.log('[TEST-PRICE] Result:', JSON.stringify(result, null, 2));
    if (result && result.ETH) {
        console.log('[TEST-PRICE] SUCCESS');
    } else {
        console.error('[TEST-PRICE] FAILURE: Result is', typeof result, result);
    }
}

testPrice();
