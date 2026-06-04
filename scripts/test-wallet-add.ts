/**
 * Test script for wallet addition API
 * Run with: npx ts-node scripts/test-wallet-add.ts
 */

const TEST_WALLETS = [
  {
    name: 'Valid 0x Address (Tier-1 Whale)',
    address: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    label: 'Binance Whale (0x)',
    shouldSucceed: true
  },
  {
    name: 'Valid Elite ENS',
    address: 'binance.eth',
    label: 'Binance (ENS)',
    shouldSucceed: true
  },
  {
    name: 'Invalid Address',
    address: '0xinvalid',
    label: 'Invalid Test',
    shouldSucceed: false
  },
  {
    name: 'Non-existent ENS',
    address: 'thisensnamedoesnotexist12345.eth',
    label: 'Fake ENS',
    shouldSucceed: false
  }
];

async function testWalletAddition() {
  console.log(' Starting Wallet Addition Tests\n');
  console.log('️  NOTE: These tests require:');
  console.log('   - A running dev server (npm run dev)');
  console.log('   - Valid WEB3 address header');
  console.log('   - CSRF token generation working\n');
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const testUserAddress = process.env.TEST_USER_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Test User: ${testUserAddress}\n`);
  console.log(''.repeat(60));
  
  for (const wallet of TEST_WALLETS) {
    console.log(`\n Test: ${wallet.name}`);
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Expected: ${wallet.shouldSucceed ? ' SUCCESS' : ' FAILURE'}`);
    
    try {
      // Step 1: Get CSRF Token
      const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`, {
        headers: { 'x-web3-address': testUserAddress }
      });
      
      if (!csrfRes.ok) {
        console.log(`    Failed to get CSRF token: ${csrfRes.status}`);
        continue;
      }
      
      const { token: csrfToken } = await csrfRes.json();
      
      // Step 2: Add Wallet
      const addRes = await fetch(`${baseUrl}/api/premium/watched-wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-web3-address': testUserAddress,
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          address: wallet.address,
          label: wallet.label,
          tags: ['Test']
        })
      });
      
      const data = await addRes.json();
      
      if (addRes.ok) {
        console.log(`    Wallet added successfully`);
        console.log(`    Data:`, JSON.stringify(data, null, 2));
        
        if (!wallet.shouldSucceed) {
          console.log(`   ️  WARNING: Expected this to fail but it succeeded!`);
        }
      } else {
        console.log(`    Failed with status ${addRes.status}`);
        console.log(`    Error:`, JSON.stringify(data, null, 2));
        
        if (wallet.shouldSucceed) {
          console.log(`   ️  WARNING: Expected this to succeed but it failed!`);
        }
      }
      
    } catch (error) {
      console.log(`    Exception:`, error);
    }
  }
  
  console.log('\n' + ''.repeat(60));
  console.log('\n All tests completed!\n');
}

// Run tests
testWalletAddition().catch(console.error);
