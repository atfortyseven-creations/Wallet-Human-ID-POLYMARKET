import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session as any).user?.role !== 'ADMIN') {
             return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
        }

        const body = await request.json();
        const { title, message, type, actionUrl } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and Message required' }, { status: 400 });
        }

        // Create Global Notification (isGlobal = true, userId optional for global broadcasts)
        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type: type || 'system',
                isGlobal: true,
                actionUrl
            }
        });

        return NextResponse.json({ success: true, notification });

    } catch (error) {
        console.error('Broadcast Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch Global Notifications + User Specific
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { isGlobal: true },
                    { userId: userId || "undefined_user" } // Returns only global if no user
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ notifications });

    } catch (error) {
         console.error('Notification Fetch Error:', error);
         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

