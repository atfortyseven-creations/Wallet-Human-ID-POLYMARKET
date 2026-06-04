import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

// Security check: Only the admin wallet b4a can upload
// Security check: Institutional Admin Wallet Protection
// [CRITICAL FIX] Replaced endsWith('b4a') with exact identity validation.
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS || '0x438640C489D5184B3b664d67364843b664d67364';

function isAdminWallet(address: string | undefined): boolean {
    if (!address) return false;
    return address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { moduleId, base64, walletAddress } = body;

        // Hardened check
        if (!isAdminWallet(walletAddress)) {
            return NextResponse.json({ ok: false, error: 'Unauthorized. Creator access only.' }, { status: 403 });
        }
        if (!moduleId || !base64) {
            return NextResponse.json({ ok: false, error: 'Missing payload' }, { status: 400 });
        }

        // Store in Redis (Persistent Academy Storage)
        const redisKey = `academy:pdf:${moduleId}`;
        
        // We use safeRedisSet without expiration (persistent)
        await safeRedisSet(redisKey, base64);
        
        // [ATOMIC FIX] Use SAdd to prevent race conditions during indexing (BUG-16)
        await safeRedisSAdd('academy:pdf_index', moduleId);

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Academy PDF Upload Error", e);
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const moduleId = searchParams.get('moduleId');

        // Directory Mode: Return all module IDs that have a PDF attached
        if (action === 'index') {
            const index = await safeRedisSMembers('academy:pdf_index');
            return NextResponse.json({ ok: true, index });
        }

        // Payload Mode: Return actual PDF content
        if (moduleId) {
            const base64 = await safeRedisGet(`academy:pdf:${moduleId}`);
            return NextResponse.json({ ok: true, base64: base64 || null });
        }

        return NextResponse.json({ ok: false, error: 'Invalid parameters' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
