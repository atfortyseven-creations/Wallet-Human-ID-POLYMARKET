const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    where: {
      isPro: false,
      createdAt: {
        gte: new Date("2024-02-01T00:00:00Z"),
      },
    },
    select: {
      walletAddress: true,
      createdAt: true,
    },
  });

  const chatContacts = await prisma.chatContact.findMany({
    select: {
      owner: true,
      updatedAt: true,
    },
  });

  const uniqueUsersMap = new Map();
  users.forEach(u => {
    if (u.walletAddress) {
      uniqueUsersMap.set(u.walletAddress.toLowerCase(), {
        walletAddress: u.walletAddress,
        createdAt: u.createdAt
      });
    }
  });
  chatContacts.forEach(c => {
    if (c.owner && !uniqueUsersMap.has(c.owner.toLowerCase())) {
      uniqueUsersMap.set(c.owner.toLowerCase(), {
        walletAddress: c.owner,
        createdAt: c.updatedAt
      });
    }
  });

  console.log('Real Users Count:', uniqueUsersMap.size);
}
run().finally(() => prisma.$disconnect());
