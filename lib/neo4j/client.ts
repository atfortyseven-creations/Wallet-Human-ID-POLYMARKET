import neo4j, { Driver, Session } from 'neo4j-driver';

//  System Architecture: Neo4j AuraDB Connector 
// This module provides the connection to the graph database used for Mass
// Transfer Analytics (3-hop heuristic tracing).
// 

const uri = process.env.NEO4J_URI || 'neo4j+s://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

class Neo4jClient {
  private driver: Driver | null = null;
  public isConnected: boolean = false;
  public isMock: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      if (!process.env.NEO4J_URI) {
        console.warn('[Neo4j] NEO4J_URI not provided. Running in degraded graph mode.');
        this.isMock = true;
        return;
      }

      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2000,
      });

      // Verify connection
      const serverInfo = await this.driver.getServerInfo();
      console.log(`[Neo4j] Connected to Neo4j AuraDB at ${serverInfo.address}`);
      this.isConnected = true;
    } catch (err: any) {
      console.error(`[Neo4j] Connection failed: ${err.message}. Running in degraded graph mode.`);
      this.driver = null;
      this.isConnected = false;
    }
  }

  /**
   * Provides a session to execute Cypher queries. 
   * Gracefully degrades if the database is unavailable.
   */
  public async executeRead<T>(query: string, params?: any, fallback: T = null as unknown as T): Promise<T | any> {
    if (!this.driver || !this.isConnected || this.isMock) return fallback;
    const session = this.driver.session();
    try {
      const res = await session.executeRead(tx => tx.run(query, params));
      return res.records;
    } catch (err) {
      console.error('[Neo4j] Read execution error:', err);
      return fallback;
    } finally {
      await session.close();
    }
  }

  public async executeWrite<T>(query: string, params?: any, fallback: T = null as unknown as T): Promise<T | any> {
    if (!this.driver || !this.isConnected || this.isMock) return fallback;
    const session = this.driver.session();
    try {
      const res = await session.executeWrite(tx => tx.run(query, params));
      return res.records;
    } catch (err) {
      console.error('[Neo4j] Write execution error:', err);
      return fallback;
    } finally {
      await session.close();
    }
  }

  public async close() {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
      console.log('[Neo4j] Driver closed.');
    }
  }
}

// Export singleton instance
export const neo4jClient = new Neo4jClient();
