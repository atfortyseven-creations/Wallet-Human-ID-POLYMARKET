import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();

    // Check if the user already has ANY transactions. If so, they already got the airdrop.
    const existingTx = await prisma.transaction.findFirst({
      where: { 
        toAddress: normalizedAddress, 
        token: 'QDs',
        type: 'AIRDROP'
      }
    });

    if (existingTx) {
      return NextResponse.json({ message: 'Already received airdrop' }, { status: 200 });
    }

    // Give 10 QDs as initial airdrop
    const parsedAmount = 10;
    
    const txCount = await prisma.transaction.count();
    let blockNumber = 103860 + txCount + 1;
    
    const payload = `SYSTEM-${normalizedAddress}-${parsedAmount}-${Date.now()}-${blockNumber}`;
    let realTxHash = '0x' + crypto.createHash('sha256').update(payload).digest('hex');

    const newTx = await prisma.transaction.create({
      data: {
        txHash:      realTxHash,
        status:      'COMPLETED',
        type:        'AIRDROP', 
        amount:      parsedAmount,
        token:       'QDs',
        tokenSymbol: 'QDs',
        fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000', // System address
        toAddress:   normalizedAddress,
        blockNumber: BigInt(blockNumber),
        chainId:     2151908,
        metadata: {
          aztecTxHash: realTxHash,
          explorerUrl: `https://testnet.aztecscan.xyz/tx-effects/${realTxHash}`,
          network:     'aztec-testnet',
          note:        'Initial Identity Genesis Airdrop'
        },
      },
    });

    console.log(`[Aztec Airdrop] ✅ 10 QDs airdropped to ${normalizedAddress}`);

    return NextResponse.json({ success: true, txHash: realTxHash });

  } catch (err: any) {
    console.error('[Aztec Airdrop Error]', err.message);
    return NextResponse.json(
      { error: `Airdrop failed: ${err.message}` },
      { status: 500 }
    );
  }
}
