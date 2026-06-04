import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        // [CLEANUP] Remove signals older than 8 days
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        await prisma.userSignal.deleteMany({
            where: {
                userId,
                createdAt: { lt: eightDaysAgo }
            }
        });

        // Fetch remaining signals
        const signals = await prisma.userSignal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ signals });
    } catch (error) {
        console.error("Fetch signals error:", error);
        return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
    }
}

