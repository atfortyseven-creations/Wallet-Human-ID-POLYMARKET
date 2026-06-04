const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('[System Admin] Eliminando topics spam...');
  const t1 = await prisma.forumTopic.deleteMany({ where: { title: 'Hello' } });
  const t2 = await prisma.forumTopic.deleteMany({ where: { title: 'R' } });
  
  console.log(`[System Admin] Eliminado 'Hello': ${t1.count} topics.`);
  console.log(`[System Admin] Eliminado 'R': ${t2.count} topics.`);
  console.log('[System Admin] Limpieza completada.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
