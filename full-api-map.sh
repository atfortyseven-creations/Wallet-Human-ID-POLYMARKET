#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

SDK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
cd "$SDK_DIR"

echo "=== SDK 5.x Full API Map ==="
node --input-type=module << 'EOF'
// Full export list of all relevant modules
const mods = {
  'aztec.js/node':    '@aztec/aztec.js/node',
  'aztec.js/account': '@aztec/aztec.js/account',
  'aztec.js/wallet':  '@aztec/aztec.js/wallet',
  'aztec.js/fields':  '@aztec/aztec.js/fields',
  'aztec.js/keys':    '@aztec/aztec.js/keys',
  'aztec.js/crypto':  '@aztec/aztec.js/crypto',
  'aztec.js/tx':      '@aztec/aztec.js/tx',
  'accounts/schnorr': '@aztec/accounts/schnorr',
  'accounts/defaults':'@aztec/accounts/defaults',
};

for (const [label, mod] of Object.entries(mods)) {
  try {
    const m = await import(mod);
    const keys = Object.keys(m);
    console.log(`\n[${label}] (${keys.length} exports):`);
    console.log('  ' + keys.join(', '));
  } catch(e) {
    console.log(`[${label}] ERROR: ${e.message.split('\n')[0]}`);
  }
}
EOF
