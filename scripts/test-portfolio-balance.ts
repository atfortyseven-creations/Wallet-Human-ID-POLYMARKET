import { getPortfolio } from '../lib/wallet/portfolio';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testPortfolio() {
  const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
  console.log(`Testing portfolio for ${testAddress}...`);
  
  try {
    const portfolio = await getPortfolio(testAddress, [1]); // Only Mainnet for fast test
    console.log('Portfolio Summary:');
    console.log(`Total Value USD: $${portfolio.totalValueUSD.toFixed(2)}`);
    console.log(`24h Change: $${portfolio.change24hUSD.toFixed(2)} (${portfolio.change24hPercent.toFixed(2)}%)`);
    
    console.log('\nAssets:');
    portfolio.assets.forEach(asset => {
      console.log(`- ${asset.symbol}: ${asset.balanceFormatted} ($${asset.valueUSD.toFixed(2)}) on Chain ${asset.chainId}`);
    });

    const ethAsset = portfolio.assets.find(a => a.symbol === 'ETH' && a.tokenAddress === 'native');
    if (ethAsset) {
      console.log('\nSUCCESS: Native ETH found in portfolio!');
    } else {
      console.log('\nFAILURE: Native ETH NOT found in portfolio.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPortfolio();
