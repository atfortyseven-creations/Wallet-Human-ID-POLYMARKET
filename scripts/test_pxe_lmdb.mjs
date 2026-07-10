// Use LMDB store (Node.js compatible) instead of IndexedDB
import 'dotenv/config';
import { createPXE } from '@aztec/pxe/client/lazy';
import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { openTmpStore } from '@aztec/kv-store/lmdb';

const nodeUrl = process.env.AZTEC_PXE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
console.log('[1] Connecting to Aztec Node:', nodeUrl);

const aztecNode = createAztecNodeClient(nodeUrl);
console.log('[2] Node client created');

const nodeInfo = await aztecNode.getNodeInfo();
console.log('[3] Node info:', JSON.stringify(nodeInfo, null, 2).substring(0, 300));

// Create in-memory LMDB store for PXE
const store = openTmpStore(true); // ephemeral = in-memory only
console.log('[4] LMDB store created:', typeof store);

// Create local PXE with the LMDB store
console.log('[5] Creating local PXE...');
try {
  const pxe = await createPXE(aztecNode, {}, { store });
  console.log('[6] PXE created:', typeof pxe);
  const pxeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(pxe));
  console.log('[7] PXE methods:', pxeMethods.join(', '));
} catch(e) {
  console.error('[ERROR]', e.message);
  console.error(e.stack?.substring(0, 800));
}
