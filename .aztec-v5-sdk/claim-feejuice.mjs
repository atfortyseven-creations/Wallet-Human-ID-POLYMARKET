process.env.LOG_LEVEL = 'silent';

import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { FeeJuicePaymentMethodWithClaim } from '@aztec/aztec.js/fee';

const NODE_URL        = process.env.NODE_URL   || 'https://node.aztec.network/';
const SECRET_HEX      = (process.env.SECRET    || '').trim();
const CLAIM_AMOUNT_STR= process.env.CLAIM_AMOUNT || '100000000000000000000';
const CLAIM_SECRET_HEX= process.env.CLAIM_SECRET || '';
const LEAF_INDEX      = Number(process.env.LEAF_INDEX || '0');

console.log('\n\x1b[36m╔══════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[36m║  💧  Claiming Fee Juice — Aztec V5 Testnet          ║\x1b[0m');
console.log('\x1b[36m╚══════════════════════════════════════════════════════╝\x1b[0m\n');

console.log(`  Node:         ${NODE_URL}`);
console.log(`  Claim amount: 100 FeeJuice`);
console.log(`  Leaf index:   ${LEAF_INDEX}`);
console.log('');

try {
  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  const secretKey = Fr.fromString(SECRET_HEX);
  const account   = await wallet.createSchnorrAccount(secretKey, Fr.ZERO);
  console.log(`  Address: ${account.address.toString()}`);

  const claimSecret = Fr.fromString(CLAIM_SECRET_HEX);
  const claimAmount = BigInt(CLAIM_AMOUNT_STR);

  const claim = {
    claimAmount,
    claimSecret,
    messageLeafIndex: BigInt(LEAF_INDEX),
  };

  const paymentMethod = new FeeJuicePaymentMethodWithClaim(account.address, claim);

  console.log('\n  [1/2] Deploying account + claiming Fee Juice atomically...');
  process.stdout.write('        Generating ZK proof (may take 1-2 min)...');

  const deployMethod = await account.getDeployMethod();
  const deployTx = await deployMethod.send({ 
    fee: { paymentMethod },
    from: account.address 
  });
  const receipt  = await deployTx.wait();

  console.log(`\n  \x1b[32m✅ Done!\x1b[0m tx: ${receipt.txHash?.toString()}`);
  console.log('');
  console.log('  \x1b[32m🚀 Fee Juice claimed. Now running QDs token deploy...\x1b[0m');

  await wallet.stop();
  process.exit(0);
} catch(err) {
  console.error('\n  \x1b[31m❌ Claim failed:\x1b[0m', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
}
