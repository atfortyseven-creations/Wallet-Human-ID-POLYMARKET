#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "=== AccountManager.create + getAccount full source ==="
node --input-type=module << 'EOF'
import { AccountManager } from '@aztec/aztec.js/wallet';

// Print full source
const src = AccountManager.toString();
console.log(src.slice(0, 3000));
EOF
