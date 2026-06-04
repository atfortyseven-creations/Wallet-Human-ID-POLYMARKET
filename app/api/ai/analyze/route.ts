import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/ai/analytics';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: 'Missing text to analyze' }, { status: 400 });
        }

        const analysis = await analyzeSentiment(text);
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('[API-AI-Analyze]', error);
        return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
    }
}
