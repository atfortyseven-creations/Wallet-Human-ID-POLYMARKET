import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import * as pxeLazy from '@aztec/pxe/client/lazy';

try {
    const pxe = createSafeJsonRpcClient('http://127.0.0.1:8080', pxeLazy.PXE);
    console.log('Created!', Object.keys(pxe));
} catch (e) {
    console.error('Error creating:', e);
}
