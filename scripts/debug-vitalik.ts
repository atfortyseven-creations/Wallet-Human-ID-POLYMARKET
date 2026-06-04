
import 'dotenv/config';
import { portfolioService } from '../lib/blockchain/PortfolioService';
import { getLegendaryStats } from '../lib/stats-engine';

async function main() {
    const address = 'vitalik.eth';
    console.log(`Fetching stats for ${address}...`);
    
    try {
        // Test 1: Stats Engine (High Level)
        const stats = await getLegendaryStats(address, true);
        console.log('\n--- LEGENDARY STATS ---');
        console.log('Total Value:', stats.totalValue);
        console.log('Token Count:', stats.tokenCount);
        console.log('Breakdown (Top 5):', Object.entries(stats.breakdown).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 5));
        
        // Test 2: Portfolio Service Direct (Deep Dive)
        console.log('\n--- PORTFOLIO SERVICE DETAILS ---');
        const portfolio = await portfolioService.getMultiChainPortfolio(address, undefined, true, true); // Force deep + refresh
        
        const topTokens = portfolio.tokens.sort((a: any, b: any) => b.valueUsd - a.valueUsd).slice(0, 10);
        console.log('Top 10 Tokens:');
        topTokens.forEach((t: any) => {
            console.log(`- ${t.symbol} (${t.chain || '?'}) : $${t.valueUsd.toFixed(2)} [${t.balanceFormatted}]`);
        });

        console.log('\nChain Breakdown:', portfolio.chainBreakdown);
        
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
