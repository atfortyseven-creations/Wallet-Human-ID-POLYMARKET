import { createAztecNodeClient, waitForNode } from '@aztec/aztec.js/node';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { Fr } from '@aztec/aztec.js/fields';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { getWallet } from '@aztec/aztec.js/wallet';

const PXE_URL = process.env.AZTEC_PXE_URL || 'http://localhost:8080';

async function main() {
    console.log(`Connecting to PXE at ${PXE_URL}...`);
    const pxe = createAztecNodeClient(PXE_URL);
    await waitForNode(pxe);
    
    // We don't have createPXEClient, pxeClient.ts uses createAztecNodeClient as 'pxe'.
    // Let's assume createAztecNodeClient returns a PXE interface.
    
    console.log("Generating admin account...");
    const secretKey = Fr.random();
    const account = await getSchnorrAccount(pxe, secretKey, Fr.ZERO, Fr.ZERO);
    await account.waitSetup();
    const wallet = await account.getWallet();
    const adminAddress = account.getAddress();
    
    console.log(`Admin account deployed at ${adminAddress.toString()}`);
    
    console.log("Deploying QDs Token Contract...");
    // TokenContract.deploy parameters: admin, name, symbol, decimals
    const receipt = await TokenContract.deploy(wallet, adminAddress, "Quantum Dots", "QDs", 18n).send().wait();
    const contractAddress = receipt.contract.address.toString();
    
    console.log(`✅ QDs Token deployed at: ${contractAddress}`);
    console.log(`Add this to your .env file:`);
    console.log(`AZTEC_QDS_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`RELAYER_SECRET_KEY=${secretKey.toString()}`);
}

main().catch(console.error);
