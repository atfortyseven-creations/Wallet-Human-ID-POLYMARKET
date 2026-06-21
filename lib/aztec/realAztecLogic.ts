// @ts-nocheck
import { createPXEClient } from '@aztec/foundation/json-rpc/client';
import { AccountManager } from '@aztec/aztec.js/wallet';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { Fr } from '@aztec/aztec.js/fields';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

// The URL of the PXE/Node. For the backend, this must be a public testnet node 
// or a hosted Sandbox. It cannot be localhost unless the Sandbox runs on the same server.
const PXE_URL = process.env.AZTEC_PXE_URL || process.env.AZTEC_NODE_URL || 'http://localhost:8080';
const CONTRACT_ADDRESS = process.env.AZTEC_QDS_CONTRACT_ADDRESS || '';
const RELAYER_SECRET = process.env.RELAYER_SECRET_KEY || '';

async function ensureNodeConnection(pxe: any) {
    try {
        await pxe.getNodeInfo();
        return true;
    } catch (e) {
        console.error(`❌ Aztec network unreachable at ${PXE_URL}. Ensure Sandbox is running.`);
        return false;
    }
}

export async function mintPrivateQDs(toAddressHex: string, amount: number) {
    if (!CONTRACT_ADDRESS || !RELAYER_SECRET) {
        console.warn('⚠️ Missing AZTEC_QDS_CONTRACT_ADDRESS or RELAYER_SECRET_KEY. Skipping real Aztec tx.');
        return null;
    }

    const pxe = createPXEClient(PXE_URL);
    if (!(await ensureNodeConnection(pxe))) return null;

    const secretKey = Fr.fromString(RELAYER_SECRET);
    const accountContract = new SchnorrAccountContract(secretKey);
    const accountManager = await AccountManager.create(pxe, secretKey, accountContract);
    const wallet = await accountManager.getWallet();

    const contract = await TokenContract.at(AztecAddress.fromString(CONTRACT_ADDRESS), wallet);
    const toAddress = AztecAddress.fromString(toAddressHex);

    console.log(`Minting ${amount} QDs to ${toAddress.toString()} on Aztec Testnet...`);
    
    // Call the Noir smart contract mint function
    const tx = await contract.methods.mint_private(toAddress, BigInt(amount)).send().wait();
    
    return tx.txHash.toString();
}

export async function transferPrivateQDs(senderSecretHex: string, toAddressHex: string, amount: number) {
    const pxe = createPXEClient(PXE_URL);
    if (!(await ensureNodeConnection(pxe))) return null;

    const secretKey = Fr.fromString(senderSecretHex);
    const accountContract = new SchnorrAccountContract(secretKey);
    const accountManager = await AccountManager.create(pxe, secretKey, accountContract);
    const wallet = await accountManager.getWallet();

    const contract = await TokenContract.at(AztecAddress.fromString(CONTRACT_ADDRESS), wallet);
    const toAddress = AztecAddress.fromString(toAddressHex);

    console.log(`Transferring ${amount} QDs from ${wallet.getAddress().toString()} to ${toAddress.toString()}...`);
    
    // Nonce is required for private transfers in some Noir contracts
    const nonce = Fr.random();
    
    const tx = await contract.methods.transfer(wallet.getAddress(), toAddress, BigInt(amount), nonce).send().wait();
    
    return tx.txHash.toString();
}

