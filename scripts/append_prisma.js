const fs = require('fs');

const appendText = `
// 
// HUMANITY LEDGER INDEXER (NATIVE ON-CHAIN ARCHIVE)
// 

model HumanityLedgerBlock {
  id          BigInt   @id
  hash        String   @unique
  parentHash  String
  timestamp   BigInt
  miner       String
  gasUsed     BigInt
  gasLimit    BigInt
  baseFee     BigInt?
  txCount     Int
  syncedAt    DateTime @default(now())

  transactions HumanityLedgerTransaction[]

  @@index([timestamp(sort: Desc)])
  @@index([miner])
}

model HumanityLedgerTransaction {
  hash             String   @id
  blockNumber      BigInt
  from             String
  to               String?
  value            String
  gasPrice         String?
  gas              BigInt
  transactionIndex Int
  timestamp        BigInt
  
  block HumanityLedgerBlock @relation(fields: [blockNumber], references: [id], onDelete: Cascade)

  @@index([blockNumber])
  @@index([from, timestamp(sort: Desc)])
  @@index([to, timestamp(sort: Desc)])
  @@index([timestamp(sort: Desc)])
}
`;

fs.appendFileSync('./prisma/schema.prisma', appendText, 'utf8');
console.log('Appended Humanity Ledger models to schema.prisma');
