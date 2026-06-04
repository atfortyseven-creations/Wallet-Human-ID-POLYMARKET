import { NextResponse } from 'next/server';
import axios from 'axios';

// Institutionally-sourced signal providers
const RSS_FEEDS = [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
    { name: 'CryptoPanic', url: 'https://cryptopanic.com/api/v1/posts/?public=true' } // Attempting public endpoint
];

export async function GET() {
    try {
        // For "Maximum Impolutez", we fetch from multiple institutional sources
        const apiKeyRow = process.env.CRYPTOPANIC_API_KEYS || '';
        const token = apiKeyRow.split(',')[0]; // Use the primary key

        if (!token) {
            return NextResponse.json({ error: 'News portal missing API credentials' }, { status: 500 });
        }

        const cpRes = await axios.get(`https://cryptopanic.com/api/v1/posts/?auth_token=${token}&public=true`, {
            timeout: 5000
        });

        // Map CryptoPanic data into our AnalyticsItem format
        const externalData = cpRes.data?.results || [];
        const signals = externalData.slice(0, 10).map((post: any) => ({
            id: `sig-${post.id}`,
            topic: post.kind || 'NEWS',
            title: post.title,
            description: `Source: ${post.domain}. ${post.votes?.important > 0 ? 'High relevance.' : ''}`,
            impact: post.votes?.important > 5 ? 'MAXIMUM' : 'HIGH',
            timestamp: post.published_at,
            source: post.source?.title || post.domain
        }));

        return NextResponse.json(signals, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error) {
        console.error('FAILED_TO_AGGREGATE_NEWS:', error);
        return NextResponse.json({ error: 'News portal sync failed' }, { status: 500 });
    }
}
