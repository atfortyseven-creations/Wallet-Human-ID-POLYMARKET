import { prisma } from './lib/prisma';
prisma.transaction.findMany({ take: 5, orderBy: { timestamp: 'desc' } })
  .then(res => console.dir(res, { depth: null }))
  .finally(() => prisma.$disconnect());
