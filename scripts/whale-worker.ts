const { Alchemy, Network, AssetTransfersCategory, SortingOrder } = require("alchemy-sdk");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const prisma = new PrismaClient();

// Alchemy Configuration
const config = {
  apiKey: process.env.ALCHEMY_API_KEY || "p2MK6Y8eQyHPbS5gQZ7TU",
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);
const WHALE_THRESHOLD_USD = 50000; // $50k threshold for whale detection

// Telegram Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8400528150:AAGtzfSpSvD6HgauHwg7Nw3sGElQx1Ug4rg";
const TARGET_CHAT_ID = "@HumanidFi"; 
const TOPIC_ID = 1367;

/**
 * Sends a premium-formatted alert to Telegram
 */
async function sendTelegram(text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await axios.post(url, {
      chat_id: TARGET_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      message_thread_id: TOPIC_ID
    });
    return res.data.ok;
  } catch (e: any) {
    console.error("❌ [Whale Worker] Telegram Error:", e.response?.data || e.message);
    return false;
  }
}

/**
 * Formats USD value to EUR millions
 */
const formatMoney = (val: number) => {
  const eurVal = val * 0.96;
  const millions = (eurVal / 1_000_000).toFixed(2);
  return `€${millions} Millones de euros`;
};

async function startWorker() {
  console.log("🐋 [Whale Worker] Background monitoring started on Base Mainnet...");
  
  let lastProcessedBlock: number;
  try {
    lastProcessedBlock = await alchemy.core.getBlockNumber();
    console.log(`📡 [Whale Worker] Starting from block: ${lastProcessedBlock}`);
  } catch (err: any) {
    console.error("❌ [Whale Worker] Failed to get initial block number:", err.message);
    return;
  }

  // Infinite poll loop
  while (true) {
    try {
      const currentBlock = await alchemy.core.getBlockNumber();
      
      if (currentBlock > lastProcessedBlock) {
        console.log(`🔍 [Whale Worker] Processing blocks ${lastProcessedBlock + 1} to ${currentBlock}...`);
        
        const transfers = await alchemy.core.getAssetTransfers({
          fromBlock: `0x${(lastProcessedBlock + 1).toString(16)}`,
          toBlock: `0x${currentBlock.toString(16)}`,
          category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
          excludeZeroValue: true,
          order: SortingOrder.ASCENDING,
        });

        for (const tx of transfers.transfers) {
          let usdValue = 0;
          const val = tx.value || 0;

          // Value estimation logic
          if (tx.asset === "ETH" || tx.asset === "WETH" || tx.asset === "CBETH") usdValue = val * 3300;
          else if (["USDC", "USDT", "DAI"].includes(tx.asset || "")) usdValue = val;
          else if (tx.asset === "AERO") usdValue = val * 1.2;
          else {
            usdValue = val * 0.5; // fallback
          }

          if (usdValue >= WHALE_THRESHOLD_USD) {
            console.log(`🌊 [Whale Worker] Detected Whale Move: ${usdValue.toFixed(2)} USD (${tx.asset})`);
            
            // 1. Save to Database
            await prisma.whaleActivity.upsert({
              where: { transactionHash: tx.hash },
              update: {},
              create: {
                walletAddress: tx.from,
                type: tx.to === null ? "CONTRACT" : "TRANSFER",
                token: tx.asset || "TOKEN",
                amount: val,
                usdValue: usdValue,
                fromAddress: tx.from,
                toAddress: tx.to || "Contract",
                transactionHash: tx.hash,
                blockNumber: BigInt(parseInt(tx.blockNum, 16)),
                timestamp: new Date(),
              }
            }).catch((err: any) => console.error("❌ [Whale Worker] DB Error:", err.message));

            // 2. Send Telegram Alert
            const shortFrom = `${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`;
            const shortTo = tx.to ? `${tx.to.slice(0, 4)}...${tx.to.slice(-4)}` : 'Contract 📄';
            
            const msg = `
🐳 <b>ALERTA WHALE DETECTADA</b> | Base

💶 <b>${formatMoney(usdValue)}</b>
Transferencia de <b>${parseFloat(val.toFixed(2)).toLocaleString()} ${tx.asset || 'Token'}</b> detectada AHORA MISMO.

👤 <code>${shortFrom}</code> ➡️ <code>${shortTo}</code>

🔗 <a href="https://basescan.org/tx/${tx.hash}">Ver Transacción Real</a>
`.trim();

            await sendTelegram(msg);
            console.log("✅ [Whale Worker] Telegram Alert sent successfully");
            await new Promise(r => setTimeout(r, 500)); // Rate limit protection
          }
        }
        
        lastProcessedBlock = currentBlock;
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000)); // Poll every 30s
    } catch (error: any) {
      console.error("❌ [Whale Worker] Error in worker loop:", error.message);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}

module.exports = { startWorker };

// Only run if called directly (CLI)
if (require.main === module) {
  startWorker().catch((err: any) => {
    console.error("💀 [Whale Worker] Fatal error:", err);
    process.exit(1);
  });
}



