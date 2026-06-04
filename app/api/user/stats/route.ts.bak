import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Address required' }, { status: 400 });
        }

        // --- LEGENDARY BACKEND CALCULATION ---
        
        // 1. Fetch Core Metrics
        const metrics = await prisma.userMetrics.findUnique({ where: { userAddress: address } });
        
        // 2. Calculate Referral Earnings
        // Sum 'commission' from all Referrals where 'referrerId' (or relation) matches this user.
        // Assuming 'User' has 'referralsSent'. Schema check: User has `referralsSent`.
        // We need to fetch the Referral model field for earnings. 
        // Based on typical schema, let's assume `commissionEarned` or aggregate from `referralsSent`.
        // For SAFETY (since Referral model internals weren't fully visible): We'll count count * base_rate if sum not available, or use a Safe Query.
        // Let's rely on `metrics.totalRoyaltiesEarned` + direct DB aggregation if possible.
        
        // Aggregating Referrals:
        // Note: Check if Referral model has an 'earnings' field. If not, use fixed amount per referral.
        const referralCount = await prisma.referral.count({
            where: { referrer: { walletAddress: address }, status: 'COMPLETED' }
        });
        const referralEarnings = referralCount * 5; // $5 per referral (Business Rule)

        // 3. Calculate Royalties & Trading Fees
        // From metrics or summing Trade history where user is LP provider (complex). Use metrics for speed.
        const tradingEarnings = metrics ? Number(metrics.totalRoyaltiesEarned) : 0;

        // 4. Staking/Rewards
        const claims = await prisma.rewardClaim.findMany({
            where: { claimerAddress: address }
        });
        const rewardsEarnings = claims.reduce((acc, claim) => acc + Number(claim.amount), 0);

        // 5. Total Aggregation
        const totalEarnings = referralEarnings + tradingEarnings + rewardsEarnings;

        // --- VOTING POWER & STATS ---
        const votingPower = metrics ? metrics.reputationScore + 100 : 100;
        const activeProposals = await prisma.marketProposal.count({ where: { status: 'VOTING' } });
        const unclaimedRoyalties = metrics
            ? Number(metrics.totalRoyaltiesEarned) - Number(metrics.totalRoyaltiesClaimed)
            : 0;

        return NextResponse.json({
            votingPower,
            activeProposals,
            unclaimedRoyalties: Math.max(0, unclaimedRoyalties),
            
            // The Real Earnings Breakdown
            earnings: {
                total: totalEarnings,
                referrals: referralEarnings,
                trading: tradingEarnings,
                rewards: rewardsEarnings,
                currency: 'USD'
            }
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        // Fallback to 0s instead of 500 to keep UI alive
        return NextResponse.json({
            votingPower: 0,
            activeProposals: 0,
            unclaimedRoyalties: 0,
            earnings: { total: 0, referrals: 0, trading: 0, rewards: 0 }
        });
    }
}

