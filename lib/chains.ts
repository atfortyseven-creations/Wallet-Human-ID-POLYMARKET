/**
 * Multi-Chain Configuration for Expert-Level Whale Tracking
 * Supports: Ethereum, Base, Polygon, Arbitrum, Optimism
 */

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl: string;
  color: string;
  isTestnet: boolean;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://eth-mainnet.g.alchemy.com/v2/',
      'https://mainnet.infura.io/v3/',
      'https://rpc.ankr.com/eth',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: '/chains/ethereum.svg',
    color: '#627EEA',
    isTestnet: false,
  },
  base: {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://base-mainnet.g.alchemy.com/v2/',
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
    ],
    blockExplorerUrls: ['https://basescan.org'],
    iconUrl: '/chains/base.svg',
    color: '#0052FF',
    isTestnet: false,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      'https://polygon-mainnet.g.alchemy.com/v2/',
      'https://polygon-rpc.com',
      'https://rpc.ankr.com/polygon',
    ],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrl: '/chains/polygon.svg',
    color: '#8247E5',
    isTestnet: false,
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://arb-mainnet.g.alchemy.com/v2/',
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
    ],
    blockExplorerUrls: ['https://arbiscan.io'],
    iconUrl: '/chains/arbitrum.svg',
    color: '#28A0F0',
    isTestnet: false,
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://opt-mainnet.g.alchemy.com/v2/',
      'https://mainnet.optimism.io',
      'https://rpc.ankr.com/optimism',
    ],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrl: '/chains/optimism.svg',
    color: '#FF0420',
    isTestnet: false,
  },
};

export const getChainById = (chainId: number): ChainConfig | undefined => {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
};

export const getChainByName = (name: string): ChainConfig | undefined => {
  return SUPPORTED_CHAINS[name.toLowerCase()];
};

export const getAllChains = (): ChainConfig[] => {
  return Object.values(SUPPORTED_CHAINS);
};

export const getMainnetChains = (): ChainConfig[] => {
  return Object.values(SUPPORTED_CHAINS).filter(chain => !chain.isTestnet);
};

export const formatChainName = (chainId: number): string => {
  const chain = getChainById(chainId);
  return chain ? chain.shortName : `Chain ${chainId}`;
};

export const getExplorerUrl = (chainId: number, address: string, type: 'address' | 'tx' = 'address'): string => {
  const chain = getChainById(chainId);
  if (!chain) return '#';
  
  const baseUrl = chain.blockExplorerUrls[0];
  return `${baseUrl}/${type}/${address}`;
};
