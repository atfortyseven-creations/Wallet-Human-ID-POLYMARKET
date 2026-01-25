"use client";

import { motion } from "framer-motion";

export const CATEGORIES = [
    "Trending", "Breaking", "New", "Politics", "Sports", "Crypto",
    "Finance", "Geopolitics", "Earnings", "Tech", "Culture", "World",
    "Economy", "Climate & Science", "Elections", "Mentions"
] as const;

export type Category = typeof CATEGORIES[number];

interface CategoryTabsProps {
    activeCategory: Category;
    onSelect: (cat: Category) => void;
}

export default function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex px-4 md:px-0 md:justify-center gap-2 min-w-max">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onSelect(cat)}
                        className={`
                            relative px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300
                            ${activeCategory === cat ? 'text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                        `}
                    >
                        {activeCategory === cat && (
                            <motion.div
                                layoutId="activeCategory"
                                className="absolute inset-0 bg-white/10 border border-white/10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        )}
                        <span className="relative z-10">{cat}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
