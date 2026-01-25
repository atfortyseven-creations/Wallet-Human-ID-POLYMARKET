import { createHash } from 'crypto';

// Conjuntos globales (en memoria) para rastrear lo que el usuario ya vio en esta sesión
const seenArticleIds = new Set<string>();
const seenImageUrls = new Set<string>();

export interface ProcessedNews {
    id: string;
    title: string;
    image: string;
    url: string;
    source: string;
    timeAgo: string;
    isGradient: boolean; // Para saber si renderizar foto o gradiente elegante
}

// Función auxiliar para generar un gradiente único basado en texto (Fallback elegante)
function generateUniqueGradient(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = Math.abs(hash % 360);
    const c2 = (c1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${c1}, 70%, 20%) 0%, hsl(${c2}, 90%, 15%) 100%)`;
}

export const processNewsFeed = (rawArticles: any[]): ProcessedNews[] => {
    return rawArticles
        .filter((article) => {
            // 1. Filtrado de calidad básica
            if (!article.title || article.title.length < 10) return false;
            if (!article.url) return false;

            // 2. DETECCIÓN DE NOTICIAS DUPLICADAS
            // Usamos el ID o la URL como huella única
            const uniqueId = article.article_id || article.url;
            if (seenArticleIds.has(uniqueId)) return false;

            seenArticleIds.add(uniqueId);
            return true;
        })
        .map((article) => {
            let finalImage = article.image_url || article.image || article.imageUrl;
            let isGradient = false;

            // 3. DETECCIÓN DE FOTOS DUPLICADAS (Lógica Senior)
            // Si la foto ya salió antes, O si no hay foto: Generamos un arte único.
            if (!finalImage || seenImageUrls.has(finalImage)) {
                finalImage = generateUniqueGradient(article.title);
                isGradient = true;
            } else {
                seenImageUrls.add(finalImage);
            }

            return {
                id: article.article_id || article.url,
                title: article.title,
                image: finalImage,
                url: article.url,
                source: article.source_name || article.source || "Polymarket",
                timeAgo: article.pubDate || article.publishedAt || article.time || new Date().toISOString(),
                isGradient
            };
        })
        // Limitamos a 20 para mantener performance visual
        .slice(0, 20);
};
