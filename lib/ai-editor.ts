// lib/ai-editor.ts
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

export async function generateSmartTitles(newsContext: string) {
    const prompt = `
    # ROLE
    Act as a Senior Editor-in-Chief. Your specialty is reader psychology and semantic SEO.

    # TASK
    Generate 10 RADICALLY different title variations for the provided news.
    Use the following styles: Click-Gap, Analytical, Emotional, Contrarian, SEO Long-Tail, Punchy, Storyteller, Quote, Utility, Avant-Garde.

    # INPUT
    ${newsContext}

    # OUTPUT FORMAT
    Respond ONLY in pure JSON format with the following structure:
    {
      "variations": [
        { "style": "Style Name", "title": "The generated title" }
      ]
    }
  `;

    try {
        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini", // Fast and cheap for titles
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.8, // Adds that creative spark
        });

        const content = response.choices[0].message.content;
        return content ? JSON.parse(content).variations : [];
    } catch (error) {
        console.error("AI Generation Error:", error);
        // Return empty array instead of throwing to prevent app crash
        return [];
    }
}

