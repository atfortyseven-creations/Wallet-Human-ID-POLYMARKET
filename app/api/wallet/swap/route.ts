import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSwapQuote, buildSwapTransaction } from '@/lib/wallet/swap';
import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/wallet/swap
 * Get swap quote OR build transaction
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { 
      chainId,
      fromToken,
      toToken,
      amount,
      fromAddress,
      slippage = 0.5,
      mode = 'quote'
    } = body;

    // Strict Validation
    if (!chainId || isNaN(chainId)) throw new Error('Invalid or missing Chain ID');
    if (!fromAddress?.startsWith('0x')) throw new Error('Invalid sender address');
    if (!amount || parseFloat(amount) <= 0) throw new Error('Amount must be greater than zero');
    if (fromToken === toToken) throw new Error('Source and destination tokens must be different');

    if (!chainId || !fromToken || !toToken || !amount || !fromAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const swapParams = {
      src: fromToken,
      dst: toToken,
      amount: amount,
      from: fromAddress,
      slippage: slippage,
    };

    if (mode === 'swap') {
      const result = await buildSwapTransaction(chainId, swapParams);
      
      // OPTIONAL: If the user wants the server to broadcast (Managed Wallet Mode)
      // Otherwise, we return the transaction for client-side signing (Self-Custody Mode)
      // For "Human Wallet", we support both. Here we return it for the UI to handle.
      return NextResponse.json({ transaction: result });
    } else if (mode === 'broadcast') {
      const { signedTx } = body;
      const tx = await buildSwapTransaction(chainId, swapParams); // Re-fetch to verify
      
      // Broadcast to network
      const provider = new ethers.AlchemyProvider(chainId === 1 ? 'mainnet' : 'base', process.env.ALCHEMY_API_KEY);
      const broadcastRes = await provider.broadcastTransaction(signedTx);
      
      // Save to DB
      await prisma.transaction.create({
        data: {
          authUserId: user.id,
          hash: broadcastRes.hash,
          chainId: chainId,
          type: 'SWAP',
          status: 'PENDING',
          from: fromAddress,
          to: tx.tx.to,
          value: amount,
          tokenSymbol: fromToken,
        }
      });

      return NextResponse.json({ success: true, hash: broadcastRes.hash });
    } else {
      const result = await getSwapQuote(chainId, swapParams);
      return NextResponse.json({ quote: result });
    }

  } catch (error: any) {
    console.error('Swap execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute swap request' },
      { status: 500 }
    );
  }
}
