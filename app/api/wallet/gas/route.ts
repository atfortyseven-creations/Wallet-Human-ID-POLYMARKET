import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGasEstimates, estimateGasLimit } from '@/lib/wallet/gas';

/**
 * GET /api/wallet/gas?chainId=1&gasLimit=21000
 * Get gas estimates for a transaction
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');
    const gasLimit = searchParams.get('gasLimit');
    const ethPriceUSD = searchParams.get('ethPrice');

    if (!chainId) {
      return NextResponse.json(
        { error: 'Missing required parameter: chainId' },
        { status: 400 }
      );
    }

    const estimates = await getGasEstimates(
      parseInt(chainId),
      gasLimit ? BigInt(gasLimit) : 21000n,
      ethPriceUSD ? parseFloat(ethPriceUSD) : 3000
    );

    return NextResponse.json({ gasEstimates: estimates });
  } catch (error) {
    console.error('Error fetching gas estimates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gas estimates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet/gas/estimate
 * Estimate gas limit for a specific transaction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chainId, from, to, data, value } = body;

    if (!chainId || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: chainId, from, to' },
        { status: 400 }
      );
    }

    const gasLimit = await estimateGasLimit(chainId, from, to, data, value);

    return NextResponse.json({ gasLimit: gasLimit.toString() });
  } catch (error) {
    console.error('Error estimating gas limit:', error);
    return NextResponse.json(
      { error: 'Failed to estimate gas limit' },
      { status: 500 }
    );
  }
}
