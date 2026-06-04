import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { 
    RawNewsItem, 
    AIAnalysisResult, 
    MarketSentiment,
    NewsArticleAnalytics 
} from './news-analytics';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build_time',
        });
    }
    return _openai;
}

const VERSION_ID = "v2-parallel-sync-777-expert";

export class NewsProcessor {
    /**
     * Processes a batch of news items: Deduplicates, Analyzes via AI, and Saves to DB.
     * Parallelized with limited concurrency to prevent timeouts (502).
     */
    static async processBatch(items: RawNewsItem[]): Promise<number> {
        console.log(`[NewsProcessor][${VERSION_ID}] Processing batch of ${items.length} items...`);
        let addedCount = 0;
        
        // 1. Normalized Semantic Deduplication
        const filteredItems: RawNewsItem[] = [];
        const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]|_|[ ]{2,}/g, " ").trim();

        for (const item of items) {
            const normalizedTitle = normalize(item.title);
            
            // Check for existing ID, URL OR Semantic Title
            const existing = await prisma.newsArticle.findFirst({
                where: { 
                    OR: [
                        { externalId: item.id }, 
                        { url: item.url },
                        { title: { contains: normalizedTitle, mode: 'insensitive' } }
                    ] 
                },
                select: { id: true }
            });
            
            if (!existing) {
                // Batch deduplication
                const isLocalDuplicate = filteredItems.some(f => normalize(f.title) === normalizedTitle);
                if (!isLocalDuplicate) {
                    filteredItems.push(item);
                }
            }
        }

        console.log(`[NewsProcessor] ${filteredItems.length} legendary unique items to analyze.`);
        if (filteredItems.length === 0) return 0;

        // 2. Process in chunks
        const CHUNK_SIZE = 5;
        for (let i = 0; i < filteredItems.length; i += CHUNK_SIZE) {
            const chunk = filteredItems.slice(i, i + CHUNK_SIZE);
            
            const results = await Promise.allSettled(chunk.map(async (item) => {
                // Image Resurrection Logic
                let finalImageUrl = item.imageUrl;
                if (!finalImageUrl || finalImageUrl.includes('news-placeholder') || finalImageUrl.includes('unsplash')) {
                    finalImageUrl = await this.resurrectImage(item.url) || finalImageUrl;
                }

                const analysis: AIAnalysisResult = await this.analyzeNewsWithAI(item);
                
                return await prisma.newsArticle.create({
                    data: {
                        externalId: item.id,
                        title: item.title,
                        summary: item.summary,
                        url: item.url,
                        source: item.source,
                        imageUrl: finalImageUrl,
                        category: item.category || 'crypto',
                        publishedAt: new Date(item.publishedAt),
                        veracityScore: analysis.score,
                        veracityAnalysis: analysis.explanation,
                        isFake: analysis.isFake,
                        sentiment: analysis.sentiment
                    }
                });
            }));

            addedCount += results.filter(r => r.status === 'fulfilled').length;
        }

        console.log(`[NewsProcessor] Successfully added ${addedCount} legendary articles.`);
        return addedCount;
    }

    private static async resurrectImage(url: string): Promise<string | null> {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } });
            const html = await res.text();
            const match = html.match(/<meta property="og:image" content="([^"]+)"/);
            return match && match[1] ? match[1] : null;
        } catch {
            return null;
        }
    }

    private static async analyzeNewsWithAI(item: RawNewsItem): Promise<AIAnalysisResult> {
        try {
            const prompt = `
            Act as a Senior Hedge Fund Analyst specializing in Prediction Markets (Polymarket) and Global Macro nuances.
            
            Analyze the following news item for a verified, high-net-worth audience.
            
            Title: ${item.title}
            Summary: ${item.summary}
            Source: ${item.source}

            Task:
            1. Validate the veracity based on known market consensus (Real vs Fake/Hype).
            2. Analyze the 'Betting Angle' or Market Implication.
            3. Provide a concise but "Legendary" grade analysis in SPANISH.

            Output JSON ONLY:
            {
                "score": 0-100 (Integer. 100 = Absolute Truth/Verified, 0 = Confirmed Fake/Scam),
                "explanation": "Two sharp, Elite-grade sentences in Spanish. Focus on the alpha/edge. NO fluff.",
                "sentiment": "bullish" | "bearish" | "neutral",
                "isFake": boolean (true only if verifiable scam/fake news),
                "EliteReliability": "low" | "medium" | "high"
            }
            `;

            const response = await getOpenAI().chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3 
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error("AI returned empty response");

            return JSON.parse(content) as AIAnalysisResult;
        } catch (error) {
            console.error("[NewsProcessor] AI Analysis failed:", error);
            return {
                score: 0,
                explanation: "Analysis in high-priority processing queue. Pending neural verification.",
                sentiment: 'neutral',
                isFake: false,
                EliteReliability: 'low',
                isPending: true 
            };
        }
    }
}

