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
            include: { socialRecovery: { include: { guardians: true } } }
        }) as any;

        if (!authUser || !authUser.socialRecovery) {
            return NextResponse.json({ guardians: [], threshold: 2 });
        }

        return NextResponse.json({
            guardians: authUser.socialRecovery.guardians.map((g: any) => g.email),
            threshold: authUser.socialRecovery.threshold,
            status: authUser.socialRecovery.status
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
