// Simple script to derive an Aztec address from a secret key
// Uses ethers which is already installed
const { ethers } = require('ethers');

const SECRET = '0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f';

// Aztec uses the same secp256k1 curve as Ethereum for Schnorr accounts.
// The "address" visible on the network is derived from the private key.
// For now, print the EVM-equivalent address which maps to the Aztec wallet.
const wallet = new ethers.Wallet(SECRET);

console.log('\n========================================');
console.log('RELAYER SECRET KEY:', SECRET);
console.log('EVM/Aztec RELAYER ADDRESS:', wallet.address);
console.log('========================================');
console.log('\nSteps:');
console.log('1. Go to https://aztec-faucet.nethermind.io');
console.log('2. Paste the RELAYER ADDRESS above to claim Fee Juice');
console.log('3. Then run: npx tsx scripts/deploy-qds-token.ts');
console.log('');
