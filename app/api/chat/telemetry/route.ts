import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { isAddress } from 'viem';

export const dynamic = 'force-dynamic';

const PRESENCE_TTL_S = 30; // 30 seconds online window
const TYPING_TTL_S   = 5;  // 5 seconds typing window

// ── SECURITY: Resolve the authenticated address from headers or session ────────
// Middleware sets 'x-verified-session-address' from the JWT at edge level.
// Falls back to reading the session cookie directly for non-edge environments.
async function resolveAuthenticatedAddress(request: NextRequest): Promise<string | null> {
    const fromHeader = request.headers.get('x-verified-session-address')
        ?? request.headers.get('x-verified-session-address');
    if (fromHeader) return fromHeader.toLowerCase();

    try {
        const { getSession } = await import('@/lib/session');
        const session = await getSession();
        return session?.userId?.toLowerCase() ?? null;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { address, type, peer } = body;

        if (!address || !isAddress(address)) {
            return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
        }

        // ── [SECURITY — CRIT-03] Presence Spoofing Protection ────────────────────
        // Verify the `address` in the body belongs to the authenticated caller.
        // Without this, ANY authenticated user can spoof another user's presence
        // and typing indicators (Ghost Typing Attack — a vector used by Lazarus-class APTs
        // to seed social engineering by making victims appear to be messaging targets).
        const authenticatedAddr = await resolveAuthenticatedAddress(request);
        if (!authenticatedAddr || address.toLowerCase() !== authenticatedAddr) {
            return NextResponse.json(
                { error: 'Forbidden: address does not match authenticated identity.' },
                { status: 403 },
            );
        }
        // ─────────────────────────────────────────────────────────────────────────

        const normalizedAddress = address.toLowerCase();

        if (type === 'heartbeat') {
            await safeRedisSet(
                `chat:presence:${normalizedAddress}`,
                Date.now().toString(),
                'EX',
                PRESENCE_TTL_S,
            );
            return NextResponse.json({ success: true });
        }

        if (type === 'typing') {
            if (!peer || !isAddress(peer)) {
                return NextResponse.json({ error: 'Invalid peer target' }, { status: 400 });
            }
            const normalizedPeer = peer.toLowerCase();
            await safeRedisSet(
                `chat:typing:${normalizedAddress}:${normalizedPeer}`,
                Date.now().toString(),
                'EX',
                TYPING_TTL_S,
            );
            // Implicit heartbeat
            await safeRedisSet(
                `chat:presence:${normalizedAddress}`,
                Date.now().toString(),
                'EX',
                PRESENCE_TTL_S,
            );
            return NextResponse.json({ success: true });
        }

        if (type === 'stop_typing') {
            if (!peer || !isAddress(peer)) {
                return NextResponse.json({ error: 'Invalid peer target' }, { status: 400 });
            }
            const normalizedPeer = peer.toLowerCase();
            // Sentinel '0' immediately kills the typing indicator without waiting for TTL
            await safeRedisSet(
                `chat:typing:${normalizedAddress}:${normalizedPeer}`,
                '0',
                'EX',
                1,
            );
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown telemetry type' }, { status: 400 });

    } catch (err) {
        console.error('[Chat/Telemetry/POST]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const peer = searchParams.get('peer');
        const self = searchParams.get('self');

        if (!peer || !isAddress(peer)) {
            return NextResponse.json({ error: 'Invalid peer address' }, { status: 400 });
        }

        const normalizedPeer = peer.toLowerCase();

        const lastSeenStr = await safeRedisGet(`chat:presence:${normalizedPeer}`);

        let isTyping = false;
        if (self && isAddress(self)) {
            const normalizedSelf = self.toLowerCase();
            const typingStr = await safeRedisGet(`chat:typing:${normalizedPeer}:${normalizedSelf}`);
            isTyping = !!typingStr && typingStr !== '0';
        }

        return NextResponse.json({
            online:   !!lastSeenStr,
            lastSeen: lastSeenStr ? parseInt(lastSeenStr, 10) : null,
            isTyping,
        });

    } catch (err) {
        console.error('[Chat/Telemetry/GET]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
