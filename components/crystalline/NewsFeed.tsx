"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, NewsItem } from "@/data/news";
import CategoryTabs from "@/components/crystalline/CategoryTabs";
import NewsCard from "@/components/crystalline/NewsCard";

export default function NewsFeed() {
    const [activeCategory, setActiveCategory] = useState<Category>("Trending");
    const [newsData, setNewsData] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch News from our API
    useEffect(() => {
        async function fetchNews() {
            try {
                setLoading(true);
                const response = await fetch('/api/news/sync');

                if (!response.ok) {
                    throw new Error('Failed to fetch news');
                }

                const data = await response.json();

                if (data.articles && Array.isArray(data.articles)) {
                    // Map API response to our UI NewsItem type
                    const mappedArticles: NewsItem[] = data.articles.map((art: any) => ({
                        id: art.id,
                        headline: art.originalTitle,
                        description: art.description || "No description available.",
                        category: mapCategory(art.categories), // Helper function needed or simple logic
                        time: new Date(art.date).toLocaleDateString(),
                        source: art.source || "Polymarket News",
                        imageUrl: art.image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832"
                    }));

                    setNewsData(mappedArticles);
                    setError(null);
                } else {
                    setNewsData([]);
                }

            } catch (err) {
                console.error("News Fetch Error:", err);
                setError("Could not load real-time news.");
            } finally {
                setLoading(false);
            }
        }

        fetchNews();
    }, []);

    // Filter Logic
    const filteredNews = newsData.filter(item => {
        if (activeCategory === "Trending") return true;
        return item.category === activeCategory;
    });

    // Helper to map API categories to our fixed UI categories
    // NewsData.io returns array like ["technology", "business"]
    function mapCategory(apiCategories: string[]): Category {
        if (!apiCategories || apiCategories.length === 0) return "Trending";

        const catString = apiCategories.join(' ').toLowerCase();

        if (catString.includes('crypto') || catString.includes('bitcoin')) return "Crypto";
        if (catString.includes('tech') || catString.includes('technology')) return "Tech";
        if (catString.includes('science')) return "Climate & Science";
        if (catString.includes('business') || catString.includes('finance')) return "Finance";
        if (catString.includes('economy')) return "Economy";
        if (catString.includes('politics')) return "Politics";

        return "Trending"; // Fallback
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4 pb-32 px-2 md:px-0">
            {/* Tabs */}
            <div className="sticky top-16 md:top-20 z-30 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 pb-2 pt-2 -mx-4 px-4 md:mx-0 md:px-0">
                <CategoryTabs
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                />
            </div>

            {/* ERROR / API KEY MSG */}
            {error && (
                <div className="p-4 mb-4 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg text-center text-sm">
                    ⚠ {error}
                </div>
            )}

            {/* News Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
            >
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        // Skeleton Loading State
                        [1, 2, 3].map((n) => (
                            <div key={n} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        filteredNews.map((article, index) => (
                            <NewsCard
                                key={article.id}
                                article={article}
                                priority={index < 6}
                            />
                        ))
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Footer fallback */}
            {!loading && filteredNews.length === 0 && (
                <div className="py-20 text-center text-white/30 italic">
                    {error ? "Please configure API keys to see real news." : "No trending news found right now."}
                </div>
            )}
        </div>
    );
}
