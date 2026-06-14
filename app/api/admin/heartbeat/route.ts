import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis/client';
import { verifyMessage } from 'viem';

export const dynamic = 'force-dynamic';

// [QUANTUM AEGIS FIX] Removed NEXT_PUBLIC prefix to prevent leaking admin address to client bundle
const ADMIN_WALLET = process.env.PRIVATE_ADMIN_WALLET || process.env.ADMIN_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000'; 

export async function POST(req: NextRequest) {
    try {
        const { signature, timestamp } = await req.json();
        
        if (!signature || !timestamp) {
            return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
        }
        
        // Ensure timestamp is recent (anti-replay within 5 minutes)
        if (Date.now() - timestamp > 300000) {
            return NextResponse.json({ error: 'Timestamp expired' }, { status: 401 });
        }
        
        const isValid = await verifyMessage({
            address: ADMIN_WALLET as `0x${string}`,
            message: `Private_HEARTBEAT_${timestamp}`,
            signature: signature as `0x${string}`,
        });
        
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid admin signature' }, { status: 403 });
        }
        
        // Reset Dead Man's Switch timer
        await redisClient.set('admin:heartbeat:timestamp', Date.now().toString());
        
        return NextResponse.json({ success: true, message: 'Heartbeat acknowledged. Protocol extended 30 days.' });
        
    } catch (e: any) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
