import { getNeo4jDriver, runQuery } from '@/lib/neo4j';
import { CosmicEntityBase } from '../types';

export class TemporalGraph {
  /**
   * Registers a new entity in the Neo4j Graph
   */
  static async registerEntity(entity: CosmicEntityBase) {
    const query = `
      MERGE (e:CosmicEntity { id: $id })
      SET e.seedHash = $seedHash,
          e.tier = $tier,
          e.chain = $chain,
          e.generatorType = $generatorType,
          e.status = $status,
          e.createdAt = $createdAt
      RETURN e
    `;

    try {
      await runQuery(query, {
        id: entity.id,
        seedHash: entity.seedHash,
        tier: entity.tier,
        chain: entity.chain,
        generatorType: entity.generatorType,
        status: entity.status,
        createdAt: entity.createdAt.toISOString()
      });
      console.log(`[TemporalGraph] Registered Node: ${entity.id}`);
    } catch (e) {
      console.error('[TemporalGraph] Failed to register entity node.', e);
    }
  }

  /**
   * Records an evolution step between parent and child/new state
   */
  static async recordEvolution(parentId: string, childId: string, trigger: string) {
    const query = `
      MATCH (p:CosmicEntity { id: $parentId })
      MATCH (c:CosmicEntity { id: $childId })
      MERGE (p)-[r:EVOLVED_INTO { timestamp: $timestamp, trigger: $trigger }]->(c)
      RETURN r
    `;
    try {
      await runQuery(query, {
        parentId,
        childId,
        trigger,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('[TemporalGraph] Failed to record evolution edge.', e);
    }
  }

  /**
   * Detects merge candidates (entities on the same chain max 2 hops away or completely disconnected)
   * This drives the Mass Transfer Analytics AI logic.
   */
  static async findMergeCandidates() {
    const query = `
      MATCH (a:CosmicEntity), (b:CosmicEntity)
      WHERE a.id <> b.id 
        AND a.chain = b.chain 
        AND a.status = 'ACTIVE' 
        AND b.status = 'ACTIVE'
        // Just an arbitrary graph proximity heuristic for demonstration
        AND NOT (a)-[:EVOLVED_INTO*1..3]-(b)
      RETURN a, b
      LIMIT 5
    `;
    try {
      const result = await runQuery(query);
      return result.records.map(r => ({
        a: r.get('a').properties,
        b: r.get('b').properties
      }));
    } catch (e) {
      console.error('[TemporalGraph] Failed finding merge candidates.', e);
      return [];
    }
  }
}
