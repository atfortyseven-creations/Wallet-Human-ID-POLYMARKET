const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Users:', await prisma.user.count());
  console.log('AuthUsers:', await prisma.authUser.count());
  console.log('SecurityEvents:', await prisma.securityEvent.count());
  
  const events = await prisma.securityEvent.findMany({
    take: 5,
    where: { location: { not: null } }
  });
  console.log('Sample locations:', events.map(e => e.location));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
