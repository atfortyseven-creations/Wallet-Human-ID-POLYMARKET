import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const wallets = await prisma.watchedWallet.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ wallets });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const userId = session?.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { address, label } = body;

        if (!address) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const wallet = await prisma.watchedWallet.create({
            data: {
                userId,
                address,
                label: label || 'My Watched Wallet',
                alertsEnabled: true
            }
        });

        return NextResponse.json({ wallet });
    } catch (error) {
        console.error("Create wallet error:", error);
        return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        const userId = session?.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        // Verify ownership
        const wallet = await prisma.watchedWallet.findUnique({
             where: { id } 
        });

        if (!wallet || wallet.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
        }

        await prisma.watchedWallet.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
         console.error("Delete wallet error:", error);
        return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 });
    }
}

