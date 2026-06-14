import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generateCSRFToken } from '@/lib/security/premium-security';

export async function GET(req: NextRequest) {
  try {
    // Priority: SIWE Session ONLY (Cryptographic identity is non-negotiable)
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = generateCSRFToken(userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[API ERROR] CSRF token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

