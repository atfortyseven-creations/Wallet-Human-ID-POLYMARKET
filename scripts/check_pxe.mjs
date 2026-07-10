import { createPXEClient } from '@aztec/aztec.js';
const pxeUrl = 'https://v5.testnet.rpc.aztec-labs.com';
const pxe = createPXEClient(pxeUrl);
console.log('typeof getContractClassMetadata:', typeof pxe.getContractClassMetadata);
console.log('typeof sendTx:', typeof pxe.sendTx);
