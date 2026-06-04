export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { moralisService } from '@/lib/blockchain/MoralisService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'eth';
    const timeframe = searchParams.get('timeframe') || '1h';
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!address) {
        return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    try {
        console.log(`[Market History API] Fetching ${timeframe} candles for ${address} on ${chain}`);
        
        // Convert input chain to Moralis-compatible chain names
        let moralisChain: any = chain;
        if (chain === '56' || chain === 'bsc') moralisChain = 'bsc';
        else if (chain === '8453' || chain === 'base') moralisChain = 'base';
        else if (chain === '1') moralisChain = 'eth';

        const data = await moralisService.getOHLCV(address, moralisChain, timeframe, limit);
        
        return NextResponse.json(data);
    } catch (err: any) {
        console.error('[Market History API] Error:', err.message);
        
        // Fallback or Error return
        if (err.message === 'MORALIS_QUOTA_EXHAUSTED') {
            return NextResponse.json({ error: 'Market data quota exhausted' }, { status: 429 });
        }
        
        return NextResponse.json({ error: 'Failed to fetch market history', result: [] }, { status: 502 });
    }
}

