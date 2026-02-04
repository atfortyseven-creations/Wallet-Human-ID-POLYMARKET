import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { getEnrichedHistory } from '@/lib/wallet/activities-server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress || !isAddress(userAddress)) {
        return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    try {
        const activities = await getEnrichedHistory(userAddress);

        return NextResponse.json({ activities }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Enriched History API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch enriched history' },
            { status: 500 }
        );
    }
}
