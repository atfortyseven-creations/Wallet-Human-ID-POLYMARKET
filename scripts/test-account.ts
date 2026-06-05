import { Fr } from '@aztec/aztec.js/fields';
import { AccountManager } from '@aztec/aztec.js/wallet';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { deriveMasterIncomingViewingSecretKey } from '@aztec/aztec.js/keys';

async function main() {
    const secretKey = Fr.random();
    const signingKey = deriveMasterIncomingViewingSecretKey(secretKey);
    const contract = new SchnorrAccountContract(signingKey as any);
    
    // We just need a dummy PXE client to see if AccountManager works
    const pxe = createAztecNodeClient('http://localhost:8080');
    
    const manager = await AccountManager.create(pxe, secretKey, contract);
    const wallet = await manager.getWallet();
    const address = wallet.getAddress();
    console.log("Wallet address:", address.toString());
}
main().catch(e => console.error("Error:", e.message));
