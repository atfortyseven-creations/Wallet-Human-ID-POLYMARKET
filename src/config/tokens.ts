import { mainnet, polygon, zksync, optimism, arbitrum, baseSepolia, optimismSepolia } from "wagmi/chains";

export const TOKENS_BY_CHAIN: Record<number, { symbol: string, name: string, address: string, decimals: number, icon?: string }[]> = {
    [polygon.id]: [
        { symbol: "USDC", name: "USD Coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
        { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
        { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18 }
    ],
    [mainnet.id]: [
        { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
        { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 }
    ],
    [optimism.id]: [
        { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf992cL92055", decimals: 6 } // Example (Ensure validity or handle error)
    ],
    [arbitrum.id]: [
        { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 }
    ],
    [zksync.id]: [
        { symbol: "USDC", name: "USD Coin", address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", decimals: 6 }
    ]
};

export const getUsdcAddress = (chainId: number) => {
    const list = TOKENS_BY_CHAIN[chainId];
    return list?.find(t => t.symbol === "USDC")?.address as `0x${string}` | undefined;
}

export const getSupportedTokens = (chainId: number) => {
    return TOKENS_BY_CHAIN[chainId] || [];
}
