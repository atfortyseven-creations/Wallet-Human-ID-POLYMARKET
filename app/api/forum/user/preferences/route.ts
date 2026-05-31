import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';
export async function GET(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req);
    if (!validation.valid || !validation.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const address = validation.userId;

    const realUser = await prisma.user.findUnique({ where: { walletAddress: address } });
    if (!realUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      theme: realUser.theme,
      language: realUser.language,
      notifyOnReply: realUser.notifyOnReply,
      notifyOnMention: realUser.notifyOnMention,
      bio: realUser.bio,
      displayName: realUser.displayName
    });
  } catch (error) {
    console.error('[Forum Preferences GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req);
    if (!validation.valid || !validation.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const address = validation.userId;
    
    const body = await req.json();

    const realUser = await prisma.user.findUnique({ where: { walletAddress: address } });
    if (!realUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { id: realUser.id },
      data: {
        ...(body.theme && { theme: body.theme }),
        ...(body.language && { language: body.language }),
        ...(body.notifyOnReply !== undefined && { notifyOnReply: body.notifyOnReply }),
        ...(body.notifyOnMention !== undefined && { notifyOnMention: body.notifyOnMention }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.displayName !== undefined && { displayName: body.displayName })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[Forum Preferences PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
