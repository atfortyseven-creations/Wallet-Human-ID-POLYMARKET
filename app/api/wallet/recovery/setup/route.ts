import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { guardians, threshold } = await req.json();

        const email = user.emailAddresses[0]?.emailAddress;
        const authUser = await prisma.authUser.findUnique({ where: { email } });

        if (!authUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Setup Social Recovery
        const recovery = await prisma.socialRecovery.upsert({
            where: { userId: authUser.id },
            update: {
                threshold: parseInt(threshold),
                totalGuardians: guardians.length,
                status: 'ACTIVE'
            },
            create: {
                userId: authUser.id,
                threshold: parseInt(threshold),
                totalGuardians: guardians.length,
                status: 'ACTIVE'
            }
        });

        // Add Guardians
        for (const gEmail of guardians) {
            await prisma.guardian.upsert({
                where: { 
                    recoveryId_email: { 
                        recoveryId: recovery.id, 
                        email: gEmail 
                    } 
                },
                update: { status: 'PENDING' },
                create: {
                    recoveryId: recovery.id,
                    email: gEmail,
                    status: 'PENDING'
                }
            });
        }

        return NextResponse.json({ success: true, recovery });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
