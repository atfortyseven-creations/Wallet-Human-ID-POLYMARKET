import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generateCSRFToken } from '@/lib/security/premium-security';

export async function GET(req: NextRequest) {
  try {
    // Priority: SIWE Session > Web3 Address header (guest)
    const session = await getSession();
    const web3Address = req.headers.get('x-web3-address');
    const userId = session?.userId || (web3Address && /^0x[a-fA-F0-9]{40}$/.test(web3Address) ? web3Address.toLowerCase() : null);

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

