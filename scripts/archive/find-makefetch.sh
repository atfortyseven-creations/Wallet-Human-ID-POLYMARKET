#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

BASE="/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec/foundation"

echo "=== Finding makeFetch ==="
find "$BASE" -name "client*" -path "*/json-rpc/*" | head -20

echo ""
echo "=== json-rpc client files ==="
ls "$BASE/dest/json-rpc/client/" 2>/dev/null || ls "$BASE/dest/json-rpc/" 2>/dev/null
