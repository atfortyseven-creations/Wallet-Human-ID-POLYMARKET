import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import { mockPXESchema } from '../lib/aztec/pxeSchema.js'; // MUST BE .js for some ESM loaders, but let's try .ts

async function main() {
  const pxeUrl = process.env.AZTEC_PXE_URL || 'http://127.0.0.1:18080';
  console.log('Testing createSafeJsonRpcClient with mockPXESchema...');
  const pxe = createSafeJsonRpcClient(pxeUrl, mockPXESchema as any);
  
  console.log('Fetching node info from PXE sidecar...');
  const info = await pxe.getNodeInfo();
  console.log('Success:', info);
}
main().catch(console.error);
