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
            include: { aiRebalancerPlans: { orderBy: { createdAt: 'desc' }, take: 1 } }
        }) as any;

        if (!authUser || authUser.aiRebalancerPlans.length === 0) {
            return NextResponse.json({ plan: null });
        }

        return NextResponse.json({ plan: authUser.aiRebalancerPlans[0] });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
