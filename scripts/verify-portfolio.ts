
import { getLegendaryStats } from '@/lib/stats-engine';
import { ChainId } from '@/lib/blockchain/BlockchainService';

async function testPortfolio() {
  console.log('Testing Portfolio Fetching...');
  try {
    // Elite test case: Standard Top-Tier Wallet
    const stats = await getLegendaryStats('0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'); // Binance 7 for high-fidelity testing
    console.log('Portfolio Stats:', {
      totalValue: stats?.totalValue,
      tokenCount: stats?.tokens.length,
      networks: stats?.tokens.map((t: any) => t.chainId),
      hasWorldChain: stats?.tokens.some((t: any) => t.chainId === ChainId.WORLDCHAIN)
    });
  } catch (e) {
    console.error('Test Failed:', e);
  }
}

testPortfolio();
