import { useState, useEffect, useCallback } from 'react';

interface SentimentData {
    score: number;
    trend: 'UP' | 'DOWN' | 'NEUTRAL';
    keywords: string[];
    lastHeadlines: string[];
    index: number; // 0-100
}

const POSITIVE_WORDS = ['boom', 'rally', 'surge', 'growth', 'adopted', 'partnership', 'upgrade', 'launch', 'profit', 'gain', 'low', 'approval'];
const NEGATIVE_WORDS = ['hack', 'stolen', 'crash', 'drop', 'regulatory', 'ban', 'exploit', 'vuln', 'bug', 'panic', 'loss', 'bear'];

export function useAiSentiment() {
    const [data, setData] = useState<SentimentData>({
        score: 50,
        trend: 'NEUTRAL',
        keywords: [],
        lastHeadlines: [],
        index: 50
    });

    const analyzeRealHeadlines = useCallback(async () => {
        try {
            const res = await fetch('/api/news');
            const json = await res.json();
            const headlines = json.news || [];
            
            if (headlines.length === 0) return;

            // Analyze sentiment based on keywords
            let totalScore = 0;
            const foundKeywords: Set<string> = new Set();

            const selected = headlines.slice(0, 5); // Take top 5 recent

            selected.forEach((h: any) => {
                const text = (h.title + ' ' + (h.summary || '')).toLowerCase();
                
                POSITIVE_WORDS.forEach(w => {
                    if (text.includes(w)) {
                        totalScore += 10;
                        foundKeywords.add(w.toUpperCase());
                    }
                });

                NEGATIVE_WORDS.forEach(w => {
                    if (text.includes(w)) {
                        totalScore -= 10;
                        foundKeywords.add(w.toUpperCase());
                    }
                });
            });

            setData(prev => {
                const newIndex = Math.min(100, Math.max(0, 50 + totalScore));
                const trend = newIndex > prev.index ? 'UP' : newIndex < prev.index ? 'DOWN' : 'NEUTRAL';

                return {
                    score: totalScore,
                    trend,
                    keywords: Array.from(foundKeywords).slice(0, 5),
                    lastHeadlines: selected.map((h: any) => h.title),
                    index: Math.round(newIndex)
                };
            });

        } catch (error) {
            console.error("AI Sentiment Hub Error:", error);
        }
    }, []);

    useEffect(() => {
        analyzeRealHeadlines();
        const interval = setInterval(analyzeRealHeadlines, 60000); // Only every minute for news
        return () => clearInterval(interval);
    }, [analyzeRealHeadlines]);

    return data;
}
