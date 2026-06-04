import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';

// NOTE: Biconomy core SDK would typically be used here for client-side AA.
// Since this is the server-side Relayer module, we use raw Viem to sign and sponsor the batched Merkle root transactions.
// The actual Client-side SDK would use @biconomy/account to wrap the user's EOA into a Smart Account.

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
const BICONOMY_PAYMASTER_URL = process.env.BICONOMY_PAYMASTER_URL || '';

export const relayerAccount = privateKeyToAccount(RELAYER_PRIVATE_KEY as `0x${string}`);

export const relayerClient = createWalletClient({
  account: relayerAccount,
  chain: optimism,
  transport: http(process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io'),
});

/**
 * Initiates an ERC-4337 Sponsored Transaction using Biconomy's Paymaster
 * @param userOp The raw UserOperation
 */
export async function sponsorUserOperation(userOp: any): Promise<any> {
    if (!BICONOMY_PAYMASTER_URL) {
        throw new Error('BICONOMY_PAYMASTER_URL not configured. Cannot sponsor gas.');
    }

    try {
        const response = await fetch(BICONOMY_PAYMASTER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'pm_sponsorUserOperation',
                params: [userOp, { policyId: process.env.BICONOMY_POLICY_ID }],
                id: Date.now(),
                jsonrpc: '2.0',
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.result;
    } catch (error) {
        console.error('[Biconomy] Failed to sponsor UserOp:', error);
        throw error;
    }
}
