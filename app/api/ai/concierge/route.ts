import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query } = body;

        // SIMULATED AI LOGIC (Mocking Vector DB / LLM Analysis)
        // In production, this connects to OpenAI/Anthropic + Pinecone
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking

        let answer = "I'm analyzing your on-chain footprint...";
        let suggestions = ["Analyze Gas Fees", "Portfolio Audit"];

        const q = query.toLowerCase();

        if (q.includes('fee') || q.includes('gas')) {
            answer = "In the last 30 days, you spent **$142.50** on gas fees. 85% was on Ethereum Mainnet. Moving to Polygon could save you ~$120/month.";
            suggestions = ["Optimize my trades", "Bridge to Polygon"];
        } 
        else if (q.includes('scam') || q.includes('risk')) {
            answer = "Audit Complete: No malicious approvals found on your main wallet. However, you interacted with a high-risk contract (0x82...a9) 4 months ago. I recommend revoking permissions.";
            suggestions = ["Revoke 0x82...a9", "Full Security Scan"];
        }
        else if (q.includes('spent') || q.includes('cost')) {
            answer = "You've spent a total of **$4,250.00** this month. Top category: DEX Swaps (Uniswap).";
            suggestions = ["Set spending limit", "View monthly breakdown"];
        }
        else {
            answer = "I can help you optimize your portfolio, detecting hidden fees, or auditing smart contract safety. What's your priority?";
            suggestions = ["How much did I spend?", "Check for scams", "Yield opportunities"];
        }

        return NextResponse.json({
            answer,
            suggestions
        });

    } catch (error) {
        return NextResponse.json({ error: 'AI Brain Overload' }, { status: 500 });
    }
}
