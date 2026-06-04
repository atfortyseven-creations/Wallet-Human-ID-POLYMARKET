import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { isAddress } from 'viem';

// Extreme Security: Rate limit in-memory or via Edge (simplified for robust execution)
const PRESENCE_TTL_S = 30; // 30 seconds online window
const TYPING_TTL_S = 5; // 5 seconds typing window

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { address, type, peer } = body;

        if (!address || !isAddress(address)) {
            return NextResponse.json({ error: 'Invalid address signature' }, { status: 400 });
        }

        const normalizedAddress = address.toLowerCase();

        if (type === 'heartbeat') {
            await safeRedisSet(`chat:presence:${normalizedAddress}`, Date.now().toString(), 'EX', PRESENCE_TTL_S);
            return NextResponse.json({ success: true });
        } 
        
        if (type === 'typing') {
            if (!peer || !isAddress(peer)) {
                return NextResponse.json({ error: 'Invalid peer target' }, { status: 400 });
            }
            const normalizedPeer = peer.toLowerCase();
            // Store that `address` is typing to `peer`
            await safeRedisSet(`chat:typing:${normalizedAddress}:${normalizedPeer}`, Date.now().toString(), 'EX', TYPING_TTL_S);
            // Also update heartbeat implicitly
            await safeRedisSet(`chat:presence:${normalizedAddress}`, Date.now().toString(), 'EX', PRESENCE_TTL_S);
            return NextResponse.json({ success: true });
        }

        //  Ghost Typing Fix: explicit stop_typing clears the key immediately 
        // Called by the sender right after dm.send() so the receiver's next
        // poll (within 3s) sees isTyping=false instead of waiting for the 5s TTL.
        if (type === 'stop_typing') {
            if (!peer || !isAddress(peer)) {
                return NextResponse.json({ error: 'Invalid peer target' }, { status: 400 });
            }
            const normalizedPeer = peer.toLowerCase();
            // Write sentinel '0' with 1s TTL  the GET handler treats '0' as isTyping=false.
            // This eliminates the 5s ghost-typing tail after the user sends a message.
            await safeRedisSet(`chat:typing:${normalizedAddress}:${normalizedPeer}`, '0', 'EX', 1);
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
        
        // Check presence
        const lastSeenStr = await safeRedisGet(`chat:presence:${normalizedPeer}`);
        
        // Check if peer is typing to us
        let isTyping = false;
        if (self && isAddress(self)) {
            const normalizedSelf = self.toLowerCase();
            const typingStr = await safeRedisGet(`chat:typing:${normalizedPeer}:${normalizedSelf}`);
            // isTyping is true only when the key exists AND is NOT the stop_typing sentinel ('0')
            isTyping = !!typingStr && typingStr !== '0';
        }

        return NextResponse.json({
            online: !!lastSeenStr,
            lastSeen: lastSeenStr ? parseInt(lastSeenStr, 10) : null,
            isTyping
        });
    } catch (err) {
        console.error('[Chat/Telemetry/GET]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
