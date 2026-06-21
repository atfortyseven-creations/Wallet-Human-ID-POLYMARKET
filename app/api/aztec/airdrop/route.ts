// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { getPXEClient, getRelayerWallet, SPONSORED_FPC_ADDRESS } from '@/lib/aztec/client';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';

export const dynamic = 'force-dynamic';

/**
 * POST /api/aztec/airdrop
 * 
 * Mints 10 QDs to the caller's Aztec Address on the Alpha Testnet (V5).
 * Uses the Relayer Wallet to pay the gas fee via the Sponsored Fee Payment Contract (FPC).
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate (optional strict check, but usually good to ensure they logged in)
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { address } = body; // The derived Aztec Address

        if (!address) {
            return NextResponse.json({ error: 'Missing Aztec address' }, { status: 400 });
        }

        const tokenAddressStr = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
        if (!tokenAddressStr) {
            return NextResponse.json({ error: 'Aztec Token Contract not configured' }, { status: 503 });
        }

        console.log(`[Aztec Airdrop] Initiating 10 QDs airdrop to ${address}`);

        // 2. Setup Aztec Clients
        const pxe = await getPXEClient();
        const relayerWallet = await getRelayerWallet();

        const targetAddress = AztecAddress.fromString(address);
        const tokenAddress = AztecAddress.fromString(tokenAddressStr);

        // 3. Instantiate the Token Contract
        const tokenContract = await TokenContract.at(tokenAddress, relayerWallet);

        // 4. Amount = 10 QDs (10 * 10^18, but we pass BigInt)
        // Note: Noir contracts often use field elements or u120, BigInt handles it.
        const amount = 10n * (10n ** 18n);

        // 5. Submit mint_to_public transaction gaslessly via FPC
        // Depending on the Token contract, mint_to_public takes (to, amount).
        const tx = await tokenContract.methods.mint_to_public(targetAddress, amount).send({
            fee: {
                paymentMethod: new SponsoredFeePaymentMethod(
                    AztecAddress.fromString(SPONSORED_FPC_ADDRESS)
                )
            }
        });

        // 6. Wait for tx to be mined
        const receipt = await tx.wait();

        console.log(`[Aztec Airdrop] ✅ 10 QDs minted to ${address}. Hash: ${receipt.txHash}`);

        return NextResponse.json({
            success: true,
            txHash: receipt.txHash.toString(),
            message: '10 QDs successfully airdropped on Aztec Testnet!'
        });

    } catch (error: any) {
        console.error(`[Aztec Airdrop] Failed:`, error);
        
        // Handle common errors
        if (error.message?.includes('already claimed')) {
            return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
        }

        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

