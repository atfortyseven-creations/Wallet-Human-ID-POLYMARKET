import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aztec/account?evmAddress=0x...
 *
 * Creates (or retrieves) a deterministic Aztec Schnorr account for a given
 * EVM address. The account is registered in the server PXE on first call.
 *
 * Returns:
 *   { aztecAddress, registered }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('evmAddress');

  if (!evmAddress || !/^0x[0-9a-fA-F]{40}$/.test(evmAddress)) {
    return NextResponse.json({ error: 'Valid evmAddress query param required' }, { status: 400 });
  }

  try {
    const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
    const { Fr, deriveSigningKey } = await import('@aztec/aztec.js');
    const { getPXEClient, deriveSecretKeyFromEvm } = await import('@/lib/aztec/client');

    const pxe       = await getPXEClient();
    const secretHex = deriveSecretKeyFromEvm(evmAddress);
    const secretKey = Fr.fromString(secretHex);
    const signingKey = deriveSigningKey(secretKey);
    const account    = getSchnorrAccount(pxe, secretKey, signingKey);

    // Register the account so the PXE can track its notes
    await account.register();
    const wallet      = await account.getWallet();
    const aztecAddress = wallet.getAddress().toString();

    console.log(`[Aztec Account] EVM ${evmAddress} → Aztec ${aztecAddress}`);

    return NextResponse.json({
      aztecAddress,
      evmAddress,
      network: 'aztec-testnet',
      registered: true,
    });
  } catch (err: any) {
    console.error('[Aztec Account Error]', err.message);
    return NextResponse.json(
      { error: `Failed to create Aztec account: ${err.message}` },
      { status: 500 }
    );
  }
}
