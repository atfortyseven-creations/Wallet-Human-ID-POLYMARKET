import { createAztecNodeClient } from '@aztec/aztec.js/node';

async function main() {
  const rpc = createAztecNodeClient('https://v5.testnet.rpc.aztec-labs.com/');
  const info = await rpc.getNodeInfo();
  console.log("Node Info:");
  console.log(JSON.stringify(info, null, 2));
}

main().catch(console.error);
