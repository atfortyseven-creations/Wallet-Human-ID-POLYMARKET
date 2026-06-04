import { NextRequest, NextResponse } from 'next/server';

const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY || '';

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  optimism: 10,
  polygon: 137,
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const address = searchParams.get('address');
  const chain   = searchParams.get('chain') ?? 'ethereum';
  const type    = searchParams.get('type') ?? 'txlist'; // txlist | balance

  if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  if (!ETHERSCAN_KEY) return NextResponse.json({ error: 'Etherscan key not configured' }, { status: 503 });

  const chainId = chain === 'humanity' ? 8453 : (CHAIN_IDS[chain] ?? 1);
  const base_url = `https://api.etherscan.io/v2/api?chainid=${chainId}&apikey=${ETHERSCAN_KEY}`;

  let url = '';
  if (chain === 'humanity') {
      const qdContract = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x';
      if (type === 'balance') {
          url = `${base_url}&module=account&action=tokenbalance&contractaddress=${qdContract}&address=${address}&tag=latest`;
      } else {
          url = `${base_url}&module=account&action=tokentx&contractaddress=${qdContract}&address=${address}&page=1&offset=50&sort=desc`;
      }
  } else {
      if (type === 'balance') {
        url = `${base_url}&module=account&action=balance&address=${address}&tag=latest`;
      } else {
        url = `${base_url}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=15&sort=desc`;
      }
  }

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
