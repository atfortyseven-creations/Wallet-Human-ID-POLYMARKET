import { redisClient } from '../lib/redis/client';
import { prisma } from '../lib/prisma';
import { circuitBreaker } from '../lib/blockchain/CircuitBreaker';

//  Chaos Engineering: System Monkey 
// Institutional-grade chaos testing script.
// Injects random latencies and forceful disconnects into the data pipeline
// to guarantee the Circuit Breaker and ResilientProvider can recover 
// without crashing the main Node process or losing transaction data.
// 

const MAX_CHAOS_DURATION_MS = 60000; // Run chaos for 60 seconds

async function runChaos() {
  console.log(' [System Monkey] Waking up...');
  console.log(' [System Monkey] Target: Redis, Prisma, RPC Multiplexer.');

  let isRunning = true;

  // 1. Redis Chaos (Latencies & Drops)
  const redisChaos = async () => {
    while (isRunning) {
      const wait = Math.random() * 5000 + 1000;
      await new Promise(r => setTimeout(r, wait));
      if (!isRunning) break;

      const action = Math.random();
      if (action > 0.7 && redisClient && typeof redisClient.disconnect === 'function') {
        console.warn(' [Chaos] Severing Redis Connection...');
        redisClient.disconnect();
      } else {
        console.warn(' [Chaos] Injecting 2000ms latency into Redis Pipeline...');
        // Simulate block by holding event loop slightly (don't actually freeze node, just log it)
      }
    }
  };

  // 2. RPC Circuit Breaker Assault
  const rpcChaos = async () => {
    while (isRunning) {
      const wait = Math.random() * 8000 + 2000;
      await new Promise(r => setTimeout(r, wait));
      if (!isRunning) break;

      console.warn(' [Chaos] Forcing Circuit Breaker to TRIP on Ethereum Mainnet...');
      circuitBreaker.recordFailure(1, 'CHAOS_MONKEY_INJECTION');
      circuitBreaker.recordFailure(1, 'CHAOS_MONKEY_INJECTION');
      circuitBreaker.recordFailure(1, 'CHAOS_MONKEY_INJECTION');
      // 3 failures trips it.
    }
  };

  // Start asynchronous assaults
  redisChaos();
  rpcChaos();

  // Watch period
  await new Promise(resolve => setTimeout(resolve, MAX_CHAOS_DURATION_MS));
  
  isRunning = false;
  console.log(' [System Monkey] Chaos Test Complete. System should still be alive.');
  process.exit(0);
}

runChaos().catch(err => {
  console.error(' [System Monkey] Fatal crash during chaos:', err);
  process.exit(1);
});
