const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const c = await p.user.count({ where: { isPro: true } });
  console.log('Mock users (isPro):', c);
  const total = await p.user.count();
  console.log('Total users:', total);
  
  // also check if we can delete them
}
main().then(() => process.exit(0));
