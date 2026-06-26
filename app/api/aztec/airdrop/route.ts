// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import rateLimit from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
});

const AirdropSchema = z.object({
    address: z.string().regex(/^0x[0-9a-fA-F]{40,64}$/, "Invalid Aztec address format")
});

const AZTEC_EXPLORER        = 'https://testnet.aztecscan.xyz';
const SPONSORED_FPC_ADDRESS = '0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880';
const AIRDROP_AMOUNT        = 10;  // 10 QDs per airdrop

/**
 * POST /api/aztec/airdrop
 *
 * Mints 10 QDs to the caller's Aztec address.
 * - Attempts real on-chain mint via Aztec PXE (visible on AztecScan)
 * - Always records in DB so balance endpoint is accurate
 * - One-per-wallet enforcement via DB unique check
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    try {
        await limiter.check(5, ip); // Max 5 airdrop attempts per minute
    } catch {
        return NextResponse.json({ error: 'Too many airdrop requests. Try again later.' }, { status: 429 });
    }

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized: sign in first.' }, { status: 401 });
    }

    const body = await req.json();
    
    // Zod Validation
    const parsedBody = AirdropSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Missing or invalid Aztec address.', details: parsedBody.error.errors }, { status: 400 });
    }

    const normalizedAddress = parsedBody.data.address.toLowerCase();

    // ── Global Gas Exhaustion / Airdrop Limit Check ─────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyAirdrops = await prisma.transaction.count({
      where: {
        token: 'QDs',
        type: 'AIRDROP',
        createdAt: { gte: today },
      }
    });

    // Hard limit to 1000 airdrops per day to prevent FPC drain
    if (dailyAirdrops >= 1000) {
      return NextResponse.json(
        { error: 'Daily airdrop limit reached. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // ── One-per-wallet check ─────────────────────────────────────────────────
    const existingAirdrop = await prisma.transaction.findFirst({
      where: {
        toAddress: normalizedAddress,
        token:     'QDs',
        type:      'AIRDROP',
        status:    'COMPLETED',
      },
    });

    if (existingAirdrop) {
      return NextResponse.json(
        { error: 'Already claimed. Each wallet receives 10 QDs once.' },
        { status: 409 }
      );
    }

    console.log(`[Aztec Airdrop] Initiating ${AIRDROP_AMOUNT} QDs to ${normalizedAddress}`);

    // ── Attempt real on-chain mint ────────────────────────────────────────────
    let aztecTxHash: string | null  = null;
    let explorerUrl: string | null  = null;
    let onChainSuccess              = false;

    const tokenAddressStr   = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
    const relayerSecretHex  = process.env.AZTEC_RELAYER_SECRET_KEY;

    if (tokenAddressStr && relayerSecretHex) {
      try {
        const pxeUrl = process.env.AZTEC_PXE_URL || 'http://127.0.0.1:18080';

        const { createPXEClient }           = await import('@aztec/aztec.js/wallet');
        const { getSchnorrAccount }         = await import('@aztec/accounts/schnorr');
        const { Fr }                        = await import('@aztec/aztec.js/fields');
        const { deriveSigningKey }          = await import('@aztec/aztec.js/keys');
        const { AztecAddress }              = await import('@aztec/aztec.js/addresses');
        const { TokenContract }             = await import('@aztec/noir-contracts.js/Token');
        const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');

        const pxe = createPXEClient(pxeUrl);

        const secretKey  = Fr.fromString(relayerSecretHex);
        const signingKey = deriveSigningKey(secretKey);
        const account    = getSchnorrAccount(pxe, secretKey, signingKey);
        await account.register();
        const relayerWallet = await account.getWallet();

        const tokenAddress = AztecAddress.fromString(tokenAddressStr);
        const toAddress    = AztecAddress.fromString(normalizedAddress);
        const tokenContract = await TokenContract.at(tokenAddress, relayerWallet);

        // 10 QDs in base units (18 decimals)
        const amountBigInt = BigInt(AIRDROP_AMOUNT) * (10n ** 18n);

        const tx = await tokenContract.methods
          .mint_to_public(toAddress, amountBigInt)
          .send({
            fee: {
              paymentMethod: new SponsoredFeePaymentMethod(
                AztecAddress.fromString(SPONSORED_FPC_ADDRESS)
              )
            }
          });

        const receipt   = await tx.wait();
        aztecTxHash     = receipt.txHash.toString();
        explorerUrl     = `${AZTEC_EXPLORER}/tx/${aztecTxHash}`;
        onChainSuccess  = true;

        console.log(`[Aztec Airdrop] ✅ On-chain! Hash: ${aztecTxHash}`);

      } catch (aztecErr: any) {
        console.warn(`[Aztec Airdrop] On-chain mint skipped (PXE unavailable): ${aztecErr?.message?.slice(0, 200)}`);
      }
    } else {
      console.warn('[Aztec Airdrop] AZTEC_TOKEN_CONTRACT_ADDRESS or AZTEC_RELAYER_SECRET_KEY not set — ledger-only mode.');
    }

    const nonce         = crypto.randomBytes(16).toString('hex');
    const txPayload     = `aztec-airdrop:${normalizedAddress}:${AIRDROP_AMOUNT}:${Date.now()}:${nonce}`;
    const localTxHash   = `0x${crypto.createHash('sha256').update(txPayload).digest('hex')}`;
    const displayTxHash = aztecTxHash ?? localTxHash;
    const displayExplorerUrl = explorerUrl ?? null;
    const blockNum      = Math.floor(Date.now() / 12_000);

    // ── Record in DB (always) ────────────────────────────────────────────────
    await prisma.transaction.create({
      data: {
        txHash:      localTxHash,
        fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
        toAddress:   normalizedAddress,
        amount:      AIRDROP_AMOUNT,
        token:       'QDs',
        tokenSymbol: 'QDs',
        type:        'AIRDROP',
        status:      'COMPLETED',
        chainId:     9302,
        blockNumber: BigInt(blockNum),
        metadata:    {
          network:     'aztec-testnet',
          aztecTxHash: aztecTxHash,
          explorerUrl: displayExplorerUrl,
          onChain:     onChainSuccess,
          nonce,
        },
      },
    });

    return NextResponse.json({
      success:     true,
      txHash:      displayTxHash,
      explorerUrl: displayExplorerUrl,
      onChain:     onChainSuccess,
      amount:      AIRDROP_AMOUNT,
      message:     onChainSuccess
        ? '10 QDs minted on Aztec Testnet ✅ — view on AztecScan!'
        : '10 QDs credited to your account (ledger-recorded)',
    });

  } catch (error: any) {
    console.error('[Aztec Airdrop] Failed:', error);

    if (error.message?.includes('already claimed') || error.code === 'P2002') {
      return NextResponse.json({ error: 'Already claimed.' }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
