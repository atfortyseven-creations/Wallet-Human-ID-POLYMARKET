import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this exists, if not I will create/fix import
import { getServerSession } from "next-auth"; // Or your auth method

// MOCK AUTH for now to ensure robustness without getting stuck on Auth setup
// In production, replace with actual auth check
const getUserId = async () => {
    // return "0x123..."; 
    // For now we assume the client sends the address or we resolve it from session
    return "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Demo User
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const referral = await (prisma as any).referral.findFirst({
            where: { referrerId: userId },
            include: { referee: true }
        });

        // Calculate stats
        const totalReferrals = await (prisma as any).referral.count({
            where: { referrerId: userId }
        });

        const totalEarnings = await (prisma as any).referral.aggregate({
            where: { referrerId: userId },
            _sum: { totalEarnings: true }
        });

        return NextResponse.json({
            inviteCode: `HUMAN-${userId.slice(-4).toUpperCase()}`,
            totalInvites: totalReferrals,
            totalEarnings: totalEarnings._sum.totalEarnings || 0,
            rank: totalReferrals > 50 ? 'Gold' : totalReferrals > 10 ? 'Silver' : 'Bronze',
            recentActivity: [] // Populate with real recent referrals if needed
        });

    } catch (error) {
        console.error('Referral API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { referrerId, refereeId } = body;

        if (!referrerId || !refereeId) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        // Prevent self-referral
        if (referrerId === refereeId) {
            return NextResponse.json({ error: 'Cannot refer self' }, { status: 400 });
        }

        // Create Referral
        const newReferral = await (prisma as any).referral.create({
            data: {
                referrer: { connect: { walletAddress: referrerId } },
                referee: { connect: { walletAddress: refereeId } },
                status: 'ACTIVE'
            }
        });

        return NextResponse.json({ success: true, referral: newReferral });

    } catch (error) {
         console.error('Referral Creation Error:', error);
         return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
    }
}

