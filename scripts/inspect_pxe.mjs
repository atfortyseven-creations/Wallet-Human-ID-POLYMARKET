import { AccountManager } from '@aztec/aztec.js/wallet';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { Fr } from '@aztec/aztec.js/fields';
import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import { PXE } from '@aztec/pxe/client/lazy';
import { deriveSigningKey } from '@aztec/stdlib/keys';

const pxeUrl = 'https://v5.testnet.rpc.aztec-labs.com';
const pxe = createSafeJsonRpcClient(pxeUrl, PXE);

// Check what methods the PXE client has
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(pxe)).concat(Object.keys(pxe));
console.log('PXE proxy methods:', methods);

// Also check if it's a Proxy
console.log('pxe type:', typeof pxe);
console.log('pxe.getContractClassMetadata:', pxe.getContractClassMetadata);

// Try a simple call
const result = await pxe.getNodeInfo?.();
console.log('nodeInfo:', result);
