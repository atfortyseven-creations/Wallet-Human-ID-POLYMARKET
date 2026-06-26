#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "=== DefaultAccountContract source ==="
node --input-type=module << 'EOF'
import { DefaultAccountContract } from '@aztec/accounts/defaults';
console.log('DefaultAccountContract methods:', Object.getOwnPropertyNames(DefaultAccountContract.prototype));
console.log('\nFull source:');
console.log(DefaultAccountContract.toString().slice(0, 3000));

// Also check AccountWithSecretKey
import { AccountWithSecretKey } from '@aztec/aztec.js/account';
console.log('\n\nAccountWithSecretKey methods:', Object.getOwnPropertyNames(AccountWithSecretKey.prototype));
console.log('\nAccountWithSecretKey source:');
console.log(AccountWithSecretKey.toString().slice(0, 2000));
EOF
