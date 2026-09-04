import { createAztecNodeClient } from '@aztec/aztec.js';
import { createPXE } from '@aztec/pxe/client/lazy';

async function main() {
  console.log('Creating node client...');
  const node = createAztecNodeClient('https://node.aztec.network');
  console.log('Node info:', await node.getNodeInfo());

  console.log('Creating in-memory PXE...');
  const pxe = await createPXE(node, {}, {});
  console.log('PXE created. Syncing...');

  const info = await pxe.getNodeInfo();
  console.log('Synced! Node info from PXE:', info);
  
  process.exit(0);
}
main().catch(console.error);
