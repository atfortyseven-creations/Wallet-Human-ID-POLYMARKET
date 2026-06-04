import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, portfolioContext } = body;

        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking

        let answer = "I'm analyzing your multi-chain footprint...";
        let suggestions = ["Analyze Gas Fees", "Portfolio Audit"];

        const q = query.toLowerCase();

        // INTELLIGENT CONTEXT-AWARE LOGIC
        if (portfolioContext && (q.includes('risk') || q.includes('portfolio') || q.includes('analysis'))) {
            const { legendaryScore, totalValue, assets } = portfolioContext;
            const topAsset = assets?.[0];
            
            if (legendaryScore < 60) {
                answer = `Analysis complete. Your Legendary Score is **${legendaryScore}/100**. This is sub-optimal. Your 60%+ concentration in **${topAsset?.symbol || 'one asset'}** creates a logic bottleneck. I recommend diversifying into ETH or USDC to stabilize your vault.`;
            } else {
                answer = `Your portfolio is performing at a high level with a score of **${legendaryScore}/100**. You have a strong balance across **${assets.length}** assets. Strategy Recommendation: Maintain current positions but look for yield opportunities in your **${topAsset?.symbol}** holding.`;
            }
            suggestions = ["View Sector Allocation", "Yield Opportunities"];
        } 
        else if (q.includes('fee') || q.includes('gas')) {
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

