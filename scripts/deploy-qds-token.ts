/**
 * scripts/deploy-qds-token.ts
 *
 * One-time deployment script for the QDs TokenContract on Aztec Mainnet.
 *
 * Requirements:
 *   - AZTEC_PXE_URL pointing to a running PXE connected to Aztec V5 Testnet
 *   - AZTEC_RELAYER_SECRET_KEY = a 32-byte hex Fr key
 *
 * Usage:
 *   AZTEC_PXE_URL=http://localhost:18080 \
 *   AZTEC_RELAYER_SECRET_KEY=0x... \
 *   npx tsx scripts/deploy-qds-token.ts
 *
 * After running, copy AZTEC_TOKEN_CONTRACT_ADDRESS → Railway Variables.
 */

import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/stdlib/keys';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { EmbeddedWallet } from '@aztec/wallets/embedded';

const NODE_URL     = process.env.AZTEC_NODE_URL  || 'https://node.aztec.network';
const SECRET       = process.env.AZTEC_RELAYER_SECRET_KEY;
// V5 Testnet SponsoredFPC — CANONICAL rc.2 address from docs.aztec.network/networks
// Confirmed by @joshc [AZTC] 2026-07-07. Old 0x2613... is NOT deployed on rc.2.
const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

async function main() {
  if (!SECRET) {
    console.error('❌ AZTEC_RELAYER_SECRET_KEY not set');
    console.error('   Set it: export AZTEC_RELAYER_SECRET_KEY=0x...');
    process.exit(1);
  }

  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('  QDs Token Deploy — Aztec V5 Testnet');
  console.log('══════════════════════════════════════════════════════');
  console.log(`🌐 Node URL:  ${NODE_URL}`);
  console.log(`⛽ FPC Addr:  ${SPONSORED_FPC}`);
  console.log('');

  console.log('\n🔗 Initializing embedded PXE via EmbeddedWallet...');
  const pxe = await EmbeddedWallet.create(NODE_URL, {
    ephemeral: true,
    pxeConfig: { proverEnabled: true }
  });

  const nodeInfo = await pxe.getNodeInfo();
  console.log(`🌐 Aztec Network: chain=${nodeInfo.l2ChainId} version=${nodeInfo.protocolVersion}`);

  console.log('🔑 Loading relayer account...');
  const secretKey  = Fr.fromString(SECRET);
  const signingKey = deriveSigningKey(secretKey);
  const account    = getSchnorrAccount(pxe, secretKey, signingKey);
  await account.register();
  const wallet    = await account.getWallet();
  const adminAddr = wallet.getAddress();

  console.log(`👛 Relayer Aztec address: ${adminAddr.toString()}`);

  console.log('\n📦 Deploying QDs TokenContract...');
  console.log('   (This may take 30-120 seconds for proof generation)');

  const fpcAddress    = AztecAddress.fromString(SPONSORED_FPC);
  const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

  const token = await TokenContract.deploy(
    wallet,
    adminAddr,       // admin
    'Quantum Dots',  // name
    'QDs',           // symbol
    18               // decimals
  )
    .send({ fee: { paymentMethod } })
    .deployed();

  const contractAddress = token.address.toString();

  console.log('');
  console.log('✅ QDs TokenContract deployed successfully!');
  console.log('══════════════════════════════════════════════════════');
  console.log('AZTEC_TOKEN_CONTRACT_ADDRESS=' + contractAddress);
  console.log('AZTEC_RELAYER_ADDRESS=' + adminAddr.toString());
  console.log('══════════════════════════════════════════════════════');
  console.log('');
  console.log('👉 Copy both values above into Railway → Variables');
  console.log('👉 Also set AZTEC_RELAYER_SECRET_KEY in Railway if not already set');
  console.log('');
  console.log(`🔍 View on AztecScan: https://aztecscan.xyz/address/${contractAddress}`);
}

main().catch(err => {
  console.error('\n💥 Deployment failed:', err?.message || err);
  process.exit(1);
});
