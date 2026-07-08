import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const qdTransactions = await prisma.transaction.findMany({
    where: { token: 'QDs' },
    orderBy: { timestamp: 'desc' },
    take: 20
  });
  console.log("Recent QD transactions:", qdTransactions.length);
  console.dir(qdTransactions, { depth: null });
  
  const allQd = await prisma.transaction.count({ where: { token: 'QDs' }});
  console.log("Total QD transactions:", allQd);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
