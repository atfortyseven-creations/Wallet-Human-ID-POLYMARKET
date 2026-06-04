import { createHmac } from 'crypto';
import { prisma } from './prisma';

export class WebhookDispatcher {
  static async dispatch(subscriptionId: string, event: any) {
    const sub = await (prisma as any).apiSubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!sub || !sub.webhookUrl || sub.status !== 'active') return;

    const payload = {
      event_type: 'whale_activity',
      timestamp: new Date().toISOString(),
      data: event
    };

    const bodyString = JSON.stringify(payload);
    
    //  HMAC-SHA256 SIGNING 
    let signature = 'unsigned';
    if (sub.hmacSecret) {
      signature = createHmac('sha256', sub.hmacSecret)
        .update(bodyString)
        .digest('hex');
    }

    try {
      const response = await fetch(sub.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhaleAlertCorp-Webhook/1.0',
          'X-WAC-Signature': signature,
          'X-WAC-Timestamp': payload.timestamp
        },
        body: bodyString
      });

      const responseBody = await response.text();

      await (prisma as any).apiWebhookLog.create({
        data: {
          subscriptionId,
          url: sub.webhookUrl,
          payload: payload as any,
          responseCode: response.status,
          responseBody: responseBody.slice(0, 1000), // Cap size
          createdAt: new Date()
        }
      });

    } catch (error: any) {
      await (prisma as any).apiWebhookLog.create({
        data: {
          subscriptionId,
          url: sub.webhookUrl,
          payload: payload as any,
          error: error.message,
          createdAt: new Date()
        }
      });
    }
  }
}

