import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const resultSend = await prisma.transaction.deleteMany({
    where: { txHash: { endsWith: '-send' } }
  });
  console.log(`Deleted ${resultSend.count} old -send records.`);

  const resultReceive = await prisma.transaction.deleteMany({
    where: { txHash: { endsWith: '-receive' } }
  });
  console.log(`Deleted ${resultReceive.count} old -receive records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
