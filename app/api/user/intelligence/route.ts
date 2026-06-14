import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/blockchain/AnalyticsService';

export async function GET(request: Request) {
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    const address = session.userId.toLowerCase();

    try {
        const report = await analyticsService.getAnalyticsReport(address);
        return NextResponse.json(report);
    } catch (error: any) {
        console.error(`[Analytics API] Critical failure for address ${address}:`, error);
        
        // If it's a known service error or timeout, we might want to return a 503 or 404
        if (error.message?.includes('timeout') || error.message?.includes('rate limit')) {
            return NextResponse.json({ 
                error: 'Servicio de inteligencia temporalmente saturado.',
                retryAfter: 60 
            }, { status: 503 });
        }

        return NextResponse.json({ 
            error: 'Error interno al procesar el informe de inteligencia.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

