import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { useAccount } from 'wagmi'; // Wait, this is server side

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

    return NextResponse.json({ watchedWallets });
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
