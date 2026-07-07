// @ts-nocheck
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dev/deploy
 *
 * Deploys the QDs (Quantum Dollars) TokenContract to the Aztec Testnet.
 * This is a ONE-TIME admin operation. After running:
 *   1. Copy the `tokenAddress` from the response
 *   2. Set AZTEC_TOKEN_CONTRACT_ADDRESS=<tokenAddress> in Railway env vars
 *   3. Redeploy — transfers will then use Mode A (full on-chain private token transfers)
 *
 * Prerequisites:
 *   - AZTEC_RELAYER_SECRET_KEY: 32-byte hex string (Fr scalar) for the relayer wallet
 *   - AZTEC_PXE_URL: URL to a running PXE sidecar (or external PXE)
 *   - The PXE must be connected to the Aztec Testnet node
 *
 * Architecture (SDK v4.3.1):
 *   - The PXE is accessed via createSafeJsonRpcClient
 *   - Account is created via AccountManager.create + SchnorrAccountContract
 *   - Token is deployed via TokenContract.deploy(wallet, adminAddress, name, symbol, decimals)
 */
export async function GET() {
  const nodeUrl  = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
  const pxeUrl   = process.env.AZTEC_PXE_URL  || nodeUrl;
  const relayerSecretHex = process.env.AZTEC_RELAYER_SECRET_KEY;

  // ── Step 0: Verify node is alive ────────────────────────────────────────────
  let nodeInfo: any = null;
  try {
    const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
    const node = createAztecNodeClient(nodeUrl);
    const [blockNumber, info] = await Promise.all([
      node.getBlockNumber(),
      node.getNodeInfo(),
    ]);
    nodeInfo = { blockNumber, ...info };
    console.log(`[Deploy] ✅ Testnet alive — Block #${blockNumber}`);
  } catch (e: any) {
    console.error('[Deploy] Node unreachable:', e.message);
    return NextResponse.json(
      { success: false, error: `Aztec Testnet unreachable: ${e.message}` },
      { status: 503 }
    );
  }

  // ── Step 1: Require AZTEC_RELAYER_SECRET_KEY ─────────────────────────────
  if (!relayerSecretHex) {
    return NextResponse.json({
      success: false,
      error: 'AZTEC_RELAYER_SECRET_KEY not set. Set this in Railway env vars before deploying.',
      nodeInfo,
    }, { status: 400 });
  }

  // ── Step 2: Check for existing deployment ────────────────────────────────
  const existingAddress = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
  if (existingAddress && existingAddress !== 'PENDING_DEPLOY') {
    return NextResponse.json({
      success: true,
      message: 'Token already deployed.',
      tokenAddress: existingAddress,
      nodeInfo,
    });
  }

  // ── Step 3: Deploy TokenContract via PXE ─────────────────────────────────
  try {
    console.log('[Deploy] Loading Aztec SDK modules...');

    const { createSafeJsonRpcClient } = await import('@aztec/foundation/json-rpc/client');
    const { PXE }                     = await import('@aztec/pxe/client/lazy');
    const { AccountManager }          = await import('@aztec/aztec.js/wallet');
    const { SchnorrAccountContract }  = await import('@aztec/accounts/schnorr');
    const { Fr }                      = await import('@aztec/aztec.js/fields');
    const { deriveSigningKey }        = await import('@aztec/aztec.js/keys');
    const { TokenContract }           = await import('@aztec/noir-contracts.js/Token');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const { AztecAddress }            = await import('@aztec/aztec.js/addresses');

    const pxe = createSafeJsonRpcClient(pxeUrl, PXE);

    const secretKey  = Fr.fromString(relayerSecretHex);
    const signingKey = deriveSigningKey(secretKey);
    const contract   = new SchnorrAccountContract(signingKey);

    console.log('[Deploy] Creating relayer account...');
    const manager = await AccountManager.create(pxe, secretKey, contract);
    const wallet  = await manager.getWallet();
    const adminAddress = wallet.getAddress();

    console.log(`[Deploy] Relayer address: ${adminAddress.toString()}`);

    const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

    console.log('[Deploy] Deploying QDs TokenContract...');
    const deployTx  = await TokenContract.deploy(wallet, adminAddress, 'Quantum Dollars', 'QDs', 18)
      .send({
        fee: { paymentMethod: new SponsoredFeePaymentMethod(AztecAddress.fromString(SPONSORED_FPC)) }
      });

    const receipt = await deployTx.wait();
    const tokenAddress = receipt.contract.address.toString();

    console.log(`[Deploy] ✅ TokenContract deployed at: ${tokenAddress}`);
    console.log(`[Deploy] 📋 ACTION REQUIRED: Set AZTEC_TOKEN_CONTRACT_ADDRESS=${tokenAddress} in Railway`);

    return NextResponse.json({
      success: true,
      message: '✅ QDs Token deployed! Set AZTEC_TOKEN_CONTRACT_ADDRESS in Railway env vars and redeploy.',
      tokenAddress,
      relayerAddress: adminAddress.toString(),
      deployTxHash: receipt.txHash?.toString(),
      nodeInfo,
      actionRequired: `Set AZTEC_TOKEN_CONTRACT_ADDRESS=${tokenAddress} in Railway environment variables, then redeploy.`,
    });

  } catch (error: any) {
    console.error('[Deploy] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: `Deployment failed: ${error.message}`,
        hint: 'Ensure AZTEC_PXE_URL points to a running PXE sidecar. The PXE must be connected to the Aztec testnet node.',
        pxeUrl,
        nodeInfo,
      },
      { status: 500 }
    );
  }
}
