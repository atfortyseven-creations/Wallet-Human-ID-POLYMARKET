#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "=== FINAL API DISCOVERY ==="
node --input-type=module << 'EOF'
// 1. What does TokenContract.deploy() expect from wallet?
import { TokenContract } from '@aztec/noir-contracts.js/Token';
const deployFn = TokenContract.deploy.toString().slice(0, 500);
console.log('=== TokenContract.deploy source ===');
console.log(deployFn);

// 2. Check ContractDeployer / DeployMethod
const { readFileSync } = await import('fs');
const { execSync } = await import('child_process');

// 3. Find createWallet or wallet helpers
try {
  const grepResult = execSync(
    `grep -r "createWallet\\|getWallet\\|AccountWalletWithSecretKey\\|class.*Wallet" node_modules/@aztec/aztec.js/dest/ --include="*.js" -l 2>/dev/null | head -5`,
    { encoding: 'utf8' }
  );
  console.log('\n=== Files with wallet creation ===');
  console.log(grepResult);
} catch {}

// 4. Check what's exported from wallet module in depth
import * as walletMod from '@aztec/aztec.js/wallet';
// Find anything that looks like a factory or has 'create' in name
const factories = Object.keys(walletMod).filter(k => 
  typeof walletMod[k] === 'function' && (
    k.startsWith('create') || k.startsWith('get') || k.startsWith('make')
  )
);
console.log('\n=== Wallet module factory functions ===');
console.log(factories);

// 5. Check contracts module
import * as contractsMod from '@aztec/aztec.js/contracts';
console.log('\n=== contracts module exports ===');
console.log(Object.keys(contractsMod));

EOF
