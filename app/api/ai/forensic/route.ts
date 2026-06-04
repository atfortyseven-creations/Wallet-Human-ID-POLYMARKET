import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/AIService';

/**
 * POST /api/ai/forensic
 * Securely performs AI forensic analysis on the server.
 */
export async function POST(req: NextRequest) {
    try {
        const { address, context } = await req.json();

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const analysis = await aiService.analyzeAddressForensics(address, context);
        
        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('[API:Forensic]  Error performing analysis:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
