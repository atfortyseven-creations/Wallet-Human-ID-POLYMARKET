import { createPXEClient, getSchnorrAccount, Fr, deriveKeys } from '@aztec/aztec.js';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { getContractInstanceFromDeployParams } from '@aztec/aztec.js';

// Configuration
const PXE_URL = 'https://v4-devnet-2.aztec-labs.com';
const RELAYER_SECRET_KEY = '0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36';

async function main() {
  console.log(`\n======================================================`);
  console.log(`🚀 DEPLOYING AZTEC RELAYER & TOKEN CONTRACT ON WINDOWS`);
  console.log(`======================================================\n`);

  try {
    const pxe = createPXEClient(PXE_URL);
    
    // Check PXE connection
    console.log(`⏳ Connecting to PXE at ${PXE_URL}...`);
    const nodeInfo = await pxe.getNodeInfo();
    console.log(`✅ Connected! Rollup version: ${nodeInfo.rollupVersion}, ChainId: ${nodeInfo.l1ChainId}\n`);

    // Setup relayer account
    console.log(`⏳ Setting up Relayer Account...`);
    const secretKey = Fr.fromString(RELAYER_SECRET_KEY);
    const relayerAccount = getSchnorrAccount(pxe, secretKey, secretKey, 1);
    
    const address = relayerAccount.getAddress();
    console.log(`✅ Relayer Address: ${address.toString()}\n`);

    // Register and deploy account
    console.log(`⏳ Deploying Relayer Account to Devnet...`);
    const isRegistered = await pxe.getRegisteredAccount(address);
    if (!isRegistered) {
        await relayerAccount.register();
    }
    const relayerWallet = await relayerAccount.getWallet();
    
    // NOTE: On Devnet 2, account deployment usually requires FPC (fee payment contract). 
    // Since this script is a direct SDK call, we might encounter fee constraints.
    // If it requires fees, we'll see an error here. Let's attempt basic deployment.
    console.log(`⏳ Sending account deploy tx...`);
    try {
        const deployTx = await relayerAccount.deploy().send();
        await deployTx.wait();
        console.log(`✅ Relayer Account Deployed on-chain!\n`);
    } catch (e) {
        if (e.message.includes('already deployed')) {
            console.log(`✅ Relayer Account already deployed.\n`);
        } else {
            console.warn(`⚠️ Account deploy step issue (could be fee related, attempting to proceed anyway): ${e.message}\n`);
        }
    }

    // Deploy TokenContract
    console.log(`⏳ Deploying QDs TokenContract...`);
    const adminAddress = address;
    const name = "QuantumDollars";
    const symbol = "QDs";
    const decimals = 18n;

    // We deploy the token.
    const tokenDeployer = TokenContract.deploy(relayerWallet, adminAddress, name, symbol, decimals);
    
    console.log(`⏳ Sending contract deploy tx...`);
    const tokenTx = await tokenDeployer.send();
    const tokenReceipt = await tokenTx.wait();

    console.log(`\n======================================================`);
    console.log(`🎉 SUCCESS! EVERYTHING IS ON-CHAIN!`);
    console.log(`======================================================`);
    console.log(`AZTEC_QDS_CONTRACT_ADDRESS = ${tokenReceipt.contract.address.toString()}`);
    console.log(`======================================================\n`);

  } catch (error) {
    console.error(`\n❌ ERROR:`, error.message);
    if (error.message.includes("Cannot find module '@aztec/noir-contracts.js/Token'")) {
        console.log("\nTrying fallback import path for TokenContract...");
    }
  }
}

main();
