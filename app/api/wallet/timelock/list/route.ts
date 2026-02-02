import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const email = user.emailAddresses[0]?.emailAddress;
        const authUser = await prisma.authUser.findUnique({
            where: { email },
            include: { timeLockVaults: true }
        }) as any;

        if (!authUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ vaults: authUser.timeLockVaults || [] });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
