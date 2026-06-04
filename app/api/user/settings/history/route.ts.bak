import { getSession } from '@/lib/session';
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// GET /api/user/settings/history - Get settings change history
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const email = session?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUser = await prisma.authUser.findUnique({
      where: { email },
    });

    if (!authUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const field = searchParams.get('field');

    // Build query
    const whereClause: any = {
      authUserId: authUser.id,
    };

    if (field) {
      whereClause.field = field;
    }

    // Fetch history
    const history = await prisma.userSettingsHistory.findMany({
      where: whereClause,
      orderBy: {
        changedAt: 'desc',
      },
      take: Math.min(limit, 100), // Max 100 records
    });

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error: any) {
    console.error('Settings history error:', error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

