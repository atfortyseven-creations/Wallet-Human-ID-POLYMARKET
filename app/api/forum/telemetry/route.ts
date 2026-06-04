import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('system_handshake')?.value;

        let userId: string | undefined = undefined;
        if (address) {
            try {
                const user = await prisma.user.findUnique({
                    where: { walletAddress: address },
                    select: { id: true }
                });
                if (user) userId = user.id;
            } catch { /* ignore */ }
        }

        const body = await req.json();
        const { action, metadata } = body;
        const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';

        // Attempt to write telemetry  silently discard if table doesn't exist
        try {
            await (prisma as any).forumTelemetry.create({
                data: { userId, action, ipAddress, metadata: metadata || {} }
            });
        } catch {
            // ForumTelemetry table not yet created  run /api/admin/sync-db to fix
        }

        return NextResponse.json({ success: true });
    } catch {
        // Never error to client  telemetry is optional
        return NextResponse.json({ success: true });
    }
}
