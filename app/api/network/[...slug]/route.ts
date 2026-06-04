export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://mempool.space/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    // Await params as per Next.js 15+ requirements if applicable, or standard async handling
    const resolvedParams = await params;
    const path = resolvedParams.slug.join('/');
    const query = request.nextUrl.search;
    
    // Construct the full URL
    // mempool.space api structure: /api/v1/...
    // Our incoming slug might be ['v1', 'blocks'] -> /api/v1/blocks
    // Or if the user follows the simpler pattern: /api/network/blocks -> slug=['blocks']
    // The user's spec had /api/v1/... so we should probably map straightforwardly.
    // If the client calls /api/network/v1/blocks, slug is ['v1', 'blocks'] -> https://mempool.space/api/v1/blocks
    
    const targetUrl = `${API_BASE}/${path}${query}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                // Forward accept header or default to json
                'Accept': 'application/json',
            },
            next: { revalidate: 10 } // optional caching
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${response.statusText}` }, 
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Network Proxy Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch network data' },
            { status: 500 }
        );
    }
}

