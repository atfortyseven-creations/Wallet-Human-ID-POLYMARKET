// app/api/news/sync/route.ts
import { NextResponse } from 'next/server';
import { NewsDataService } from '@/lib/news-service';
import { generateSmartTitles } from '@/lib/ai-editor';

export async function GET() {
    try {
        // Fetch diverse news to populate all categories
        const articles = await NewsDataService.fetchLatest('crypto OR technology OR business OR science OR politics');

        if (!articles.length) {
            return NextResponse.json({ message: "No fresh news found (or API Key missing)" }, { status: 404 });
        }

        // Return up to 10 articles
        // Note: AI title generation for ALL articles might be too slow/expensive for this demo, 
        // using original titles + descriptions.
        const mappedArticles = articles.slice(0, 10).map(news => ({
            id: news.id,
            originalTitle: news.title,
            source: news.source,
            image: news.imageUrl,
            url: news.link,
            date: news.pubDate,
            description: news.description, // Pass the description/summary
            categories: news.category // Pass original categories for filtering
        }));

        return NextResponse.json({
            articles: mappedArticles,
            status: "success"
        });

    } catch (error) {
        console.error("[Sync Route Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
