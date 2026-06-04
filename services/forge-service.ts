import prisma from '@/lib/prisma';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { FORGE_ENABLED, TIER_THRESHOLDS } from '@/lib/forge';
import { CosmicSeed, CosmicEntityBase, EntityTier, GeneratorType } from '@/lib/forge/types';
import * as Generators from '@/lib/forge/generators';
import crypto from 'crypto';

export class ForgeService {
  /**
   * Calculate SHA-256 hash to act as the Cosmic Seed
   */
  static generateSeedHash(whaleEventId: string, amountUSD: number, timestamp: number): string {
    const payload = `${whaleEventId}-${amountUSD}-${timestamp}-Enterprise-FORGE`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Determine tier based on the USD amount
   */
  static determineTier(amountUSD: number): EntityTier {
    if (amountUSD >= TIER_THRESHOLDS.MEGALODON) return 'MEGALODON';
    if (amountUSD >= TIER_THRESHOLDS.LEVIATHAN) return 'LEVIATHAN';
    if (amountUSD >= TIER_THRESHOLDS.KRAKEN)    return 'KRAKEN';
    return 'NARWHAL';
  }

  /**
   * Select a generator blindly/randomly for V1, or deterministic by hash
   */
  static getGeneratorType(seedHash: string): GeneratorType {
    const char = seedHash.charAt(0).toLowerCase();
    if (['0','1','2'].includes(char)) return 'COSMIC_ART';
    if (['3','4','5'].includes(char)) return 'LIVING_MUSIC';
    if (['6','7','8'].includes(char)) return 'BIOTECH_DNA';
    if (['9','a','b'].includes(char)) return 'HIVE_AGENT';
    if (['c','d'].includes(char))     return 'WORLD_SIM';
    return 'AUTO_CONTRACT'; // 'e', 'f'
  }

  /**
   * Core pipeline: Take raw whale event, generate seed, create entity
   */
  static async processWhaleSeed(seed: CosmicSeed): Promise<CosmicEntityBase | null> {
    if (!FORGE_ENABLED) return null;

    // Zero-mock mandate: verify it hasn't been created
    const existing = await prisma.cosmicEntity.findUnique({
      where: { seedHash: seed.seedHash }
    });

    if (existing) {
      console.warn(`[CosmicForge] Seed ${seed.seedHash} already invoked.`);
      return existing as unknown as CosmicEntityBase;
    }

    const generatorType = this.getGeneratorType(seed.seedHash);

    // Hydrate metadata by invoking correct generator
    let payload = {};
    switch (generatorType) {
        case 'COSMIC_ART': payload = { artMetadata: Generators.CosmicArtGenerator.generate(seed) }; break;
        case 'LIVING_MUSIC': payload = { musicMetadata: Generators.LivingMusicGenerator.generate(seed) }; break;
        case 'BIOTECH_DNA': payload = { biotechMetadata: Generators.BiotechDnaGenerator.generate(seed) }; break;
        case 'WORLD_SIM': payload = { worldSimMetadata: Generators.WorldSimGenerator.generate(seed) }; break;
        case 'HIVE_AGENT': payload = { agentMetadata: Generators.HiveAgentGenerator.generate(seed) }; break;
        case 'AUTO_CONTRACT': payload = { contractAddress: Generators.AutoContractGenerator.generate(seed).template }; break; // Stub until deployment
    }

    try {
      const entity = await prisma.cosmicEntity.create({
        data: {
          seedHash: seed.seedHash,
          whaleEventId: seed.eventId,
          tier: seed.tier,
          amountUSD: seed.amountUSD,
          chain: seed.chain,
          generatorType,
          status: 'ACTIVE',
          hiveEnergyAtBirth: await this.getHiveEnergy(),
          ...payload
        }
      });

      // Update Mesh Real-time
      await safeRedisSet(`system:forge:trigger:${seed.tier.toLowerCase()}`, JSON.stringify(entity), 'EX', 3600);
      
      console.log(`[CosmicForge]  Entity invoked: ${entity.id} (${seed.tier})`);
      return entity as unknown as CosmicEntityBase;
      
    } catch (error) {
      console.error('[CosmicForge] Error creating entity:', error);
      return null;
    }
  }

  /**
   * Sum of all ACTIVE and HIBERNATING entity values
   */
  static async updateHiveEnergy(): Promise<number> {
    if (!FORGE_ENABLED) return 0;

    try {
      // Aggregation
      const result = await prisma.cosmicEntity.aggregate({
        where: {
          status: { in: ['ACTIVE', 'HIBERNATING'] }
        },
        _sum: {
          amountUSD: true
        }
      });
      
      const energy = result._sum.amountUSD || 0;
      await safeRedisSet('system:hive:energy', energy.toString());
      return energy;
    } catch (e) {
      console.error('[CosmicForge] Failed to calculate Hive Energy', e);
      return 0;
    }
  }

  static async getHiveEnergy(): Promise<number> {
    const cached = await safeRedisGet('system:hive:energy');
    if (cached && cached !== 'TIMEOUT') return parseFloat(cached);
    return this.updateHiveEnergy();
  }
}
