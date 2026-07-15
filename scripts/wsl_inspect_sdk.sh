#!/bin/bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "=== Checking SDK version ==="
node -e "import('@aztec/aztec.js/node').then(m => console.log('node exports:', Object.keys(m).slice(0,10))).catch(e => console.error('node err:', e.message))"

echo ""
echo "=== Checking EmbeddedWallet exports ==="
node -e "import('@aztec/wallets/embedded').then(m => console.log('wallet exports:', Object.keys(m))).catch(e => console.error('wallet err:', e.message))"

echo ""
echo "=== Package versions ==="
node -e "const p = require('./node_modules/@aztec/aztec.js/package.json'); console.log('@aztec/aztec.js version:', p.version)" 2>/dev/null || \
  cat node_modules/@aztec/aztec.js/package.json | grep '"version"' | head -1
