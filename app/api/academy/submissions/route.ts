import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/academy/submissions
 * Body: { address, lessonId, txHash, proofUrl? }
 */
export async function POST(request: NextRequest) {
    try {
        const { address, lessonId, txHash, proofUrl = '' } = await request.json();
        if (!address || !lessonId) {
            return NextResponse.json({ ok: false, error: 'address and lessonId required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) {
            return NextResponse.json({ ok: false, error: 'User not registered' }, { status: 404 });
        }

        const submission = await (prisma as any).academySubmission.create({
            data: {
                userId:     user.id,
                lessonId,
                contentUrl: proofUrl,
                txHash,
                status:     'PENDING',
            },
        });

        return NextResponse.json({ ok: true, submission });
    } catch (e: any) {
        console.error('[Academy Submissions POST]', e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
