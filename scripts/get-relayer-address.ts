import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/aztec.js/keys';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { createAztecNodeClient } from '@aztec/aztec.js/node';

const SECRET = process.env.AZTEC_RELAYER_SECRET_KEY || '0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f';
const PXE_URL = process.env.AZTEC_PXE_URL || 'https://aztec-mainnet.drpc.org';

async function main() {
    console.log('\n🔗 Connecting to Aztec node:', PXE_URL);
    const pxe = createAztecNodeClient(PXE_URL);

    const secretKey  = Fr.fromString(SECRET);
    const signingKey = deriveSigningKey(secretKey);
    const account    = getSchnorrAccount(pxe, secretKey, signingKey);
    
    const address = account.getAddress();
    
    console.log('\n========================================');
    console.log('RELAYER ADDRESS (for faucet):');
    console.log(address.toString());
    console.log('========================================');
    console.log('\n👉 Go to: https://aztec-faucet.nethermind.io');
    console.log('   Paste the address above to get Fee Juice\n');
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
