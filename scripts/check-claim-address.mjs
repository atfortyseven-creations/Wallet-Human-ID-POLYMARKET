import { EmbeddedWallet } from '@aztec-rc/wallets/embedded';
import { Fr } from '@aztec-rc/aztec.js/fields';

async function main() {
  const accountSecret = '0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f';
  const nodeUrl = "https://rpc.testnet.aztec-labs.com";
  
  const wallet = await EmbeddedWallet.create(nodeUrl, {
    ephemeral: true,
    pxeConfig: { proverEnabled: true },
  });
  const secretKey = Fr.fromHexString(accountSecret);
  const accountManager = await wallet.createSchnorrAccount(secretKey, Fr.ZERO);
  console.log('Claim Script Address:', accountManager.address.toString());
  await wallet.stop();
}

main().catch(console.error);
