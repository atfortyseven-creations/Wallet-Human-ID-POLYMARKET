import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try to fetch from DB
    // If DB fails (like now with P1001), fallback to static data for demo
    let news: any[] = [];
    try {
        news = await prisma.newsUpdate.findMany({
            orderBy: { publishedAt: 'desc' },
            take: 10
        });
    } catch (e) {
        console.warn("DB Connection failed, using mock news data", e);
    }

    // Map DB fields to frontend format if needed, or use as is
    // Schema: title, description, category, imageUrl, publishedAt
    
    if (!news || news.length === 0) {
        // Fetch from Real News Service (NewsData.io)
        const { fetchNewsByCategory } = await import("@/lib/news-service");
        news = await fetchNewsByCategory('crypto');
    }

    // Frontend expects 'summary', schema has 'description'. We map it.
    const mappedNews = news.map((item: any) => ({
        ...item,
        summary: item.description || item.summary
    }));

    return NextResponse.json({ news: mappedNews });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
