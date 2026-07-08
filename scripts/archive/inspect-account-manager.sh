#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "=== AccountManager methods ==="
node --input-type=module << 'EOF'
import { AccountManager } from '@aztec/aztec.js/wallet';
import { Fr, GrumpkinScalar } from '@aztec/aztec.js/fields';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { createAztecNodeClient } from '@aztec/aztec.js/node';

// Inspect prototype
const proto = AccountManager.prototype;
console.log('AccountManager methods:', Object.getOwnPropertyNames(proto));

// Also check SchnorrAccountContract
const sproto = SchnorrAccountContract.prototype;
console.log('\nSchnorrAccountContract methods:', Object.getOwnPropertyNames(sproto));

// Inspect constructor signature
console.log('\nAccountManager.length:', AccountManager.length);
console.log('AccountManager source (300 chars):\n', AccountManager.toString().slice(0, 500));
EOF
