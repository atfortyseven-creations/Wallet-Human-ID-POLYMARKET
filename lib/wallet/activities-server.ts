/**
 * Enriched History Service
 * Fetch real on-chain transactions across multiple chains using Alchemy
 */

import { matchNewsToMarket } from '@/utils/news-matcher';

const DATA_API = 'https://data-api.polymarket.com';

const KNOWN_ROUTERS: Record<string, string> = {
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': 'Uniswap V2',
  '0xE592427A0AEce92De3Edee1F18E0157C05861564': 'Uniswap V3',
  '0x3fC91A3afd003363435A4017ef20a2dCf95BB222': 'Uniswap Universal',
  '0x1111111254EEB25477B68fb85Ed929f73A960582': '1inch',
  '0x881D40237659C251811CEC9c364ef91dC08D300C': 'Metamask Swap',
  '0xa5E0829CaCEd8fFDD03902106140928170dDC299': 'QuickSwap',
  '0xc45e8615D0D727F475e0764684062ba879cc88e5': 'Aerodrome',
  '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45': 'Uniswap V3 (Poly/Base)',
};

const KNOWN_BRIDGES: Record<string, string> = {
  '0xb8901acB165ed027E32754E0FFe830802919c463': 'Hop Protocol',
  '0x5c7BC2d53442343564997E308DA5A3D39626C88A': 'Across',
  '0x8731d54E9D025E285642698A9158D0294118124A': 'Stargate',
};

interface AlchemyTransfer {
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  category: string;
  metadata: {
    blockTimestamp: string;
  };
}

async function fetchAlchemyTransfers(address: string, chainId: number): Promise<AlchemyTransfer[]> {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const networkMap: Record<number, string> = {
    1: 'eth-mainnet',
    137: 'polygon-mainnet',
    8453: 'base-mainnet',
  };

  const network = networkMap[chainId];
  if (!network) return [];

  const url = `https://${network}.g.alchemy.com/v2/${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: "0x0",
          toBlock: "latest",
          fromAddress: address,
          category: ["external", "erc20", "erc721", "erc1155"],
          withMetadata: true,
          excludeZeroValue: true,
          maxCount: "0x32" // 50 transactions
        }]
      })
    });

    const data = await response.json();
    const transfers = data.result?.transfers || [];

    // Also fetch transfers TO the address (INCOMING)
    const responseIn = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock: "0x0",
            toBlock: "latest",
            toAddress: address,
            category: ["external", "erc20", "erc721", "erc1155"],
            withMetadata: true,
            excludeZeroValue: true,
            maxCount: "0x32"
          }]
        })
      });
  
    const dataIn = await responseIn.json();
    const transfersIn = dataIn.result?.transfers || [];

    return [...transfers, ...transfersIn];
  } catch (error) {
    console.error(`Error fetching Alchemy transfers for chain ${chainId}:`, error);
    return [];
  }
}

export async function getEnrichedHistory(address: string) {
  const chains = [1, 137, 8453]; // Ethereum, Polygon, Base
  
  const allTransfersPromises = chains.map(id => fetchAlchemyTransfers(address, id));
  const results = await Promise.all(allTransfersPromises);
  
  const allTransfers = results.flat().map(t => {
    const isSwap = KNOWN_ROUTERS[t.to.toLowerCase()] || KNOWN_ROUTERS[t.from.toLowerCase()];
    const isBridge = KNOWN_BRIDGES[t.to.toLowerCase()] || KNOWN_BRIDGES[t.from.toLowerCase()];
    const type = isSwap ? 'SWAP' : isBridge ? 'BRIDGE' : (t.from.toLowerCase() === address.toLowerCase() ? 'SEND' : 'RECEIVE');
    
    return {
        id: t.uniqueId,
        hash: t.hash,
        from: t.from,
        to: t.to,
        value: t.value || 0,
        asset: t.asset || 'ETH',
        type,
        platform: isSwap || isBridge || undefined,
        timestamp: t.metadata.blockTimestamp,
        chainId: 0 // Will be set in next step
    };
  });

  // Clean up chainId mapping
  results.forEach((res, index) => {
      const chainId = chains[index];
      allTransfers.forEach(t => {
          if (res.some(r => r.uniqueId === t.id)) {
              (t as any).chainId = chainId;
          }
      });
  });

  // Sort by timestamp
  allTransfers.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return allTransfers;
}
