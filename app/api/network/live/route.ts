
import { NextRequest, NextResponse } from 'next/server';
import { mainnetClient } from '@/lib/blockchain/rpc-engine';

export const dynamic = 'force-dynamic';

// Omega Directive: Deep Failover Strategy
// If the primary node fails, Viem will automatically rotate to the next one via rpc-engine.
const client = mainnetClient;

// Chainlink Oracles for ETH/USD and BTC/USD
const CHAINLINK_ETH_USD = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
const CHAINLINK_BTC_USD = '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c';

const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(req: NextRequest) {
  try {
    // Fire all RPC calls in parallel to maximize performance
    const [blockNumber, gasPrice, ethRoundData, btcRoundData] = await Promise.all([
      client.getBlockNumber(),
      client.getGasPrice(),
      client.readContract({
        address: CHAINLINK_ETH_USD,
        abi: aggregatorV3InterfaceABI,
        functionName: 'latestRoundData',
      }),
      client.readContract({
        address: CHAINLINK_BTC_USD,
        abi: aggregatorV3InterfaceABI,
        functionName: 'latestRoundData',
      }),
    ]);

    // Chainlink answers have 8 decimals for USD pairs
    const ethPrice = Number(ethRoundData[1]) / 1e8;
    const btcPrice = Number(btcRoundData[1]) / 1e8;
    
    // Gas Price is reported in Wei, convert to Gwei
    const gasGwei = Number(gasPrice) / 1e9;

    return NextResponse.json({
      success: true,
      blockNumber: Number(blockNumber),
      gasGwei: parseFloat(gasGwei.toFixed(2)),
      ethPrice,
      btcPrice,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('[ON-CHAIN LIVE ENG FAIL]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract live on-chain metrics.' },
      { status: 500 }
    );
  }
}


