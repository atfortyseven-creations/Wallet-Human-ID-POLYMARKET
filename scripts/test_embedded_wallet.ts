import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';

async function main() {
  console.log('Creating EmbeddedWallet connected to Aztec Node...');
  const wallet = await EmbeddedWallet.create('https://v5.testnet.rpc.aztec-labs.com');
  console.log('Wallet created!');
  
  console.log('Creating Schnorr Account...');
  const secret = Fr.random();
  const salt = Fr.random();
  const accountManager = await wallet.createSchnorrAccount(secret, salt);
  const address = accountManager.getAddress();
  
  console.log(`Account created with address: ${address.toString()}`);
  process.exit(0);
}

main().catch(console.error);
