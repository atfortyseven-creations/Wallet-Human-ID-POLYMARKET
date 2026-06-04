import { NextRequest, NextResponse } from 'next/server';
import { moralisService } from '@/lib/blockchain/MoralisService';
import { portfolioService } from '@/lib/blockchain/PortfolioService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  try {
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching wallet profitability for ${address.slice(0, 10)}...`);

    const pnlData = await moralisService.getWalletProfitability(address);

    return NextResponse.json(pnlData);
  } catch (error: any) {
    console.error('[API] Profitability fetch failed, using fallback:', error.message);
    
    //  [LEGENDARY FALLBACK] If Moralis fails, use Portfolio data for 24h P&L
    try {
        const portfolio = await portfolioService.getMultiChainPortfolio(address as string, undefined, false, false);
        return NextResponse.json({
            total_realized_profit_usd: '0',
            total_unrealized_profit_usd: (portfolio.change24hUSD || 0).toString(),
            total_profit_usd: (portfolio.change24hUSD || 0).toString(),
            total_tokens_sold: 0,
            total_tokens_bought: 0,
            isPartial: true,
            result: []
        });
    } catch (fallErr) {
        console.error('[API-FALLBACK-FAIL] Profitability fallback also failed');
    }

    return NextResponse.json(
      { 
        error: 'FETCH_FAILED',
        message: error?.message || 'Failed to fetch profitability data',
        total_realized_profit_usd: '0',
        total_unrealized_profit_usd: '0',
        total_profit_usd: '0',
        total_tokens_sold: 0,
        total_tokens_bought: 0,
        result: []
      },
      { status: 500 }
    );
  }
}

