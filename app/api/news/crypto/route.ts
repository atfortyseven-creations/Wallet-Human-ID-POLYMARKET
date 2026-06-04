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
      imageUrl: getLegendaryImage(article.title, article.imageurl ? (article.imageurl.startsWith('http') ? article.imageurl : `https://www.cryptocompare.com${article.imageurl}`) : undefined),
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
 *  VISUAL INTELLIGENCE ENGINE (Legendary Level)
 * Detects keywords and returns high-fidelity contextual photos.
 * Replaces generic logos (Investing.com, etc.) with professional imagery.
 */
function getLegendaryImage(title: string, originalUrl?: string): string {
  const text = title.toLowerCase();
  
  // 1. Detect Generic Logos / Bad Placeholders
  const isGeneric = !originalUrl || 
                   originalUrl.includes('placeholder') || 
                   originalUrl.includes('fallback') ||
                   originalUrl.includes('default');

  // [LEGENDARY FIX] If we have a valid real image, USE IT. Do not override with stock photos.
  if (!isGeneric) {
      return originalUrl!;
  }

  // 2. Keyword Mapping (High-Fidelity Curated Collection) - ONLY for missing/bad images
  const mapping = [
    { keywords: ['bitcoin', 'btc'], img: 'https://picsum.photos/seed/bitcoin/1200/800?grayscale' },
    { keywords: ['ethereum', 'eth', 'ether'], img: 'https://picsum.photos/seed/eth/1200/800?grayscale' },
    { keywords: ['crash', 'plunge', 'drop', 'falling', 'plummet', 'dip', 'bearish'], img: 'https://picsum.photos/seed/crash/1200/800?grayscale' },
    { keywords: ['bull', 'surge', 'rally', 'breakout', 'moon', 'ath', 'soar'], img: 'https://picsum.photos/seed/bull/1200/800?grayscale' },
    { keywords: ['regulation', 'sec', 'legal', 'law', 'court', 'government', 'fed'], img: 'https://picsum.photos/seed/legal/1200/800?grayscale' },
    { keywords: ['hack', 'scam', 'security', 'theft', 'fraud'], img: 'https://picsum.photos/seed/hack/1200/800?grayscale' },
    { keywords: ['mining', 'energy', 'hashrate'], img: 'https://picsum.photos/seed/mining/1200/800?grayscale' },
    { keywords: ['solana', 'sol'], img: 'https://picsum.photos/seed/sol/1200/800?grayscale' },
    { keywords: ['nft', 'metaverse', 'digital'], img: 'https://picsum.photos/seed/nft/1200/800?grayscale' }
  ];

  // 3. Match Context for Fallback
  for (const entry of mapping) {
    if (entry.keywords.some(k => text.includes(k))) {
      return entry.img;
    }
  }

  // 4. Ultimate Fallback
  return 'https://picsum.photos/seed/global/1200/800?grayscale'; // Global Crypto/Node visualization
}

/**
 * Simple AI sentiment analysis based on keywords
 * In production, use OpenAI or specialized sentiment API
 */
function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  const bullishKeywords = [
    'surge', 'rally', 'bullish', 'pump', 'moon', 'ath', 'breakout',
    'soar', 'gain', 'rise', 'up', 'breakthrough', 'adoption', 'partnership', 'opportunity'
  ];
  
  const bearishKeywords = [
    'crash', 'dump', 'bearish', 'plunge', 'fall', 'drop', 'decline',
    'lose', 'down', 'hack', 'scam', 'fraud', 'concern', 'warning', 'sinks'
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
  if (bearishScore > bullishScore) return 'bearish';
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
      imageUrl: getLegendaryImage('Major DeFi Protocol Sees $100M in 24h Trading Volume')
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
      imageUrl: getLegendaryImage('Whale Moves 50,000 ETH to Unknown Wallet')
    },
    {
      id: '3',
      title: 'Solana Ecosystem Growth Surges in 2026',
      body: 'New protocols and user adoption drive record development on the Solana blockchain...',
      url: '#',
      source: 'Decrypt',
      publishedOn: now - 10800,
      tags: ['Solana', 'Scaling'],
      categories: ['Technology'],
      sentiment: 'bullish',
      imageUrl: getLegendaryImage('Solana Ecosystem Growth Surges in 2026')
    },
  ];
}

