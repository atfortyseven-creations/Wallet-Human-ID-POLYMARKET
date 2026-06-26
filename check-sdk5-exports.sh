#!/bin/bash
# Inspeciona exports del SDK 5.x
source ~/.nvm/nvm.sh
nvm use 20 --silent

DEPLOY_DIR="/tmp/aztec-v5-deploy"
cd "$DEPLOY_DIR"

echo "=== package.json exports of @aztec/aztec.js 5.x ==="
node -e "
const pkg = JSON.parse(require('fs').readFileSync('./node_modules/@aztec/aztec.js/package.json', 'utf8'));
console.log('exports keys:', JSON.stringify(Object.keys(pkg.exports || {}), null, 2));
console.log('main:', pkg.main);
console.log('module:', pkg.module);
"
