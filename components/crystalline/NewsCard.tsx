import { ExternalLink, Clock } from 'lucide-react';
import SafeImage from "@/components/ui/SafeImage";
import { NewsItem } from '@/data/news';

interface NewsCardProps {
    article: NewsItem;
    priority?: boolean;
}

export default function NewsCard({ article, priority = false }: NewsCardProps) {
    return (
        <article className="group flex flex-col bg-gray-900/50 border border-white/10 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10 h-full">

            {/* 1. Image with Fixed Aspect Ratio */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-800">
                <SafeImage
                    src={article.imageUrl}
                    alt={article.headline}
                    fallbackCategory={article.category}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                {/* Source Badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white border border-white/10">
                    {article.source || "Polymarket"}
                </div>
            </div>

            <div className="flex flex-col flex-1 p-4">
                {/* 2. Metadata: Time */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Clock size={12} />
                    <span className="capitalize">
                        {article.timeAgo || article.time || article.date || "Recently"}
                    </span>
                </div>

                {/* 3. Headline */}
                <h3 className="text-sm font-semibold text-gray-100 leading-snug mb-4 line-clamp-3 flex-1 group-hover:text-blue-400 transition-colors">
                    {article.headline}
                </h3>

                {/* 4. Functional Footer */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    {article.url ? (
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <span>Leer noticia completa</span>
                            <ExternalLink size={14} />
                        </a>
                    ) : (
                        <div className="flex items-center justify-between w-full text-xs font-medium text-gray-500 cursor-not-allowed">
                            <span>Fuente no disponible</span>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
