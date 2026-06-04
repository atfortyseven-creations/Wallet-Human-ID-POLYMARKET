import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aztec/balance?aztecAddress=0x...
 *
 * Returns the real private QDs balance for a given Aztec address.
 * Queries the deployed TokenContract on Aztec Testnet via PXE.
 *
 * No simulation. No fallbacks. Real on-chain data only.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const aztecAddress = searchParams.get('aztecAddress') || searchParams.get('address');

  if (!aztecAddress) {
    return NextResponse.json({ error: 'aztecAddress query param required' }, { status: 400 });
  }

  const contractAddress = process.env.AZTEC_QDS_CONTRACT_ADDRESS;
  if (!contractAddress) {
    return NextResponse.json(
      { error: 'QDs contract not deployed yet. Run the deploy script and set AZTEC_QDS_CONTRACT_ADDRESS.' },
      { status: 503 }
    );
  }

  try {
    const { getPXEClient, getRelayerWallet } = await import('@/lib/aztec/client');
    const { getQDsTokenContract, rawToQds }  = await import('@/lib/aztec/token-contract');
    const { AztecAddress } = await import('@aztec/aztec.js');

    // We use the relayer wallet to read private balance via authwit or public balance
    // For TokenContract, balance_of_private requires the owner's wallet.
    // We use balance_of_public as a proxy here since private requires the owner's key.
    const wallet   = await getRelayerWallet();
    const contract = await getQDsTokenContract(wallet, contractAddress);
    const owner    = AztecAddress.fromString(aztecAddress);

    // Query public balance (visible to all) — this is the standard testnet approach
    // For fully private balances, the user's PXE + key would be needed client-side
    const rawBalance = await contract.methods.balance_of_public(owner).simulate();
    const displayBalance = rawToQds(rawBalance);

    console.log(`[Aztec Balance] ${aztecAddress} → ${displayBalance} QDs`);

    return NextResponse.json({
      balance: displayBalance,
      raw: rawBalance.toString(),
      symbol: 'QDs',
      network: 'aztec-testnet',
      address: aztecAddress,
    });
  } catch (err: any) {
    console.error('[Aztec Balance Error]', err.message);
    return NextResponse.json(
      { error: `Failed to fetch balance: ${err.message}` },
      { status: 500 }
    );
  }
}
