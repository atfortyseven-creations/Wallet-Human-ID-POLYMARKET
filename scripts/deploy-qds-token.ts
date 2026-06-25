/**
 * scripts/deploy-qds-token.ts
 *
 * One-time deployment script for the QDs TokenContract on Aztec Testnet.
 *
 * Requirements:
 *   - AZTEC_PXE_URL pointing to a running PXE connected to Aztec Testnet
 *   - AZTEC_RELAYER_SECRET_KEY = a funded 32-byte hex key (has Fee Juice)
 *
 * Usage:
 *   npx tsx scripts/deploy-qds-token.ts
 *
 * After running, set AZTEC_QDS_CONTRACT_ADDRESS in your Railway environment.
 */

import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/stdlib/keys';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

const PXE_URL  = process.env.AZTEC_PXE_URL  || 'http://localhost:8080';
const NODE_URL = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
const SECRET   = process.env.AZTEC_RELAYER_SECRET_KEY;
// V5 Testnet SponsoredFPC — use: aztec get-canonical-sponsored-fpc-address to verify
const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880';

async function main() {
  if (!SECRET) {
    console.error('❌ AZTEC_RELAYER_SECRET_KEY not set');
    process.exit(1);
  }

  console.log('🔗 Connecting to PXE:', PXE_URL);
  const pxe = await createAztecNodeClient(PXE_URL);

  const nodeInfo = await pxe.getNodeInfo();
  console.log('🌐 Connected to Aztec Network:', JSON.stringify(nodeInfo, null, 2));

  console.log('🔑 Loading relayer account...');
  const secretKey  = Fr.fromString(SECRET);
  const signingKey = deriveSigningKey(secretKey);
  const account    = getSchnorrAccount(pxe, secretKey, signingKey);
  await account.register();
  const wallet     = await account.getWallet();
  const adminAddr  = wallet.getAddress();

  console.log('👛 Relayer address:', adminAddr.toString());

  console.log('📦 Deploying QDs TokenContract...');

  // Use SponsoredFPC for gas-free deployment on testnet
  const fpcAddress = AztecAddress.fromString(SPONSORED_FPC);
  const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

  const token = await TokenContract.deploy(
    wallet,
    adminAddr,   // admin
    'Quantum Dots',
    'QDs',
    18           // decimals
  )
    .send({ fee: { paymentMethod } })
    .deployed();

  const contractAddress = token.address.toString();

  console.log('');
  console.log('✅ QDs TokenContract deployed!');
  console.log('══════════════════════════════════════════════════');
  console.log('Contract Address:', contractAddress);
  console.log('══════════════════════════════════════════════════');
  console.log('');
  console.log('Next step — set this in Railway and your .env:');
  console.log(`AZTEC_QDS_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('');
  console.log('Also set AZTEC_RELAYER_ADDRESS for minting:');
  console.log(`AZTEC_RELAYER_ADDRESS=${adminAddr.toString()}`);
}

main().catch(err => {
  console.error('💥 Deployment failed:', err);
  process.exit(1);
});
