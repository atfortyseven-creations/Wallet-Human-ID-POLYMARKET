import { NextRequest, NextResponse } from 'next/server';
import {
  validateSecureRequest,
  logAuditEvent,
  sanitizeInput,
  verifyPremiumAccess,
  watermarkData,
} from '@/lib/security/premium-security';
import { prisma } from '@/lib/prisma';

// ============================================
// PROTECTED API: Watch Wallet
// ============================================

export async function POST(req: NextRequest) {
  try {
    // Security validation
    const validation = await validateSecureRequest(req, 'PREMIUM');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = validation.userId!;
    const body = await req.json();

    // Input validation
    const address = sanitizeInput(body.address);
    const label = sanitizeInput(body.label || '');

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Check subscription limits
    const access = await verifyPremiumAccess(userId);
    if (!access.valid) {
      const walletCount = await prisma.watchedWallet.count({
        where: { userId },
      });

      if (walletCount >= 3) {
        return NextResponse.json(
          {
            error: 'Free tier limited to 3 wallets. Upgrade to Premium for unlimited.',
            requiresUpgrade: true,
          },
          { status: 403 }
        );
      }
    }

    // Check for duplicates
    const existing = await prisma.watchedWallet.findFirst({
      where: { userId, address },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already being watched' },
        { status: 409 }
      );
    }

    // Create watched wallet
    const wallet = await prisma.watchedWallet.create({
      data: {
        userId,
        address,
        label,
        tags: body.tags || [],
        notes: body.notes || '',
        createdAt: new Date(),
      },
    });

    // Audit log
    await logAuditEvent({
      userId,
      action: 'WATCH_WALLET_ADDED',
      resource: 'watched_wallet',
      metadata: { address, label },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    // Return watermarked data
    return NextResponse.json(watermarkData(wallet, userId));
  } catch (error) {
    console.error('[API ERROR] Watch wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PROTECTED API: Get Watched Wallets
// ============================================

export async function GET(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = validation.userId!;

    const wallets = await prisma.watchedWallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Watermark each wallet
    const watermarkedWallets = wallets.map(w => watermarkData(w, userId));

    return NextResponse.json({
      wallets: watermarkedWallets,
      count: wallets.length,
    });
  } catch (error) {
    console.error('[API ERROR] Get wallets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PROTECTED API: Delete Wallet
// ============================================

export async function DELETE(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = validation.userId!;
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get('id');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const wallet = await prisma.watchedWallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    await prisma.watchedWallet.delete({
      where: { id: walletId },
    });

    // Audit log
    await logAuditEvent({
      userId,
      action: 'WATCH_WALLET_DELETED',
      resource: 'watched_wallet',
      metadata: { walletId, address: wallet.address },
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API ERROR] Delete wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
