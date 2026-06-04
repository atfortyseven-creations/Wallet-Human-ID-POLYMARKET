import { PrismaClient } from '@prisma/client';
import neo4j from 'neo4j-driver';

const prisma = new PrismaClient();

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j+s://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

const MICRO_SECTORS = [
  "Layer-1", "Layer-2", "DeFi", "Smart Contracts", "Stablecoins",
  "Memecoins", "Gaming", "RWA", "DePIN", "AI", "Privacy", "Yield Farming",
  "Exchanges", "Business Services", "Entertainment", "Governance"
]; // Abbreviated from 103 for script

async function main() {
  console.log("Seeding PostgreSQL via Prisma...");
  for (const name of MICRO_SECTORS) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.sector.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        description: `Everything related to ${name}`,
        totalTvl: Math.random() * 10000000000,
        volume24h: Math.random() * 500000000,
        zScore: (Math.random() * 4) - 2 
      }
    });
  }

  console.log("Seeding Neo4j Knowledge Graph...");
  const session = neo4jDriver.session();
  try {
    // Basic Constraints handled outside, but let's just MERGE nodes
    await session.run(`
      MERGE (vitalik:Person {
        name: "Vitalik Buterin",
        slug: "vitalik-buterin",
        capitalInfluenced: 420000000000.0,
        role: "Founder"
      })
      MERGE (ethf:Company {
        name: "Ethereum Foundation",
        slug: "ethereum-foundation",
        type: "Development"
      })
      MERGE (eth:Token {
        name: "Ethereum",
        symbol: "ETH",
        marketCap: 450000000000.0
      })
      MERGE (vWallet:Wallet {
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        balanceUsd: 15300000.0
      })
      MERGE (layer1:Sector { name: "Layer-1", slug: "layer-1" })
      MERGE (ecosystemEth:Ecosystem { name: "Ethereum", slug: "ethereum" })

      MERGE (vitalik)-[:FOUNDED]->(ethf)
      MERGE (ethf)-[:ISSUED]->(eth)
      MERGE (vitalik)-[:OWNS_WALLET]->(vWallet)
      MERGE (eth)-[:BELONGS_TO_SECTOR]->(layer1)
      MERGE (eth)-[:NATIVE_TO]->(ecosystemEth)
    `);
    
    await session.run(`
      MERGE (marc:Person {
        name: "Marc Andreessen",
        slug: "marc-andreessen",
        capitalInfluenced: 35000000000.0,
        role: "Investor"
      })
      MERGE (a16z:Company {
        name: "a16z Crypto",
        slug: "a16z-crypto",
        type: "VC"
      })
      MERGE (marc)-[:FOUNDED]->(a16z)
    `);

    console.log("Entities injected directly into the Knowledge Graph.");
  } finally {
    await session.close();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await neo4jDriver.close();
  });
