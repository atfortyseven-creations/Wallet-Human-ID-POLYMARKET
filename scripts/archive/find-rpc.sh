#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

BASE="/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec"

echo "=== Finding AztecNodeClient / node RPC client ==="
find "$BASE" -name "*.js" -newer "$BASE/pxe/dest/pxe.js" 2>/dev/null | head -5
find "$BASE" -name "*rpc_client*" -o -name "*node_client*" 2>/dev/null | grep "\.js$" | head -20

echo ""
echo "=== Checking embedded wallet package ==="
ls "$BASE/wallets/dest/" 2>/dev/null
find "$BASE/wallets" -name "*.js" 2>/dev/null | head -20
