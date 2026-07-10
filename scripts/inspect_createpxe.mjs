// Inspect createPXE function signature
import { createPXE, getPXEConfig } from '@aztec/pxe/client/lazy';
import { createAztecNodeClient } from '@aztec/aztec.js/node';

console.log('createPXE:', createPXE.toString().substring(0, 200));
console.log('getPXEConfig:', getPXEConfig.toString().substring(0, 200));

// Check what AztecNodeClient looks like
const nodeClient = createAztecNodeClient('https://v5.testnet.rpc.aztec-labs.com');
console.log('\nnodeClient methods:', Object.keys(nodeClient));
