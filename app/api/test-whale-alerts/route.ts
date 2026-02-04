import { NextRequest, NextResponse } from 'next/server';
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { sendTelegramMessage, formatWhaleAlertTelegram } from '@/lib/telegramBot';

/**
 * Test Endpoint: Real Whale Alerts
 * Fetches recent large transactions from Base and sends Telegram notifications
 * 
 * Usage: GET /api/test-whale-alerts?chatId=YOUR_CHAT_ID&count=20&minValue=100000
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const count = parseInt(searchParams.get('count') || '20');
    const minValue = parseFloat(searchParams.get('minValue') || '100000');

    if (!chatId) {
      return NextResponse.json({
        error: 'Chat ID required',
        usage: '/api/test-whale-alerts?chatId=YOUR_CHAT_ID&count=20&minValue=100000',
      }, { status: 400 });
    }

    // Get latest block
    const latestBlock = await alchemy.core.getBlockNumber();
    
    // Fetch recent large transfers (last ~1000 blocks, about 30 minutes on Base)
    const fromBlock = latestBlock - 1000;

    console.log(`Scanning blocks ${fromBlock} to ${latestBlock} for whale movements...`);

    // Get ETH transfers
    const ethTransfers = await alchemy.core.getAssetTransfers({
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: 'latest',
      category: [AssetTransfersCategory.EXTERNAL],
      maxCount: 1000,
      order: SortingOrder.DESCENDING,
    });

    // Get ERC20 transfers (USDC, WETH, etc)
    const tokenTransfers = await alchemy.core.getAssetTransfers({
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: 'latest',
      category: [AssetTransfersCategory.ERC20],
      maxCount: 1000,
      order: SortingOrder.DESCENDING,
    });

    // Combine and filter large transfers
    const allTransfers = [...ethTransfers.transfers, ...tokenTransfers.transfers];

    // Estimate USD values and filter
    const whaleMovements = allTransfers
      .map(tx => {
        let usdValue = 0;
        const value = tx.value || 0;

        // Estimate USD value
        if (tx.asset === 'ETH' || tx.asset === 'WETH') {
          usdValue = value * 3200; // ETH price estimate
        } else if (tx.asset === 'USDC' || tx.asset === 'USDT' || tx.asset === 'DAI') {
          usdValue = value; // Stablecoins
        } else {
          usdValue = value * 100; // Generic token estimate
        }

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to || 'Contract',
          asset: tx.asset || 'Unknown',
          value: value,
          usdValue: usdValue,
          blockNum: tx.blockNum,
          category: tx.category,
        };
      })
      .filter(tx => tx.usdValue >= minValue)
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, count);

    console.log(`Found ${whaleMovements.length} whale movements >= $${minValue.toLocaleString()}`);

    // Send Telegram notifications for each
    const results = [];
    for (const [index, movement] of whaleMovements.entries()) {
      const message = formatWhaleAlertTelegram({
        address: movement.from,
        type: movement.to === 'Contract' ? 'CONTRACT' : 'TRANSFER',
        amount: Math.round(movement.usdValue),
        token: movement.asset,
        txHash: movement.hash,
      });

      // Add position in list
      const numberedMessage = `📊 #${index + 1} of ${whaleMovements.length}\n\n${message}`;

      const success = await sendTelegramMessage({
        chatId,
        text: numberedMessage,
        parseMode: 'HTML',
      });

      results.push({
        index: index + 1,
        hash: movement.hash,
        amount: `$${Math.round(movement.usdValue).toLocaleString()}`,
        asset: movement.asset,
        sent: success,
      });

      // Small delay to avoid rate limits (Telegram allows 30 msg/sec)
      if (index < whaleMovements.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      success: true,
      scanned: {
        fromBlock,
        toBlock: latestBlock,
        blocksScanned: latestBlock - fromBlock,
      },
      found: whaleMovements.length,
      minValue: `$${minValue.toLocaleString()}`,
      sent: results.filter(r => r.sent).length,
      failed: results.filter(r => !r.sent).length,
      movements: results,
      summary: `Sent ${results.filter(r => r.sent).length} whale alerts to Telegram`,
    });
  } catch (error: any) {
    console.error('Test Whale Alerts Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch whale movements',
      details: error.message,
    }, { status: 500 });
  }
}
