// @ts-nocheck
import { PrismaClient } from './lib/prisma';
const p = new PrismaClient();
p.transaction.findMany({ take: 5, orderBy: { timestamp: 'desc' } })
  .then(res => console.dir(res, { depth: null }))
  .finally(() => p.$disconnect());
