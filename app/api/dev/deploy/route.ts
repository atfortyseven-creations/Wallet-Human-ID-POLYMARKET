import { NextResponse } from 'next/server';
// Removed static @aztec imports to prevent Webpack bundling errors.

export const dynamic = 'force-dynamic';

export async function GET() {
  const nodeUrl  = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
  const pxeUrl   = process.env.AZTEC_PXE_URL  || nodeUrl;
  const relayerSecretHex = process.env.AZTEC_RELAYER_SECRET_KEY;

  let nodeInfo: any = null;
  try {
    const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
    const node = createAztecNodeClient(nodeUrl);
    const [blockNumber, info] = await Promise.all([
      node.getBlockNumber(),
      node.getNodeInfo(),
    ]);
    nodeInfo = { blockNumber, ...info };
  } catch (e: any) {
    return NextResponse.json({ success: false, error: `Aztec Testnet unreachable: ${e.message}` }, { status: 503 });
  }

  if (!relayerSecretHex) {
    return NextResponse.json({ success: false, error: 'AZTEC_RELAYER_SECRET_KEY not set.', nodeInfo }, { status: 400 });
  }

  const existingAddress = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
  if (existingAddress && existingAddress !== 'PENDING_DEPLOY') {
    return NextResponse.json({ success: true, message: 'Already deployed.', tokenAddress: existingAddress, nodeInfo });
  }

  try {
    const { createSafeJsonRpcClient } = await import('@aztec/foundation/json-rpc/client');
    const { PXE } = await import('@aztec/pxe/client/lazy');
    const { Fr } = await import('@aztec/aztec.js/fields');
    const { deriveSigningKey } = await import('@aztec/stdlib/keys');
    const { SchnorrAccountContract } = await import('@aztec/accounts/schnorr');
    const { AccountManager } = await import('@aztec/aztec.js/wallet');
    const pxe = createSafeJsonRpcClient(pxeUrl, PXE);
    const secretKey  = Fr.fromHexString(relayerSecretHex.replace('0x', ''));
    const signingKey = deriveSigningKey(secretKey);
    const contract   = new SchnorrAccountContract(signingKey);

    const manager = await AccountManager.create(pxe, secretKey, contract);
    const wallet  = await manager.getWallet();
    const adminAddress = wallet.getAddress();

    const { AztecAddress } = await import('@aztec/stdlib/aztec-address');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';
    const fpcAddress = AztecAddress.fromString(SPONSORED_FPC);
    const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

    const { TokenContract } = await import('@aztec/noir-contracts.js/Token');
    const deployTx  = await TokenContract.deploy(wallet, adminAddress, 'Quantum Dollars', 'QDs', 18)
      .send({
        fee: { paymentMethod }
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
