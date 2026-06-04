import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/privacy/settings?userId=xxx */
export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ success: false, profile: null, error: 'userId required' }, { status: 400 });
    }
    try {
        const profile = await (prisma as any).userPrivacyProfile.findUnique({ where: { userId } });
        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('[Privacy API] GET failed:', error);
        return NextResponse.json({ success: false, profile: null }, { status: 500 });
    }
}

/** POST /api/privacy/settings  body: { userId, field, value } */
export async function POST(request: NextRequest) {
    try {
        const { userId, field, value } = await request.json();
        if (!userId || !field) {
            return NextResponse.json({ success: false, error: 'userId and field required' }, { status: 400 });
        }

        const profile = await (prisma as any).userPrivacyProfile.upsert({
            where:  { userId },
            update: { [field]: value },
            create: { userId, [field]: value },
        });

        // Non-fatal audit log
        try {
            await (prisma as any).userSessionLog.create({
                data: {
                    userId,
                    sessionId: `session-${crypto.randomUUID().substring(0, 8)}`,
                    action:     'PRIVACY_SETTINGS_UPDATE',
                    entityType: 'setting',
                    entityId:   field,
                    ipAddress:  request.headers.get('x-forwarded-for') ?? 'unknown',
                    userAgent:  request.headers.get('user-agent') ?? 'unknown',
                    metadata:   { newValue: value },
                },
            });
        } catch { /* Audit log failure must never break the response */ }

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('[Privacy API] POST failed:', error);
        return NextResponse.json({ success: false, error: 'Settings update failed' }, { status: 500 });
    }
}
