import { portfolioService } from '../lib/blockchain/PortfolioService';
import { ChainId } from '../lib/blockchain/BlockchainService';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * [LEGENRDARY VERIFICATION]
 * This script measures the effectiveness of the PortfolioService cache.
 */
async function runPerformanceTest() {
  const testAddress = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'; // Vitalik's address
  const chains = [ChainId.MAINNET, ChainId.POLYGON];

  console.log(`\n [Legendary Test] Starting Performance Verification for: ${testAddress}`);
  
  // 1. First Fetch (Cold Cache)
  console.log(`\n [Step 1] Cold Cache Fetch...`);
  const startCold = Date.now();
  await portfolioService.getMultiChainPortfolio(testAddress, chains);
  const endCold = Date.now();
  console.log(`️ Cold Response: ${endCold - startCold}ms`);

  // 2. Second Fetch (Instant Cache)
  console.log(`\n [Step 2] Instant Cache Fetch...`);
  const startHot = Date.now();
  await portfolioService.getMultiChainPortfolio(testAddress, chains);
  const endHot = Date.now();
  const hotTime = endHot - startHot;
  console.log(`️ Hot Response: ${hotTime}ms`);

  // Verification
  if (hotTime < 10) {
    console.log(`\n [LEGENDARY SUCCESS] Response is instantaneous (<10ms).`);
  } else {
    console.log(`\n️ [OPTIMIZATION NEEDED] Hot response took ${hotTime}ms.`);
  }

  // 3. Pre-Warming Simulation
  console.log(`\n [Step 3] Simulating Pre-Warming...`);
  const newUser = '0x000000000000000000000000000000000000dEaD';
  await portfolioService.preWarmCache(newUser, chains);
  
  // Wait a bit for background tasks (usually instant in local but simulation needs a tick)
  console.log(` Waiting for background warming...`);
  await new Promise(resolve => setTimeout(resolve, 3000));

  const startPrewarmed = Date.now();
  await portfolioService.getMultiChainPortfolio(newUser, chains);
  const endPrewarmed = Date.now();
  console.log(`️ Pre-warmed Response: ${endPrewarmed - startPrewarmed}ms`);

  if (endPrewarmed - startPrewarmed < 10) {
    console.log(`\n [PRE-WARM SUCCESS] Background warming achieved instant access.`);
  }

  process.exit(0);
}

runPerformanceTest().catch(err => {
  console.error(err);
  process.exit(1);
});
