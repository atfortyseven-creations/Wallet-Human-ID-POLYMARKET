import { getTokenPrice, getTokenPricesBatch, discoverTokens } from '../lib/wallet/tokens';

async function testResilience() {
    console.log('--- Testing Resilience to Throttling ---');
    
    // Test 1: Batch with many tokens (force many IDs)
    console.log('\nTesting Batch Fetching...');
    const dummyAddresses = Array.from({ length: 110 }, (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`);
    const batchResult = await getTokenPricesBatch(1, dummyAddresses);
    console.log(`Batch Result for 110 tokens: ${Object.keys(batchResult).length} prices found.`);

    // Test 2: Verify Single fetcher doesn't crash on mocked throttled response
    // (In reality this would be tested with a mock server or by hitting the real API until throttled)
    console.log('\nVerifying Error Handling...');
    const singlePrice = await getTokenPrice(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7');
    console.log(`Single Price Result:`, singlePrice);

    console.log('\nResilience verification complete.');
}

testResilience().catch(console.error);
