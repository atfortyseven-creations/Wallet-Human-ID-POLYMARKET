import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { AztecAddress } from '@aztec/stdlib/aztec-address';

const NODE_URL = 'https://node.aztec.network/';
const SPONSORED_FPC = "0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c";

async function main() {
  const node = createAztecNodeClient(NODE_URL);
  const fpcAddress = AztecAddress.fromStringUnsafe(SPONSORED_FPC);
  const plainObj = await node.getContract(fpcAddress);
  
  console.log("deployer:", plainObj.deployer);
  console.log("publicKeys:", plainObj.publicKeys);
  console.log("is fully typed?", !!plainObj.deployer?.toFields);
  console.log("salt:", plainObj.salt);
  
  process.exit(0);
}
main().catch(console.error);
