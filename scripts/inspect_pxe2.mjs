// Let's look at what createSafeJsonRpcClient actually is
import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
console.log('createSafeJsonRpcClient:', createSafeJsonRpcClient.toString().substring(0, 500));

// Look at the PXE schema more carefully
import { PXE } from '@aztec/pxe/client/lazy';
console.log('\nPXE type:', typeof PXE);
console.log('PXE constructor name:', PXE?.constructor?.name);
console.log('PXE prototype methods:', PXE?.prototype ? Object.getOwnPropertyNames(PXE.prototype) : 'no prototype');

// Try to look at the z schema
import { z } from 'zod';
console.log('\nPXE._def?.typeName:', (PXE as any)?._def?.typeName);
