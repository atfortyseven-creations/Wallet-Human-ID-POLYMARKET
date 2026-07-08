import assert from 'assert';

/**
 * QD Economy Security Tests
 * Penetration testing suite for Airdrops, Sybil protection, and WebRTC balances.
 * 
 * RUN VIA: npx tsx test/qd-economy.security.test.ts
 */

const API_BASE = 'http://localhost:3000/api';
const MOCK_ADDRESS = '0x1111111111111111111111111111111111111111111111111111111111111111';

async function runTests() {
  console.log('🛡️ Starting QD Economy Security Audit...');

  try {
    // --------------------------------------------------------------------------
    // TEST 1: Bypass Balance for WebRTC / ZK Grid
    // --------------------------------------------------------------------------
    console.log('▶ [TEST 1] Testing Balance Bypass Prevention (WebRTC / ZK Proof)...');
    
    const spendRes = await fetch(`${API_BASE}/aztec/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MOCK_ADDRESS,
        to: '0xdead000000000000000000000000000000000000000000000000000000000000',
        amount: 0.5,
        reason: 'Encrypted Video Call'
      })
    });
    
    // It should fail because MOCK_ADDRESS has no funds
    assert.strictEqual(spendRes.status, 400, 'Expected 400 Bad Request for Insufficient Funds');
    const spendBody = await spendRes.json();
    assert.ok(spendBody.error.includes('Insufficient QDs'), 'Error should explicitly mention insufficient funds');
    console.log('  ✅ [PASS] Zero-balance exploit blocked.');


    // --------------------------------------------------------------------------
    // TEST 2: Airdrop Sybil / Social Verification
    // --------------------------------------------------------------------------
    console.log('\n▶ [TEST 2] Testing Airdrop Calendar Anti-Sybil & Social Requirements...');
    
    const airdropRes = await fetch(`${API_BASE}/aztec/airdrop/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aztecAddress: MOCK_ADDRESS,
        debugOverride: false // Strict time & social mode
      })
    });

    const airdropBody = await airdropRes.json();
    
    const now = new Date();
    if (now.getUTCDate() !== 1) {
      assert.strictEqual(airdropRes.status, 403, 'Expected 403 Forbidden for non-1st day');
      assert.ok(airdropBody.error.includes('1st day of the month'), 'Time Gate failed');
      console.log('  ✅ [PASS] Time-spoofing exploit blocked (Not 1st day).');
    } else {
      // If it is the 1st, it should fail on Socials
      assert.strictEqual(airdropRes.status, 403, 'Expected 403 Forbidden for no socials');
      assert.ok(airdropBody.error.includes('Social requirements not met'), 'Social Gate failed');
      console.log('  ✅ [PASS] Social bypass blocked.');
    }


    // --------------------------------------------------------------------------
    // TEST 3: Social Penalty Cron Security
    // --------------------------------------------------------------------------
    console.log('\n▶ [TEST 3] Testing Cron Penalty Authorization...');
    
    const cronRes = await fetch(`${API_BASE}/cron/social-audit`);
    assert.strictEqual(cronRes.status, 401, 'Expected 401 Unauthorized for unauthenticated cron request');
    console.log('  ✅ [PASS] Unauthorized cron execution blocked.');


    console.log('\n✅ ALL SECURITY TESTS PASSED ABYSMALLY PERFECTLY.');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ SECURITY TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
