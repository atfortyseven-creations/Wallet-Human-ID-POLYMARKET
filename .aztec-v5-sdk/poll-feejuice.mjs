process.env.LOG_LEVEL = 'silent';

import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { FeeJuicePaymentMethodWithClaim } from '@aztec/aztec.js/fee';

const NODE_URL        = process.env.NODE_URL   || 'https://v5.testnet.rpc.aztec-labs.com/';
const SECRET_HEX      = (process.env.SECRET    || '').trim();
const CLAIM_AMOUNT_STR= process.env.CLAIM_AMOUNT || '100000000000000000000';
const CLAIM_SECRET_HEX= process.env.CLAIM_SECRET || '';
const LEAF_INDEX      = Number(process.env.LEAF_INDEX || '0');

console.log('\n\x1b[36m╔══════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[36m║  💧  Aztec Fee Juice Auto-Claimer (Polling)         ║\x1b[0m');
console.log('\x1b[36m╚══════════════════════════════════════════════════════╝\x1b[0m\n');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  const secretKey = Fr.fromString(SECRET_HEX);
  const account   = await wallet.createSchnorrAccount(secretKey, Fr.ZERO);
  
  const claimSecret = Fr.fromString(CLAIM_SECRET_HEX);
  const claimAmount = BigInt(CLAIM_AMOUNT_STR);

  const claim = {
    claimAmount,
    claimSecret,
    messageLeafIndex: BigInt(LEAF_INDEX),
  };

  const paymentMethod = new FeeJuicePaymentMethodWithClaim(account.address, claim);

  let success = false;
  let attempts = 0;

  while (!success && attempts < 60) {
    attempts++;
    process.stdout.write(`\r  [⌛] Attempt ${attempts}/60: Checking if bridge message arrived on L2... `);
    try {
      const deployMethod = await account.getDeployMethod();
      const deployTx = await deployMethod.send({ 
        fee: { paymentMethod },
        from: account.address 
      });
      process.stdout.write('\n  [✨] Message found! Sending transaction...\n');
      const receipt  = await deployTx.wait();
      
      console.log(`\n  \x1b[32m✅ Done!\x1b[0m tx: ${receipt.txHash?.toString()}`);
      console.log('  \x1b[32m🚀 Fee Juice claimed successfully!\x1b[0m');
      success = true;
    } catch(err) {
      if (err.message.includes('No L1 to L2 message found')) {
         // Expected, we wait
         await sleep(10000); // 10 seconds
      } else {
         console.error('\n  \x1b[31m❌ Unexpected Error:\x1b[0m', err.message);
         break;
      }
    }
  }

  if (!success) {
    console.log('\n\n  ⏳ Polling timed out. The Aztec testnet sequencer might be currently halted or slow.');
  }

  await wallet.stop();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
