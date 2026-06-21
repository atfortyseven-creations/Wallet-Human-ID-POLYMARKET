import { NextResponse } from 'next/server';
import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/aztec.js/keys';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { createPXEClient } from '@aztec/aztec.js/wallet';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pxeUrl = process.env.AZTEC_PXE_URL || 'http://localhost:8080';
    console.log(`[Deployer] Connecting to PXE at ${pxeUrl}...`);
    const pxe = createPXEClient(pxeUrl);

    await pxe.getNodeInfo();
    
    // User's secret key generated earlier
    const secretKeyHex = process.env.AZTEC_RELAYER_SECRET_KEY || '0x002be8c287a3a36a7f3277f9cbba0b1a98feb9c08249cc5cedab7b5cf4052216';
    const secretKey = Fr.fromString(secretKeyHex);
    const signingKey = deriveSigningKey(secretKey);

    console.log('[Deployer] Registering account...');
    const account = getSchnorrAccount(pxe, secretKey, signingKey);
    const wallet = await account.waitDeploy();
    const adminAddress = await account.getAddress();
    
    console.log(`[Deployer] Account ready: ${adminAddress.toString()}`);
    console.log('[Deployer] Deploying TokenContract...');

    const contract = await TokenContract.deploy(wallet, adminAddress, 'Quantum Dollars', 'QDs', 18n).send().deployed();
    const contractAddress = contract.address.toString();

    return NextResponse.json({
      success: true,
      pxeUrl,
      adminAddress: adminAddress.toString(),
      contractAddress,
      message: 'TokenContract deployed successfully!'
    });
  } catch (error: any) {
    console.error('[Deployer] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
