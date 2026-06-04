/**
 * lib/db.ts
 * 
 * Canonical singleton Prisma Client re-export.
 * MempoolWatcher and whale-events route import from '@/lib/db'.
 * This file resolves that import by delegating to the hardened
 * lib/prisma.ts client (PgBouncer + connection_limit + error filter).
 */
export { prisma as default, prisma, prisma as db } from '@/lib/prisma';
