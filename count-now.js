const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const count = await p.user.count();
  console.log('Total users now:', count);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
