#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

BASE="/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec/stdlib/dest"
echo "=== Files in stdlib/dest/block ==="
ls "$BASE/block/" 2>/dev/null || echo "(not found)"

echo "=== Files in stdlib/dest ==="
ls "$BASE/" 2>/dev/null | head -30

# Search for l2_block_stream
echo "=== Searching for l2_block_stream ==="
find "/mnt/d/Projects/Wallet Human Polymarket ID/node_modules/@aztec/" -name "l2_block_stream*" 2>/dev/null | head -20
