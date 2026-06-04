import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || 'neo4j+s://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      // Connection timeout: fail fast if Neo4j is not reachable
      connectionTimeout: 5000,
      maxConnectionPoolSize: 10,
    });
  }
  return driver;
}

export async function closeNeo4jDriver() {
  if (driver) {
    await driver.close();
  }
}

/**
 * runQuery  Execute a Cypher query with a hard 5-second timeout.
 * If Neo4j is offline (Railway service not started, routing table empty),
 * this will fail fast instead of hanging the API handler.
 */
export async function runQuery(cypher: string, params: Record<string, any> = {}) {
  const NEO4J_TIMEOUT_MS = 5000;

  const queryPromise = (async () => {
    const session = getNeo4jDriver().session();
    try {
      const result = await session.run(cypher, params);
      return result;
    } finally {
      await session.close();
    }
  })();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('NEO4J_QUERY_TIMEOUT: No response within 5s. Is the Neo4j service running?')),
      NEO4J_TIMEOUT_MS
    )
  );

  return Promise.race([queryPromise, timeoutPromise]);
}
