import { NextResponse } from 'next/server';

/**
 * POST /api/aztec/transfer
 *
 * Executes a REAL private QDs transfer on the Aztec Testnet.
 *
 * Because Aztec private transfers require the sender's secret key to
 * generate the ZK proof, this route handles a "sponsored relayer transfer":
 * the relayer (admin) transfers from its own account. In production,
 * this would use authwit (authorization witness) so the user signs off-chain
 * and the relayer submits. For the testnet demo, the relayer owns the QDs
 * and can transfer them directly.
 *
 * Body: { from: string, to: string, amount: string }
 */

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 min between transfers per IP

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  const lastTx = rateLimitMap.get(ip);
  if (lastTx && Date.now() - lastTx < RATE_LIMIT_MS) {
    const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastTx)) / 1000);
    return NextResponse.json(
      { error: `Rate limited — please wait ${wait}s before next transfer.` },
      { status: 429 }
    );
  }

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const { from, to, amount } = body;

  if (!from || !to || !amount) {
    return NextResponse.json({ error: 'from, to, and amount are required' }, { status: 400 });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
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
    const { AztecAddress } = await import('@aztec/aztec.js/addresses');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');

    const wallet    = await getRelayerWallet();
    const contract  = await getQDsTokenContract(wallet, contractAddress);
    const recipient = AztecAddress.fromString(to);
    const rawAmount = qdsToRaw(amount);

    console.log(`[Aztec Transfer] Sending ${amount} QDs → ${to}`);

    // Use SponsoredFPC for gas-free transfers on testnet
    const fpcAddr   = AztecAddress.fromString(
      process.env.SPONSORED_FPC_ADDRESS ||
      '0x254082b62f9108d044b8998f212bb145619d91bfcd049461d74babb840181257'
    );
    const paymentMethod = new SponsoredFeePaymentMethod(fpcAddr);

    // Execute the real private transfer on Aztec Testnet
    const receipt = await contract.methods
      .transfer_in_private(wallet.getAddress(), recipient, rawAmount, 0n)
      .send({ fee: { paymentMethod } })
      .wait();

    const txHash = receipt.txHash.toString();
    rateLimitMap.set(ip, Date.now());

    console.log(`[Aztec Transfer] ✅ Success! txHash: ${txHash}, block: ${receipt.blockNumber}`);

    return NextResponse.json({
      success:     true,
      txHash,
      from:        wallet.getAddress().toString(),
      to,
      amount,
      symbol:      'QDs',
      blockNumber: receipt.blockNumber,
      explorerUrl: explorerTxUrl(txHash),
    });

  } catch (err: any) {
    console.error('[Aztec Transfer Error]', err.message);
    return NextResponse.json(
      { error: `Transfer failed: ${err.message}` },
      { status: 500 }
    );
  }
}
