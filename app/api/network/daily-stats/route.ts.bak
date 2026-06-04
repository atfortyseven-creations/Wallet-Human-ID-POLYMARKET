
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const nextReset = addDays(todayStart, 1);

        // 1. Count Unique Mega Whales today (transactions > $500k or as defined by worker)
        // Note: WhaleActivity only stores "Whale" level events usually.
        const dailyWhaleCount = await prisma.whaleActivity.groupBy({
            by: ['walletAddress'],
            where: {
                timestamp: {
                    gte: todayStart,
                    lte: todayEnd,
                },
                usdValue: {
                    gte: 500000 // Standard Elite threshold
                }
            },
        });

        // 2. Get latest TPS and Base Fee from Treasury/Snapshots if available, or use defaults
        const latestSnapshot = await prisma.treasurySnapshot.findFirst({
            orderBy: { date: 'desc' }
        });

        // 3. Systemic Risk Calculation (Heuristic based on daily volume/anomalies)
        const dailyVolume = await prisma.whaleActivity.aggregate({
            _sum: { usdValue: true },
            where: {
                timestamp: { gte: todayStart, lte: todayEnd }
            }
        });

        const totalVol = Number(dailyVolume._sum.usdValue || 0);
        let systemicRisk = "LOW";
        if (totalVol > 100000000) systemicRisk = "ELEVATED"; // >100M daily whale vol
        if (totalVol > 500000000) systemicRisk = "CRITICAL"; // >500M daily whale vol

        return NextResponse.json({
            whalesToday: dailyWhaleCount.length,
            whaleAddresses: dailyWhaleCount.map(w => w.walletAddress),
            dailyVolumeUsd: totalVol,
            nextReset: nextReset.toISOString(),
            systemicRisk,
            // Fallbacks for live metrics if needed as starting points
            baseFee: 15, // Gwei fallback
            tps: 3.2,    // TPS fallback
            serverTime: now.toISOString()
        });

    } catch (error) {
        console.error('Daily Stats API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch daily stats',
            whalesToday: 0,
            nextReset: addDays(startOfDay(new Date()), 1).toISOString()
        }, { status: 500 });
    }
}


