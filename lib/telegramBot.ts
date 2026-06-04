import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

/**
 * Telegram Bot Helper
 * Simplified bot for sending whale alerts
 * Setup: Talk to @BotFather on Telegram to get your bot token
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  disableWebPagePreview?: boolean;
  threadId?: string; // Optional: For Telegram Topics
}

/**
 * Send a message via Telegram Bot API
 */
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn('Telegram bot token not configured');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode || 'HTML',
        disable_web_page_preview: message.disableWebPagePreview ?? true,
        message_thread_id: message.threadId, // Sends to specific topic if provided
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

/**
 * Format whale alert for Telegram
 */
export function formatWhaleAlertTelegram(data: {
  address: string;
  type: string;
  amount: number;
  token: string;
  txHash?: string;
}): string {
  const shortAddress = `${data.address.slice(0, 4)}...${data.address.slice(-4)}`;
  
  // Format huge numbers
  const formatMoney = (val: number) => {
    // Convert to Euros (Approx rate: 0.96)
    const eurVal = val * 0.96;
    const millions = safeToFixed(eurVal / 1_000_000, 2);
    return `${millions} Million Euros`;
  };

  const emoji = ''; // Always whale, never mermaid
  const typeTranslated = data.type === 'CONTRACT' ? 'Interaction' : 'Transfer';

  return `
${emoji} <b>WHALE ALERT</b> | Base

 <b>${formatMoney(data.amount)}</b>
${typeTranslated} of <b>${data.token}</b> successfully transferred

 <code>${shortAddress}</code>

 ${data.txHash ? `<a href="https://basescan.org/tx/${data.txHash}">View Transaction</a>` : ''}
`.trim();
}

/**
 * Format price alert for Telegram
 */
export function formatPriceAlertTelegram(data: {
  token: string;
  currentPrice: number;
  targetPrice: number;
  condition: 'above' | 'below';
}): string {
  const emoji = data.condition === 'above' ? '' : '';
  const conditionText = data.condition === 'above' ? 'ABOVE' : 'BELOW';
  
  return `
${emoji} <b>PRICE ALERT</b>

 <b>Token:</b> ${data.token}
 <b>Current Price:</b> $${safeToLocaleString(data.currentPrice)}
 <b>Target:</b> $${safeToLocaleString(data.targetPrice)}
 <b>Condition:</b> ${conditionText}

 ${new Date().toLocaleTimeString()}
  `.trim();
}

/**
 * Format daily digest for Telegram
 */
export function formatDailyDigestTelegram(data: {
  walletsTracked: number;
  totalValue: number;
  transactions24h: number;
  topMovers: Array<{ address: string; change: number }>;
}): string {
  const topMoversList = data.topMovers
    .slice(0, 3)
    .map((m, i) => {
      const emoji = m.change > 0 ? '' : '';
      const shortAddr = `${m.address.slice(0, 6)}...${m.address.slice(-4)}`;
      return `${i + 1}. ${shortAddr}: ${emoji} ${m.change > 0 ? '+' : ''}${safeToFixed(m.change, 2)}%`;
    })
    .join('\n');

  return `
 <b>DAILY SUMMARY</b>

 <b>Wallets Tracked:</b> ${data.walletsTracked}
 <b>Total Value:</b> $${safeToFixed(data.totalValue / 1e6, 2)}M
 <b>Transactions 24h:</b> ${data.transactions24h}

 <b>Top Movers:</b>
${topMoversList}

 ${new Date().toLocaleDateString()}
  `.trim();
}

