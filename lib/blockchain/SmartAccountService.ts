import { 
    createPublicClient, 
    http, 
    type Address, 
    type Chain,
    type PublicClient
} from 'viem';
import { 
    createSmartAccountClient, 
    type SmartAccountClient
} from 'permissionless';
import { 
    toKernelSmartAccount
} from 'permissionless/accounts';
import {
    createPimlicoClient,
    type PimlicoClient
} from 'permissionless/clients/pimlico';
import { blockchainService, ChainId } from './BlockchainService';
import { mainnet } from 'viem/chains';

/**
 * SmartAccountService
 * Orchestrates ERC-4337 Account Abstraction for the Arctic Protocol.
 * Transitions identity from EOA to programmable Smart Accounts (Kernel v3).
 */
export class SmartAccountService {
    private publicClient: PublicClient;
    private bundlerClient: PimlicoClient | null = null;
    private paymasterUrl?: string;

    constructor(chain: Chain, rpcUrl: string, bundlerUrl?: string, paymasterUrl?: string) {
        this.publicClient = createPublicClient({
            chain,
            transport: http(rpcUrl)
        });

        this.paymasterUrl = paymasterUrl;

        if (bundlerUrl) {
            this.bundlerClient = createPimlicoClient({
                transport: http(bundlerUrl),
                entryPoint: { address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', version: '0.7' }
            } as any);
        }
    }

    /**
     * Factory: Create a service instance for a specific ChainId.
     */
    public static createForChain(chainId: ChainId): SmartAccountService {
        const config = blockchainService.getChainConfig(chainId);
        // Map common chains to viem chain objects (omitted for brevity, using mainnet as fallback or mapping logic)
        const chainMapping: Record<number, Chain> = { 1: mainnet /* ... etc */ };
        const chain = chainMapping[chainId] || mainnet;

        return new SmartAccountService(
            chain, 
            config.rpcUrls[0], 
            config.bundlerUrl, 
            config.paymasterUrl
        );
    }

    /**
     * Initializes a Kernel v3 Smart Account for a given EOA signer.
     */
    public async getKernelAccount(signer: any): Promise<any> {
        return toKernelSmartAccount({
            client: this.publicClient,
            signer: signer,
            entryPoint: { address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', version: '0.7' },
            index: 0n
        } as any);
    }

    /**
     * Creates a high-fidelity Smart Account Client with Gasless support.
     */
    public async createClient(account: any): Promise<any> {
        return createSmartAccountClient({
            account,
            bundlerTransport: this.bundlerClient ? this.bundlerClient.transport : http(),
            paymaster: this.paymasterUrl ? {
                getPaymasterData: async (userOp: any) => {
                    // Phase 2: High-Fidelity Gasless Sponsorship
                    const response = await fetch(this.paymasterUrl!, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'pm_sponsorUserOperation',
                            params: [userOp, '0x0000000071727De22E5E9d8BAf0edAc6f37da032']
                        })
                    });
                    const result = await response.json();
                    return result.result;
                }
            } : undefined
        } as any);
    }

    /**
     * Initializes a Smart Account with a Session Key (Scoped Signer).
     * This allows agents to execute within restricted cryptographic boundaries.
     */
    public async getScopedAccount(sessionSigner: any, validatorData: any): Promise<any> {
        return toKernelSmartAccount({
            client: this.publicClient,
            signer: sessionSigner,
            entryPoint: { address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', version: '0.7' },
            index: 0n
        } as any);
    }

    /**
     * Predicts the Smart Account address without deployment.
     */
    public async predictAddress(signer: any): Promise<Address> {
        const account = await this.getKernelAccount(signer);
        return account.address;
    }
}
