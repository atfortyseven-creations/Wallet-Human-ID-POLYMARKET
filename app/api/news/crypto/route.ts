import { NextRequest, NextResponse } from 'next/server';

/**
 * CryptoCompare News API Integration
 * Real-time crypto news with AI sentiment analysis
 */

interface NewsArticle {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  publishedOn: number;
  imageUrl?: string;
  tags: string[];
  categories: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

interface NewsResponse {
  articles: NewsArticle[];
  hasMore: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'blockchain';
    const limit = parseInt(searchParams.get('limit') || '20');
    const tags = searchParams.get('tags')?.split(',') || [];

    // CryptoCompare API (Free tier: 100k calls/month)
    const apiKey = process.env.CRYPTOCOMPARE_API_KEY || 'demo';
    const baseUrl = 'https://min-api.cryptocompare.com/data/v2/news/';
    
    const params = new URLSearchParams({
      lang: 'EN',
      sortOrder: 'latest',
    });

    if (tags.length > 0) {
      params.append('categories', tags.join(','));
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'Authorization': `Apikey ${apiKey}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    
    if (!data.Data) {
      return NextResponse.json({ articles: [], hasMore: false });
    }

    // Process and enhance articles
    const articles: NewsArticle[] = data.Data.slice(0, limit).map((article: any) => ({
      id: article.id || String(article.published_on),
      title: article.title,
      body: article.body,
      url: article.url || article.guid,
      source: article.source_info?.name || article.source,
      publishedOn: article.published_on,
      imageUrl: article.imageurl,
      tags: article.tags?.split('|').filter(Boolean) || [],
      categories: article.categories?.split('|').filter(Boolean) || [],
      sentiment: analyzeSentiment(article.title + ' ' + article.body),
    }));

    return NextResponse.json({
      articles,
      hasMore: data.Data.length > limit,
    });
  } catch (error) {
    console.error('News fetch error:', error);
    
    // Return fallback demo data if API fails
    return NextResponse.json({
      articles: getDemoNews(),
      hasMore: false,
    });
  }
}

/**
 * Simple AI sentiment analysis based on keywords
 * In production, use OpenAI or specialized sentiment API
 */
function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  const bullishKeywords = [
    'surge', 'rally', 'bullish', 'pump', 'moon', 'ath', 'breakout',
    'soar', 'gain', 'rise', 'up', 'breakthrough', 'adoption', 'partnership'
  ];
  
  const bearishKeywords = [
    'crash', 'dump', 'bearish', 'plunge', 'fall', 'drop', 'decline',
    'lose', 'down', 'hack', 'scam', 'fraud', 'concern', 'warning'
  ];

  let bullishScore = 0;
  let bearishScore = 0;

  bullishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bullishScore++;
  });

  bearishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bearishScore++;
  });

  if (bullishScore > bearishScore + 1) return 'bullish';
  if (bearishScore > bullishScore + 1) return 'bearish';
  return 'neutral';
}

/**
 * Demo/fallback news data
 */
function getDemoNews(): NewsArticle[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      id: '1',
      title: 'Major DeFi Protocol Sees $100M in 24h Trading Volume',
      body: 'A leading decentralized exchange has experienced unprecedented trading volume as whale activity surges...',
      url: '#',
      source: 'CryptoNews',
      publishedOn: now - 3600,
      tags: ['DeFi', 'Trading'],
      categories: ['Blockchain'],
      sentiment: 'bullish',
    },
    {
      id: '2',
      title: 'Whale Moves 50,000 ETH to Unknown Wallet',
      body: 'Blockchain analytics reveal significant Ethereum movement from a known whale address...',
      url: '#',
      source: 'WhaleAlert',
      publishedOn: now - 7200,
      tags: ['Ethereum', 'Whales'],
      categories: ['Transaction'],
      sentiment: 'neutral',
    },
    {
      id: '3',
      title: 'Layer 2 Solutions Gain Traction in 2026',
      body: 'Arbitrum and Optimism see record user adoption as gas fees remain low...',
      url: '#',
      source: 'Decrypt',
      publishedOn: now - 10800,
      tags: ['Layer2', 'Scaling'],
      categories: ['Technology'],
      sentiment: 'bullish',
    },
  ];
}
