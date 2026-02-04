import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Gamification API - XP and Levels
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user gamification data
    // In production, this would fetch from database
    const gamificationData = {
      userId: user.id,
      xp: 2450,
      level: 12,
      nextLevelXp: 3000,
      streak: 7,
      achievements: [
        { id: 'first-whale', name: 'First Whale Tracked', unlockedAt: Date.now() - 86400000 },
        { id: 'week-streak', name: '7 Day Streak', unlockedAt: Date.now() - 3600000 },
      ],
      rank: 142,
      totalUsers: 10000,
    };

    return NextResponse.json(gamificationData);
  } catch (error) {
    console.error('[API ERROR] Gamification data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, amount } = await req.json();

    // Award XP based on action
    const xpGained = calculateXP(action, amount);

    // In production, update database
    console.log(`User ${user.id} gained ${xpGained} XP for action: ${action}`);

    return NextResponse.json({
      success: true,
      xpGained,
      newTotal: 2450 + xpGained,
    });
  } catch (error) {
    console.error('[API ERROR] Award XP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateXP(action: string, amount?: number): number {
  const xpMap: Record<string, number> = {
    'track_whale': 10,
    'create_alert': 15,
    'copy_trade': 50,
    'daily_login': 5,
    'share_insight': 20,
  };

  return xpMap[action] || 0;
}
