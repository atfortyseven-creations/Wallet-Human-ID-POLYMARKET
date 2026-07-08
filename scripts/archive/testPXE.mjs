import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import * as pxeLazy from '@aztec/pxe/client/lazy';

try {
    const pxe = createSafeJsonRpcClient('http://127.0.0.1:18080', pxeLazy.PXE);
    console.log('PXE object:', typeof pxeLazy.PXE);
    console.log('Calling getBlockNumber...');
    pxe.getBlockNumber().then(console.log).catch(e => console.error('Call error:', e.message));
} catch (e) {
    console.error('Error creating:', e);
}
