import prisma from '@/lib/prisma';
import { HIVE_HIBERNATION_THRESHOLD_USD, FORGE_ENABLED } from '../index';
import { TemporalGraph } from './temporal-graph';
import { safeRedisSet } from '@/lib/redis/client';

export class EntityLifecycle {

  /**
   * If total Hive value crashes below $500M, active entities enter HIBERNATING mode
   * to conserve resources and simulate macro-economic darwinian pressure.
   */
  static async evaluateHibernation(currentHiveEnergyUSD: number) {
    if (!FORGE_ENABLED) return;

    if (currentHiveEnergyUSD < HIVE_HIBERNATION_THRESHOLD_USD) {
      const activeCount = await prisma.cosmicEntity.count({ where: { status: 'ACTIVE' }});
      if (activeCount > 0) {
        await prisma.cosmicEntity.updateMany({
          where: { status: 'ACTIVE' },
          data: { status: 'HIBERNATING', updatedAt: new Date() }
        });
        console.warn(`[EntityLifecycle] ️ Macro Crash detected ($${currentHiveEnergyUSD}). ${activeCount} entities forced to HIBERNATE.`);
        await safeRedisSet('system:hive:status', 'HIBERNATING');
      }
    } else {
      const hibernatingCount = await prisma.cosmicEntity.count({ where: { status: 'HIBERNATING' }});
      if (hibernatingCount > 0) {
        await prisma.cosmicEntity.updateMany({
          where: { status: 'HIBERNATING' },
          data: { status: 'ACTIVE', updatedAt: new Date() }
        });
        console.log(`[EntityLifecycle] ️ Macro Recovery ($${currentHiveEnergyUSD}). ${hibernatingCount} entities AWAKENED.`);
        await safeRedisSet('system:hive:status', 'THRIVING');
      }
    }
  }

  /**
   * Evaluates if Entities merge and create a stronger MEGALODON Entity
   */
  static async evaluateMergers() {
    if (!FORGE_ENABLED) return;

    const candidates = await TemporalGraph.findMergeCandidates();
    for (const pair of candidates) {
        // Pseudo logic for merging: if combined energy is high enough, merge them.
        const combined = pair.a.amountUSD + pair.b.amountUSD;
        if (combined > 10_000_000) {
            console.log(`[EntityLifecycle]  Entities ${pair.a.id} and ${pair.b.id} are merging into ${combined}`);
            // Update PRISMA states to MERGED
            await prisma.cosmicEntity.updateMany({
                where: { id: { in: [pair.a.id, pair.b.id] } },
                data: { status: 'MERGED', updatedAt: new Date() }
            });
            
            // Record in Neo4j
            await TemporalGraph.recordEvolution(pair.a.id, pair.b.id, 'P2P_MERGE');
        }
    }
  }
}
