import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSwapQuote, buildSwapTransaction } from '@/lib/wallet/swap';

/**
 * POST /api/wallet/swap/quote
 * Get swap quote from DEX aggregator
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      chainId,
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromAddress,
      slippage = 0.5
    } = body;

    if (!chainId || !fromTokenAddress || !toTokenAddress || !amount || !fromAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const quote = await getSwapQuote(chainId, {
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromAddress,
      slippage,
    });

    return NextResponse.json({ quote });
  } catch (error: any) {
    console.error('Error getting swap quote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get swap quote' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet/swap/build
 * Build swap transaction
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      chainId,
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromAddress,
      slippage = 0.5
    } = body;

    if (!chainId || !fromTokenAddress || !toTokenAddress || !amount || !fromAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const txData = await buildSwapTransaction(chainId, {
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromAddress,
      slippage,
    });

    return NextResponse.json({ transaction: txData });
  } catch (error: any) {
    console.error('Error building swap transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to build swap transaction' },
      { status: 500 }
    );
  }
}
