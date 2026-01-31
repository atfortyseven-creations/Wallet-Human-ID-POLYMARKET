import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Blockchain monitoring service
// This would connect to Alchemy/Infura in production
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock whale activities for now
    // In production, this would fetch from Alchemy/Infura
    const whaleActivities = generateMockWhaleActivities();

    return NextResponse.json({
      activities: whaleActivities,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[API ERROR] Whale activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockWhaleActivities() {
  const tokens = ['USDC', 'WETH', 'USDT', 'DAI', 'WBTC'];
  const actions = ['BUY', 'SELL', 'TRANSFER'];
  const whales = [
    '0x28C6c06298d514Db089934071355E5743bf21d60',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    '0x1234567890abcdef1234567890abcdef12345678',
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `whale-${Date.now()}-${i}`,
    walletAddress: whales[Math.floor(Math.random() * whales.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    token: tokens[Math.floor(Math.random() * tokens.length)],
    amount: (Math.random() * 1000000).toFixed(2),
    usdValue: (Math.random() * 1000000).toFixed(2),
    timestamp: Date.now() - Math.random() * 3600000,
    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    confidence: 85 + Math.random() * 15,
  }));
}
