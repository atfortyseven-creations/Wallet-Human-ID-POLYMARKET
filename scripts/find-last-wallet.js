const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lastIntel = await prisma.walletAnalytics.findFirst({
    orderBy: { lastCheck: 'desc' },
    select: { address: true, lastCheck: true, totalValueUsd: true }
  });
  console.log('LAST_SEARCHED_WALLET:', JSON.stringify(lastIntel, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
