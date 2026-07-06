import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { AztecAddress } from '@aztec/stdlib/aztec-address';

async function main() {
  const NODE_URL = 'https://v5.testnet.rpc.aztec-labs.com/';
  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  
  const fpcStr = '0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880';
  const fpcAddress = AztecAddress.fromString(fpcStr);

  try {
    const pxe = wallet; // EmbeddedWallet implements PXE
    const instance = await pxe.getContractInstance(fpcAddress);
    console.log("Found instance in PXE:", instance);
  } catch(e) {
    console.error("Not found in PXE:", e.message);
  }

  // Let's try Node methods
  const node = await createAztecNodeClient(NODE_URL);
  const keys = [];
  for (let key in node) {
    keys.push(key);
  }
  console.log("Node methods:", keys);
}
main().catch(console.error);
