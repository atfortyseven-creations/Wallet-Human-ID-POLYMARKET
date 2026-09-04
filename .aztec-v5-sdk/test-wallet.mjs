import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';

const NODE_URL = 'https://node.aztec.network';
const SECRET_HEX = '0x1234567890123456789012345678901234567890123456789012345678901234';

async function main() {
    const node = await createAztecNodeClient(NODE_URL);
    console.log('Node connected, block number:', await node.getBlockNumber());
    
    console.log('Creating embedded wallet...');
    const wallet = await EmbeddedWallet.create(NODE_URL);
    
    console.log('Creating schnorr account locally in wallet...');
    const secretKey = Fr.fromString(SECRET_HEX);
    const accountManager = await wallet.createSchnorrAccount(secretKey, new Fr(0));
    
    console.log('Account Address:', accountManager.address.toString());
    
    process.exit(0);
}
main().catch(console.error);
