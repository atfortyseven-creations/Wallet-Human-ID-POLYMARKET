import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token');
        if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

        const statusData = await safeRedisGet(`bridge:status:${token}`);
        
        let isLinked = false;
        let wallet = '';
        if (statusData) {
            if (statusData === 'linked') {
                isLinked = true;
            } else {
                try {
                    const parsed = JSON.parse(statusData);
                    isLinked = parsed.status === 'linked';
                    wallet = parsed.wallet || '';
                } catch {
                    isLinked = statusData === 'linked';
                }
            }
        }

        return NextResponse.json({
            linked: isLinked,
            wallet
        });
    } catch (err) {
        console.error('[Bridge/Status]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
