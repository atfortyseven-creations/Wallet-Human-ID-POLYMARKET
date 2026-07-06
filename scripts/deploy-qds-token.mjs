/**
 * deploy-qds-token.mjs
 *
 * Deploys the QDs (Quantum Dots) Token Contract onto the Aztec Testnet V5.
 * Uses native SDK 5.0.0-nightly embedded wallet and account management.
 */

// Suppress SDK internal logs
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';

import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const NODE_URL     = process.env.AZTEC_NODE_URL    || 'https://v5.testnet.rpc.aztec-labs.com/';
const SECRET_HEX   = process.env.AZTEC_RELAYER_SECRET_KEY;
const TOKEN_NAME   = process.env.QDS_TOKEN_NAME    || 'Quantum Dots';
const TOKEN_SYMBOL = process.env.QDS_TOKEN_SYMBOL  || 'QDs';
const TOKEN_DEC    = BigInt(process.env.QDS_TOKEN_DECIMALS || '18');

// ─── VALIDATION ───────────────────────────────────────────────────────────────
if (!SECRET_HEX) {
  console.error('\n  \x1b[31m✗\x1b[0m  AZTEC_RELAYER_SECRET_KEY is not set.\n');
  process.exit(1);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n\x1b[36m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║  \x1b[1m🚀 QDs Token Deploy — Aztec Testnet V5 (Native)\x1b[0m             \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚══════════════════════════════════════════════════════════════╝\x1b[0m\n');

  console.log(`  \x1b[2mnode\x1b[0m         ${NODE_URL}`);
  console.log(`  \x1b[2mtoken\x1b[0m        ${TOKEN_NAME} (${TOKEN_SYMBOL}, ${TOKEN_DEC} decimals)`);
  console.log('');

  // 1. Create Aztec Node Client
  process.stdout.write('  [1/4] \x1b[36m⠧\x1b[0m Connecting to Aztec Node... ');
  const node = await createAztecNodeClient(NODE_URL);
  const blockNum = await node.getBlockNumber();
  console.log(`\r\x1b[K  \x1b[32m✓\x1b[0m [1/4] Connected to node (block #${blockNum})`);

  // 2. Initialize EmbeddedWallet (local PXE)
  process.stdout.write('  [2/4] \x1b[36m⠧\x1b[0m Initializing EmbeddedWallet (PXE)... ');
  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  console.log('\r\x1b[K  \x1b[32m✓\x1b[0m [2/4] EmbeddedWallet ready');

  // 3. Create Schnorr Account
  process.stdout.write('  [3/4] \x1b[36m⠧\x1b[0m Loading Schnorr account from secret... ');
  const secretKey = Fr.fromString(SECRET_HEX);
  const accountManager = await wallet.createSchnorrAccount(secretKey, Fr.ZERO);
  const adminAddress = accountManager.address;
  console.log(`\r\x1b[K  \x1b[32m✓\x1b[0m [3/4] Account loaded: ${adminAddress.toString().slice(0, 22)}...`);

  // 4. Deploy TokenContract
  process.stdout.write('  [4/4] \x1b[36m⠧\x1b[0m Deploying QDs TokenContract (generating ZK proof)... ');
  const deployTx = await TokenContract.deploy(wallet, adminAddress, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DEC)
    .send({ universalDeploy: true, from: adminAddress });
  
  process.stdout.write(`\r\x1b[K  [4/4] \x1b[33m⠧\x1b[0m Waiting for transaction to be mined... `);
  const receipt = await deployTx.wait();
  console.log(`\r\x1b[K  \x1b[32m✓\x1b[0m [4/4] Transaction mined!`);

  const contractAddress = receipt.contract?.address?.toString() || 'UNKNOWN';
  const txHash = receipt.txHash?.toString() || 'UNKNOWN';

  // ─── SUCCESS ───────────────────────────────────────────────────────────────
  console.log('\n\x1b[36m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║  \x1b[1m✅ QDs TokenContract deployed successfully!\x1b[0m                 \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚══════════════════════════════════════════════════════════════╝\x1b[0m\n');
  
  console.log(`  \x1b[1mContract address:\x1b[0m  ${contractAddress}`);
  console.log(`  \x1b[1mAdmin address:\x1b[0m     ${adminAddress.toString()}`);
  console.log(`  \x1b[1mTransaction hash:\x1b[0m  ${txHash}`);
  console.log('');
  console.log(`  \x1b[36mCopy these into Railway → Variables:\x1b[0m\n`);
  console.log(`  AZTEC_TOKEN_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`  AZTEC_RELAYER_ADDRESS=${adminAddress.toString()}`);
  console.log(`  AZTEC_RELAYER_SECRET_KEY=${SECRET_HEX}`);
  console.log('');
  console.log(`  \x1b[2mAztecScan:\x1b[0m https://testnet.aztecscan.xyz/address/${contractAddress}`);
  console.log('');

  process.exit(0);
}

main().catch(err => {
  console.error('\n  \x1b[31m💥 Deployment failed\x1b[0m\n');
  console.error(`  Raw error: ${err.message}`);
  if (err.stack) console.error(`\n${err.stack}`);
  process.exit(1);
});
