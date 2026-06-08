import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const address = '0x1234567890123456789012345678901234567890';
  
  // 1. Airdrop logic
  const existingTx = await prisma.transaction.findFirst({
    where: { 
      toAddress: address.toLowerCase(), 
      token: 'QDs',
      type: 'AIRDROP'
    }
  });

  if (existingTx) {
    console.log('Existing TX found:', existingTx);
  } else {
    console.log('No existing TX. Creating one...');
    const newTx = await prisma.transaction.create({
      data: {
        txHash: '0xmockhash',
        status: 'COMPLETED',
        type: 'AIRDROP',
        amount: 10,
        token: 'QDs',
        tokenSymbol: 'QDs',
        fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
        toAddress: address.toLowerCase(),
        blockNumber: 10000,
        chainId: 2151908,
      }
    });
    console.log('Created TX:', newTx);
  }

  // 2. Balance logic
  const [receivedAgg, sentAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { toAddress: address.toLowerCase(), token: 'QDs', status: 'COMPLETED' },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { fromAddress: address.toLowerCase(), token: 'QDs', status: 'COMPLETED' },
      _sum: { amount: true }
    })
  ]);

  console.log('Received:', receivedAgg._sum.amount);
  console.log('Sent:', sentAgg._sum.amount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
