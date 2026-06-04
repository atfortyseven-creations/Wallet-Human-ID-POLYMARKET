import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Extend the session user type to include the wallet address added in auth callbacks
interface SessionUser {
  address?: string;
  email?: string | null;
  name?: string | null;
}

// [SECURITY] Generate a random API key
function generateApiKey() {
  const prefix = 'wh_live_';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${prefix}${randomBytes}`;
}

/** Resolve wallet address from session  supports both SIWE (address) and legacy email sessions */
async function resolveWalletFromSession(session: any): Promise<string | null> {
  const user = session?.user as SessionUser | undefined;

  // Primary: SIWE session sets user.address
  if (user?.address) return user.address.toLowerCase();

  // Fallback: legacy next-auth email session  look up by email
  if (user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    return dbUser?.walletAddress ?? null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const walletAddress = await resolveWalletFromSession(session);
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    const key = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        userId: user.walletAddress, // Securely obtained from DB
        plan: 'whale',
      },
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Create API Key Error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const walletAddress = await resolveWalletFromSession(session);
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return NextResponse.json({ keys: [] });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.walletAddress, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('List API Keys Error:', error);
    return NextResponse.json({ error: 'Failed to list keys' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const walletAddress = await resolveWalletFromSession(session);
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await req.json();

    const apiKey = await prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey || apiKey.userId !== user.walletAddress) {
      return NextResponse.json({ error: 'API Key not found or forbidden' }, { status: 403 });
    }

    await prisma.apiKey.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 });
  }
}
