/**
 * Diagnose FPC class ID mismatch between local SDK and testnet.
 * 
 * Testnet FPC address: 0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c
 * Testnet FPC class:   0x2015e1c62855672a06820d57dd6365eb55e6ece2ddb95a44ce9f2c849abb9ea3
 * 
 * We need to figure out the correct approach to fix Error 14.
 */

import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { SponsoredFPCContractArtifact } from '@aztec/noir-contracts.js/SponsoredFPC';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
import { AztecAddress } from '@aztec/stdlib/aztec-address';

const NODE_URL = 'https://node.aztec.network/';
const SPONSORED_FPC = '0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c';

// Step 1: Check what methods exist on AztecNode for fetching contract class
const node = await createAztecNodeClient(NODE_URL);

console.log('\n=== Available node methods for contract info ===');
const nodeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(node))
  .filter(m => m.includes('contract') || m.includes('Contract') || m.includes('class') || m.includes('Class'))
  .sort();
console.log(nodeMethods);

// Step 2: Try to get the class ID of the canonical FPC from the node
const fpcAddress = AztecAddress.fromStringUnsafe(SPONSORED_FPC);

console.log('\n=== Trying getContractClass / getContractClassMetadata ===');
for (const method of ['getContractClass', 'getContractClassMetadata', 'getContractClassIds', 'getContractInstance', 'getContract']) {
  try {
    const fn = (node)[method];
    if (typeof fn === 'function') {
      // For getContractInstance, pass fpcAddress
      const result = method === 'getContractClassIds' 
        ? await node[method]()
        : await node[method](fpcAddress);
      console.log(`${method}(fpcAddress):`, JSON.stringify(result, null, 2).slice(0, 500));
    } else {
      console.log(`${method}: not a function`);
    }
  } catch (e) {
    console.log(`${method}: ERROR - ${e.message.slice(0, 120)}`);
  }
}

// Step 3: Check what artifact we have locally
console.log('\n=== Local SponsoredFPC artifact info ===');
console.log('name:', SponsoredFPCContractArtifact.name);
console.log('functions count:', SponsoredFPCContractArtifact.functions?.length);

// Try computing class ID
try {
  const { deriveContractClassId } = await import('@aztec/circuits.js').catch(() => ({}));
  if (deriveContractClassId) {
    console.log('deriveContractClassId available');
  }
} catch {}

try {
  const mod = await import('@aztec/stdlib/contract-class-id').catch(() => null);
  if (mod) {
    console.log('stdlib/contract-class-id keys:', Object.keys(mod));
  }
} catch (e) {
  console.log('stdlib/contract-class-id error:', e.message);
}

console.log('\n=== Available EmbeddedWallet methods ===');
const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
const walletMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(wallet))
  .filter(m => m.toLowerCase().includes('contract') || m.toLowerCase().includes('class'))
  .sort();
console.log(walletMethods);

process.exit(0);
