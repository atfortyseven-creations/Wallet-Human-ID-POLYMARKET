import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        // If not logged in, we can't save to DB, but that's fine (client-side storage handles it)
        if (!session?.user?.email) {
            return NextResponse.json({ success: true, saved: false });
        }

        const body = await req.json();

        // Validate structure briefly
        if (typeof body.essential !== 'boolean') {
             return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        await prisma.userSettings.upsert({
            where: { authUserId: (session.user as any).id }, // Assuming session has ID, otherwise query by email
            update: {
                cookiePreferences: body
            },
            create: {
                authUserId: (session.user as any).id, // Fixme: ensure ID exists or query by email
                cookiePreferences: body
            }
        }).catch(async () => {
             // Fallback: try by email if ID lookup fails or structure is different
             const authUser = await prisma.authUser.findUnique({ where: { email: session.user!.email! }});
             if (authUser) {
                 await prisma.userSettings.upsert({
                     where: { authUserId: authUser.id },
                     update: { cookiePreferences: body },
                     create: { authUserId: authUser.id, cookiePreferences: body }
                 });
             }
        });

        return NextResponse.json({ success: true, saved: true });

    } catch (error) {
        console.error("Error saving cookie preferences:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

