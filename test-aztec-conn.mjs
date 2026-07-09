import { createAztecNodeClient } from '@aztec/aztec.js/node';

const url = 'https://v5.testnet.rpc.aztec-labs.com';
console.log('Testing connection to ' + url);

async function test() {
  try {
    const client = createAztecNodeClient(url);
    const info = await client.getNodeInfo();
    console.log('Node Info:', info);
    const blockNum = await client.getBlockNumber();
    console.log('Block Number:', blockNum);
  } catch (e) {
    console.error('Error connecting to Aztec:', e);
  }
}

test();
