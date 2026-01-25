import { useState } from "react";
import { Category } from "@/data/news";
import CategoryTabs from "@/components/crystalline/CategoryTabs";
import { NewsGrid } from "./NewsGrid";

export default function NewsFeed() {
    const [activeCategory, setActiveCategory] = useState<Category>("Trending");

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            {/* Header / Tabs */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 pb-4 pt-2 mb-6">
                <CategoryTabs
                    activeCategory={activeCategory} // Pass standard state
                    onSelect={setActiveCategory}    // Pass standard setter
                />
            </div>

            {/* News Grid: Handles fetching, deduplication, and display */}
            <NewsGrid category={activeCategory} />
        </div>
    );
}
