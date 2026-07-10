// Test creating a local PXE with the testnet node
// This is the CORRECT architecture for SDK 4.3.1:
// Script -> Local PXE (in-memory) -> Aztec Node (remote testnet)
import 'dotenv/config';
import { createPXE, getPXEConfig } from '@aztec/pxe/client/lazy';
import { createAztecNodeClient } from '@aztec/aztec.js/node';

const nodeUrl = process.env.AZTEC_PXE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
console.log('[1] Connecting to Aztec Node:', nodeUrl);

// Step 1: Create a node client
const aztecNode = createAztecNodeClient(nodeUrl);
console.log('[2] Node client created');

// Step 2: Get PXE config from environment
const pxeConfig = getPXEConfig();
console.log('[3] PXE config:', JSON.stringify(pxeConfig, null, 2).substring(0, 500));

// Step 3: Create local PXE
console.log('[4] Creating local PXE (this may take a few seconds)...');
try {
  const pxe = await createPXE(aztecNode, pxeConfig);
  console.log('[5] Local PXE created successfully!');
  console.log('PXE type:', typeof pxe);
  
  // Check what methods the local PXE has
  const pxeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(pxe));
  console.log('\nPXE methods:', pxeMethods);
} catch(e) {
  console.error('[ERROR] Failed to create PXE:', e.message);
  console.error(e.stack?.substring(0, 500));
}
