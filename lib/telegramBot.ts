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
    // Conversión a Euros (Tasa aprox: 0.96)
    const eurVal = val * 0.96;
    const millions = (eurVal / 1_000_000).toFixed(2);
    return `€${millions} Millones de euros`;
  };

  const emoji = '🐋'; // Siempre ballena, nunca sirena
  const typeTranslated = data.type === 'CONTRACT' ? 'Interacción' : 'Transferencia';

  return `
${emoji} <b>ALERTA WHALE</b> | Base

💶 <b>${formatMoney(data.amount)}</b>
${typeTranslated} de <b>${data.token}</b> transferidos correctamente

👤 <code>${shortAddress}</code>

🔗 ${data.txHash ? `<a href="https://basescan.org/tx/${data.txHash}">Ver Transacción</a>` : ''}
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
  const emoji = data.condition === 'above' ? '📈' : '📉';
  const conditionText = data.condition === 'above' ? 'POR ENCIMA' : 'POR DEBAJO';
  
  return `
${emoji} <b>ALERTA DE PRECIO</b>

🪙 <b>Token:</b> ${data.token}
💵 <b>Precio Actual:</b> $${data.currentPrice.toLocaleString()}
🎯 <b>Objetivo:</b> $${data.targetPrice.toLocaleString()}
🔔 <b>Condición:</b> ${conditionText}

⏰ ${new Date().toLocaleTimeString()}
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
      const emoji = m.change > 0 ? '📈' : '📉';
      const shortAddr = `${m.address.slice(0, 6)}...${m.address.slice(-4)}`;
      return `${i + 1}. ${shortAddr}: ${emoji} ${m.change > 0 ? '+' : ''}${m.change.toFixed(2)}%`;
    })
    .join('\n');

  return `
📊 <b>RESUMEN DIARIO</b>

👀 <b>Wallets Rastreadas:</b> ${data.walletsTracked}
💰 <b>Valor Total:</b> $${(data.totalValue / 1e6).toFixed(2)}M
⚡ <b>Transacciones 24h:</b> ${data.transactions24h}

🏆 <b>Mayores Movimientos:</b>
${topMoversList}

📅 ${new Date().toLocaleDateString()}
  `.trim();
}
