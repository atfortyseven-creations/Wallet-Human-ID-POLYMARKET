
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0; // Disable cache so we always get the latest from the DB

export async function GET() {
    try {
        const latestSnapshot = await prisma.treasurySnapshot.findFirst({
            orderBy: {
                date: 'desc',
            },
        });

        if (!latestSnapshot) {
            return NextResponse.json({ tvl: null, formatted: "$0.00" });
        }

        const tvlNum = Number(latestSnapshot.totalValueLocked);
        let formatted = "";
        
        if (tvlNum >= 1000000000) {
            formatted = `$${(tvlNum / 1000000000).toFixed(1)}B`;
        } else if (tvlNum >= 1000000) {
            formatted = `$${(tvlNum / 1000000).toFixed(1)}M`;
        } else {
            formatted = `$${tvlNum.toLocaleString()}`;
        }

        return NextResponse.json({ tvl: tvlNum, formatted });
    } catch (error) {
        console.error('Error fetching TVL:', error);
        return NextResponse.json({ error: "Failed to fetch TVL", tvl: null, formatted: "$0.00" }, { status: 500 });
    }
}


