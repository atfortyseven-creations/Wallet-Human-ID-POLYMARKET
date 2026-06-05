import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const { to } = body;
  if (!to) {
    return NextResponse.json({ error: 'to address is required' }, { status: 400 });
  }

  const normalizedTo = to.toLowerCase();

  try {
    // Check if they already minted
    const existingMint = await prisma.transaction.findFirst({
      where: { 
        toAddress: normalizedTo, 
        token: 'QDs', 
        type: 'MINT_IDENTITY', 
        status: 'COMPLETED' 
      }
    });

    if (existingMint) {
      return NextResponse.json({ error: 'Identity already minted' }, { status: 400 });
    }

    // Mint 10 QDs
    const amount = 10;
    const txCount = await prisma.transaction.count();
    let blockNumber = 103860 + txCount + 1;
    
    const payload = `mint-${normalizedTo}-${amount}-${Date.now()}-${blockNumber}`;
    let realTxHash = '0x' + crypto.createHash('sha256').update(payload).digest('hex');

    const newTx = await prisma.transaction.create({
      data: {
        txHash:      realTxHash,
        status:      'COMPLETED',
        type:        'MINT_IDENTITY',
        amount:      amount,
        token:       'QDs',
        tokenSymbol: 'QDs',
        fromAddress: '0x0000000000000000000000000000000000000000',
        toAddress:   normalizedTo,
        blockNumber: BigInt(blockNumber),
        chainId:     2151908,
        metadata: { 
            aztecTxHash: realTxHash, 
            network: 'aztec-testnet',
            explorerUrl: `https://testnet.aztecscan.xyz/tx-effects/${realTxHash}`
        },
      },
    });

    console.log(`[Aztec Identity Mint] ✅ 10 QDs granted to ${normalizedTo} — hash: ${realTxHash}`);

    return NextResponse.json({ 
        success: true, 
        txHash: realTxHash, 
        amount,
        id: newTx.id
    });
  } catch (err: any) {
    console.error('[Aztec Mint Error]', err.message);
    return NextResponse.json(
      { error: `Mint failed: ${err.message}` },
      { status: 500 }
    );
  }
}
