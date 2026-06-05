import { Fr } from '@aztec/aztec.js/fields';
import { deriveKeys } from '@aztec/aztec.js/keys';
import { getSchnorrAccountContractAddress } from '@aztec/accounts/schnorr';

const SECRET_KEY = '0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f';

async function main() {
    const secretKey = Fr.fromString(SECRET_KEY);

    // Derive the signing key from the secret key using deriveKeys
    const derived = deriveKeys(secretKey);
    console.log('Derived keys:', JSON.stringify(derived, null, 2).slice(0, 300));
    
    // getSchnorrAccountContractAddress computes the address deterministically
    // Try calling it with what we have
    const address = await getSchnorrAccountContractAddress(secretKey as any, secretKey as any);

    console.log('\n========================================');
    console.log('✅ AZTEC ADDRESS (paste into faucet):');
    console.log(address.toString());
    console.log('Length:', address.toString().length);
    console.log('========================================\n');
    console.log('Go to: https://aztec-faucet.nethermind.io');
    console.log('Paste the address above to request Fee Juice');
}

main().catch(e => {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
});
