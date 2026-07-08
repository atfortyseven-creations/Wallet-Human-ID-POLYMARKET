import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const address = "0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a".toLowerCase();
  
  const user = await prisma.user.upsert({
    where: { walletAddress: address },
    update: {
      isPro: true,
      tier: "INSTITUTIONAL",
      isAdmin: true,
      isZkVerified: true,
    },
    create: {
      walletAddress: address,
      isPro: true,
      tier: "INSTITUTIONAL",
      isAdmin: true,
      isZkVerified: true,
    }
  });
  
  console.log("Successfully granted maximum power to:", user.walletAddress);
}

main().catch(console.error).finally(() => prisma.$disconnect());
