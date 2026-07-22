import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

const NODE_URL = 'https://v5.testnet.rpc.aztec-labs.com/';
const SECRET_HEX = process.env.AZTEC_RELAYER_SECRET_KEY;

async function main() {
  const node = await createAztecNodeClient(NODE_URL);
  const info = await node.getNodeInfo();
  const feeJuiceAddress = info.protocolContractAddresses.feeJuiceAddress;
  console.log("Fee Juice Address:", feeJuiceAddress.toString());

  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  const secretKey = Fr.fromHexString(SECRET_HEX);
  await wallet.registerAccount();
  const accountManager = await wallet.createSchnorrAccount(secretKey, Fr.ZERO, secretKey);
  const addr = accountManager.address;
  console.log("My Address:", addr.toString());

  // Can we just call mint_public?
  const feeJuice = await TokenContract.at(feeJuiceAddress, wallet);
  
  // Mint 1000 Fee Juice
  const mintAmount = 1000n * 10n**18n;
  console.log("Minting Fee Juice natively (L2)...");
  
  // Try sending the mint Tx. Wait, if we have 0 fee juice, can we pay for the mint tx?
  // No! If we have 0 fee juice, we can't pay for the mint_public tx either!
  try {
    await feeJuice.methods.mint_public(addr, mintAmount).send().wait();
    console.log("Mint successful!");
  } catch(e) {
    console.error("Mint failed:", e.message);
  }
}
main().catch(console.error);
