import { createAztecNodeClient } from '@aztec/aztec.js/node';

async function main() {
  const node = createAztecNodeClient('https://v5.testnet.rpc.aztec-labs.com');
  const info = await node.getNodeInfo();
  console.log("Node info protocol contract addresses:", JSON.stringify(info.protocolContractAddresses, null, 2));
}
main().catch(console.error);
