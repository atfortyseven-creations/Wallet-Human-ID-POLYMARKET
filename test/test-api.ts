import { portfolioService } from '../lib/blockchain/PortfolioService';
import { ChainId } from '../lib/blockchain/BlockchainService';

async function testPortfolioAPI() {
  const address = '0x106260D05658e47d192D4058E3C11bB2B28Bbe9E'; 
  console.log(`Testing Portfolio for: ${address}`);
  
  try {
    const portfolio = await portfolioService.getMultiChainPortfolio(address, [ChainId.MAINNET]);
    console.log('Portfolio Result Summary:', {
      totalValue: portfolio.totalValueUsd,
      tokenCount: portfolio.tokens?.length,
      address: portfolio.address
    });
    
    if (portfolio.tokens && portfolio.tokens.length > 0) {
      console.log('Tokens found:', portfolio.tokens.map((t: any) => `${t.symbol}: $${t.valueUsd}`).join(', '));
    } else {
      console.warn('WARNING: No tokens returned in portfolio.');
    }
  } catch (error) {
    console.error('API Error:', error);
  }
}

testPortfolioAPI().catch(console.error);
