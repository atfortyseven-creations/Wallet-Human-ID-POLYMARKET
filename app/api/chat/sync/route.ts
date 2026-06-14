import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { getSession } from '@/lib/session';
import { randomBytes } from 'crypto';

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
        const { content, type = 'USER' } = body;

        // [SECURITY HARDENING] Require authenticated session.
        // Previously fully unauthenticated — any bot could flood the global chat buffer
        // (50 msgs max), wiping all real messages and impersonating any wallet address.
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Authentication required to post messages.' }, { status: 401 });
        }

        // Derive address and sender from cryptographic session — not from body
        const address = session.userId;
        const sender = `${address.slice(0, 6)}...${address.slice(-4)}`;

        // Input validation
        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
        }
        if (content.trim().length > 2000) {
            return NextResponse.json({ error: 'Message exceeds maximum length of 2000 characters.' }, { status: 400 });
        }

        const newMessage = {
            id:        `msg_${Date.now()}_${randomBytes(4).toString('hex')}`, // CSPRNG, not Math.random()
            sender,
            content:   content.trim(),
            address,   // Cryptographically verified wallet address
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
