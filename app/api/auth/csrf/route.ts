import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generateCSRFToken } from '@/lib/security/premium-security';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = generateCSRFToken(session.user.id);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[API ERROR] CSRF token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
