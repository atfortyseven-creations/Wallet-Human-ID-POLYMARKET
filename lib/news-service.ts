
export interface NewsArticle {
    id: string;
    title: string;
    link: string;
    description: string;
    content: string;
    pubDate: string;
    source: string;
    imageUrl: string | null;
    category: string[];
}

/**
 * NewsDataService: Clase para gestionar la comunicación con NewsData.io
 * IMPLEMENTACIÓN PARALELA PARA ALTO RENDIMIENTO (50 ÍTEMS)
 */
export class NewsDataService {
    private static readonly BASE_URL = "https://newsdata.io/api/1/news";
    private static readonly API_KEY = process.env.NEWSDATA_API_KEY;

    // CONSTANTS
    private static readonly TARGET_LIMIT = 50;

    // ESTRATEGIAS DE PARALELISMO
    // Para lograr 50 ítems rápidamente sin paginación secuencial lenta,
    // lanzamos múltiples queries relacionadas en paralelo.
    private static readonly PARALLEL_STRATEGIES: Record<string, string[]> = {
        'trending': ['top', 'world', 'business', 'technology', 'entertainment'],
        'crypto': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'web3'],
        'tech': ['technology', 'science', 'ai', 'mobile', 'startup'],
        'politics': ['politics', 'world', 'elections', 'policy', 'government'],
        'economy': ['business', 'economy', 'finance', 'market', 'stock'],
        'sports': ['sports', 'football', 'basketball', 'tennis', 'racing'],
        'culture': ['entertainment', 'movies', 'music', 'art', 'lifestyle'],
        'world': ['world', 'international', 'politics', 'human rights', 'global'],
    };

    static async fetchLatest(query: string = 'actualidad'): Promise<NewsArticle[]> {
        return this.fetchByCategory('Trending'); // Default fallback
    }

    static async fetchByCategory(categoryName: string): Promise<NewsArticle[]> {
        if (!this.API_KEY) {
            console.warn("[NewsDataService] Missing NEWSDATA_API_KEY");
            return [];
        }

        const strategies = this.getStrategiesForCategory(categoryName);
        console.log(`[NewsService] Fetching parallel strategies for ${categoryName}:`, strategies);

        try {
            // EXECUTE PARALLEL REQUESTS
            // Usamos Promise.allSettled para "Graceful Degradation"
            // Si una falla, las otras siguen.
            const results = await Promise.allSettled(
                strategies.map(strategy => this.fetchRawStrategy(strategy))
            );

            // AGGREGATE RESULTS
            let allArticles: NewsArticle[] = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    allArticles = [...allArticles, ...result.value];
                } else {
                    console.warn(`[NewsService] Strategy '${strategies[index]}' failed:`, result.reason);
                }
            });

            // Note: Deduplication happens in the Processor, but we can do a quick pass here if needed.
            // We return everything we found, let the processor pick the best 50.
            return allArticles;

        } catch (error) {
            console.error("[NewsService Critical Failure]:", error);
            return [];
        }
    }

    private static getStrategiesForCategory(categoryName: string): string[] {
        const cat = categoryName.toLowerCase();
        // Si existe una estrategia predefinida, úsala
        if (this.PARALLEL_STRATEGIES[cat]) {
            return this.PARALLEL_STRATEGIES[cat];
        }

        // Estrategia por defecto: Variedad básica
        return ['top', 'world', 'business', 'technology', 'sports'];
    }

    private static async fetchRawStrategy(identifier: string): Promise<NewsArticle[]> {
        // Determinamos si es 'category' o 'q' (search)
        // Las categorías estándar de NewsData.io son limitadas.
        const validCategories = ['business', 'entertainment', 'environment', 'food', 'health', 'politics', 'science', 'sports', 'technology', 'top', 'tourism', 'world'];

        const params = new URLSearchParams({
            apikey: this.API_KEY || '',
            language: 'es', // Español
            image: '1',     // Intentar forzar imagen
            size: '10'      // Max per request (Free tier usually 10)
        });

        if (validCategories.includes(identifier)) {
            params.append('category', identifier);
        } else {
            params.append('q', identifier);
        }

        try {
            const response = await fetch(`${this.BASE_URL}?${params.toString()}`, {
                next: { revalidate: 300 }, // 5 min cache
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== "success") return [];

            return (data.results || []).map((article: any) => ({
                id: article.article_id || article.link, // Fallback ID
                title: article.title,
                link: article.link,
                description: article.description,
                content: article.content,
                pubDate: article.pubDate,
                source: article.source_id,
                imageUrl: article.image_url,
                category: article.category,
            }));

        } catch (e) {
            console.error(`[NewsService] Error fetching strategy '${identifier}':`, e);
            return [];
        }
    }
}

export const fetchNewsByCategory = NewsDataService.fetchByCategory.bind(NewsDataService);
