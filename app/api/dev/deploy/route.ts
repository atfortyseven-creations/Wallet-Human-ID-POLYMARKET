// @ts-nocheck
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
    const { EmbeddedWallet } = await import('@aztec/wallets/embedded');
    const { Fr } = await import('@aztec/foundation/curves/bn254');
    const { AztecAddress } = await import('@aztec/stdlib/aztec-address');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const { getFpcAddress } = await import('@/lib/aztec/client');
    const { TokenContract } = await import('@aztec/noir-contracts.js/Token');

    const wallet = await EmbeddedWallet.create(pxeUrl, { ephemeral: true });
    
    try {
      const secretKey = Fr.fromHexString(relayerSecretHex.replace(/^0x/i, ''));
      const salt = new Fr(0n);
      
      const accountManager = await wallet.createSchnorrAccount(secretKey, salt);
      const adminAddress = accountManager.address;

      const fpcAddress = AztecAddress.fromString(getFpcAddress());
      const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

      const deployResult = await TokenContract.deploy(wallet, adminAddress, 'Quantum Dollars', 'QDs', 18n)
        .send({ 
          from: adminAddress, 
          fee: { paymentMethod } 
        });

      const tokenAddress = deployResult.contract.address.toString();
      const txHash = deployResult.receipt.txHash.toString();

    console.log(`[Deploy] ✅ TokenContract deployed at: ${tokenAddress}`);
    console.log(`[Deploy] 📋 ACTION REQUIRED: Set AZTEC_TOKEN_CONTRACT_ADDRESS=${tokenAddress} in Railway`);

    return NextResponse.json({
      success: true,
      message: '✅ QDs Token deployed! Set AZTEC_TOKEN_CONTRACT_ADDRESS in Railway env vars and redeploy.',
      tokenAddress,
      relayerAddress: adminAddress.toString(),
      deployTxHash: txHash,
      nodeInfo,
      actionRequired: `Set AZTEC_TOKEN_CONTRACT_ADDRESS=${tokenAddress} in Railway environment variables, then redeploy.`,
    });
    } finally {
      await wallet.stop();
    }

  } catch (error: any) {
    console.error('[Deploy] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: `Deployment failed: ${error.message}`,
        hint: 'Ensure EmbeddedWallet dependencies and native binaries are available.',
        pxeUrl,
        nodeInfo,
      },
      { status: 500 }
    );
  }
}
