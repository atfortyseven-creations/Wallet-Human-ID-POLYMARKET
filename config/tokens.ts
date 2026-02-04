import { Address } from "viem";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";

// USDC Contract Addresses per Chain
export const USDC_ADDRESSES: Record<number, Address> = {
    [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    [polygon.id]: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Bridged USDC
    [optimism.id]: "0x0b2C639c5343465d47499142552a7ba59dd7346F", // Native USDC
    [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Native USDC
    [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Native USDC
    [84532]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
};

export const getUsdcAddress = (chainId: number): Address | undefined => {
    return USDC_ADDRESSES[chainId];
};

export const WLD_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS || '0xdc6f18f83959cd25095c2453192f16d08b496666') as `0x${string}`;

export const TOKENS_BY_CHAIN: Record<number, any[]> = {
    [mainnet.id]: [
        { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESSES[mainnet.id], decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
        { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
        { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' },
        { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
         { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBcfedf7c193bc2C599', decimals: 8, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    ],
    [polygon.id]: [
        { symbol: 'USDC', name: 'USD Coin (PoS)', address: USDC_ADDRESSES[polygon.id], decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
        { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
        { symbol: 'WETH', name: 'Wrapped Ether', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
        { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', decimals: 8, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
        { symbol: 'WMATIC', name: 'Wrapped Matic', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', decimals: 18, logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' }
    ],
    [optimism.id]: [
        { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESSES[optimism.id], decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
        { symbol: 'USDT', name: 'Tether USD', address: '0x94b008aA00579c1307B0EF2c499a98a359659956', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
        { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    ],
    [arbitrum.id]: [
         { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESSES[arbitrum.id], decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
         { symbol: 'USDT', name: 'Tether USD', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
         { symbol: 'WETH', name: 'Wrapped Ether', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    ],
    [base.id]: [
        { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESSES[base.id], decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
        { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    ],
    [84532]: [
        { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESSES[84532], decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
    ]
};

export const getSupportedTokens = (chainId: number) => {
    return TOKENS_BY_CHAIN[chainId] || [];
};
