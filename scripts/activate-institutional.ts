import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const walletAddress = '0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a';

  console.log(` Attempting to grant Elite Access to wallet: ${walletAddress}`);

  // 1. Find user by wallet
  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress }
  });

  if (!user) {
    console.error(` Error: No user found with wallet ${walletAddress}.`);
    process.exit(1);
  }

  console.log(` User found in DB.`);

  // 2. Upsert Subscription
  // Using userId as the unique key for upsert
  const subscription = await prisma.subscription.upsert({
    where: { userId: user.walletAddress },
    update: {
      tier: 'Elite',
      status: 'ACTIVE',
      updatedAt: new Date()
    },
    create: {
      userId: user.walletAddress,
      tier: 'Elite',
      status: 'ACTIVE'
    }
  });

  console.log(` SUCCESS: Elite Tier activated for wallet: ${walletAddress}`);
  console.log(` Subscription ID: ${subscription.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
