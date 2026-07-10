import { createPXEClient } from '@aztec/aztec.js';
const pxeUrl = 'https://v5.testnet.rpc.aztec-labs.com';
const pxe = createPXEClient(pxeUrl);
console.log('pxe keys:', Object.keys(pxe));
console.log('has getContractClassMetadata:', typeof pxe.getContractClassMetadata);
