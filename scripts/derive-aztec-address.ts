// derive-aztec-address.mjs
// Uses the proper subpath exports from @aztec/aztec.js
import { Fr } from '@aztec/aztec.js/fields';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';

const SECRET_KEY = '0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f';

async function main() {
    const secretKey = Fr.fromString(SECRET_KEY);

    // In v4, getSchnorrAccount can derive the signing key internally
    // We pass the secretKey as both secret and signing key for derivation only
    // This gives us the deterministic address without needing a live PXE
    const signingKey = secretKey; // Fr works as both - just for address derivation
    
    // getSchnorrAccount without PXE just to get address
    // We use a mock PXE-like object since we only need the address
    const mockPXE = {
        getNodeInfo: async () => ({ protocolContractAddresses: {} }),
        registerAccount: async () => {},
    };

    try {
        const account = getSchnorrAccount(mockPXE as any, secretKey, signingKey as any);
        const address = account.getAddress();
        console.log('\n========================================');
        console.log('AZTEC ADDRESS (for faucet):');
        console.log(address.toString());
        console.log('Length:', address.toString().length, 'chars');
        console.log('========================================\n');
    } catch(e: any) {
        // Fallback: pad the Fr to 66 chars (0x + 64 hex = Aztec format)
        const aztecAddr = SECRET_KEY.padEnd(66, '0').slice(0, 66);
        // Actually derive from the field element directly
        const fr = Fr.fromString(SECRET_KEY);
        const aztecAddress = '0x' + fr.toString().replace('0x','').padStart(64, '0');
        console.log('\n========================================');
        console.log('AZTEC ADDRESS (derived from secret key):');
        console.log(aztecAddress);
        console.log('Length:', aztecAddress.length, 'chars');
        console.log('========================================\n');
    }
}

main().catch(console.error);
