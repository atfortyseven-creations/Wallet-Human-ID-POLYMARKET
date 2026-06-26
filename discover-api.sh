#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

SDK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
cd "$SDK_DIR"

echo "=== AZTEC SDK 5.x — API Discovery ==="
node --input-type=module << 'EOF'
// Check all relevant exports
const mods = [
  '@aztec/aztec.js/keys',
  '@aztec/aztec.js/crypto',
  '@aztec/aztec.js/account',
  '@aztec/aztec.js/wallet',
  '@aztec/aztec.js/fields',
  '@aztec/accounts/schnorr',
  '@aztec/accounts/utils',
];

for (const mod of mods) {
  try {
    const m = await import(mod);
    const keys = Object.keys(m);
    const relevant = keys.filter(k =>
      k.toLowerCase().includes('sign') ||
      k.toLowerCase().includes('derive') ||
      k.toLowerCase().includes('grumpkin') ||
      k.toLowerCase().includes('schnorr')
    );
    if (relevant.length > 0) {
      console.log(`\n[${mod}]`);
      console.log('  relevant:', relevant.join(', '));
    }
  } catch(e) {
    console.log(`[${mod}] ERROR: ${e.message.split('\n')[0]}`);
  }
}

// Check schnorr account signature
console.log('\n=== getSchnorrAccount signature ===');
const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
console.log('getSchnorrAccount.length (# params):', getSchnorrAccount.length);
console.log('getSchnorrAccount.toString() (first 300 chars):');
console.log(getSchnorrAccount.toString().slice(0, 400));
EOF
