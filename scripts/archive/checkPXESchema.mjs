// Test if PXE from @aztec/pxe/client/lazy can be used as a schema
import { createSafeJsonRpcClient, makeFetch } from '@aztec/foundation/json-rpc/client';

// Check what PXE looks like
const pxeModule = await import('@aztec/pxe/client/lazy');
console.log('PXE module keys:', Object.keys(pxeModule).slice(0, 15));

const PXE = pxeModule.PXE;
console.log('PXE type:', typeof PXE);
console.log('PXE own keys:', Object.getOwnPropertyNames(PXE).slice(0, 10));

// Try to see if PXE can be used as schema
try {
  const client = createSafeJsonRpcClient('http://127.0.0.1:18080', PXE, {
    fetch: makeFetch([1, 2, 3], false),
    batchWindowMS: 0
  });
  console.log('client type:', typeof client);
  console.log('client keys:', Object.keys(client).filter(k => !k.startsWith('Symbol')).slice(0, 10));
} catch(e) {
  console.log('createSafeJsonRpcClient error:', e.message);
}
