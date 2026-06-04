import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: { email: true, walletAddress: true, clerkId: true }
  });

  console.log('--- LATEST 10 USERS ---');
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
