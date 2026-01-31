import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Leaderboard API
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'profits';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Generate mock leaderboard data
    const leaderboard = generateMockLeaderboard(type, limit);

    return NextResponse.json({
      type,
      entries: leaderboard,
      currentUserRank: 42,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[API ERROR] Leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockLeaderboard(type: string, limit: number) {
  const names = ['CryptoWhale', 'DeFiKing', 'TraderPro', 'WhaleHunter', 'ProfitMaster'];
  
  return Array.from({ length: limit }, (_, i) => ({
    rank: i + 1,
    userId: `user-${i}`,
    username: `${names[i % names.length]}${i}`,
    avatar: `https://i.pravatar.cc/150?u=${i}`,
    value: type === 'profits' 
      ? (1000000 - i * 10000).toFixed(2)
      : type === 'winRate'
      ? (95 - i * 0.5).toFixed(1)
      : 100 - i,
    change: Math.random() > 0.5 ? 'up' : 'down',
    badge: i < 3 ? ['gold', 'silver', 'bronze'][i] : null,
  }));
}
