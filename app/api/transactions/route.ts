import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * [Elite] Transaction Registration API
 * Creates a PENDING entry in the DB immediately after broadcast.
 */
export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { hash, userId, type, fromChain, toChain, fromToken, toToken, fromAmount, metadata } = data;

        if (!hash || !userId) {
            return NextResponse.json({ error: 'Missing hash or userId' }, { status: 400 });
        }

        const tx = await prisma.blockchainTransaction.upsert({
            where: { txHash: hash },
            update: {
                status: data.status || 'PENDING_RELAY',
                updatedAt: new Date()
            },
            create: {
                txHash: hash,
                userId,
                blockNumber: metadata?.blockNumber || 0,
                type: type || 'SWAP',
                fromChain: fromChain?.toString() || '1',
                toChain: toChain?.toString() || '1',
                fromToken,
                toToken,
                fromAmount: fromAmount?.toString() || '0',
                status: 'PENDING_RELAY',
                metadata: metadata || {}
            }
        });

        console.log(`[ORCHESTRATOR] Registered transaction: ${hash}`);
        return NextResponse.json(tx);
    } catch (error: any) {
        console.error('[ORCHESTRATOR] API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { 
    getTransactionHistory 
} from '@/lib/wallet/transactions-server';

/**
 * Gets user transactions - Unified System Flow
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        //  UNIFICACIÓN DE EXPLORADOR (5000T) 
        // Ya no consultamos una sola tabla; usamos el motor de unificación.
        const transactions = await getTransactionHistory(userId, { limit: 50 });

        // Serialize BigInt to string to prevent JSON stringify crashes
        const safeTransactions = JSON.parse(JSON.stringify(transactions, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(safeTransactions);
    } catch (error: any) {
        console.warn('[TransactionsAPI] Unified sync failed, returning empty list.', error.message);
        return NextResponse.json([]); 
    }
}

