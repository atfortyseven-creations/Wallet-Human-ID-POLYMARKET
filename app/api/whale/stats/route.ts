import { NextRequest, NextResponse } from 'next/server';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { getRealTimePrice } from '@/lib/priceHelper';

// Configure Alchemy with GetBlock RPC
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
  // Use GetBlock RPC endpoint for Base Mainnet
  url: process.env.BASE_RPC_URL || undefined,
};

// HACK: Fix for Alchemy SDK "Referrer 'client' is not a valid URL" in Next.js Server
const originalFetch = global.fetch;
global.fetch = (url, init) => {
    if (init && init.referrer === 'client') {
        delete init.referrer;
    }
    return originalFetch(url, init);
};

const alchemy = new Alchemy(config);

// Common tokens on Base to check for value
const TOKENS = [
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
  '0x4200000000000000000000000000000000000006', // WETH
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', // DAI
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // Parallel fetch for speed
    let ethBalance, tokenBalances;
    try {
        [ethBalance, tokenBalances] = await Promise.all([
            alchemy.core.getBalance(address.toLowerCase()),
            alchemy.core.getTokenBalances(address.toLowerCase(), TOKENS)
        ]);
    } catch (apiError: any) {
        console.warn("[Alchemy Error] Returning fallback data:", apiError.message);
        
        return NextResponse.json({
            address,
            totalValue: 0,
            ethBalance: 0,
            isWhale: false,
            isSmart: false,
            fallback: true,
            error: "Live data unavailable (Network limit)"
        });
    }

    // Get REAL-TIME ETH price from CoinGecko
    const ethPrice = await getRealTimePrice('ETH');
    
    // 1. ETH Value (REAL PRICE)
    const ethVal = parseFloat(Utils.formatEther(ethBalance));
    const ethUsd = ethVal * ethPrice; 

    // 2. Token Value
    let tokenUsd = 0;
    if (tokenBalances && tokenBalances.tokenBalances) {
        for (const token of tokenBalances.tokenBalances) {
            if (token.tokenBalance) {
                // USDC is a stablecoin = $1
                if (token.contractAddress.toLowerCase() === '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913') {
                     const val = parseInt(token.tokenBalance, 16) / 1e6;
                     tokenUsd += val; // USDC = $1
                }
                // WETH uses same price as ETH
                if (token.contractAddress.toLowerCase() === '0x4200000000000000000000000000000000000006') {
                     const val = parseInt(token.tokenBalance, 16) / 1e18;
                     tokenUsd += val * ethPrice;
                }
                // DAI is a stablecoin = $1
                if (token.contractAddress.toLowerCase() === '0x50c5725949a6f0c72e6c4a641f24049a917db0cb') {
                     const val = parseInt(token.tokenBalance, 16) / 1e18;
                     tokenUsd += val; // DAI = $1
                }
            }
        }
    }

    const totalValue = ethUsd + tokenUsd;

    return NextResponse.json({
      address,
      totalValue,
      ethBalance: ethVal,
      isWhale: totalValue > 100000, // Threshold > $100k
      ethPrice, // Include real ETH price in response
    });

  } catch (error) {
    console.error('Alchemy Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: String(error) }, { status: 500 });
  }
}
