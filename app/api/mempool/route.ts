import { NextResponse } from 'next/server';
import { mempoolWatcher } from '@/lib/blockchain/MempoolWatcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        mempoolWatcher.startListening();
        const latest = mempoolWatcher.recentTiers.slice(-30);
        return NextResponse.json({ result: latest });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
