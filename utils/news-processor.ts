import { createHash } from 'crypto';

// GLOBAL removed

export interface ProcessedNews {
    id: string;
    title: string;
    image: string;
    url: string;
    source: string;
    timeAgo: string;
    isGradient: boolean;
}

// Fallback images map by category/keyword - ARRAYS for variety
const FALLBACK_IMAGES: Record<string, string[]> = {
    'Crypto': [
        'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1622630998477-20aa696fab05?q=80&w=2000&auto=format&fit=crop'
    ],
    'Technology': [
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1531297461136-82ae56a2b752?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop'
    ],
    'Politics': [
        'https://images.unsplash.com/photo-1529101091760-61df6be5d187?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555848962-6e79363ec58f?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541872703-74c5963631df?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1575320181502-9091922095a5?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop'
    ],
    'Economy': [
        'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1565514020176-dbf2277e9e64?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1642543419965-741aab27b3d3?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2000&auto=format&fit=crop'
    ],
    'Science': [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1614935151043-97882842a632?q=80&w=2000&auto=format&fit=crop'
    ],
    'Sports': [
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1593341646782-e0b495cffd32?q=80&w=2000&auto=format&fit=crop'
    ],
    'World': [
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=2000&auto=format&fit=crop'
    ],
    'Culture': [
        'https://images.unsplash.com/photo-1459749411177-287ce112a8bf?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=2000&auto=format&fit=crop'
    ],
    'Default': [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop'
    ]
};

// Deterministic hash to select image style
const getHashIndex = (text: string, max: number): number => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % max);
};

const getFallbackImage = (text: string, category: string): string => {
    // 1. Identify category key
    let catKey = 'Default';

    // Explicit priority
    const explicitKey = Object.keys(FALLBACK_IMAGES).find(k => category.toLowerCase().includes(k.toLowerCase()));
    if (explicitKey) {
        catKey = explicitKey;
    } else {
        // Content inference
        const lowerText = text.toLowerCase();
        if (lowerText.includes('bitcoin') || lowerText.includes('crypto')) catKey = 'Crypto';
        else if (lowerText.includes('tech') || lowerText.includes('ai')) catKey = 'Technology';
        else if (lowerText.includes('election') || lowerText.includes('vote')) catKey = 'Politics';
        else if (lowerText.includes('economy') || lowerText.includes('inflation')) catKey = 'Economy';
    }

    // 2. Select specific image deterministically from the pool
    const pool = FALLBACK_IMAGES[catKey] || FALLBACK_IMAGES['Default'];
    const index = getHashIndex(text, pool.length);

    return pool[index];
};

export const processNewsFeed = (rawArticles: any[], categoryContext: string = 'General'): ProcessedNews[] => {
    // LOCAL: Deduplicación solo para el lote actual de noticias
    const currentBatchIds = new Set<string>();

    return rawArticles
        .filter((article) => {
            // 1. Filtros de Calidad
            if (!article.title || article.title.length < 5) return false;

            // 2. Deduplicación Local
            const uniqueId = article.article_id || article.url || article.title;
            if (currentBatchIds.has(uniqueId)) return false;
            currentBatchIds.add(uniqueId);

            return true;
        })
        .map((article) => {
            let finalImage = article.image || article.image_url;

            // Force Image: If missing, assign fallback based on category/content
            if (!finalImage || finalImage.length < 5) {
                finalImage = getFallbackImage(article.title + " " + (article.description || ""), categoryContext);
            }

            return {
                id: article.article_id || article.url || Math.random().toString(),
                title: article.title,
                image: finalImage,
                url: article.url || article.link,
                source: article.source || article.source_name || "Polymarket",
                timeAgo: article.time || article.pubDate || article.publishedAt || new Date().toISOString(),
                isGradient: false
            };
        })
        .slice(0, 20); // Limit to top 20
};
