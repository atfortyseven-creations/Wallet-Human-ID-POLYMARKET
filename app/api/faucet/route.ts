import { NextResponse } from 'next/server';

/**
 * POST /api/faucet
 *
 * Real QDs Testnet Faucet.
 * Mints 100 QDs to the given Aztec address using the relayer wallet.
 * Uses SponsoredFPC for gas-free minting on the Aztec Testnet.
 *
 * Rate limited: 1 claim per address per 24h.
 */

const rateLimitByAddress = new Map<string, number>();
const rateLimitByIp      = new Map<string, number>();
const RATE_LIMIT_MS      = 1000 * 60 * 60 * 24; // 24 hours

const FAUCET_AMOUNT      = '100';   // 100 QDs
export const dynamic     = 'force-dynamic';

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { address } = body;
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'Aztec address required' }, { status: 400 });
  }

  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const now = Date.now();

  // Rate limit by address
  const lastByAddr = rateLimitByAddress.get(address);
  if (lastByAddr && now - lastByAddr < RATE_LIMIT_MS) {
    const hoursLeft = Math.ceil((RATE_LIMIT_MS - (now - lastByAddr)) / 3_600_000);
    return NextResponse.json(
      { error: `Address already claimed today. Try again in ${hoursLeft}h.` },
      { status: 429 }
    );
  }

  // Rate limit by IP
  const lastByIp = rateLimitByIp.get(ip);
  if (lastByIp && now - lastByIp < RATE_LIMIT_MS) {
    const hoursLeft = Math.ceil((RATE_LIMIT_MS - (now - lastByIp)) / 3_600_000);
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${hoursLeft}h.` },
      { status: 429 }
    );
  }

  const contractAddress = process.env.AZTEC_QDS_CONTRACT_ADDRESS;
  if (!contractAddress) {
    return NextResponse.json(
      { error: 'QDs contract not deployed. Set AZTEC_QDS_CONTRACT_ADDRESS in your environment.' },
      { status: 503 }
    );
  }

  try {
    const { getRelayerWallet, explorerTxUrl } = await import('@/lib/aztec/client');
    const { getQDsTokenContract, qdsToRaw }   = await import('@/lib/aztec/token-contract');
    const { AztecAddress, SponsoredFeePaymentMethod } = await import('@aztec/aztec.js');

    const wallet    = await getRelayerWallet();
    const contract  = await getQDsTokenContract(wallet, contractAddress);
    const recipient = AztecAddress.fromString(address);
    const rawAmount = qdsToRaw(FAUCET_AMOUNT);

    console.log(`[Faucet] Minting ${FAUCET_AMOUNT} QDs → ${address}`);

    const fpcAddr = AztecAddress.fromString(
      process.env.SPONSORED_FPC_ADDRESS ||
      '0x254082b62f9108d044b8998f212bb145619d91bfcd049461d74babb840181257'
    );
    const paymentMethod = new SponsoredFeePaymentMethod(fpcAddr);

    // Mint QDs to the recipient using the admin/relayer wallet
    const receipt = await contract.methods
      .mint_to_public(recipient, rawAmount)
      .send({ fee: { paymentMethod } })
      .wait();

    const txHash = receipt.txHash.toString();
    rateLimitByAddress.set(address, now);
    rateLimitByIp.set(ip, now);

    console.log(`[Faucet] ✅ Minted! txHash: ${txHash}, block: ${receipt.blockNumber}`);

    return NextResponse.json({
      success:     true,
      amount:      FAUCET_AMOUNT,
      symbol:      'QDs',
      txHash,
      blockNumber: receipt.blockNumber,
      explorerUrl: explorerTxUrl(txHash),
    });

  } catch (err: any) {
    console.error('[Faucet Error]', err.message);
    return NextResponse.json(
      { error: `Faucet failed: ${err.message}` },
      { status: 500 }
    );
  }
}
