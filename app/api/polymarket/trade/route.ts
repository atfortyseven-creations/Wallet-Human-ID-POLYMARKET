import { NextRequest, NextResponse } from 'next/server';
import { polymarketRouterService } from '@/lib/blockchain/PolymarketRouterService';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { marketId, direction, amount, userAddress } = body;

        if (!marketId || !direction || !amount || !userAddress) {
            return NextResponse.json({ error: 'Faltan parámetros de ejecución (Trade Payload)' }, { status: 400 });
        }

        if (direction !== 'YES' && direction !== 'NO') {
            return NextResponse.json({ error: 'Dirección inválida, debe ser YES o NO' }, { status: 400 });
        }

        const txPayload = await polymarketRouterService.buildTradeTransaction(
            marketId,
            direction,
            amount
        );

        return NextResponse.json({
            tx: txPayload.tx
        });

    } catch (error: any) {
        console.error('[POLY_API_TRADE]', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
