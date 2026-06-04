import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Gamification API - XP and Levels
// ZERO-MOCK MANDATE: XP data must come from real DB once gamification schema is implemented.
// For now gate the endpoint with the session check and return 501 for unimplemented reads.

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = prisma as any;
    let record = await db.gamificationRecord.findUnique({ where: { userId: session.userId } });
    if (!record) {
      record = await db.gamificationRecord.create({
        data: { userId: session.userId, totalXp: 0, level: 1 }
      });
    }

    return NextResponse.json({
      userId: record.userId,
      xp: record.totalXp,
      level: record.level,
      tier: record.currentTier,
      achievements: record.achievements,
      status: 'success'
    });

  } catch (error) {
    console.error('[API ERROR] Gamification data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { xpAmount = 50, eventType = 'STANDARD_ACTION' } = await req.json().catch(() => ({}));
    const db = prisma as any;
    
    let record = await db.gamificationRecord.findUnique({ where: { userId: session.userId } });
    if (!record) {
      record = await db.gamificationRecord.create({ data: { userId: session.userId, totalXp: 0, level: 1 } });
    }

    const newXp = record.totalXp + xpAmount;
    const newLevel = Math.floor(newXp / 1000) + 1; // 1000 XP per level

    const updated = await db.gamificationRecord.update({
      where: { userId: session.userId },
      data: { totalXp: newXp, level: newLevel, lastEventDate: new Date() }
    });

    return NextResponse.json({
      success: true,
      newXp: updated.totalXp,
      newLevel: updated.level
    });

  } catch (error) {
    console.error('[API ERROR] Award XP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
