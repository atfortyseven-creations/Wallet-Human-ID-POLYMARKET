// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aztec/account?address=0x...
 *
 * Derives or retrieves the Aztec address for a given EVM address.
 * Architecture (SDK v4.3.1):
 *  - Uses createAztecNodeClient to verify testnet liveness
 *  - Computes the deterministic Schnorr account address from the EVM address
 *  - No PXE required for address derivation (pure cryptographic computation)
 *  - Account deployment to L2 happens client-side when the user first transacts
 *
 * Query params:
 *   address — EVM wallet address (0x...)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('address');

  if (!evmAddress || !/^0x[0-9a-fA-F]{40}$/.test(evmAddress)) {
    return NextResponse.json({ error: 'Missing or invalid EVM address.' }, { status: 400 });
  }

  try {
    const nodeUrl = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';

    // ── Derive deterministic Aztec address ──────────────────────────────────
    // In v4.3.1, SchnorrAccountContract computes address from (secretKey, signingKey, salt)
    // The secretKey is derived deterministically from the EVM address.
    const { deriveSecretKeyFromEvm } = await import('@/lib/aztec/client');
    const { Fr }                     = await import('@aztec/aztec.js/fields');
    const { deriveSigningKey }       = await import('@aztec/aztec.js/keys');
    const { SchnorrAccountContract, getSchnorrAccountContractAddress } = await import('@aztec/accounts/schnorr');

    const secretKeyHex = deriveSecretKeyFromEvm(evmAddress.toLowerCase());
    const secretKey    = Fr.fromString(secretKeyHex);
    const signingKey   = deriveSigningKey(secretKey);

    // Compute the canonical Aztec address for this user's Schnorr account
    const aztecAddress = await getSchnorrAccountContractAddress(secretKey, undefined, signingKey);
    const aztecAddressStr = aztecAddress.toString();

    // ── Probe testnet liveness ────────────────────────────────────────────────
    let testnetData: any = null;
    try {
      const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
      const node = createAztecNodeClient(nodeUrl);
      const rpcStart = Date.now();
      const [blockNumber, info] = await Promise.all([
        node.getBlockNumber(),
        node.getNodeInfo(),
      ]);
      testnetData = {
        blockNumber,
        nodeVersion: info.nodeVersion,
        l1ChainId: info.l1ChainId,
        rollupVersion: info.rollupVersion,
        rollupAddress: info.l1ContractAddresses?.rollupAddress?.toString(),
        latencyMs: Date.now() - rpcStart,
      };
    } catch (e: any) {
      console.warn('[Aztec Account] Node probe failed:', e.message);
      testnetData = { fallback: true, error: 'RPC_UNAVAILABLE' };
    }

    console.log(`[Aztec Account] EVM ${evmAddress} → Aztec ${aztecAddressStr} (Block: ${testnetData?.blockNumber})`);

    return NextResponse.json({
      aztecAddress:   aztecAddressStr,
      evmAddress:     evmAddress.toLowerCase(),
      network:        'aztec-testnet',
      registered:     true, // Address is always computable; deployment happens on first tx
      method:         'schnorr-deterministic-v4',
      sdkVersion:     '4.3.1',
      testnetData,
    });

  } catch (err: any) {
    console.error('[Aztec Account] Error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Failed to derive Aztec address.' },
      { status: 500 }
    );
  }
}
