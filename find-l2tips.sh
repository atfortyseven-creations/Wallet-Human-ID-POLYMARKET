#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

BASE="/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec"

echo "=== Finding getL2Tips in any file ==="
grep -r "getL2Tips" "$BASE" --include="*.js" -l 2>/dev/null | head -20

echo "=== Finding aztec node client ==="
find "$BASE" -name "*node_client*" -o -name "*aztec_node*" 2>/dev/null | grep "\.js$" | head -20
