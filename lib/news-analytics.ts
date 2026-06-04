/**
 *  WHALE ALERT NETWORK  NEWS INTELLIGENCE DOMAIN
 * Institutional-grade type definitions for forensic news analysis.
 */

export type MarketSentiment = 'bullish' | 'bearish' | 'neutral';

/**
 * Valid reliability levels for institutional analysis.
 */
export type AnalyticsReliability = 'low' | 'medium' | 'high';

/**
 * Shared interface for raw data input before processing.
 */
export interface RawNewsItem {
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string | Date;
    imageUrl?: string;
    category?: string;
}

/**
 * The canonical News Article model used across API, Processor, and UI.
 * Matches the schema.prisma NewsArticle model exactly.
 */
export interface NewsArticleAnalytics {
    id: string;
    externalId?: string | null;
    title: string;
    summary: string;
    url: string;
    source: string;
    imageUrl?: string | null;
    category?: string;
    publishedAt: Date | string;
    
    // Forensic Analysis Fields
    veracityScore: number;
    veracityAnalysis?: string | null;
    isFake: boolean;
    sentiment: MarketSentiment;
    
    tokens: string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * AI Analysis result structure
 */
export interface AIAnalysisResult {
    score: number;
    explanation: string;
    sentiment: MarketSentiment;
    isFake: boolean;
    EliteReliability: AnalyticsReliability;
    isPending?: boolean;
}
