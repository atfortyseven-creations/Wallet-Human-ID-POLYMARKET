import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // [UNLOCKED] Everyone is PREMIUM by default now
    return NextResponse.json({
      isPremium: true,
      tier: 'PREMIUM',
      subscriptionId: 'sub_unlocked_global',
      currentPeriodEnd: 4102444800, // Year 2100
      cancelAtPeriodEnd: false,
    });
  } catch (error) {
    console.error('[API ERROR] Subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
