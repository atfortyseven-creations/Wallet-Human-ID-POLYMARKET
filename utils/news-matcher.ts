import { NewsItem } from '@/types/wallet'; // Asegúrate de tener este tipo

export function matchNewsToMarket(marketQuestion: string, newsItems: NewsItem[]): string | undefined {
    if (!marketQuestion || !newsItems.length) return undefined;

    // 1. Normalización: Minúsculas y quitar caracteres especiales
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/gi, '');

    const cleanQuestion = normalize(marketQuestion);

    // 2. Buscar coincidencias
    const match = newsItems.find(news => {
        const cleanHeadline = normalize(news.title);

        // A. Coincidencia directa fuerte
        if (cleanHeadline.includes(cleanQuestion) || cleanQuestion.includes(cleanHeadline)) {
            return true;
        }

        // B. Coincidencia por palabras clave (Heurística simple)
        // Extraemos palabras clave largas (>4 letras) del título de la noticia
        const keywords = cleanHeadline.split(' ').filter(word => word.length > 4);
        // Si la pregunta del mercado contiene al menos 2 palabras clave de la noticia
        const hits = keywords.filter(word => cleanQuestion.includes(word));

        return hits.length >= 2;
    });

    return match ? match.title : undefined;
}
