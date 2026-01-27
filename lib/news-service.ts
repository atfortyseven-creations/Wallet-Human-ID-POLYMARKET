
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
    // Check all possible variable names the user might have set
    private static readonly API_KEY = process.env.NEWSDATA_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY || process.env.NEWS_API_KEY;

    // CONSTANTS
    private static readonly TARGET_LIMIT = 50;

    // FALLBACK DATA (For maximum elegance even when API fails)
    private static readonly FALLBACK_NEWS: NewsArticle[] = Array(50).fill(0).map((_, i) => ({
        id: `fallback-${i}`,
        title: [
            "Bitcoin alcanza nuevo máximo histórico en medio de adopción institucional masiva",
            "La inteligencia artificial transforma el sector salud: Nuevos descubrimientos",
            "Mercados globales reaccionan positivamente a los datos de inflación de EE.UU.",
            "Apple revela sus nuevos dispositivos con tecnología holográfica revolucionaria",
            "SpaceX lanza exitosamente la misión tripulada a Marte: Un hito para la humanidad"
        ][i % 5],
        link: "https://polymarket.com",
        description: "Análisis profundo sobre las últimas tendencias que están marcando el ritmo de la economía digital y tecnológica mundial.",
        content: "Contenido completo no disponible en modo fallback.",
        pubDate: new Date().toISOString(),
        source: "Nexus Global",
        imageUrl: [
            "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
        ][i % 5],
        category: ['technology']
    }));

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

            // Verify we have enough articles
            if (allArticles.length === 0) {
                console.warn("[NewsService] API returned 0 items. Using FALLBACK data for elegance.");
                return this.FALLBACK_NEWS;
            }

            // Note: Deduplication happens in the Processor
            return allArticles;

        } catch (error) {
            console.error("[NewsService Critical Failure]:", error);
            // Graceful Fallback
            return this.FALLBACK_NEWS;
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
