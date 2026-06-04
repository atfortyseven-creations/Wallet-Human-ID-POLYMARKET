import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Using MEXC API as a reliable fallback that matches Binance schema and doesn't geo-block like api.binance.com
        const res = await fetch('https://api.mexc.com/api/v3/ticker/24hr', {
            next: { revalidate: 10 }, // Cache for 10 seconds
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        if (!res.ok) {
            throw new Error(`Market Data API responded with status: ${res.status}`);
        }
        
        const validData = await res.json();
            
        return NextResponse.json(validData);
    } catch (error) {
        console.error("RPC Relayer Ticker Error:", error);
        // Return empty array instead of 500 so UI doesn't crash
        return NextResponse.json([], { status: 200 });
    }
}
