import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // Or your auth provider

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
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
        const body = await req.json();
        const { userId, address, label } = body;

        if (!userId || !address) {
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
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const userId = searchParams.get('userId');

        if (!id || !userId) {
            return NextResponse.json({ error: 'Missing id or userId' }, { status: 400 });
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

