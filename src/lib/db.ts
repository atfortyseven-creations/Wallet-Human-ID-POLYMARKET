import { PrismaClient } from '@prisma/client'

// Prevenimos múltiples instancias en hot-reloading (Next.js dev behavior)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['error', 'warn'], // En producción, solo queremos ver errores críticos
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db
