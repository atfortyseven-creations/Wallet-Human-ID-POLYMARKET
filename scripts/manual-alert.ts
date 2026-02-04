
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import fetch from 'node-fetch';

// Polyfill for fetch if needed (Node 18+ has it native, but just in case)
if (!global.fetch) {
  (global as any).fetch = fetch;
}

const ALCHEMY_KEY = "p2MK6Y8eQyHPbS5gQZ7TU"; // Hardcoded from .env for immediate execution
const BOT_TOKEN = "8400528150:AAGtzfSpSvD6HgauHwg7Nw3sGElQx1Ug4rg";
const CHAT_ID = "7247569356";

console.log("🚀 Starting Manual Whale Alert Script...");

const config = {
  apiKey: ALCHEMY_KEY,
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

async function sendTelegram(text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("Telegram Error:", e);
    return false;
  }
}

async function run() {
  try {
    // 1. Get latest block
    const latestBlock = await alchemy.core.getBlockNumber();
    const fromBlock = latestBlock - 1000;
    
    console.log(`Scanning Base mainnet blocks ${fromBlock} to ${latestBlock}...`);

    // 2. Fetch Transfers
    const ethTransfers = await alchemy.core.getAssetTransfers({
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: 'latest',
      category: [AssetTransfersCategory.EXTERNAL],
      maxCount: 200,
      order: SortingOrder.DESCENDING,
    });

    const tokenTransfers = await alchemy.core.getAssetTransfers({
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: 'latest',
      category: [AssetTransfersCategory.ERC20],
      maxCount: 200,
      order: SortingOrder.DESCENDING,
    });

    const all = [...ethTransfers.transfers, ...tokenTransfers.transfers];

    // 3. Filter & Sort by Value
    const whaleMovements = all
      .map(tx => {
        let usdValue = 0;
        const val = tx.value || 0;
        if (tx.asset === 'ETH' || tx.asset === 'WETH') usdValue = val * 3200;
        else if (['USDC', 'USDT', 'DAI'].includes(tx.asset || '')) usdValue = val;
        else usdValue = val * 50; // Conservative estimate

        return { ...tx, usdValue };
      })
      .filter(tx => tx.usdValue > 50000) // > $50k
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 20); // Top 20

    console.log(`Found ${whaleMovements.length} whale transactions.`);

    // 4. Formatting Helpers
    const formatMoney = (val: number) => {
      // Conversión a Euros (Tasa aprox: 0.96)
      const eurVal = val * 0.96;
      const millions = (eurVal / 1_000_000).toFixed(2);
      return `€${millions} Millones de euros`; // Añadido símbolo € al inicio para mayor claridad
    };

    // 5. Send Alerts
    for (const [i, tx] of whaleMovements.entries()) {
      const shortFrom = `${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`;
      const shortTo = tx.to && tx.to !== 'Contract' ? `${tx.to.slice(0, 4)}...${tx.to.slice(-4)}` : 'Contract 📄';
      
      const emoji = '🐋'; // Siempre ballena, nunca sirena
      const type = tx.to === 'Contract' ? 'Interacción' : 'Transferencia';
      
      // Diseño Premium Minimalista (Español Personalizado + Euros)
      const msg = `
${emoji} <b>ALERTA WHALE</b> | Base

💶 <b>${formatMoney(tx.usdValue)}</b>
${type} de <b>${parseFloat(tx.value?.toFixed(2) || '0').toLocaleString()} ${tx.asset || 'Token'}</b> transferidos correctamente

👤 <code>${shortFrom}</code> ➡️ <code>${shortTo}</code>

🔗 <a href="https://basescan.org/tx/${tx.hash}">Ver Transacción</a>
`.trim();

      console.log(`Sending alert ${i+1}/${whaleMovements.length}...`);
      await sendTelegram(msg);
      
      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 200));
    }

    console.log("✅ All alerts sent!");

  } catch (error) {
    console.error("Script failed:", error);
  }
}

run();
