import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { NewsItem } from '@/data/news';

export const processNewsFeed = (rawArticles: NewsItem[]) => {
    const seen = new Set();

    return rawArticles.filter(article => {
        // 1. Basic Cleaning
        if (!article.headline || !article.imageUrl) return false;

        // 2. Normalization (using headline as ID proxy if ID is not unique enough, or just ID)
        // The API returns IDs, but let's be safe and also check headline/url if available.
        // For our NewsItem, we use 'id'. 
        // If we want to deduplicate by URL (source), we'd need that field. 
        // Let's assume 'id' from backend (which wraps article_id) is sufficient, 
        // OR we can deduplicate by headline to be super safe.
        const identifier = article.headline.toLowerCase().trim();

        // 3. Deduplication
        if (seen.has(identifier)) return false;
        seen.add(identifier);

        return true;
    }).map(article => ({
        ...article,
        // 4. Relative Time formatting
        // We catch invalid dates to avoid crashes
        timeAgo: formatTime(article.time || article.date), // backend sends 'date' mapped to 'time' or we need to check properties
    }));
};

function formatTime(dateString?: string): string {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // If it's already "2h ago" or invalid
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch (e) {
        return dateString || '';
    }
}
