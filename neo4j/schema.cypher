// Neo4j Cypher Schema - System Global Knowledge Graph
// Run these commands to initialize the constraints

// 1. CONSTRAINTS (Unique Identities)
CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) REQUIRE p.slug IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (c:Company) REQUIRE c.slug IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (t:Token) REQUIRE t.symbol IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (w:Wallet) REQUIRE w.address IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (s:Sector) REQUIRE s.slug IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (e:Ecosystem) REQUIRE e.slug IS UNIQUE;

// 2. VECTOR INDEXES for Embeddings (pgvector equivalence in Neo4j)
CREATE VECTOR INDEX person_bio_vector IF NOT EXISTS 
FOR (p:Person) ON (p.embedding) 
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};

// 3. SAMPLE DATA SEEDING & RELATIONSHIPS
MERGE (vitalik:Person {
  name: "Vitalik Buterin",
  slug: "vitalik-buterin",
  capitalInfluenced: 4200000000.0,
  role: "Founder"
})
MERGE (ethFoundation:Company {
  name: "Ethereum Foundation",
  slug: "ethereum-foundation",
  type: "Development"
})
MERGE (eth:Token {
  name: "Ethereum",
  symbol: "ETH",
  marketCap: 450000000000.0
})
MERGE (vitalikWallet:Wallet {
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  balanceUsd: 15000000.0
})

MERGE (layer1:Sector { name: "Layer 1", slug: "layer-1" })
MERGE (ecosystemEth:Ecosystem { name: "Ethereum", slug: "ethereum" })

// Edges (Relationships)
MERGE (vitalik)-[:FOUNDED]->(ethFoundation)
MERGE (ethFoundation)-[:ISSUED]->(eth)
MERGE (vitalik)-[:OWNS_WALLET]->(vitalikWallet)
MERGE (eth)-[:BELONGS_TO_SECTOR]->(layer1)
MERGE (eth)-[:NATIVE_TO]->(ecosystemEth)

// 4. ADVANCED FORENSIC QUERIES
// Discover Capital Flows of a Sector via Entities
// "Find all Founders who own a wallet with > $1M balance and launched a Token in Layer-1"
/*
MATCH (p:Person)-[:FOUNDED]->(c:Company)-[:ISSUED]->(t:Token)-[:BELONGS_TO_SECTOR]->(s:Sector {slug: "layer-1"})
MATCH (p)-[:OWNS_WALLET]->(w:Wallet)
WHERE w.balanceUsd > 1000000
RETURN p.name, c.name, t.symbol, w.balanceUsd
ORDER BY w.balanceUsd DESC;
*/
