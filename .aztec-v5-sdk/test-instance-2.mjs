import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { ContractInstanceWithAddress } from '@aztec/stdlib/contract';

const NODE_URL = 'https://v5.testnet.rpc.aztec-labs.com/';
const SPONSORED_FPC = "0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c";

async function main() {
  const node = createAztecNodeClient(NODE_URL);
  const fpcAddress = AztecAddress.fromStringUnsafe(SPONSORED_FPC);
  const plainObj = await node.getContract(fpcAddress);
  
  // Method 1: new ContractInstanceWithAddress
  try {
    const inst = new ContractInstanceWithAddress(plainObj, plainObj.address);
    console.log("Method 1 success");
    console.log("has toFields?", 'toFields' in inst);
  } catch(e) {
    console.log("Method 1 failed");
  }

  // Method 2: Create a dummy object with the right structure
  try {
    const inst = {
      version: plainObj.version,
      salt: plainObj.salt,
      contractClassId: plainObj.contractClassId || plainObj.originalContractClassId,
      initializationHash: plainObj.initializationHash,
      publicKeys: plainObj.publicKeys,
      address: plainObj.address,
      toFields: () => { console.log("called toFields"); return []; } // hack
    };
    console.log("Method 2 created dummy");
  } catch(e) {}
}
main().catch(console.error);
