"use client";

import { useEffect, useState, useRef } from 'react';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';

export interface VIPTransaction {
    hash: string;
    from: string;
    to: string;
    valueEth: number;
    valueUsd: number;
    feeUsd: number;
    gasPrice: number;
    timestamp: number;
    blockNumber: number;
    txType: 'TRANSFER' | 'CONTRACT_INTERACTION' | 'DEFI_ROUTING' | 'MEV_BOT' | 'UNKNOWN';
    methodSignature: string;
    methodName: string;
    direction: 'BUY' | 'SELL' | 'TRANSFER';
    aiRiskScore: number;
    anomalyDetected: boolean;
    network: string;
    tokenSymbol: string;
}

const SIGNATURE_DIRECTIONS: Record<string, 'BUY' | 'SELL' | 'TRANSFER'> = {
    '0x38ed1739': 'SELL', // Swap Exact Tokens (Tokens OUT)
    '0x7ff36ab5': 'BUY',  // Swap Exact ETH (Tokens IN)
    '0x18cbafe5': 'SELL', // Swap Exact Tokens For ETH (Tokens OUT)
    '0x4a25d94a': 'SELL', // Swap Tokens For Exact ETH (Tokens OUT)
    '0xd0e30db0': 'BUY', // Deposit / Wrap
    '0x2e1a7d4d': 'SELL', // Withdraw / Unwrap
};

const KNOWN_SIGNATURES: Record<string, string> = {
    '0xa9059cbb': 'ERC20 Transfer',
    '0x095ea7b3': 'ERC20 Approve',
    '0x2e1a7d4d': 'Withdraw',
    '0xd0e30db0': 'Deposit',
    '0x38ed1739': 'Swap Exact Tokens',
    '0x7ff36ab5': 'Swap Exact ETH',
    '0x18cbafe5': 'Swap Exact Tokens For ETH',
    '0x4a25d94a': 'Swap Tokens For Exact ETH',
    '0x5ae401dc': 'Multicall',
    '0x88316456': 'Mint',
    '0x42842e0e': 'Safe Transfer From',
    '0xb88d4fde': 'Safe Transfer From',
    '0x3593564c': 'Execute',
    '0x022c4a45': 'Flashloan',
    '0xdb42f1cf': 'Liquidate Borrow'
};

const PROTOCOL_MAP: Record<string, string> = {
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2',
    '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap V3',
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap V3 Router',
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap Universal Router',
    '0x1111111254fb6c44bac0bed2854e76f90643097d': '1inch Network',
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff': '0x Protocol',
    '0x87870b27f51f6b033d7c58ca82a4abbd58d44445': 'Aave V3 Pool',
    '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': 'Aave V2 Pool',
    '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': 'Lido stETH',
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': 'Lido wstETH',
    '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': 'Sushiswap',
    '0xba12222222228d8ba445958a75a0704d566bf2c8': 'Balancer Vault',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
};

const TOKEN_MAP: Record<string, string> = {
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC',
    '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': 'stETH',
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': 'wstETH',
    '0x514910771af9ca656af840dff83e8264ecf986ca': 'LINK',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'MATIC',
    '0x9dbfa9f29f86e4d197dd1abd69a96df59ffdd0bb': 'WLFI',
    '0xb8c77482e45f1f44de1745f52c74426c631bdd52': 'BNB',
    '0xd31a59c85ae9d8edefec411d448f90841571b89c': 'SOL', // Wrapped SOL on ETH
};

const TOKEN_PRICES: Record<string, number> = {
    'ETH': 3500,
    'BTC': 68000,
    'WBTC': 68000,
    'USDC': 1,
    'USDT': 1,
    'DAI': 1,
    'stETH': 3500,
    'wstETH': 4100,
    'LINK': 18.5,
    'MATIC': 0.7,
    'WLFI': 0.02,
    'BNB': 580,
    'SOL': 145,
};

export interface VIPNetworkStats {
    currentBlock: number;
    tps: number;
    baseFee: number;
    activeWhales: number;
    liquidityContraction: number;
    systemicRisk: string; // "LOW", "MODERATE", "ELEVATED", "CRITICAL"
    nextReset?: string;
    whalesToday?: number;
}

// Global store to prevent unmounting data loss across VIP pages
let globalTxCache: VIPTransaction[] = [];

export function useVIPAnalytics() {
    const publicClient = usePublicClient();
    const [transactions, setTransactions] = useState<VIPTransaction[]>(globalTxCache);
    const [stats, setStats] = useState<VIPNetworkStats>({
        currentBlock: 0,
        tps: 0,
        baseFee: 0,
        activeWhales: 0,
        liquidityContraction: 0,
        systemicRisk: "LOW"
    });
    
    const [isStreaming, setIsStreaming] = useState(false);
    const lastBlockPolled = useRef<number>(0);
    const knownWhaleAddresses = useRef<Set<string>>(new Set());
    const [nextResetTime, setNextResetTime] = useState<string>('');
    const ethPriceUsd = TOKEN_PRICES['ETH']; 

    useEffect(() => {
        fetch('/api/network/daily-stats')
            .then(r => r.json())
            .then(data => {
                if (data.whalesToday !== undefined) {
                    // Initialize the known whale list from DB for perfect daily synchronization
                    if (data.whaleAddresses) {
                        data.whaleAddresses.forEach((addr: string) => knownWhaleAddresses.current.add(addr));
                    }
                    
                    setStats(prev => ({ 
                        ...prev, 
                        activeWhales: data.whalesToday,
                        systemicRisk: data.systemicRisk || prev.systemicRisk,
                        nextReset: data.nextReset 
                    }));
                    setNextResetTime(data.nextReset);
                }
            })
            .catch(err => console.error("Error fetching daily stats:", err));
    }, []);

    const pollLatestBlock = async () => {
        if (!publicClient) return;
        try {
            const block = await publicClient.getBlock({ includeTransactions: true });
            const blockNum = Number(block.number);
            if (blockNum <= lastBlockPolled.current) return;
            lastBlockPolled.current = blockNum;

            const timeNow = Date.now();
            
            // Extract and parse up to 50 transactions to avoid browser lag
            const parsedTxs: VIPTransaction[] = block.transactions
                .slice(0, 50)
                .map((tx: any) => {
                    const valueEth = Number(formatEther(tx.value || 0n));
                    const gasPrice = Number(formatEther(tx.gasPrice || 0n)) * 1e9; // in gwei
                    const gasLimit = Number(tx.gas || 21000n);
                    const feeEth = (gasPrice / 1e9) * gasLimit;
                    const feeUsd = feeEth * ethPriceUsd;

                    const methodSignature = tx.input && tx.input.length >= 10 ? tx.input.slice(0, 10).toLowerCase() : '0x';
                    let methodName = KNOWN_SIGNATURES[methodSignature] || 'Smart Contract Call';
                    let direction: 'BUY' | 'SELL' | 'TRANSFER' = SIGNATURE_DIRECTIONS[methodSignature] || 'TRANSFER';
                    if (methodSignature === '0x') {
                         methodName = 'Native Transfer';
                         direction = 'TRANSFER';
                    }
                    
                    let tokenSymbol = 'ETH';
                    
                    // buy/sell cluster analysis
                    let txType: VIPTransaction['txType'] = 'UNKNOWN';
                    if (!tx.to) { txType = 'CONTRACT_INTERACTION'; methodName = 'Contract Creation'; }
                    else if (tx.input && tx.input !== '0x') {
                        txType = (valueEth > 50 || gasPrice > 50) ? 'MEV_BOT' : 'DEFI_ROUTING';
                    } else {
                        txType = 'TRANSFER';
                    }

                    // Token & Protocol Identification [LEGENDARY UPGRADE]
                    const targetAddr = tx.to?.toLowerCase();
                    if (targetAddr && TOKEN_MAP[targetAddr]) {
                        tokenSymbol = TOKEN_MAP[targetAddr];
                        methodName = `${tokenSymbol} ${methodName}`;
                    } else if (targetAddr && PROTOCOL_MAP[targetAddr]) {
                        methodName = PROTOCOL_MAP[targetAddr];
                    }

                    // CRITICAL FIX: Determine correct amount and USD value based on true EVM context
                    let finalAmount = valueEth;
                    const tokenPrice = TOKEN_PRICES[tokenSymbol] || 1;
                    
                    if (tokenSymbol !== 'ETH' && valueEth === 0) {
                        // Attempt to decode true ERC20 transfer amount from standard calldata (0xa9059cbb = transfer)
                        if (methodSignature === '0xa9059cbb' && tx.input && tx.input.length >= 138) {
                            try {
                                const amountHex = `0x${tx.input.slice(74, 138)}`;
                                const rawAmount = Number(BigInt(amountHex));
                                // Apply known decimal formats
                                const decimals = (tokenSymbol === 'USDC' || tokenSymbol === 'USDT') ? 6 : (tokenSymbol === 'WBTC' || tokenSymbol === 'BTC') ? 8 : 18;
                                finalAmount = rawAmount / (10 ** decimals);
                            } catch (e) {
                                finalAmount = 0; // Absolute reality, no faking amounts if decode fails
                            }
                        } else {
                            // Without full transaction receipts, exact nested DEX swap routing amounts are invisible to the mempool/pending block.
                            // We strictly enforce 0 rather than inventing mock numbers to adhere to absolute on-chain reality.
                            finalAmount = 0;
                        }
                    }

                    const valueUsd = finalAmount * tokenPrice;

                    // Absolute risk score based ONLY on real fees and volume (no randomness)
                    let aiRiskScore = Math.min(100, Math.floor(((valueUsd > 100000) ? 50 : 10) + ((gasPrice > 80) ? 20 : 0)));
                    let anomalyDetected = aiRiskScore > 65;

                    // Persistent Whale Counting
                    if (valueUsd > 500000 || (txType === 'MEV_BOT' && valueUsd > 100000)) {
                        knownWhaleAddresses.current.add(tx.from);
                    }

                    return {
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to || 'Contract Creation',
                        valueEth: finalAmount,
                        valueUsd,
                        feeUsd,
                        gasPrice,
                        timestamp: Number(block.timestamp) * 1000,
                        blockNumber: blockNum,
                        txType,
                        methodSignature,
                        methodName: methodName,
                        direction,
                        aiRiskScore,
                        anomalyDetected,
                        network: publicClient.chain?.name || 'Ethereum',
                        tokenSymbol
                    };
                });

            // Keep only transactions > 0.05 ETH or high risk or high fees to emulate "VIP" feed
            const valuableTxs = parsedTxs.filter(t => t.valueEth >= 0.05 || t.feeUsd > 10 || t.anomalyDetected || t.txType === 'MEV_BOT' || t.txType === 'DEFI_ROUTING');
            
            globalTxCache = [...valuableTxs, ...globalTxCache].slice(0, 500); // Store up to 500 historically
            setTransactions(globalTxCache);

            // Update global network stats
            setStats(prev => {
                const liveWhaleCount = knownWhaleAddresses.current.size;
                // Accumulate live whales with daily persistence
                const totalWhales = Math.max(prev.activeWhales, liveWhaleCount);
                
                return {
                    ...prev,
                    currentBlock: blockNum,
                    tps: block.transactions.length / 12, // approx 12 sec block time
                    baseFee: Number(formatEther(block.baseFeePerGas || 0n)) * 1e9,
                    activeWhales: totalWhales,
                    liquidityContraction: 0, // Awaiting real-time contraction telemetry
                    systemicRisk: (valuableTxs.filter(t => t.anomalyDetected).length > 5) ? 'ELEVATED' : prev.systemicRisk
                };
            });

        } catch (error) {
            console.error("useVIPAnalytics polling error:", error);
        }
    };

    useEffect(() => {
        setIsStreaming(true);
        pollLatestBlock(); // initial fetch
        const interval = setInterval(pollLatestBlock, 12000); // Poll every 12 seconds
        
        return () => clearInterval(interval);
    }, [publicClient]);

    return {
        transactions,
        stats,
        isStreaming
    };
}

