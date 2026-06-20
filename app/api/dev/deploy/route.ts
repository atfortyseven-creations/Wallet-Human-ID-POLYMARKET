import { NextResponse } from 'next/server';
import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { AccountManager } from '@aztec/aztec.js/wallet';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { Fr } from '@aztec/aztec.js/fields';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { AztecAddress } from '@aztec/aztec.js/addresses';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const PXE_URL = process.env.AZTEC_NODE_URL || 'http://localhost:8080';
    const RELAYER_SECRET_KEY = process.env.RELAYER_SECRET_KEY || '0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36';

    const pxe = createAztecNodeClient(PXE_URL);
    
    // Quick check to avoid infinite waitForNode loops if server is down
    let nodeInfo;
    try {
        nodeInfo = await pxe.getNodeInfo();
    } catch (e: any) {
        console.error(`❌ Aztec network unreachable at ${PXE_URL}. Ensure Sandbox is running.`);
        return NextResponse.json({ success: false, error: 'Aztec network unreachable. Start the Sandbox.' }, { status: 503 });
    }

    console.log(`✅ Connected to PXE! Rollup version: ${nodeInfo.rollupVersion}`);

    const secretKey = Fr.fromString(RELAYER_SECRET_KEY);
    const accountContract = new SchnorrAccountContract(secretKey);
    const accountManager = await AccountManager.create(pxe, secretKey, accountContract);
    
    const wallet = await accountManager.getWallet();
    const address = wallet.getAddress();
    console.log(`✅ Relayer Address: ${address.toString()}`);

    console.log(`⏳ Deploying Relayer Account...`);
    try {
        const deployTx = await accountManager.deploy().send();
        await deployTx.wait();
        console.log(`✅ Relayer Account Deployed!`);
    } catch (e: any) {
        if (e.message.includes('already deployed') || e.message.includes('Already registered')) {
            console.log(`✅ Relayer Account already deployed.`);
        } else {
            console.warn(`⚠️ Account deploy error: ${e.message}`);
        }
    }

    // Deploy TokenContract
    console.log(`⏳ Deploying TokenContract...`);
    const adminAddress = address;
    const name = "QuantumDollars";
    const symbol = "QDs";
    const decimals = 18n;

    const tokenDeployer = TokenContract.deploy(wallet, adminAddress, name, symbol, decimals);
    
    console.log(`⏳ Sending contract deploy tx...`);
    const tokenTx = tokenDeployer.send(); // Use send() explicitly
    const tokenReceipt = await tokenTx.wait();

    const result = {
      success: true,
      relayerAddress: address.toString(),
      contractAddress: tokenReceipt.contract.address.toString(),
    };
    console.log(`🎉 SUCCESS! Contract Address: ${result.contractAddress}`);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`❌ ERROR:`, error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
