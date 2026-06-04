import { Worker, Job } from 'bullmq';
import { createRedisClient } from '../lib/redis/client';
import { ForgeService } from '../services/forge-service';
import { CosmicSeed } from '@/lib/forge/types';
import { FORGE_ENABLED } from '@/lib/forge';

// Singleton Redis connections for the worker
const connection = createRedisClient({ name: 'CosmicForgeWorker' });

export function startCosmicForgeWorker() {
  if (!FORGE_ENABLED) {
    console.log('[CosmicForgeWorker]  Forge is disabled by ENABLE_COSMIC_FORGE=false');
    return;
  }

  // Energy heartbeat every 30s
  setInterval(async () => {
    try {
      const energy = await ForgeService.updateHiveEnergy();
      console.log(`[CosmicForgeWorker]  Hive Energy Pulse: $${energy.toLocaleString()}`);
    } catch (e) {
      console.error('[CosmicForgeWorker] Hive Energy Pulse failed.', e);
    }
  }, 30000);

  // BullMQ Worker to process incoming seeds
  const worker = new Worker('forge:seed', async (job: Job) => {
    const { eventId, amountUSD, chain, timestamp } = job.data;

    // Recon / Validation
    if (!eventId || amountUSD < 1_000_000) {
      console.log(`[CosmicForgeWorker] IGNORING ${eventId} - Below $1M Narwhal threshold`);
      return;
    }

    const tier = ForgeService.determineTier(amountUSD);
    const seedHash = ForgeService.generateSeedHash(eventId, amountUSD, timestamp || Date.now());

    const seed: CosmicSeed = {
      seedHash,
      eventId,
      amountUSD,
      chain,
      tier,
      timestamp: timestamp || Date.now()
    };

    console.log(`[CosmicForgeWorker]  Processing Cosmic Seed for ${tier} (Hash: ${seedHash.substring(0, 8)}...)`);
    const entity = await ForgeService.processWhaleSeed(seed);

    if (entity) {
      console.log(`[CosmicForgeWorker]  Entity Created: ${entity.id} [${entity.generatorType}]`);
    }

  }, { connection });

  worker.on('failed', (job, err) => {
    console.error(`[CosmicForgeWorker] Job ${job?.id} failed with ${err.message}`);
  });

  console.log('[CosmicForgeWorker]  Initialization complete. Listening on "forge:seed"');
}
