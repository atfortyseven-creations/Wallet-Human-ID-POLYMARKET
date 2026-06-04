/**
 * Legendary Entity Registry
 * Maps critical system addresses (Routers, Bridges, Exchanges) to their human-readable identities.
 */

export interface BlockchainEntity {
  address: string;
  name: string;
  protocol: string;
  type: 'ROUTER' | 'BRIDGE' | 'EXCHANGE' | 'SYSTEM' | 'WRAPPER' | 'WHALE';
}

const ENTITY_DATA: Record<string, BlockchainEntity> = {
  // --- PROTOCOLS & ROUTERS ---
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { address: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', name: 'Uniswap V2 Router', protocol: 'Uniswap', type: 'ROUTER' },
  '0xe592427a0aece92de3edee1f18e0157c05861564': { address: '0xe592427a0aece92de3edee1f18e0157c05861564', name: 'Uniswap V3 Router', protocol: 'Uniswap', type: 'ROUTER' },
  '0x3fc91a3afd003363435a4017ef20a2dcf95bb222': { address: '0x3fc91a3afd003363435a4017ef20a2dcf95bb222', name: 'Uniswap Universal Router', protocol: 'Uniswap', type: 'ROUTER' },
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { address: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', name: 'Uniswap V3 (Multi-chain)', protocol: 'Uniswap', type: 'ROUTER' },
  '0x1111111254eeb25477b68fb85ed929f73a960582': { address: '0x1111111254eeb25477b68fb85ed929f73a960582', name: '1inch Router V5', protocol: '1inch', type: 'ROUTER' },
  '0x881d40237659c251811cec9c364ef91dc08d300c': { address: '0x881d40237659c251811cec9c364ef91dc08d300c', name: 'Metamask Swap Router', protocol: 'Metamask', type: 'ROUTER' },
  '0x3bfc20f0b9afcace800d73d2191166ff16540258': { address: '0x3bfc20f0b9afcace800d73d2191166ff16540258', name: 'PancakeSwap V3 Router', protocol: 'PancakeSwap', type: 'ROUTER' },
  '0x10ed43c718714eb63d5aa57b78b54704e256024e': { address: '0x10ed43c718714eb63d5aa57b78b54704e256024e', name: 'PancakeSwap V2 Router (BSC)', protocol: 'PancakeSwap', type: 'ROUTER' },
  '0x13f4ea83d0bd40e75c8222255bc855a974568dd4': { address: '0x13f4ea83d0bd40e75c8222255bc855a974568dd4', name: 'PancakeSwap V3 Router (BSC)', protocol: 'PancakeSwap', type: 'ROUTER' },
  '0x8cfe327cecc257f23378842af311cd23f36db787': { address: '0x8cfe327cecc257f23378842af311cd23f36db787', name: 'PancakeSwap V3 Router (Base)', protocol: 'PancakeSwap', type: 'ROUTER' },
  '0x2626664c2603336e57b0372000b05b18a38c201d': { address: '0x2626664c2603336e57b0372000b05b18a38c201d', name: 'Uniswap V3 Router (Base)', protocol: 'Uniswap', type: 'ROUTER' },
  
  // --- WRAPPERS & SYSTEM ---
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', name: 'WETH Wrapped Ether', protocol: 'Ethereum', type: 'WRAPPER' },
  '0x4200000000000000000000000000000000000006': { address: '0x4200000000000000000000000000000000000006', name: 'WETH Wrapped Ether (Base)', protocol: 'Base', type: 'WRAPPER' },
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': { address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', name: 'WBNB Wrapped BNB', protocol: 'BSC', type: 'WRAPPER' },
  '0x00000000219ab540356cbb839cbe05303d7705fa': { address: '0x00000000219ab540356cbb839cbe05303d7705fa', name: 'Beacon Deposit Contract', protocol: 'Ethereum', type: 'SYSTEM' },

  // --- EXCHANGES (CEX) ---
  '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8': { address: '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', name: 'Binance 7', protocol: 'Binance', type: 'EXCHANGE' },
  '0x40b38765696e3d5d8d9d834d8aad4bb6e418e489': { address: '0x40b38765696e3d5d8d9d834d8aad4bb6e418e489', name: 'Binance 8', protocol: 'Binance', type: 'EXCHANGE' },
  '0x0e58e8993100f1cbe45376c410f97f4893d9bfcd': { address: '0x0e58e8993100f1cbe45376c410f97f4893d9bfcd', name: 'Binance 14', protocol: 'Binance', type: 'EXCHANGE' },
  '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a': { address: '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a', name: 'Binance 15', protocol: 'Binance', type: 'EXCHANGE' },
  '0x49048044d57e1c92a77f79988d21fa8faf74e97e': { address: '0x49048044d57e1c92a77f79988d21fa8faf74e97e', name: 'Binance 16', protocol: 'Binance', type: 'EXCHANGE' },
  '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503': { address: '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503', name: 'Binance 18 (Swap Router)', protocol: 'Binance', type: 'EXCHANGE' },
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': { address: '0xdfd5293d8e347dfe59e90efd55b2956a1343963d', name: 'Binance 24', protocol: 'Binance', type: 'EXCHANGE' },
  '0xafcd96e580138cfa2332c632e66308eacd45c5da': { address: '0xafcd96e580138cfa2332c632e66308eacd45c5da', name: 'OKX 1', protocol: 'OKX', type: 'EXCHANGE' },
  '0xe92d1a43df510f82c66382592a047d288f85226f': { address: '0xe92d1a43df510f82c66382592a047d288f85226f', name: 'OKX 2', protocol: 'OKX', type: 'EXCHANGE' },
  '0x73af3bcf944a6559933396c1577b257e2054d935': { address: '0x73af3bcf944a6559933396c1577b257e2054d935', name: 'Crypto.com 1', protocol: 'Crypto.com', type: 'EXCHANGE' },
  '0xca8fa8f0b631ecdb18cda619c4fc9d197c8affca': { address: '0xca8fa8f0b631ecdb18cda619c4fc9d197c8affca', name: 'Crypto.com 2', protocol: 'Crypto.com', type: 'EXCHANGE' },

  // --- BRIDGES ---
  '0x9f1799fb47b1514f453bcebbc37ecfe883756e83': { address: '0x9f1799fb47b1514f453bcebbc37ecfe883756e83', name: 'Arbitrum Gateway', protocol: 'Arbitrum', type: 'BRIDGE' },
  '0x8103683202aa8da10536036edef04cdd865c225e': { address: '0x8103683202aa8da10536036edef04cdd865c225e', name: 'Optimism Gateway', protocol: 'Optimism', type: 'BRIDGE' },
  '0x539c92186f7c6cc4cbf443f26ef84c595babbca1': { address: '0x539c92186f7c6cc4cbf443f26ef84c595babbca1', name: 'Base Gateway', protocol: 'Base', type: 'BRIDGE' },
  '0x4901460393699709033323091178222384910398': { address: '0x4901460393699709033323091178222384910398', name: 'Base Bridge', protocol: 'Base', type: 'BRIDGE' },
  '0xbfbbfaccd1126a11b8f84c60b09859f80f3bd10f': { address: '0xbfbbfaccd1126a11b8f84c60b09859f80f3bd10f', name: 'Polygon PoS Bridge', protocol: 'Polygon', type: 'BRIDGE' },
  '0x2b6ed29a95753c3ad948348e3e7b1a251080ffb9': { address: '0x2b6ed29a95753c3ad948348e3e7b1a251080ffb9', name: 'Avalanche Bridge', protocol: 'Avalanche', type: 'BRIDGE' },
  '0x0000000000000000000000000000000000000000': { address: '0x0000000000000000000000000000000000000000', name: 'Zero/Burn', protocol: 'System', type: 'SYSTEM' },
};

export function getEntity(address: string): BlockchainEntity | null {
  if (!address) return null;
  return ENTITY_DATA[address.toLowerCase()] || null;
}

export function isSystemEntity(address: string): boolean {
  const entity = getEntity(address);
  return !!entity && ['ROUTER', 'BRIDGE', 'EXCHANGE', 'SYSTEM', 'WRAPPER'].includes(entity.type);
}

