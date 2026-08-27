const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  const deleted = await prisma.transaction.deleteMany({
    where: {
      NOT: {
        type: {
          in: [
            'MINT_IDENTITY',
            'IDENTITY_PROOF',
            'FORUM_POST',
            'LEDGER_CHAT_SYNC',
            'PORTFOLIO_ACCESS',
            'STUDIO_ACCESS',
            'ANCHOR',
            'SEND',
            'RECEIVE',
            'REBALANCE'
          ]
        }
      }
    }
  });

  const deletedTokens = await prisma.transaction.deleteMany({
    where: {
      NOT: {
        token: {
          in: ['ATOMIC_LOG', 'QDs']
        }
      }
    }
  });

  // delete that 10000000 ETH tx explicitly if still around
  const deletedEth = await prisma.transaction.deleteMany({
    where: {
      amount: { gte: 1000000 }
    }
  });

  console.log('Cleaned mock data:', deleted.count, deletedTokens.count, deletedEth.count);
}
clean();
