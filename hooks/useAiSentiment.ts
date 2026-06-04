import { useState, useEffect, useCallback } from 'react';

/**
 * useAiSentiment Hook (REFACTORED FOR REAL DATA)
 * Analyzes real news headlines from /api/news.
 */
export const useAiSentiment = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sentimentData, setSentimentData] = useState({
        score: 50,
        state: 'NEUTRAL' as 'EXTREME FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME GREED',
        keywords: [
            { tag: 'Account Abstraction', weight: 0.9 }
        ],
        analysisCount: 0,
    });

    const fetchSentiment = useCallback(async () => {
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            const headlines = data.news || [];
            
            if (headlines.length === 0) {
                setIsLoading(false);
                return;
            }

            // Simple sentiment analysis
            let points = 0;
            const positive = ['bull', 'gain', 'all-time', 'success', 'growth', 'launch'];
            const negative = ['bear', 'drop', 'crash', 'fail', 'hack', 'ban'];

            headlines.forEach((h: any) => {
                const text = (h.title + ' ' + (h.summary || '')).toLowerCase();
                positive.forEach(w => { if (text.includes(w)) points += 5; });
                negative.forEach(w => { if (text.includes(w)) points -= 5; });
            });

            const score = Math.max(0, Math.min(100, 50 + points));
            
            let state: 'EXTREME FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME GREED' = 'NEUTRAL';
            if (score < 25) state = 'EXTREME FEAR';
            else if (score < 45) state = 'FEAR';
            else if (score < 55) state = 'NEUTRAL';
            else if (score < 75) state = 'GREED';
            else state = 'EXTREME GREED';

            setSentimentData({
                score,
                state,
                keywords: [
                    { tag: 'Blockchain Trends', weight: 0.8 },
                    { tag: 'Market Analytics', weight: 0.9 }
                ],
                analysisCount: headlines.length
            });
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSentiment();
    }, [fetchSentiment]);

    return { ...sentimentData, isLoading };
};

