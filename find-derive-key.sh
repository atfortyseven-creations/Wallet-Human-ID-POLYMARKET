#!/bin/bash
# Find where deriveSigningKey is exported in SDK 5.x
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd /tmp/aztec-v5-deploy

echo "=== Searching for deriveSigningKey in SDK 5.x ==="
grep -r "deriveSigningKey" node_modules/@aztec/aztec.js/dest/ --include="*.js" -l 2>/dev/null | head -5

echo ""
echo "=== All exports from @aztec/aztec.js/keys ==="
node --input-type=module << 'EOF'
import * as keys from '@aztec/aztec.js/keys';
console.log('keys exports:', Object.keys(keys));
EOF

echo ""
echo "=== Checking @aztec/aztec.js/account ==="
node --input-type=module << 'EOF'
import * as acct from '@aztec/aztec.js/account';
const hasDerive = 'deriveSigningKey' in acct;
console.log('account exports has deriveSigningKey:', hasDerive);
if (hasDerive) console.log('FOUND in account');
EOF

echo ""
echo "=== Checking @aztec/aztec.js/crypto ==="
node --input-type=module << 'EOF'
import * as crypto from '@aztec/aztec.js/crypto';
const hasDerive = 'deriveSigningKey' in crypto;
console.log('crypto exports has deriveSigningKey:', hasDerive);
if (hasDerive) console.log('FOUND in crypto');
EOF
