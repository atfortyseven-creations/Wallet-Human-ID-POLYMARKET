import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

const NODE_URL = 'https://node.aztec.network/';
const SECRET_HEX = process.env.AZTEC_RELAYER_SECRET_KEY;

async function main() {
  const node = await createAztecNodeClient(NODE_URL);
  const info = await node.getNodeInfo();
  const feeJuiceAddress = info.protocolContractAddresses.feeJuiceAddress;

  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  const secretKey = Fr.fromHexString(SECRET_HEX);
  await wallet.registerAccount();
  const accountManager = await wallet.createSchnorrAccount(secretKey, Fr.ZERO, secretKey);
  const addr = accountManager.address;
  console.log("Relayer Address:", addr.toString());

  const feeJuice = await TokenContract.at(feeJuiceAddress, wallet);
  const bal = await feeJuice.methods.balance_of_public(addr).simulate();
  console.log("FeeJuice public balance:", bal.toString());
  
  process.exit(0);
}
main().catch(console.error);
