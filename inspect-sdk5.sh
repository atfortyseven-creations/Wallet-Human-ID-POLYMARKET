#!/bin/bash
# Inspect SDK 5.x exports and test deploy
source ~/.nvm/nvm.sh
nvm use 20 --silent

DEPLOY_DIR="/tmp/aztec-v5-deploy"
cd "$DEPLOY_DIR" 2>/dev/null || { echo "DIR NOT FOUND - run deploy-v5-sdk.sh first"; exit 1; }

echo "=== @aztec/aztec.js exports ==="
node --input-type=module << 'EOF'
import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./node_modules/@aztec/aztec.js/package.json', 'utf8'));
console.log('exports:', JSON.stringify(Object.keys(pkg.exports || {}), null, 2));

// Check if accounts/schnorr exists
import { existsSync } from 'fs';
const schnorrExists = existsSync('./node_modules/@aztec/accounts/package.json');
console.log('@aztec/accounts installed:', schnorrExists);
if (schnorrExists) {
  const aPkg = JSON.parse(readFileSync('./node_modules/@aztec/accounts/package.json', 'utf8'));
  console.log('@aztec/accounts exports:', JSON.stringify(Object.keys(aPkg.exports || {}), null, 2));
}

const ncPkg = JSON.parse(readFileSync('./node_modules/@aztec/noir-contracts.js/package.json', 'utf8'));
const tokenExport = Object.keys(ncPkg.exports || {}).find(k => k.toLowerCase().includes('token'));
console.log('noir-contracts.js Token export:', tokenExport);
EOF
