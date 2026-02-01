import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        // Security: In a real app, verify Admin Role here
        // const session = await getServerSession(authOptions);
        // if (!session || session.user.role !== 'ADMIN') ...

        const body = await request.json();
        const { title, message, type, actionUrl } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and Message required' }, { status: 400 });
        }

        // Create Global Notification
        const notification = await prisma.notification.create({
            data: {
                userId: "GLOBAL", // Special flag or use a loop for all users if needed, 
                                  // but our schema has `isGlobal` boolean now.
                // Wait, Prisma constraints might require a valid User relation if strictly enforced.
                // Let's use the isGlobal flag logic. 
                // However, since `userId` is a required field pointing to User, we might need a "System" user 
                // or handle this differently in the schema.
                // CORRECTION: Schema has `userId` as Foreign Key. 
                // STRATEGY: We will create it for a "System" user and filter by `isGlobal: true` on frontend fetch.
                // Pre-requisite: Ensure a "SYSTEM" user exists or use the first admin.
                
                // For robustness, let's assume we send this to a specific user for now, 
                // OR we update schema to make userId optional for global ? 
                // Let's stick to the Plan: We have `isGlobal`. 
                // Let's assign it to a placeholder 'ADMIN' or the sender.
                
                user: { connect: { walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" } }, // Temporary: Connect to Demo User as sender
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
