import { NextRequest, NextResponse } from 'next/server';
import { moralisService } from '@/lib/blockchain/MoralisService';
import { portfolioService } from '@/lib/blockchain/PortfolioService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`[API] Fetching net worth for ${address.slice(0, 10)}...`);
    const netWorthData = await moralisService.getWalletNetWorth(address);
    return NextResponse.json(netWorthData);

  } catch (error: any) {
    console.warn(`[API] Net worth Moralis fail for ${address}, trying Portfolio fallback:`, error.message);
    
    try {
      // Fallback to PortfolioService (which has its own Etherscan fallback)
      const portfolio = await portfolioService.getMultiChainPortfolio(address, undefined, false, false);
      
      return NextResponse.json({
        total_networth_usd: String(portfolio.totalValueUsd || '0'),
        chains: (portfolio.networksActive || ['ethereum']).map((chain: string) => ({
          chain,
          native_balance: '0', // Placeholder
          native_balance_usd: '0',
          token_balance_usd: '0',
          networth_usd: '0'
        })),
        isPartial: true,
        fallback: true
      });
    } catch (fallbackError) {
      console.error('[API] Net worth total failure:', fallbackError);
      return NextResponse.json(
        { 
          error: 'FETCH_FAILED',
          message: 'Both Moralis and Portfolio fallback failed',
          total_networth_usd: '0',
          chains: []
        },
        { status: 200 } // Still 200 to prevent UI crash
      );
    }
  }
}

