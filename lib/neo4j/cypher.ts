import { neo4jClient } from './client';

//  Mass Transfer Graph Heuristics 
// These functions encode the mathematical models required to map 3-hop capital
// flows across the Ethereum network, tracking CEX to DeFi movements.
// 

/**
 * Ingests a raw blockchain transaction into the graph database.
 * Creates Wallet nodes and a Transfer edge between them.
 */
export async function ingestTransferNode(
  fromAddress: string,
  toAddress: string,
  txHash: string,
  usdValue: number,
  tokenSymbol: string,
  timestamp: Date
) {
  const query = `
    MERGE (sender:Wallet { address: $fromAddress })
    MERGE (receiver:Wallet { address: $toAddress })
    CREATE (sender)-[tx:TRANSFERRED {
      hash: $txHash,
      usdValue: $usdValue,
      token: $tokenSymbol,
      timestamp: $timestamp
    }]->(receiver)
  `;

  await neo4jClient.executeWrite(query, {
    fromAddress: fromAddress.toLowerCase(),
    toAddress: toAddress.toLowerCase(),
    txHash,
    usdValue,
    tokenSymbol,
    timestamp: timestamp.toISOString()
  });
}

/**
 * Traces a 3-hop flow from known Exchange cold/hot wallets to detect 
 * coordinated accumulation patterns.
 */
export async function detectAccumulationClusters(targetAddress: string, timeWindowMinutes: number = 15) {
  const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();
  
  // Cypher: Find paths up to 3 hops where the destination is the target wallet,
  // and all transfers in the path occurred within the time window.
  const query = `
    MATCH path = (start:Wallet)-[txs:TRANSFERRED*1..3]->(target:Wallet { address: $targetAddress })
    WHERE ALL(t IN txs WHERE t.timestamp >= $cutoff)
    WITH path, nodes(path) AS entities, relationships(path) AS transfers
    RETURN 
      [n IN entities | n.address] AS hopAddresses,
      reduce(total = 0, t IN transfers | total + t.usdValue) AS pathVolumeUsd
    ORDER BY pathVolumeUsd DESC
    LIMIT 10
  `;

  const records = await neo4jClient.executeRead(query, {
    targetAddress: targetAddress.toLowerCase(),
    cutoff
  }, []);

  return records.map((record: any) => ({
    path: record.get('hopAddresses'),
    volume: record.get('pathVolumeUsd')
  }));
}
