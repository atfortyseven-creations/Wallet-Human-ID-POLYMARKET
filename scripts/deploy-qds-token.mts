import { createPXEClient, waitForPXE } from '@aztec/aztec.js';
import { AccountManager } from '@aztec/aztec.js/wallet';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { deriveSigningKey } from '@aztec/stdlib/keys';
import { Fr } from '@aztec/foundation/curves/bn254';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

const PXE_URL = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
const RELAYER_SECRET_KEY = process.env.AZTEC_RELAYER_SECRET_KEY || '';

if (!RELAYER_SECRET_KEY) {
    console.error("❌ ERROR: AZTEC_RELAYER_SECRET_KEY is required in environment variables.");
    process.exit(1);
}

async function main() {
    console.log(`🔗 Connecting to PXE at ${PXE_URL}...`);
    const pxe = createPXEClient(PXE_URL);
    await waitForPXE(pxe);
    
    console.log(`\n🔑 Initializing Wallet from Secret Key...`);
    const secretKey = Fr.fromString(RELAYER_SECRET_KEY);
    const signingKey = deriveSigningKey(secretKey);
    const accountContract = new SchnorrAccountContract(signingKey);
    
    // Create Account Manager
    const accountManager = await AccountManager.create(pxe, secretKey, accountContract, Fr.ZERO);
    
    // Get the wallet
    const wallet = await accountManager.getAccount();
    const adminAddress = wallet.getAddress();
    
    console.log(`✅ Wallet loaded! Address: ${adminAddress.toString()}`);
    
    console.log(`\n⏳ Deploying QDs TokenContract...`);
    const name = "Quantum Dots";
    const symbol = "QDs";
    const decimals = 18n;
    
    try {
        const deployMethod = TokenContract.deploy(wallet, adminAddress, name, symbol, decimals);
        console.log(`   Waiting for deployment to be mined...`);
        const receipt = await deployMethod.send().wait();
        
        console.log(`✅ QDs Token deployed successfully!`);
        console.log(`   Contract Address: ${receipt.contract.address.toString()}`);
        console.log(`\n📝 Add this to your Railway / .env:`);
        console.log(`AZTEC_TOKEN_CONTRACT_ADDRESS=${receipt.contract.address.toString()}`);
    } catch (e) {
        console.error("❌ Deployment failed:", e);
    }
}

main().catch(console.error);
