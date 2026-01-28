import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// In production, instantiate prisma in a singleton file to avoid connection limits
const prisma = new PrismaClient();

// Configuration
const CONFIDENCE_THRESHOLD = 85;

interface AnalyzeRequest {
    marketId: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: AnalyzeRequest = await req.json();
        const { marketId } = body;

        if (!marketId) {
            return NextResponse.json({ error: "Missing marketId" }, { status: 400 });
        }

        const market = await prisma.market.findUnique({
            where: { slug: marketId },
            include: { trades: true } // Fetch trades to analyze volume
        });

        if (!market) {
            return NextResponse.json({ error: "Market not found" }, { status: 404 });
        }

        // 1. Volume Analysis (Quantitative)
        // Logic: Compare last hour volume amplitude vs 24h average
        // Mocking logic for MVP as we don't have full historical tick data in this schema context easily

        // Simulate: Fetch real volume data or use existing trades
        // For demo: Random fluctuation or based on recent db trades
        const volumeScore = calculateVolumeAnomaly(market.trades);

        // 2. Sentiment Analysis (Qualitative)
        // Logic: Check IntelItems for keywords related to market.question
        const recentNews = await prisma.intelItem.findMany({
            where: {
                publishedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h
                }
            },
            take: 5
        });

        const sentimentScore = analyzeSentiment(market.question, recentNews);

        // 3. Confidence Score Calculation
        // Weighted Average: 60% Volume (Hard Data), 40% Sentiment (Soft Data)
        const confidenceScore = Math.round((volumeScore * 0.6) + (sentimentScore * 0.4));

        // 4. Action Trigger
        let newRiskLevel = "LOW";
        let alertEmitted = false;

        if (confidenceScore > CONFIDENCE_THRESHOLD) {
            newRiskLevel = "CRITICAL";
            alertEmitted = true;
            // In a real event-driven system, we'd emit an event to the EmergencyDAO here
        } else if (confidenceScore > 60) {
            newRiskLevel = "HIGH";
        } else if (confidenceScore > 30) {
            newRiskLevel = "MEDIUM";
        }

        // Update Database
        // We cast string to enum type roughly, assuming valid values
        await prisma.market.update({
            where: { slug: marketId },
            data: { riskLevel: newRiskLevel as any }
        });

        return NextResponse.json({
            process: "AI_MARKET_GUARD",
            marketId,
            metrics: {
                volumeAnomaly: volumeScore,
                sentimentDivergence: sentimentScore,
            },
            confidenceScore,
            riskAssessment: newRiskLevel,
            actionTaken: alertEmitted ? "EMERGENCY_ALERT_EMITTED" : "MONITORING_ACTIVE"
        });

    } catch (error) {
        console.error("AI Guard Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// --- Helper Logic (Mock Brain) ---

function calculateVolumeAnomaly(trades: any[]): number {
    // Real impl: Standard deviation of volume candles.
    // Mock impl: Random "shock" factor + basic trade count check
    const tradeCount = trades.length;
    if (tradeCount === 0) return 0;

    // Anomaly simulation: 
    // If trade count is prime, high anomaly (just for deterministic testing randomness)
    // Or just random for demo visual
    return Math.floor(Math.random() * 100);
}

function analyzeSentiment(question: string, news: any[]): number {
    // Real impl: OpenAI API call with prompt:
    // "Does the news news_list contradict the market question question?"

    // Mock impl:
    if (news.length === 0) return 50; // Neutral

    // If news mentions "Fraud" or "SEC", high risk
    const panicKeywords = ["hack", "fraud", "investigation", "sec", "ban"];
    const combinedText = news.map(n => n.title + n.aiSummary).join(" ").toLowerCase();

    const hasPanic = panicKeywords.some(kw => combinedText.includes(kw));
    return hasPanic ? 95 : 20;
}
