/**
 * WhaleFortress JSON Security Utility
 * 
 * Proporciona un análisis de JSON ultra-seguro diseñado para entornos de alta
 * disponibilidad. Previene SyntaxErrors catastróficos causados por corrupciones
 * en caché o respuestas de API truncadas.
 * 
 */

/**
 * Parsea una cadena JSON de forma segura con recuperación de fallos.
 * 
 * @param json - La cadena JSON a procesar.
 * @param fallback - El valor a retornar en caso de error (default: null).
 * @param context - Etiqueta para el log forense en caso de fallo.
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T, context = 'GLOBAL'): T {
    if (!json) return fallback;

    // Guard: Detección proactiva de respuestas "TIMEOUT" de Redis/RPC
    if (json === 'TIMEOUT' || json === 'UNDEFINED') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[Forensics:${context}] ️ Bloqueado intento de parsear señal de control: ${json}`);
        }
        return fallback;
    }

    try {
        return JSON.parse(json) as T;
    } catch (err: any) {
        // Auditoría forense del error
        const snippet = json.length > 100 ? `${json.substring(0, 50)}...${json.substring(json.length - 50)}` : json;
        const position = err.message.match(/position (\d+)/)?.[1] || 'unknown';
        
        console.error(`[Forensics:${context}]  SyntaxError detectado en JSON en posición ${position}.`);
        console.error(`[Forensics:${context}] Snippet del contenido: "${snippet}"`);
        
        // En producción, evitamos exponer el contenido completo por seguridad, 
        // pero registramos la estructura básica para debugging.
        return fallback;
    }
}

/**
 * Intenta parsear un objeto, si falla retorna un objeto vacío tipado.
 */
export function safeParseObject<T extends object>(json: string | null | undefined, context = 'OBJECT'): T {
    return safeJsonParse(json, {} as T, context);
}

/**
 * Intenta parsear un array, si falla retorna un array vacío.
 */
export function safeParseArray<T>(json: string | null | undefined, context = 'ARRAY'): T[] {
    return safeJsonParse(json, [] as T[], context);
}
