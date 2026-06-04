import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REDIS_KEY = 'global:gossip:messages';
// Maximum messages retained in the gossip buffer per channel
const MAX_GOSSIP_MESSAGES = 50;

/**
 * Returns the current message buffer from Redis.
 * Returns an EMPTY array if Redis is unavailable — never injects fabricated messages.
 * Simulated/hardcoded fallback messages are strictly prohibited.
 */
async function getMessages(): Promise<any[]> {
    try {
        const data = await safeRedisGet(REDIS_KEY);
        if (!data || data === 'TIMEOUT') return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * GET /api/chat/sync
 * Retrieves the live gossip message buffer from Redis.
 * Returns empty array if Redis is offline — no fallback fabrications.
 */
export async function GET() {
    const messages = await getMessages();
    return NextResponse.json({ messages });
}

/**
 * POST /api/chat/sync
 * Accepts a real signed message from an authenticated wallet.
 * Fields:
 *   - sender   (string) : display name or truncated address
 *   - content  (string) : message text (max 2000 chars)
 *   - address  (string) : EVM wallet address (0x...)
 *   - signature (string): EIP-191 signature of content, used for future verification
 *   - type     (string) : 'USER' | 'SYS'
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sender, content, signature, address, type = 'USER' } = body;

        // Input validation
        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
        }
        if (!sender || !sender.trim()) {
            return NextResponse.json({ error: 'Sender identity is required.' }, { status: 400 });
        }
        if (content.trim().length > 2000) {
            return NextResponse.json({ error: 'Message exceeds maximum length of 2000 characters.' }, { status: 400 });
        }
        // Address validation: must be a valid 0x EVM address if provided
        if (address && !/^0x[0-9a-fA-F]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid EVM address format.' }, { status: 400 });
        }

        const newMessage = {
            id:        `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            sender:    sender.trim(),
            content:   content.trim(),
            signature: signature || null,   // EIP-191 sig stored for audit; not yet enforced server-side
            address:   address || null,     // Originating wallet address
            timestamp: new Date().toISOString(),
            type:      type === 'SYS' ? 'SYS' : 'USER',
        };

        const existing = await getMessages();

        // Prepend and cap at MAX_GOSSIP_MESSAGES
        const updated = [newMessage, ...existing].slice(0, MAX_GOSSIP_MESSAGES);

        await safeRedisSet(REDIS_KEY, JSON.stringify(updated));

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error: any) {
        console.error('[Gossip-Relay] POST error:', error?.message || error);
        return NextResponse.json({ error: 'Internal relay failure.' }, { status: 500 });
    }
}
