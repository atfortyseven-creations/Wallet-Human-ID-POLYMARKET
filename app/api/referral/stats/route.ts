import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's wallet address from query params or Clerk metadata
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        // Fetch referrals where this user is the referrer
        const sentReferrals = await prisma.referral.findMany({
            where: {
                referrerId: address.toLowerCase()
            },
            include: {
                referee: {
                    select: {
                        walletAddress: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate total earnings from all referrals
        const totalEarnings = sentReferrals.reduce((sum, ref) => {
            return sum + Number(ref.totalEarnings);
        }, 0);

        // Calculate this week's earnings (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklyEarnings = sentReferrals
            .filter(ref => ref.updatedAt >= oneWeekAgo)
            .reduce((sum, ref) => sum + Number(ref.totalEarnings), 0);

        // Get user info
        const user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() },
            select: { walletAddress: true, createdAt: true }
        });

        // Generate invite code from wallet address
        const inviteCode = `HUMAN-${address.slice(2, 8).toUpperCase()}`;

        // Calculate rank based on total invites
        const totalInvites = sentReferrals.length;
        let rank = 'Bronze';
        let nextTierProgress = 0;

        if (totalInvites >= 100) {
            rank = 'Platinum';
            nextTierProgress = 100;
        } else if (totalInvites >= 50) {
            rank = 'Gold';
            nextTierProgress = ((totalInvites - 50) / 50) * 100; // Progress to Platinum
        } else if (totalInvites >= 10) {
            rank = 'Silver';
            nextTierProgress = ((totalInvites - 10) / 40) * 100; // Progress to Gold
        } else {
            rank = 'Bronze';
            nextTierProgress = (totalInvites / 10) * 100; // Progress to Silver
        }

        return NextResponse.json({
            stats: {
                totalEarnings: totalEarnings.toFixed(2),
                weeklyEarnings: weeklyEarnings.toFixed(2),
                totalInvites,
                rank,
                nextTierProgress: Math.min(100, Math.round(nextTierProgress)),
                inviteCode
            },
            recentInvites: sentReferrals.slice(0, 10).map(ref => ({
                id: ref.id,
                walletAddress: ref.referee.walletAddress,
                earnings: Number(ref.totalEarnings).toFixed(2),
                status: ref.status,
                createdAt: ref.createdAt
            }))
        });

    } catch (error) {
        console.error('Error fetching referral data:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
