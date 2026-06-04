/**
 * GET /api/whales/live
 * REST endpoint  returns the last 50 whale transfer events from the EP2 WS engine buffer.
 * Also starts the WS engine if not already running.
 * Powers the AlertsPanel whale feed and the WhalePortfolio leaderboard stats.
 */

import { NextResponse } from 'next/server';
import { whaleEngine } from '@/lib/blockchain/whale-ws-engine';
import { privyRelayer } from '@/lib/services/PrivyRelayerService';

export const dynamic = 'force-dynamic';

// In-memory ring-buffer of recent whale events (server singleton)
// Populated by the EP2 WS engine subscription
const WHALE_BUFFER_SIZE = 100;
let whaleBuffer: any[] = [];
let subscribed = false;

function ensureSubscribed() {
    if (subscribed) return;
    subscribed = true;
    whaleEngine.subscribe((event) => {
        whaleBuffer = [event, ...whaleBuffer].slice(0, WHALE_BUFFER_SIZE);
    });
}

export async function GET(req: Request) {
    try {
        // Verify Privy JWT for precision and security
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = await privyRelayer.verifyToken(token);
            if (!payload) {
                console.warn(`[Whale-Active] Invalid Privy JWT.`);
                // Return 401 if strict auth is desired:
                // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        } else {
            console.debug(`[Whale-Active] Missing Privy Authorization header.`);
        }

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

        // Start EP2 WS engine if not already running
        ensureSubscribed();

        return NextResponse.json({
            events: whaleBuffer.slice(0, limit),
            total: whaleBuffer.length,
            source: 'getblock_ep2_ws_live',
            threshold_usd: parseInt(process.env.WHALE_THRESHOLD_USD || '50000', 10),
            fetchedAt: new Date().toISOString(),
        });

    } catch (err: any) {
        console.error('[Whale Active EP2]', err?.message);
        return NextResponse.json({ events: [], total: 0, source: 'error' }, { status: 200 });
    }
}
