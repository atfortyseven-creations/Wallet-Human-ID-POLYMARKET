/**
 * Discord Webhook Service
 * Powerful integration to send astronomical alerts to Discord channels.
 */

export async function sendDiscordWebhook(message: string): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('️ Discord Webhook URL no configurado.');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        username: 'Whale Alert | Megalodon Alerts',
      }),
    });

    if (!response.ok) {
      console.error(' Error de Discord Webhook:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error(' Critical failure in Discord Service:', error);
    return false;
  }
}

