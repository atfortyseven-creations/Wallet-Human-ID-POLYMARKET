/**
 * Multi-Chain Configuration  20-Endpoint GetBlock Registry
 * All rpcUrls[0] pulls from getblock-registry.ts (canonical source).
 * Fallbacks: Alchemy  public nodes.
 */
import { getGbRpc } from './blockchain/getblock-registry';

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
      getGbRpc('eth') || 'https://cloudflare-eth.com',  // GB Registry slot 1 (Archive)
      'https://cloudflare-eth.com',
      'https://ethereum-rpc.publicnode.com',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: '/chains/ethereum.svg',
    color: '#627EEA',
    isTestnet: false,
  },
  bnb: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      getGbRpc('bsc') || 'https://bsc-dataseed1.binance.org',  // GB Registry slot 6
      'https://bsc-dataseed1.binance.org',
      'https://bsc.publicnode.com',
    ],
    blockExplorerUrls: ['https://bscscan.com'],
    iconUrl: '/chains/bsc.svg',
    color: '#F3BA2F',
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
      getGbRpc('base') || 'https://mainnet.base.org',  // GB Registry slot 7 (Archive)
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
      'https://base.publicnode.com',
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
      getGbRpc('polygon') || 'https://polygon-rpc.com',  // GB Registry slot 5 (Archive)
      'https://polygon-rpc.com',
      'https://polygon.publicnode.com',
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
      getGbRpc('arb') || 'https://arb1.arbitrum.io/rpc',  // GB Registry slot 8 (Archive)
      'https://arb1.arbitrum.io/rpc',
      'https://arbitrum.publicnode.com',
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
      getGbRpc('op') || 'https://mainnet.optimism.io',  // GB Registry slot 10
      'https://mainnet.optimism.io',
      'https://optimism.publicnode.com',
    ],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrl: '/chains/optimism.svg',
    color: '#FF0420',
    isTestnet: false,
  },
  bitcoin: {
    id: 0, 
    name: 'Bitcoin',
    shortName: 'BTC',
    nativeCurrency: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
    },
    // Use the custom GetBlock endpoint if available, otherwise fallback
    rpcUrls: [
        process.env.NEXT_PUBLIC_BITCOIN_RPC_URL || 'https://mempool.space/api', 
        'https://mempool.space/api'
    ], 
    blockExplorerUrls: ['https://mempool.space'],
    iconUrl: '/chains/bitcoin.svg',
    color: '#F7931A',
    isTestnet: false,
  },
  solana: {
    id: 101, // Custom ID for internal use
    name: 'Solana',
    shortName: 'SOL',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: [
      process.env.GB_SOL_RPC_1 || 'https://api.mainnet-beta.solana.com',  // GB Registry slot 5
      'https://api.mainnet-beta.solana.com',
    ],
    blockExplorerUrls: ['https://solscan.io'],
    iconUrl: '/chains/solana.svg',
    color: '#14F195',
    isTestnet: false,
  },
  worldchain: {
    id: 480,
    name: 'World Chain',
    shortName: 'AUTH',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://worldchain-mainnet.g.alchemy.com/v2/`,
      'https://rpc.worldchain.org'
    ],
    blockExplorerUrls: ['https://worldscan.org'],
    iconUrl: '/chains/worldchain.svg', // Assuming this exists or will be added
    color: '#000000',
    isTestnet: false,
  },
  scroll: {
    id: 534352,
    name: 'Scroll',
    shortName: 'SCROLL',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://rpc.scroll.io',
      'https://scroll-mainnet.public.blastapi.io',
      'https://1rpc.io/scroll'
    ],
    blockExplorerUrls: ['https://scrollscan.com'],
    iconUrl: '/chains/scroll.svg',
    color: '#FFDBB0',
    isTestnet: false,
  }
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

