import { AccountManager } from '@aztec/aztec.js/wallet';
import { Fr } from '@aztec/aztec.js/fields';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { createAztecNodeClient } from '@aztec/aztec.js/node';

async function main() {
  const pxe = createAztecNodeClient('http://localhost:8080');
  const sk = Fr.random();
  const manager = await AccountManager.create(pxe, sk, new SchnorrAccountContract(sk as any));
  const account = await manager.getAccount();
  const wallet = await manager.getWallet();
  console.log("account", account);
  console.log("wallet", wallet);
}

main().catch(console.error);
