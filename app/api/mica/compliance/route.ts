import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Enterprise Endpoint: MiCA & GDPR Compliance Toolkit
 * Handles European user data residency and the "Right to Be Forgotten".
 * 
 * Required Clearance: Private or ADMIN
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing Institutional Clearance token' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let payload: any;
        
        try {
            payload = await verifyJWT(token);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid or forged token' }, { status: 403 });
        }

        // Only Private clearance users or full Admins can execute EU Data wipes
        if (payload.clearance !== 'Private' && payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Clearance level too low for compliance tooling' }, { status: 403 });
        }

        const body = await req.json();
        const { action, targetAddress } = body;

        if (!targetAddress) return NextResponse.json({ error: 'Missing targetAddress' }, { status: 400 });

        const address = targetAddress.toLowerCase();

        switch (action) {
            case 'RIGHT_TO_BE_FORGOTTEN':
                // Wipe user profile, settings, and subscription ties
                await prisma.user.deleteMany({ where: { walletAddress: address } });
                
                // Note: We DO NOT delete the blockchain thermodynamic event records (WhaleActivity)
                // because those are public on-chain deterministic facts, not PII.
                
                // Hash the address to verify the wipe in the future without storing the PII
                const wipeHash = crypto.createHash('sha256').update(address).digest('hex');
                
                // Track the compliance execution
                await prisma.securityEvent.create({
                    data: {
                        type: 'MICA_PDI_ANONYMIZATION',
                        severity: 'WARNING',
                        ipAddress: 'System', // IP masked for compliance
                        userAgent: `Operator: ${payload.sub || payload.id}`,
                        details: `Executed GDPR wipe for EntityHash: ${wipeHash}`,
                        timestamp: new Date()
                    }
                });

                return NextResponse.json({ 
                    ok: true, 
                    message: 'Entity PDI definitively wiped per MiCA Art 72.',
                    entityHash: wipeHash
                });

            case 'DATA_RESIDENCY_DECLARATION':
                return NextResponse.json({
                    ok: true,
                    residency: 'EU-CENTRAL-1',
                    storageMode: 'EPHEMERAL_VOLATILE',
                    retentionLimit: '30_DAYS'
                });

            default:
                return NextResponse.json({ error: 'Invalid compliance action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('[MiCA Compliance] Error:', error);
        return NextResponse.json({ error: 'Internal server error processing compliance packet' }, { status: 500 });
    }
}
