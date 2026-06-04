import { NextResponse } from 'next/server';

/**
 * Private ARCADE - HIGH-SPEED TRANSACTION BROADCASTER
 * ----------------------------------------------------
 * Relays signed BSV transactions to high-performance miners/nodes.
 */
export async function POST(request: Request) {
    try {
        const { hex } = await request.json();

        if (!hex) {
            return NextResponse.json({ error: 'Missing transaction hex substrate.' }, { status: 400 });
        }

        console.log(` [Arcade] Broadcasting transaction (${hex.length} bytes)...`);

        // Relay to multiple high-fidelity broadcasters for maximum redundancy
        // (Simulating Arcade/Teranode P2P direct broadcast)
        const broadcasters = [
            'https://api.whatsonchain.com/v1/bsv/main/tx/raw',
            'https://api.taal.com/v1/broadcast' // Placeholder  requires API key
        ];

        const results = await Promise.allSettled(broadcasters.map(async (url) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txhex: hex })
            });
            return res.json();
        }));

        const success = results.find(r => r.status === 'fulfilled');

        if (success) {
            return NextResponse.json({ 
                success: true, 
                txid: (success as any).value?.txid || 'Pending Propagation',
                message: 'Transaction teleported to the BSV network.' 
            });
        }

        return NextResponse.json({ error: 'Network saturation or invalid substrate.' }, { status: 502 });

    } catch (error: any) {
        console.error('[Arcade] Broadcast Error:', error);
        return NextResponse.json({ error: 'Internal Broadcaster Failure' }, { status: 500 });
    }
}
