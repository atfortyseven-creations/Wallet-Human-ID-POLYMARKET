import { prisma } from '@/lib/prisma';

// Re-export the System optimized prisma client to prevent connection pool leaks
export const db = prisma;
export default db;
