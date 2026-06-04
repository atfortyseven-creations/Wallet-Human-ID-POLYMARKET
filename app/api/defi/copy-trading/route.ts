import { NextResponse } from 'next/server';
import { fetchHLLeaderboard } from '@/lib/blockchain/HyperliquidService';

export const runtime = 'nodejs'; // needs fetch with streaming; NOT edge
export const dynamic = 'force-dynamic';

/**
 * Copy Trading API Route
 * Fetches real top traders from the Hyperliquid public leaderboard.
 * No simulated PnL. No synthetic oscillations. All data sourced from Hyperliquid L1.
 */
export async function GET() {
    try {
        const traders = await fetchHLLeaderboard();

        if (traders.length === 0) {
            return NextResponse.json(
                { error: 'Hyperliquid leaderboard unavailable', traders: [], timestamp: Date.now() },
                { status: 503 }
            );
        }

        return NextResponse.json({
            traders,
            timestamp: Date.now(),
            source: 'hyperliquid_leaderboard',
        });
    } catch (err: any) {
        console.error('[API] copy-trading route error:', err.message);
        return NextResponse.json(
            { error: err.message, traders: [], timestamp: Date.now() },
            { status: 500 }
        );
    }
}
