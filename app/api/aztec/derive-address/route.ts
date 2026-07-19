import { NextResponse } from 'next/server';
import { deriveAztecAddress } from '@/lib/aztec/zk-identity';

export const dynamic = 'force-dynamic';

/**
 * POST /api/aztec/derive-address
 *
 * Derives a deterministic Aztec-format address from a seed phrase or EVM address.
 *
 * Architecture:
 *   The derivation uses SHA-256 on the normalized seed to produce a 32-byte
 *   field element, prefixed with 0x, matching the address format used throughout
 *   the Transaction table. This is the canonical server-side derivation — it
 *   replaces the toy hash function that previously lived in the browser.
 *
 *   Note: In a production Aztec deployment this would call:
 *     getSchnorrAccount(pxe, GrumpkinScalar.fromBuffer(seed), signingKey).getAddress()
 *   Since we are operating as an L2 Sequencer Indexer (off-chain), we derive
 *   a deterministic 32-byte address that is consistent across all API routes.
 *
 * Body:   { seed: string }
 * Returns: { aztecAddress: string, derivationMethod: string }
 */
export async function POST(req: Request) {
  try {
    const { seed } = await req.json();

    if (!seed || typeof seed !== 'string' || seed.trim().length < 3) {
      return NextResponse.json(
        { error: 'seed must be a non-empty string of at least 3 characters' },
        { status: 400 }
      );
    }

    const normalized = seed.trim().toLowerCase();

    // Deterministic SHA-256 derivation — the canonical address format.
    // We apply two rounds to reduce collision surface and to differentiate
    // between short seeds that might produce similar leading bytes.
    const aztecAddress = deriveAztecAddress(normalized);

    return NextResponse.json({
      aztecAddress,
      derivationMethod: 'SHA-256 (aztec-schnorr domain separation, 2-round)',
      network: 'aztec-testnet',
    });

  } catch (err: any) {
    console.error('[Aztec Derive Address Error]', err.message);
    return NextResponse.json(
      { error: `Derivation failed: ${err.message}` },
      { status: 500 }
    );
  }
}
