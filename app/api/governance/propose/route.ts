/**
 * API Route: Submit Market Proposal
 * POST /api/governance/propose
 * 
 * Handles market proposal submission with World ID verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWorldIDProof } from '@/lib/worldid';

interface ProposalRequest {
    question: string;
    description: string;
    outcomes: string[];
    resolutionCriteria: string;
    category: string;
    creatorAddress: string;
    worldIdProof: {
        merkle_root: string;
        nullifier_hash: string;
        proof: string;
        verification_level: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: ProposalRequest = await request.json();

        // Validate input
        if (!body.question || !body.description || !body.outcomes || body.outcomes.length < 2) {
            return NextResponse.json(
                { error: 'Invalid proposal data' },
                { status: 400 }
            );
        }

        if (!body.creatorAddress || !body.worldIdProof) {
            return NextResponse.json(
                { error: 'Missing creator address or World ID proof' },
                { status: 400 }
            );
        }

        // Verify World ID proof
        const app_id = process.env.NEXT_PUBLIC_AUTH_APP_ID as string;
        const action = 'polymarket-wallet';

        const verifyRes = await verifyWorldIDProof({
            proof: body.worldIdProof.proof,
            merkle_root: body.worldIdProof.merkle_root,
            nullifier_hash: body.worldIdProof.nullifier_hash,
            verification_level: body.worldIdProof.verification_level,
        }, app_id, action);

        if (!verifyRes.success) {
            return NextResponse.json(
                { error: 'World ID verification failed', detail: verifyRes.detail },
                { status: 401 }
            );
        }

        // Check if nullifier already used for a proposal
        const existingProposal = await (prisma as any).marketProposal.findUnique({
            where: { creatorNullifier: body.worldIdProof.nullifier_hash },
        });

        if (existingProposal) {
            return NextResponse.json(
                { error: 'You have already submitted a proposal with this World ID' },
                { status: 409 }
            );
        }

        // 1. Ensure User exists FIRST (Foreign Key Constraint)
        await prisma.user.upsert({
            where: { walletAddress: body.creatorAddress },
            update: {
                updatedAt: new Date(),
                // Update nullifier if it changed (unlikely but possible)
                worldIdNullifierHash: body.worldIdProof.nullifier_hash,
            },
            create: {
                walletAddress: body.creatorAddress,
                worldIdNullifierHash: body.worldIdProof.nullifier_hash,
            },
        });

        // 2. Create proposal
        const votingEndsAt = new Date();
        votingEndsAt.setDate(votingEndsAt.getDate() + 7); // 7 days voting period

        const proposal = await (prisma as any).marketProposal.create({
            data: {
                question: body.question,
                description: body.description,
                outcomes: body.outcomes,
                resolutionCriteria: body.resolutionCriteria,
                category: body.category,
                creatorAddress: body.creatorAddress,
                creatorNullifier: body.worldIdProof.nullifier_hash,
                votingEndsAt,
                status: 'VOTING',
            },
        });

        // 3. Update user metrics
        await (prisma as any).userMetrics.upsert({
            where: { userAddress: body.creatorAddress },
            update: {
                proposalsCreated: { increment: 1 },
                lastActiveAt: new Date(),
            },
            create: {
                userAddress: body.creatorAddress,
                proposalsCreated: 1,
            },
        });

        return NextResponse.json({
            success: true,
            proposal: {
                id: proposal.id,
                question: proposal.question,
                votingEndsAt: proposal.votingEndsAt,
            },
        });

    } catch (error) {
        console.error('Error creating proposal:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Fetch active proposals
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'VOTING';
        const limit = parseInt(searchParams.get('limit') || '20');

        const proposals = await (prisma as any).marketProposal.findMany({
            where: {
                status: status as any,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            include: {
                _count: {
                    select: { votes: true },
                },
            },
        });

        return NextResponse.json({ proposals });

    } catch (error) {
        console.error('Error fetching proposals:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

