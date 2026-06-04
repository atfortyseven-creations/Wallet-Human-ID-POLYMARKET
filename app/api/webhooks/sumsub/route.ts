import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sumsubProvider } from '@/lib/identity/sumsub-provider';
import { encryptionService } from '@/lib/security/encryption';

/**
 * WEBHOOK: Sumsub Identity Verification
 * 
 * Receives real-time updates on applicant status.
 * Updates the database and grants/revokes access.
 */
export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('x-payload-digest');
        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        const rawBody = await req.text();
        
        // 1. Verify Webhook Signature (Security Critical)
        if (!sumsubProvider.verifyWebhookSignature(rawBody, signature)) {
            console.error('[Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const { safeJsonParse } = await import('@/lib/utils/json');
        const payload = safeJsonParse(rawBody, null, 'SUMSUB_WEBHOOK') as any;
        if (!payload || typeof payload !== 'object') {
            return NextResponse.json({ error: 'Malformed or empty payload' }, { status: 400 });
        }
        const { applicantId, reviewStatus, reviewResult } = payload;
        const externalUserId = payload.externalUserId; // Currently mapped to userId

        console.log(`[Webhook] Processing update for ${externalUserId}: ${reviewStatus}`);

        // 2. Map Status to our Enum ('PENDING', 'APPROVED', 'REJECTED')
        let kycStatus = 'PENDING';

        if (reviewStatus === 'completed') {
            if (reviewResult?.reviewAnswer === 'GREEN') {
                kycStatus = 'APPROVED';
            } else {
                kycStatus = 'REJECTED';
            }
        }

        // 3. Update Database
        await prisma.kYCRecord.upsert({
            where: { userId: externalUserId },
            create: {
                userId: externalUserId,
                applicantId,
                status: kycStatus,
                documentType: 'PASSPORT', 
            },
            update: {
                status: kycStatus,
            }
        });

        // 4. Update User Role / Access Level
        if (kycStatus === 'APPROVED') {
            await prisma.user.update({
                where: { walletAddress: externalUserId.toLowerCase() },
                data: { tier: 'VERIFIED' as any } 
            });
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('[Webhook] Processing failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

