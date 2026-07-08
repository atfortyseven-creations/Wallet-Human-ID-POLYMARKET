const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.userSessionLog.deleteMany();
  console.log('Deleted all logs successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
