import React from 'react';

interface NewsCardProps {
    title: string;
    description?: string;
    source: string;
    url: string;
    date?: string;
    image?: string;
    timeAgo?: string;
    isGradient?: boolean;
}

export function NewsCard({ title, description, source, url, date, image, timeAgo, isGradient }: NewsCardProps) {
    const displayDate = timeAgo || date;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group h-full"
        >
            <div className={`h-full rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 flex flex-col ${isGradient ? 'bg-gradient-to-br from-purple-900/40 to-black/40' : 'bg-white/5 backdrop-blur-sm hover:bg-white/10'}`}>

                {image && (
                    <div className="h-48 w-full relative overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                )}

                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {source}
                        </span>
                        {displayDate && <span className="text-xs text-gray-500">{displayDate}</span>}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                        {title}
                    </h3>

                    {description && (
                        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                            {description}
                        </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-xs text-gray-500 group-hover:text-purple-400 transition-colors">
                        Leer noticia completa →
                    </div>
                </div>
            </div>
        </a>
    );
}
