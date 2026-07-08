#!/usr/bin/env node
/**
 * scripts/aztec-airdrop.mjs
 *
 * Standalone ESM script that mints QDs to a recipient address on Aztec Testnet.
 * Run via child_process.spawn from Next.js to avoid Webpack ESM bugs.
 *
 * Env vars required:
 *   AZTEC_PXE_URL              - PXE sidecar URL (e.g. http://127.0.0.1:18080)
 *   AZTEC_TOKEN_CONTRACT_ADDRESS - Deployed QDs token contract address
 *   AZTEC_RELAYER_SECRET_KEY   - 32-byte hex Fr scalar for the relayer account
 *   AIRDROP_TO                 - Recipient Aztec address
 *   AIRDROP_AMOUNT             - Amount to mint (e.g. "10")
 *
 * Output: JSON on stdout with { success, txHash, blockNumber, nodeInfo }
 *         or { success: false, error }
 */

import { createSafeJsonRpcClient, makeFetch } from '@aztec/foundation/json-rpc/client';
import { AztecNodeApiSchema } from '@aztec/stdlib/interfaces/client';

const pxeUrl       = process.env.AZTEC_PXE_URL            || 'http://127.0.0.1:18080';
const nodeUrl      = process.env.AZTEC_NODE_URL            || 'https://v5.testnet.rpc.aztec-labs.com';
const tokenAddrStr = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
const relayerSk    = process.env.AZTEC_RELAYER_SECRET_KEY;
const airdropTo    = process.env.AIRDROP_TO;
const amountStr    = process.env.AIRDROP_AMOUNT || '10';
const sponsoredFpc = process.env.SPONSORED_FPC_ADDRESS || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

async function main() {
  if (!tokenAddrStr || !relayerSk || !airdropTo) {
    console.log(JSON.stringify({
      success: false,
      error: 'Missing required env vars: AZTEC_TOKEN_CONTRACT_ADDRESS, AZTEC_RELAYER_SECRET_KEY, AIRDROP_TO'
    }));
    process.exit(1);
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    console.log(JSON.stringify({ success: false, error: 'Invalid AIRDROP_AMOUNT' }));
    process.exit(1);
  }

  try {
    // Test node connectivity
    const node = createSafeJsonRpcClient(nodeUrl, AztecNodeApiSchema, {
      namespaceMethods: 'node',
      fetch: makeFetch([1, 2, 3], false),
      batchWindowMS: 0
    });

    const blockNumber = await node.getBlockNumber();
    const nodeInfo    = await node.getNodeInfo();

    // Import modules outside Webpack context
    const { Fr }                        = await import('@aztec/foundation/fields');
    const { deriveSigningKey }          = await import('@aztec/stdlib/keys');
    const { SchnorrAccountContract }    = await import('@aztec/accounts/schnorr');
    const { AccountManager }            = await import('@aztec/aztec.js/wallet');
    const { TokenContract }             = await import('@aztec/noir-contracts.js/Token');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const { AztecAddress }              = await import('@aztec/stdlib/aztec-address');
    const { PXE }                       = await import('@aztec/pxe/client/lazy');

    const pxeClient = createSafeJsonRpcClient(pxeUrl, PXE, {
      fetch: makeFetch([1, 2, 3], false),
      batchWindowMS: 0
    });

    // Build relayer wallet (server-side, controls minting)
    const secretKey  = Fr.fromHexString(relayerSk.replace('0x', ''));
    const signingKey = deriveSigningKey(secretKey);
    const contract   = new SchnorrAccountContract(signingKey);

    const manager = await AccountManager.create(pxeClient, secretKey, contract);
    const wallet  = await manager.getAccount();

    const tokenAddress  = AztecAddress.fromString(tokenAddrStr);
    const recipientAddr = AztecAddress.fromString(airdropTo);
    const tokenContract = await TokenContract.at(tokenAddress, wallet);

    const amountBigInt = BigInt(Math.floor(amount)) * (10n ** 18n);
    const fpcAddr      = AztecAddress.fromString(sponsoredFpc);

    const tx = await tokenContract.methods
      .mint_to_public(recipientAddr, amountBigInt)
      .send({
        fee: { paymentMethod: new SponsoredFeePaymentMethod(fpcAddr) }
      });

    const receipt = await tx.wait();
    const txHash  = receipt.txHash.toString();

    console.log(JSON.stringify({
      success:     true,
      txHash,
      blockNumber: Number(receipt.blockNumber ?? blockNumber),
      nodeInfo: {
        nodeVersion:   nodeInfo.nodeVersion,
        l1ChainId:     nodeInfo.l1ChainId,
        rollupVersion: nodeInfo.rollupVersion,
      },
    }));
    process.exit(0);

  } catch (err) {
    console.log(JSON.stringify({
      success: false,
      error:   err?.message || String(err),
      stack:   err?.stack?.split('\n').slice(0, 5).join(' | '),
    }));
    process.exit(1);
  }
}

main();
