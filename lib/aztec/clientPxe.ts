"use client";

import { createAztecNodeClient, waitForNode } from '@aztec/aztec.js/node';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { Fr } from '@aztec/aztec.js/fields';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

/**
 * OPTION B: Client-Side PXE Execution
 * 
 * This function connects the user's browser directly to their local Aztec PXE 
 * (http://localhost:8080) to generate the Zero-Knowledge Proof locally.
 * 
 * Note: Running @aztec/aztec.js natively in a browser environment requires 
 * specific Webpack WASM and Node.js polyfills (crypto, stream, path, os) 
 * which must be configured in next.config.js. 
 */
export async function executeLocalAztecTransfer(
    entropyHex: string, 
    toAddressHex: string, 
    amount: number,
    pxeUrl: string = 'http://localhost:8080',
    contractAddressHex: string = process.env.NEXT_PUBLIC_AZTEC_QDS_CONTRACT_ADDRESS || ''
) {
    if (!contractAddressHex) {
        throw new Error('Aztec QDs Contract Address is not configured.');
    }

    // 1. Connect to local PXE running on user's machine
    const pxe = createAztecNodeClient(pxeUrl);
    await waitForNode(pxe);

    // 2. Reconstruct the user's account from the EIP-191 signature entropy
    const secretKey = Fr.fromString(entropyHex);
    const senderAccount = await getSchnorrAccount(pxe, secretKey, Fr.ZERO, Fr.ZERO);
    
    // Register the account on the local PXE if not already registered
    await senderAccount.waitSetup();
    const wallet = await senderAccount.getWallet();

    // 3. Bind to the Token Contract
    const contract = await TokenContract.at(AztecAddress.fromString(contractAddressHex), wallet);
    const toAddress = AztecAddress.fromString(toAddressHex);

    // 4. Generate the ZK Proof locally and send to the Sequencer
    const nonce = Fr.random();
    console.log('Generating Zero-Knowledge Proof locally...');
    const tx = await contract.methods.transfer(senderAccount.getAddress(), toAddress, BigInt(amount), nonce).send().wait();
    
    return tx.txHash.toString();
}
