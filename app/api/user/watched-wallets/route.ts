import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTotalWalletBalance } from '@/lib/wallet/multi-chain';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('address');

    if (!userId) {
      return NextResponse.json({ error: 'User wallet address required' }, { status: 400 });
    }

    const watchedWallets = await prisma.watchedWallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const watchedWalletsWithBalances = await Promise.all(
      watchedWallets.map(async (w: any) => {
        try {
          const totalValue = await getTotalWalletBalance(w.address);
          return {
            ...w,
            totalValue,
            // Mock change for now, in real app we'd track historical
            change24h: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)
          };
        } catch (e) {
          return { ...w, totalValue: 0, change24h: 0 };
        }
      })
    );

    return NextResponse.json({ watchedWallets: watchedWalletsWithBalances });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch watched wallets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, address, label, tags } = body;

    if (!userId || !address) {
      return NextResponse.json({ error: 'Missing userId or address' }, { status: 400 });
    }

    const formattedAddress = address.startsWith('0x') ? address.toLowerCase() : address;

    const watchedWallet = await prisma.watchedWallet.create({
      data: {
        userId,
        address: formattedAddress,
        label: label || address,
        tags: tags || [],
        alertsEnabled: true
      }
    });

    return NextResponse.json({ watchedWallet });
  } catch (error) {
    console.error('Error adding watched wallet:', error);
    return NextResponse.json({ error: 'Wallet already watched or server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, alertsEnabled, label } = body;

    const updated = await prisma.watchedWallet.update({
      where: { id },
      data: {
        ...(alertsEnabled !== undefined && { alertsEnabled }),
        ...(label !== undefined && { label })
      }
    });

    return NextResponse.json({ watchedWallet: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update watched wallet' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.watchedWallet.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete watched wallet' }, { status: 500 });
  }
}
