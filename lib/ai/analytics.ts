import OpenAI from 'openai';

let _openai: OpenAI | null = null;

function getOpenAI() {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build_time',
        });
    }
    return _openai;
}

export async function analyzeSentiment(text: string) {
    try {
        const prompt = `
        Act as a Senior Financial Analyst and Crypto Analytics Expert.
        Analyze the following text for market sentiment and hidden intent.
        
        Text: "${text}"

        Task:
        1. Determine if the sentiment is BULLISH, BEARISH, or NEUTRAL.
        2. Provide a one-sentence "Legendary" grade justification in Spanish.
        3. Identify any major entities (Protocols, Whales, Institutions) mentioned.

        Output JSON ONLY:
        {
            "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
            "justification": "One sentence in Spanish explaining the verdict.",
            "entities": ["Entity 1", "Entity 2"]
        }
        `;

        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("AI returned empty response");

        return JSON.parse(content);
    } catch (error) {
        console.error("[AI-Analytics] Sentiment analysis failed:", error);
        return {
            sentiment: "NEUTRAL",
            justification: "El análisis se encuentra en cola de prioridad. Verificación pendiente.",
            entities: []
        };
    }
}
