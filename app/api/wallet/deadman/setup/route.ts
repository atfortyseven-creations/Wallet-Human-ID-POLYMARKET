import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { beneficiary, months } = await req.json();

        const email = user.emailAddresses[0]?.emailAddress;
        const authUser = await prisma.authUser.findUnique({ where: { email } });

        if (!authUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const deadMan = await prisma.deadMansSwitch.upsert({
            where: { userId: authUser.id },
            update: {
                beneficiaryAddress: beneficiary,
                inactivityPeriod: parseInt(months),
                lastPingAt: new Date(),
                status: 'ACTIVE'
            },
            create: {
                userId: authUser.id,
                beneficiaryAddress: beneficiary,
                inactivityPeriod: parseInt(months),
                status: 'ACTIVE'
            }
        });

        return NextResponse.json({ success: true, deadMan });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
