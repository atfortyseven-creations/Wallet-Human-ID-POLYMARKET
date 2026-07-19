import { useState, useCallback } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { lifiService } from '@/lib/wallet/lifi-service';
import { parseUnits } from 'viem';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { erc20Abi } from 'viem';

export interface SwapParams {
    fromChain: number;
    toChain: number;
    fromToken: string; // Can be symbol or address
    toToken: string; // Can be symbol or address
    fromAmount: string;
    fromTokenAddress?: string; // Optional direct address
    toTokenAddress?: string; // Optional direct address
    slippage?: number;
}

// Token address mapping (Token Translation layer)
const TOKEN_MAP: Record<number, Record<string, string>> = {
    1: { // Ethereum
        'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
        'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        'AUTH': '0x163f8c2467924be0ae7b5347228cabf260318753',
        'ETH': '0x0000000000000000000000000000000000000000',
        'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        'BNB': '0x0000000000000000000000000000000000000000'
    },
    137: { // Polygon
        'USDT': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        'USDC': '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        'AUTH': '0x163f8c2467924be0ae7b5347228cabf260318753',
        'POL': '0x0000000000000000000000000000000000000000',
        'MATIC': '0x0000000000000000000000000000000000000000',
        'ETH': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    },
    8453: { // Base
        'USDC': '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        'ETH': '0x0000000000000000000000000000000000000000',
        'AUTH': '0x163f8c2467924be0ae7b5347228cabf260318753'
    },
    480: { // World Chain
        'AUTH': '0x2cFc85d8E48F8EAB294be644d9E25C3030863003',
        'USDC': '0x79A02482A880bCE3F13e09Da970dC34db4CD68d7',
        'ETH': '0x0000000000000000000000000000000000000000'
    },
    10: { // Optimism
        'AUTH': '0x163f8c2467924be0ae7b5347228cabf260318753',
        'USDC': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        'ETH': '0x0000000000000000000000000000000000000000'
    },
    42161: { // Arbitrum
        'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        'AUTH': '0x163f8c2467924be0ae7b5347228cabf260318753',
        'ETH': '0x0000000000000000000000000000000000000000'
    }
};

/**
 * [Elite] hook for Transaction Execution
 * Manages Approval -> Sign -> Broadcast -> DB Sync
 */

const getRpcUrl = (chainId: number) => {
    switch(chainId) {
        case 137: return "https://polygon-rpc.com";
        case 8453: return "https://mainnet.base.org";
        case 42161: return "https://arb1.arbitrum.io/rpc";
        case 10: return "https://mainnet.optimism.io";
        case 56: return "https://bsc-dataseed.binance.org";
        case 480: return "https://worldchain-mainnet.g.alchemy.com/public";
        default: return "https://cloudflare-eth.com";
    }
};

export function useEliteSwap() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const store = useWalletStore();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'quoting' | 'approving' | 'signing' | 'broadcasting' | 'synced' | 'failed'>('idle');

    // Helper function to resolve token address from symbol (The "Token Translation" Layer)
    const resolveTokenAddress = (tokenSymbolOrAddress: string, chainId: number): string => {
        if (!tokenSymbolOrAddress) return '0x0000000000000000000000000000000000000000';
        
        // If it's already an address
        if (tokenSymbolOrAddress.startsWith('0x') && tokenSymbolOrAddress.length === 42) {
            return tokenSymbolOrAddress;
        }

        // Native gas token universal fallback if not in map
        const upperToken = tokenSymbolOrAddress.toUpperCase();
        if (upperToken === 'ETH' || upperToken === 'POL' || upperToken === 'MATIC' || upperToken === 'BNB' || upperToken === 'AVAX') {
            return '0x0000000000000000000000000000000000000000';
        }
        
        const chainTokens = TOKEN_MAP[chainId] || {};
        const address = chainTokens[upperToken];
        
        if (!address) {
            console.warn(`[EliteSwap] Token translation missing for ${upperToken} on chain ${chainId}. Falling back to Li.Fi auto-resolution.`);
            return upperToken; // Li.Fi can often resolve symbols directly if mapping fails
        }
        
        return address;
    };

    const executeSwap = useCallback(async (params: SwapParams) => {
        const isSystemWallet = !!store.privateKey;
        if (!address || (!walletClient && !isSystemWallet)) {
            setError('Wallet not connected');
            throw new Error('Wallet not connected');
        }

        setLoading(true);
        setError(null);
        setStatus('quoting');

        try {
            // 1. RESOLVE TOKEN ADDRESSES
            const fromTokenAddress = params.fromTokenAddress || resolveTokenAddress(params.fromToken, params.fromChain);
            const toTokenAddress = params.toTokenAddress || resolveTokenAddress(params.toToken, params.toChain);

            console.log('[Elite] Resolved Tokens:', {
                from: `${params.fromToken} -> ${fromTokenAddress}`,
                to: `${params.toToken} -> ${toTokenAddress}`
            });

            // 2. GET QUOTE FROM LI.FI
            console.log('[Elite] Fetching Elite quote...');
            const quote = await lifiService.getQuote({
                fromChain: params.fromChain,
                toChain: params.toChain,
                fromToken: fromTokenAddress,
                toToken: toTokenAddress,
                fromAmount: params.fromAmount,
                fromAddress: address,
                toAddress: address,
                slippage: params.slippage || 0.005
            });

            const { transactionRequest, estimate } = quote;

            // 3. [MEV PROTECTION] Verify slippage and price impact
            if (estimate?.priceImpact && estimate.priceImpact > 0.05) {
                throw new Error('[SECURITY] Excessive price impact detected. Execution halted.');
            }

            // 3.5 [APPROVAL] Check and grant allowance if ERC20
            if (fromTokenAddress !== '0x0000000000000000000000000000000000000000') {
                setStatus('approving');
                console.log('[Elite] Checking token allowance...');
                
                if (walletClient && publicClient) {
                    const allowance = await publicClient.readContract({
                        address: fromTokenAddress as `0x${string}`,
                        abi: erc20Abi,
                        functionName: 'allowance',
                        args: [address as `0x${string}`, transactionRequest.to as `0x${string}`]
                    });
                    
                    if (allowance < BigInt(params.fromAmount)) {
                        console.log('[Elite] Requesting approval for router...');
                        const hash = await walletClient.writeContract({
                            address: fromTokenAddress as `0x${string}`,
                            abi: erc20Abi,
                            functionName: 'approve',
                            args: [transactionRequest.to as `0x${string}`, BigInt(params.fromAmount)]
                        });
                        await publicClient.waitForTransactionReceipt({ hash });
                    }
                } else if (store.privateKey) {
                    const provider = new ethers.JsonRpcProvider(getRpcUrl(params.fromChain));
                    const wallet = new ethers.Wallet(store.privateKey, provider);
                    const contract = new ethers.Contract(fromTokenAddress, ['function allowance(address,address) public view returns (uint256)', 'function approve(address,uint256) public returns (bool)'], wallet);
                    const allowance = await contract.allowance(wallet.address, transactionRequest.to);
                    if (allowance < BigInt(params.fromAmount)) {
                        console.log('[Elite] Requesting embedded approval for router...');
                        const tx = await contract.approve(transactionRequest.to, params.fromAmount);
                        await tx.wait(1);
                    }
                }
            }

            // 4. EXECUTE
            setStatus('signing');
            console.log('[Elite] Requesting signature for Elite execution...');
            
            let hash = "";

            if (walletClient) {
                hash = await walletClient.sendTransaction({
                    to: transactionRequest.to as `0x${string}`,
                    data: transactionRequest.data as `0x${string}`,
                    value: BigInt(transactionRequest.value || '0'),
                    gas: transactionRequest.gasLimit ? BigInt(transactionRequest.gasLimit) : undefined,
                });
            } else if (store.privateKey) {
                const provider = new ethers.JsonRpcProvider(getRpcUrl(params.fromChain));
                const wallet = new ethers.Wallet(store.privateKey, provider);
                const tx = await wallet.sendTransaction({
                    to: transactionRequest.to,
                    data: transactionRequest.data,
                    value: BigInt(transactionRequest.value || '0')
                });
                await tx.wait(1);
                hash = tx.hash;
                store.updateBalance();
            }

            setStatus('broadcasting');
            console.log(`[Elite] Broadcast successful. Hash: ${hash}`);

            // 5. [DUAL PERSISTENCE] Sync with Backend
            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hash,
                    userId: address,
                    type: params.fromChain === params.toChain ? 'SWAP' : 'BRIDGE',
                    fromChain: params.fromChain,
                    toChain: params.toChain,
                    fromToken: fromTokenAddress,
                    toToken: toTokenAddress,
                    fromAmount: params.fromAmount,
                    metadata: {
                        aggregator: 'Li.Fi',
                        quoteId: quote.id,
                        slippage: params.slippage
                    }
                })
            }).catch(e => console.error('[Elite] DB Sync Failed:', e));

            setStatus('synced');
            console.log('[Elite] Transaction complete');
            
            return hash;

        } catch (err: any) {
            console.error('[Elite] Execution Error:', err);
            setError(err.message || 'Transaction failed');
            setStatus('failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [address, walletClient, publicClient, store]);

    return {
        executeSwap,
        resolveTokenAddress,
        loading,
        error,
        status,
        reset: () => {
            setStatus('idle');
            setError(null);
        }
    };
}

