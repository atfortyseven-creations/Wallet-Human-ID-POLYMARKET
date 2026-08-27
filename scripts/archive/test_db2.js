const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('LedgerActivity:', await prisma.ledgerActivity.count());
  console.log('Transaction:', await prisma.transaction.count());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
