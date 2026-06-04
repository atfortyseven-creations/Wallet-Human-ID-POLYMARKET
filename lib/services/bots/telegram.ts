/**
 * Telegram Bot Service
 * Route astronomical alerts directly to Telegram chat.
 */

export async function sendTelegramMessage(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('️ Telegram Bot Token o Chat ID no configurado.');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(' Error de Telegram API:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error(' Critical failure in Telegram Service:', error);
    return false;
  }
}

