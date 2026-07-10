// The PXE is a schema interface not a client. We need to use createSafeJsonRpcClient correctly.
// Let's check what @aztec/foundation/json-rpc/client gives us

import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import { PXE } from '@aztec/pxe/client/lazy';

const pxeUrl = 'https://v5.testnet.rpc.aztec-labs.com';

// createSafeJsonRpcClient returns a Proxy - let's see if it's smart enough
const pxe = createSafeJsonRpcClient(pxeUrl, PXE);

// Check if proxy intercepts arbitrary method calls
try {
  const result = await pxe.getNodeInfo();
  console.log('getNodeInfo result:', result);
} catch(e) {
  console.log('getNodeInfo error:', e.message);
}

// Check PXESchema methods  
console.log('\nPXE schema methods (from PXE object keys):', Object.keys(PXE));
