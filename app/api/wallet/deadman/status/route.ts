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
            include: { deadMansSwitch: true }
        }) as any;

        if (!authUser || !authUser.deadMansSwitch) {
            return NextResponse.json({ active: false });
        }

        return NextResponse.json({
            active: authUser.deadMansSwitch.status === 'ACTIVE',
            beneficiary: authUser.deadMansSwitch.beneficiaryAddress,
            inactivityMonths: authUser.deadMansSwitch.inactivityPeriod,
            lastActivity: authUser.deadMansSwitch.lastPingAt,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
