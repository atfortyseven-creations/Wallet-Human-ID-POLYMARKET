#!/bin/bash
export HOME=/home/atfortyseven
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# The Nethermind claim.sh fails silently if $HOME/.aztec-devtools fails
# Let's write our own claim script using EmbeddedWallet directly

WORK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
cd "$WORK_DIR"

SECRET="0x15fa25927efea27a69bc92e624c43160a221f75355a297e64177d6ee37cbdb76"
CLAIM_AMOUNT="100000000000000000000"
CLAIM_SECRET="0x253ce6a663b68df669f3db6c7dc9fd7360495da29aa2f804c742324126dee236"
LEAF_INDEX="14067758"
NODE_URL="https://v5.testnet.rpc.aztec-labs.com/"

cat > /tmp/claim_feejuice.mjs << 'MEOF'
process.env.LOG_LEVEL = 'silent';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/aztec.js';
import { FeeJuicePaymentMethodWithClaim } from '@aztec/aztec.js/fee';

const NODE_URL   = process.env.NODE_URL;
const SECRET_HEX = process.env.SECRET.trim();
const CLAIM_AMOUNT_STR = process.env.CLAIM_AMOUNT;
const CLAIM_SECRET_HEX = process.env.CLAIM_SECRET;
const LEAF_INDEX = Number(process.env.LEAF_INDEX);

console.log('\n🔗  Claiming Fee Juice on Aztec V5 Testnet\n');

const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
const secretKey = Fr.fromString(SECRET_HEX);
const account = await wallet.createSchnorrAccount(secretKey, Fr.ZERO);

console.log('  Account:', account.address.toString());
console.log('  Claim amount:', CLAIM_AMOUNT_STR, 'wei (100 FeeJuice)');
console.log('  Leaf index:', LEAF_INDEX);
console.log('');

const claimSecret = Fr.fromString(CLAIM_SECRET_HEX);
const claimAmount = BigInt(CLAIM_AMOUNT_STR);

const claim = {
  claimAmount,
  claimSecret,
  messageLeafIndex: BigInt(LEAF_INDEX),
};

const paymentMethod = new FeeJuicePaymentMethodWithClaim(account.address, claim);

// Deploy-and-claim in one atomic tx
console.log('  [1/2] Deploying account + claiming Fee Juice atomically...');
const deployTx = await account.deploy({ fee: { paymentMethod } });
const receipt = await deployTx.wait();
console.log('  ✅ Account deployed! tx:', receipt.txHash?.toString());
console.log('');

// Now check balance
console.log('  [2/2] Verifying Fee Juice balance...');
const balance = await wallet.getBalance(account.address);
console.log('  💰 Fee Juice balance:', balance?.toString(), 'wei');
console.log('');
console.log('  🚀 Ready to deploy QDs token!');

await wallet.stop();
process.exit(0);
MEOF

echo "[*] Running claim script..."
NODE_URL="$NODE_URL" \
SECRET="$SECRET" \
CLAIM_AMOUNT="$CLAIM_AMOUNT" \
CLAIM_SECRET="$CLAIM_SECRET" \
LEAF_INDEX="$LEAF_INDEX" \
node --experimental-vm-modules /tmp/claim_feejuice.mjs 2>&1
