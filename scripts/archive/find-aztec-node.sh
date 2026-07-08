#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Finding createAztecNodeClient ==="
find "/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec/aztec.js" -name "*.js" | xargs grep -l "createAztecNodeClient" 2>/dev/null | head -10

echo "=== Finding node module that exposes createAztecNodeClient ==="
find "/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec" -name "node.js" | head -20
