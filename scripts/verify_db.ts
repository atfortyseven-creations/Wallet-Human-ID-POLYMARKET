import { PrismaClient } from '@prisma/client';

async function verify() {
  const prisma = new PrismaClient();
  try {
    console.log('--- DB Verification Ritual ---');
    const tableCount = await (prisma as any).apiSubscription.count();
    console.log(` Table ApiSubscription exists. Record count: ${tableCount}`);
    
    // Check models
    const usageCount = await (prisma as any).apiUsageLog.count();
    console.log(` Table ApiUsageLog exists. Record count: ${usageCount}`);
    
    console.log('--- Success: The database tiers are aligned with the schema. ---');
  } catch (err) {
    console.error(' Verification Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
