"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NEWS_DATA, Category } from "@/data/news";
import CategoryTabs from "./CategoryTabs";
import NewsCard from "./NewsCard";

export default function NewsFeed() {
    const [activeCategory, setActiveCategory] = useState<Category>("Trending");

    // Filter data based on active category
    // Memoized to prevent recalc on every render, though strictly with static data it's fast.
    const filteredNews = useMemo(() => {
        return NEWS_DATA.filter(item => item.category === activeCategory);
    }, [activeCategory]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
            {/* 1. Category Navigation */}
            <CategoryTabs
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
            />

            {/* 2. News Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0"
            >
                <AnimatePresence mode="popLayout">
                    {filteredNews.map((article, index) => (
                        <NewsCard
                            key={article.id}
                            article={article}
                            priority={index < 4} // Prioritize LCP for first few items
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State Safety */}
            {filteredNews.length === 0 && (
                <div className="text-center py-20 text-white/30 font-serif italic">
                    No news found in this category.
                </div>
            )}
        </div>
    );
}
