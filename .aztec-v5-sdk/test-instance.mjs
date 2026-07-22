import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { contractInstanceWithAddressFromPlainObject } from '@aztec/stdlib/contract';

const NODE_URL = 'https://v5.testnet.rpc.aztec-labs.com/';
const SPONSORED_FPC = "0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c";

async function main() {
  const node = createAztecNodeClient(NODE_URL);
  const fpcAddress = AztecAddress.fromStringUnsafe(SPONSORED_FPC);
  const fpcInstance = await node.getContract(fpcAddress);
  console.log("fpcInstance keys:", Object.keys(fpcInstance));
  console.log("fpcInstance constructor:", fpcInstance.constructor.name);

  // How to convert?
  // Let's try plain object
  try {
    const parsed = contractInstanceWithAddressFromPlainObject(fpcInstance);
    console.log("Parsed keys:", Object.keys(parsed));
  } catch(e) {
    console.error("Parse error:", e);
  }
}
main().catch(console.error);
