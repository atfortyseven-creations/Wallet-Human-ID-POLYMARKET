
import { portfolioService } from '../lib/blockchain/PortfolioService';
import { ChainId } from '../lib/blockchain/BlockchainService';
import * as dotenv from 'dotenv';

dotenv.config();

async function verifyPortfolio() {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik's address
    console.log(`Verifying Portfolio for ${address}...`);

    const chains = [ChainId.MAINNET, ChainId.POLYGON, ChainId.OPTIMISM]; 

    try {
        const result = await portfolioService.getMultiChainPortfolio(address, chains);
        
        console.log('--- Portfolio Result ---');
        console.log(`Total Value: $${result.totalValueUsd?.toFixed(2)}`);
        // console.log(`Token Count: ${result.tokens.length}`);
        // console.log(`Chains: ${Object.keys(result.chainBreakdown).join(', ')}`);
        
        const polyTokens = result.tokens.filter((t: any) => t.chainId === ChainId.POLYGON);
        console.log(`Polygon Tokens Found: ${polyTokens.length}`);
        
        if (polyTokens.length > 0) {
            console.log('Sample Polygon Token:', polyTokens[0].symbol, polyTokens[0].balanceFormatted);
        } else {
            console.error(' Failed to find Polygon tokens');
        }

    } catch (error) {
        console.error(' Verification FAILED:', error);
    }
}

verifyPortfolio();
