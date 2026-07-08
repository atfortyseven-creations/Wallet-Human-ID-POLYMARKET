#!/usr/bin/env node
/**
 * scripts/aztec-deploy.mjs
 *
 * Standalone ESM script that deploys the QDs TokenContract on Aztec Testnet.
 * Run via child_process.spawn from the Next.js API route to avoid Webpack
 * minification bugs ("j is not a function").
 *
 * Usage: node scripts/aztec-deploy.mjs
 * Env vars required:
 *   AZTEC_PXE_URL              - PXE sidecar URL (e.g. http://127.0.0.1:18080)
 *   AZTEC_RELAYER_SECRET_KEY   - hex Fr scalar (64 hex chars, no 0x)
 *   SPONSORED_FPC_ADDRESS      - (optional) FPC contract address
 *
 * Output: JSON on stdout with { success, tokenAddress, txHash, relayerAddress }
 *         or { success: false, error }
 */

import { createAztecNodeClient } from '@aztec/stdlib/interfaces/client';
import { createSafeJsonRpcClient, makeFetch } from '@aztec/foundation/json-rpc/client';

const pxeUrl          = process.env.AZTEC_PXE_URL            || 'http://127.0.0.1:18080';
const nodeUrl         = process.env.AZTEC_NODE_URL            || 'https://v5.testnet.rpc.aztec-labs.com';
const relayerSecret   = process.env.AZTEC_RELAYER_SECRET_KEY;
const sponsoredFpc    = process.env.SPONSORED_FPC_ADDRESS     || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

async function main() {
  if (!relayerSecret) {
    console.log(JSON.stringify({ success: false, error: 'AZTEC_RELAYER_SECRET_KEY not set' }));
    process.exit(1);
  }

  try {
    const { AztecNodeApiSchema } = await import('@aztec/stdlib/interfaces/client');
    const node = createSafeJsonRpcClient(nodeUrl, AztecNodeApiSchema, {
      namespaceMethods: 'node',
      fetch: makeFetch([1, 2, 3], false),
      batchWindowMS: 0
    });

    // Test node connectivity
    const blockNumber = await node.getBlockNumber();
    const nodeInfo    = await node.getNodeInfo();

    // Dynamic import of PXE-using modules (outside Webpack context)
    const { Fr }                      = await import('@aztec/foundation/fields');
    const { deriveSigningKey }        = await import('@aztec/stdlib/keys');
    const { SchnorrAccountContract }  = await import('@aztec/accounts/schnorr');
    const { AccountManager }          = await import('@aztec/aztec.js/wallet');
    const { TokenContract }           = await import('@aztec/noir-contracts.js/Token');
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const { AztecAddress }            = await import('@aztec/stdlib/aztec-address');

    // Build PXE JSON-RPC client using the PXE schema
    const { PXEApiSchema } = await import('@aztec/stdlib/interfaces/pxe').catch(() => null) || {};

    let pxeClient;
    if (PXEApiSchema) {
      pxeClient = createSafeJsonRpcClient(pxeUrl, PXEApiSchema, {
        namespaceMethods: 'pxe',
        fetch: makeFetch([1, 2, 3], false),
        batchWindowMS: 0
      });
    } else {
      // Fall back to lazy PXE schema from @aztec/pxe
      const { PXE } = await import('@aztec/pxe/client/lazy');
      pxeClient = createSafeJsonRpcClient(pxeUrl, PXE, {
        fetch: makeFetch([1, 2, 3], false),
        batchWindowMS: 0
      });
    }

    const secretKey  = Fr.fromHexString(relayerSecret.replace('0x', ''));
    const signingKey = deriveSigningKey(secretKey);
    const contract   = new SchnorrAccountContract(signingKey);

    const manager  = await AccountManager.create(pxeClient, secretKey, contract);
    const wallet   = await manager.getAccount();
    const adminAddr = wallet.getAddress();

    const fpcAddr = AztecAddress.fromString(sponsoredFpc);

    const deployTx = await TokenContract.deploy(wallet, adminAddr, 'Quantum Dollars', 'QDs', 18)
      .send({
        fee: { paymentMethod: new SponsoredFeePaymentMethod(fpcAddr) }
      });

    const receipt    = await deployTx.wait();
    const tokenAddr  = receipt.contract.address.toString();

    console.log(JSON.stringify({
      success:        true,
      tokenAddress:   tokenAddr,
      txHash:         receipt.txHash?.toString(),
      relayerAddress: adminAddr.toString(),
      blockNumber:    Number(blockNumber),
      nodeVersion:    nodeInfo.nodeVersion,
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
