#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Finding createAztecNodeClient in stdlib ==="
find "/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec/stdlib/dest/interfaces" -name "*.js" | head -30

echo ""
echo "=== Looking for client.js ==="
find "/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec/stdlib/dest" -name "client*" | head -10
