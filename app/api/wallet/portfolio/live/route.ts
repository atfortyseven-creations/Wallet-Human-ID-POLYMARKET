import { NextRequest, NextResponse } from 'next/server';
import { portfolioService } from '@/lib/blockchain/PortfolioService';

/**
 * POST /api/wallet/portfolio/live
 * Specialized high-frequency endpoint for 1s price updates.
 * Expects a list of symbols/balances to re-price.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokens } = body;

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json({ error: 'Invalid token list' }, { status: 400 });
    }

    // Limit to top 50 to prevent abuse
    const subset = tokens.slice(0, 50);

    const updates = await portfolioService.getActivePrices(subset.map((t: any) => ({
      symbol: t.symbol,
      balance: t.balanceNumeric || t.balance || 0,
      price: t.price || 0,
      address: t.address,
      chainId: t.chainId
    })));
    
    return NextResponse.json(updates);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Active update failed' },
      { status: 500 }
    );
  }
}

