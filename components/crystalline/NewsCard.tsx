"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { NewsItem } from "@/data/news";

interface NewsCardProps {
    article: NewsItem;
    priority?: boolean;
}

export default function NewsCard({ article, priority = false }: NewsCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-lg shadow-black/20 transition-all duration-500 hover:bg-white/10 hover:border-white/30 h-full flex flex-col"
        >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Image Section - Fixed Aspect Ratio */}
            <div className="aspect-[16/9] w-full relative overflow-hidden bg-black/50">
                <SafeImage
                    src={article.imageUrl}
                    alt={article.headline}
                    fallbackCategory={article.category}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                {/* Source Badge (Over Image) */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                    <TrendingUp className="w-3 h-3" />
                    {article.source}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-serif text-lg text-white font-bold leading-tight mb-2 group-hover:text-indigo-200 transition-colors line-clamp-3">
                    {article.headline}
                </h3>

                <p className="font-sans text-xs text-white/60 leading-relaxed mb-4 line-clamp-3 flex-1">
                    {article.description}
                </p>

                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        {article.time}
                    </div>
                    {/* NEW SIGNATURE */}
                    <span className="text-[10px] text-white/20 font-serif italic text-right">
                        Signed by Polymarket News
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
