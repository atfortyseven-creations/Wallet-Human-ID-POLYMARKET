import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { deriveSigningKey } from '@aztec/stdlib/keys';

async function main() {
  const embeddedWallet = await EmbeddedWallet.create('https://v5.testnet.rpc.aztec-labs.com', { ephemeral: true });
  const secretKey = Fr.random();
  const signingKey = deriveSigningKey(secretKey);
  const accountManager = await embeddedWallet.createSchnorrAccount(secretKey, Fr.ZERO, signingKey, 'test');
  
  console.log("AccountManager keys:", Object.keys(accountManager));
  console.log("AccountManager proto keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(accountManager)));
  
  if (typeof accountManager.getWallet === 'function') {
    console.log("getWallet exists!");
  } else {
    console.log("getWallet DOES NOT exist.");
  }
  
  if (typeof accountManager.getAccount === 'function') {
    console.log("getAccount exists!");
  }
  
  await embeddedWallet.stop();
}

main().catch(console.error);
