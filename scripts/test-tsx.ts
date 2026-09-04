import { AccountManager } from '@aztec/aztec.js/wallet';
import { createAztecNodeClient } from '@aztec/aztec.js';

async function main() {
  console.log('tsx works with aztec.js!');
  const node = createAztecNodeClient('https://node.aztec.network');
  console.log(await node.getNodeInfo());
}
main().catch(console.error);
