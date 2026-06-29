import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWorldIDProof } from '@/lib/worldid';

/**
 * POST /api/zk/verify-identity
 * Absolute Reality: Verifies a WorldID ZK-SNARK proof to elevate user to Private tier.
 * Zero simulation policy integration.
 */
export async function POST(request: NextRequest) {
    try {
        // [SECURITY HARDENING] Derive identity from cryptographic session.
        const { getSession } = await import('@/lib/session');
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized: Authentication required to verify identity.' }, { status: 401 });
        }
        const address = session.userId;

        const { proof, merkle_root, nullifier_hash, verification_level } = await request.json();
        
        if (!proof || !nullifier_hash) {
            return NextResponse.json({ error: 'Missing required ZK fields: proof, nullifier_hash' }, { status: 400 });
        }

        // Phase 6: Real WorldID ZK Verification (Mathematical Certainty)
        const result = await verifyWorldIDProof(
            { proof, merkle_root, nullifier_hash, verification_level },
            process.env.AUTH_APP_ID || "app_d2014c58bb084dcb09e1f3c1c1144287",
            "verify-human-identity"
        );
        
        if (result.success) {
            // Update the user to Private tier in the sovereign database
            await (prisma as any).user.update({
                where: { walletAddress: address.toLowerCase() },
                data: { 
                    tier: 'Private', 
                    worldIdNullifierHash: nullifier_hash,
                    reputation: { increment: 100 }
                }
            });
            
            return NextResponse.json({ 
                success: true, 
                message: 'Identity verified via WorldID ZK-SNARK. Account upgraded to Private.',
                tier: 'Private'
            });
        }
        
        return NextResponse.json({ 
            success: false, 
            error: result.detail || 'Invalid ZK Proof signature',
            code: result.code 
        }, { status: 400 });
    } catch (error) {
        console.error('[ZK:Verify] Critical Error:', error);
        return NextResponse.json({ error: 'Internal ZK Verification System Failure' }, { status: 500 });
    }
}
