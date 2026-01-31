/**
 * Multi-Chain Support
 * Support for Ethereum, Polygon, Base, Arbitrum, Optimism, and more
 */

import { Chain } from 'wagmi/chains';
import { mainnet, polygon, base, arbitrum, optimism, polygonZkEvm, avalanche, bsc } from 'wagmi/chains';

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrl: string;
  logo: string;
  color: string;
}

/**
 * Supported blockchain networks
 */
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://eth.llamarpc.com',
    ],
    blockExplorerUrl: 'https://etherscan.io',
    logo: '/chains/ethereum.svg',
    color: '#627EEA',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://polygon-rpc.com',
    ],
    blockExplorerUrl: 'https://polygonscan.com',
    logo: '/chains/polygon.svg',
    color: '#8247E5',
  },
  base: {
    id: 8453,
    name: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
    ],
    blockExplorerUrl: 'https://basescan.org',
    logo: '/chains/base.svg',
    color: '#0052FF',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://arb1.arbitrum.io/rpc',
    ],
    blockExplorerUrl: 'https://arbiscan.io',
    logo: '/chains/arbitrum.svg',
    color: '#28A0F0',
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://mainnet.optimism.io',
    ],
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    logo: '/chains/optimism.svg',
    color: '#FF0420',
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche C-Chain',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
    ],
    blockExplorerUrl: 'https://snowtrace.io',
    logo: '/chains/avalanche.svg',
    color: '#E84142',
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
    ],
    blockExplorerUrl: 'https://bscscan.com',
    logo: '/chains/bsc.svg',
    color: '#F3BA2F',
  },
};

/**
 * Get Wagmi chain object by chain ID
 */
export function getWagmiChain(chainId: number): Chain | undefined {
  const chainMap: Record<number, Chain> = {
    [mainnet.id]: mainnet,
    [polygon.id]: polygon,
    [base.id]: base,
    [arbitrum.id]: arbitrum,
    [optimism.id]: optimism,
    [avalanche.id]: avalanche,
    [bsc.id]: bsc,
  };
  
  return chainMap[chainId];
}

/**
 * Get chain config by ID
 */
export function getChainById(chainId: number): ChainConfig | undefined {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
}

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || 'Unknown Chain';
}

/**
 * Get chain logo by ID
 */
export function getChainLogo(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.logo || '/chains/default.svg';
}

/**
 * Get chain color by ID
 */
export function getChainColor(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.color || '#1F1F1F';
}

/**
 * Get block explorer URL for address
 */
export function getExplorerAddressUrl(chainId: number, address: string): string {
  const chain = getChainById(chainId);
  return chain ? `${chain.blockExplorerUrl}/address/${address}` : '';
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const chain = getChainById(chainId);
  return chain ? `${chain.blockExplorerUrl}/tx/${txHash}` : '';
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return Object.values(SUPPORTED_CHAINS).some(chain => chain.id === chainId);
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.values(SUPPORTED_CHAINS).map(chain => chain.id);
}

/**
 * Get native currency symbol for chain
 */
export function getNativeCurrencySymbol(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.nativeCurrency.symbol || 'ETH';
}
