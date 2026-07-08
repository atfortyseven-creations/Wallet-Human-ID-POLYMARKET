import { AccountManager } from '@aztec/aztec.js/wallet';
import { createAztecNodeClient } from '@aztec/aztec.js';

async function main() {
  console.log('tsx works with aztec.js!');
  const node = createAztecNodeClient('https://v5.testnet.rpc.aztec-labs.com');
  console.log(await node.getNodeInfo());
}
main().catch(console.error);
