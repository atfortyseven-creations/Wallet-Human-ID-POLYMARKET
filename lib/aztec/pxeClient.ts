// @ts-nocheck
// lib/aztec/pxeClient.ts
import { createPXEClient } from '@aztec/aztec.js/wallet';
import { getContractAt } from '@aztec/aztec.js/contracts';
import { getWallet } from '@aztec/aztec.js/wallet';
// createAccount removed in v4 — use getSchnorrAccount from @aztec/accounts/schnorr

// Phase 4: Frontend Integration
// Private System direct connection to Aztec PXE
export const initializePrivatePXE = async () => {
    try {
        const pxeUrl = process.env.AZTEC_PXE_URL || 'http://localhost:18080';
        const pxe = createPXEClient(pxeUrl);
        
        // Wait for Active Sandbox initialization
        await pxe.getNodeInfo();
        
        const accounts = await pxe.getRegisteredAccounts();
        if (accounts.length === 0) throw new Error("No sandbox accounts found");
        const sandboxAccount = accounts[0];
        const coreWallet = await getWallet(pxe, sandboxAccount.address, sandboxAccount);
        
        return { pxe, coreWallet, status: 'LEGENDARY' };
    } catch (error) {
        console.error('PXE Connection Offline. Entering Degraded Metrics Mode.', error);
        throw error;
    }
};

export const verifyWhaleAlertOnChain = async (pxeClient: any, wallet: any, contractAddress: any, abi: any, args: any) => {
    // Generate proof client-side without exposing System parameters
    const contract = await getContractAt(contractAddress, abi, wallet);
    const proof = await contract.methods.verify_whale_alert(...args).prove();
    return proof;
};

