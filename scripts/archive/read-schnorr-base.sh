#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "=== SchnorrBaseAccountContract source ==="
node --input-type=module << 'EOF'
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { Fr, GrumpkinScalar } from '@aztec/aztec.js/fields';

// Get the parent class
const parentClass = Object.getPrototypeOf(SchnorrAccountContract);
console.log('Parent class:', parentClass.name);
console.log('Parent source:', parentClass.toString().slice(0, 3000));

// List all parent methods
const proto = parentClass.prototype;
console.log('\nParent prototype methods:', Object.getOwnPropertyNames(proto));
EOF
