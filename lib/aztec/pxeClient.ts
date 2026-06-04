// lib/aztec/pxeClient.ts
import { createPXEClient, getSandboxAccountsWallets } from '@aztec/aztec.js/rpc';
import { getContractAt } from '@aztec/aztec.js/contract';
// createAccount removed in v4 — use getSchnorrAccount from @aztec/accounts/schnorr

// Phase 4: Frontend Integration
// Private System direct connection to Aztec PXE
export const initializePrivatePXE = async () => {
    try {
        const pxeUrl = process.env.AZTEC_PXE_URL || 'http://localhost:8080';
        const pxe = createPXEClient(pxeUrl);
        
        // Wait for Active Sandbox initialization
        await pxe.getNodeInfo();
        
        const wallets = await getSandboxAccountsWallets(pxe);
        const coreWallet = wallets[0];
        
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
