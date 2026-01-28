import { useState, useEffect } from 'react';

// INTERFACES
export interface IntelItem {
    id: string;
    source: string;
    title: string;
    url: string;
    image: string;
    published_on: number;
    tags: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

interface IntelState {
    data: IntelItem[];
    loading: boolean;
    error: string | null;
}

// CONFIG (Move to .env in production)
const API_ENDPOINTS = {
    CRYPTO_NEWS: 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
    // Fallback or secondary source
};

export const useRealTimeIntel = () => {
    const [intel, setIntel] = useState<IntelState>({
        data: [],
        loading: true,
        error: null
    });

    useEffect(() => {
        let isMounted = true;

        const fetchIntel = async () => {
            try {
                // 1. Fetch Data
                const response = await fetch(API_ENDPOINTS.CRYPTO_NEWS);

                if (!response.ok) {
                    throw new Error(`Intel Stream API Error: ${response.status}`);
                }

                const json = await response.json();

                // 2. Transform Data to "Void Standard"
                const sanitizedData: IntelItem[] = json.Data.slice(0, 20).map((article: any) => ({
                    id: article.id,
                    source: article.source_info.name,
                    title: article.title,
                    url: article.url,
                    image: article.imageurl,
                    published_on: article.published_on,
                    tags: article.tags,
                    sentiment: 'neutral' // Placeholder for ML sentiment analysis
                }));

                if (isMounted) {
                    setIntel({
                        data: sanitizedData,
                        loading: false,
                        error: null
                    });
                }

            } catch (err: any) {
                console.error("Intel Stream Interrupted:", err);
                if (isMounted) {
                    setIntel(prev => ({
                        ...prev,
                        loading: false,
                        error: err.message || "Encrypted Signal Lost"
                    }));
                }
            }
        };

        fetchIntel();

        // Polling every 60s
        const interval = setInterval(fetchIntel, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return intel;
};
