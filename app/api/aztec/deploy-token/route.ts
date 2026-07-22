import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — proof generation can be slow

/**
 * POST /api/aztec/deploy-token
 *
 * One-time admin endpoint to deploy the WhaleToken (QDs) contract
 * on Aztec Testnet v5 directly from the Railway Linux runtime.
 *
 * Security: Protected by DEPLOY_SECRET env var.
 * Usage:
 *   curl -X POST https://humanidfi.com/api/aztec/deploy-token \
 *     -H "Content-Type: application/json" \
 *     -d '{"secret":"YOUR_DEPLOY_SECRET"}'
 *
 * On success, returns the deployed contract address.
 * Then set AZTEC_TOKEN_CONTRACT_ADDRESS=<address> in Railway env vars.
 */
export async function POST(req: NextRequest) {
  try {
    // ── Secret Gate ─────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const deploySecret = process.env.DEPLOY_SECRET;

    if (!deploySecret) {
      return NextResponse.json(
        { error: 'DEPLOY_SECRET env var not set. Add it to Railway variables first.' },
        { status: 503 }
      );
    }

    if (!body.secret || body.secret !== deploySecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide the correct deploy secret.' },
        { status: 401 }
      );
    }

    // ── Already deployed? ───────────────────────────────────────────────────
    const existingAddress = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
    if (existingAddress && existingAddress !== 'PENDING_DEPLOY') {
      return NextResponse.json({
        status: 'already_deployed',
        tokenAddress: existingAddress,
        explorerUrl: `https://testnet.aztecscan.xyz/contract/${existingAddress}`,
        message: 'Token contract already deployed. Nothing to do.',
      });
    }

    const pxeUrl = process.env.AZTEC_PXE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
    const relayerSecretHex = process.env.AZTEC_RELAYER_SECRET_KEY;

    if (!relayerSecretHex) {
      return NextResponse.json(
        { error: 'AZTEC_RELAYER_SECRET_KEY env var not set. Add a 32-byte hex private key to Railway.' },
        { status: 503 }
      );
    }

    console.log('[Deploy] Starting WhaleToken deployment on Aztec Testnet v5...');
    console.log('[Deploy] PXE URL:', pxeUrl);

    // ── Dynamic imports — Aztec SDK (Linux native binaries only) ───────────
    const { EmbeddedWallet } = await import('@aztec/wallets/embedded');
    const { Fr } = await import('@aztec/foundation/curves/bn254');
    const { AztecAddress } = await import('@aztec/stdlib/aztec-address');
    const { TokenContract } = await import('@aztec/noir-contracts.js/Token');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const { getFpcAddress } = await import('@/lib/aztec/client');

    // ── Boot ephemeral wallet ────────────────────────────────────────────────
    console.log('[Deploy] Booting EmbeddedWallet...');
    const wallet = await EmbeddedWallet.create(pxeUrl, { ephemeral: true });

    const secretKey = Fr.fromHexString(relayerSecretHex.replace(/^0x/i, ''));
    const salt = new Fr(0n);
    const accountManager = await wallet.createSchnorrAccount(secretKey, salt);
    const adminAddress = accountManager.address;
    console.log('[Deploy] Admin address:', adminAddress.toString());

    // ── Fee payment (Sponsored FPC) ──────────────────────────────────────────
    const fpcAddress = AztecAddress.fromString(getFpcAddress());
    const feePaymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

    // ── Deploy TokenContract ─────────────────────────────────────────────────
    console.log('[Deploy] Deploying TokenContract (QDs / Quantum Dust)...');
    const deployResult = await TokenContract.deploy(
      wallet as any,
      adminAddress,
      'Quantum Dust',
      'QDs',
      18n
    )
      .send({ fee: { paymentMethod: feePaymentMethod } })
      .wait();

    const tokenAddress = deployResult.contract.address.toString();
    const txHash = deployResult.txHash?.toString() ?? 'unknown';

    console.log('[Deploy] ✅ WhaleToken deployed at:', tokenAddress);
    console.log('[Deploy] TX hash:', txHash);

    try { await (wallet as any).stop(); } catch {}

    return NextResponse.json({
      success: true,
      tokenAddress,
      txHash,
      adminAddress: adminAddress.toString(),
      explorerUrl: `https://testnet.aztecscan.xyz/tx-effects/${txHash}`,
      nextStep: `Set AZTEC_TOKEN_CONTRACT_ADDRESS=${tokenAddress} in Railway variables, then redeploy.`,
      network: 'aztec-testnet-v5',
    });

  } catch (err: any) {
    console.error('[Deploy] Failed:', err?.message);
    return NextResponse.json(
      {
        success: false,
        error: err?.message ?? 'Unknown error',
        hint: err?.message?.includes('NAPI')
          ? 'Running on Windows — this endpoint must be called on Railway (Linux). Deploy via Railway web shell instead.'
          : err?.message?.includes('fee')
          ? 'FPC out of Fee Juice. Fund the relayer address with Sepolia ETH first via Nethermind Faucet.'
          : 'Check Railway logs for details.',
      },
      { status: 500 }
    );
  }
}

// GET — status check
export async function GET() {
  const tokenAddress = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
  const hasRelayerKey = !!process.env.AZTEC_RELAYER_SECRET_KEY;
  const hasDeploySecret = !!process.env.DEPLOY_SECRET;

  return NextResponse.json({
    status: tokenAddress && tokenAddress !== 'PENDING_DEPLOY' ? 'deployed' : 'pending',
    tokenAddress: tokenAddress || 'NOT_SET',
    hasRelayerKey,
    hasDeploySecret,
    pxeUrl: process.env.AZTEC_PXE_URL || 'https://v5.testnet.rpc.aztec-labs.com',
    instructions: hasDeploySecret
      ? 'POST to this endpoint with {"secret":"YOUR_DEPLOY_SECRET"} to deploy'
      : 'Set DEPLOY_SECRET env var in Railway first',
  });
}
