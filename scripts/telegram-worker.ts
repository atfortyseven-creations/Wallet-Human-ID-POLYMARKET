import { Worker, Job } from 'bullmq';
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import axios from "axios";
import { redisClient } from "../lib/redis/client";
import { WHALE_QUEUE_NAME, WhaleJobData } from "../lib/queues/whaleQueue";
import { WebhookDispatcher } from "../lib/webhook-dispatcher";
import { WacAnalyticsService } from "../lib/analytics-service";

dotenv.config();

const prisma = new PrismaClient();

//  Security: NEVER hardcode the bot token. Fail fast if missing. 
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error(" [Telegram Worker] TELEGRAM_BOT_TOKEN env var is not set. Worker cannot start.");
    process.exit(1);
}

const TARGET_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "@HumanidFi";
const TOPIC_ID = Number(process.env.TELEGRAM_TOPIC_ID ?? "1367");


async function sendTelegram(text: string, chatId: string = TARGET_CHAT_ID, threadId: number | null = TOPIC_ID) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      message_thread_id: threadId
    });
    return res.data.ok;
  } catch (e: any) {
    console.error(` [Telegram Worker] Error sending to ${chatId}:`, e.response?.data || e.message);
    throw e; // Throw to allow BullMQ to retry
  }
}

const formatMoney = (val: number) => {
  const eurVal = val * 0.96;
  const millions = (eurVal / 1_000_000).toFixed(2);
  return `${millions} Million Euros`;
};

/**
 * BullMQ Worker Eliteization
 */
const worker = new Worker(WHALE_QUEUE_NAME, async (job: Job<WhaleJobData>) => {
  const { hash, from, to, asset, amount, usdValue, chain, type } = job.data;
  
  console.log(` [Worker] Processing Whale: ${usdValue.toFixed(2)} USD (${asset})`);

  // 1. Generate Legendary Tactical Intel
  const shortFrom = `${from.slice(0, 4)}...${from.slice(-4)}`;
  const shortTo = to ? (to === 'Contract' ? 'Contract' : `${to.slice(0, 4)}...${to.slice(-4)}`) : 'Contract';
  const explorer = chain === 'BITCOIN' ? `https://mempool.space/tx/${hash}` : `https://basescan.org/tx/${hash}`;

  const intel = WacAnalyticsService.generateTacticalIntel({ usdValue, from, to, asset, chain, type });
  
  const sentimentEmoji = intel.sentiment.includes('BULLISH') ? '' : intel.sentiment.includes('BEARISH') ? '' : '️';
  const mandateHeader = usdValue > 5_000_000 ? ' <b>HIGH CONVICTION MANDATE</b>' : ' <b>WHALE ALERT DETECTED</b>';

  const msg = `
${mandateHeader} | ${chain}
${sentimentEmoji} <b>SENTIMENT:</b> ${intel.sentiment}

️ <b>PROFILE:</b> ${intel.walletProfile}
 <b>${formatMoney(usdValue)}</b> (${amount.toLocaleString()} ${asset})

 <code>${shortFrom}</code> ️ <code>${shortTo}</code>

️ <b>IMPACT:</b> ${intel.marketImpact}
 <b>MANDATE:</b> ${intel.action}

 <a href="${explorer}">View Strategic Intercept</a>
`.trim();

  // 2. Publish to Redis for WebSocket Broadcasting
  try {
    const broadcastData = {
      ...job.data,
      timestamp: Date.now(),
      label: `Whale ${amount} ${asset}`
    };
    await redisClient.publish('whale-alerts', JSON.stringify(broadcastData));
  } catch (pubErr: any) {
    console.warn("   [Worker] WebSocket broadcast publish failed:", pubErr.message);
  }

  // 3. Send to Global Channel
  await sendTelegram(msg, TARGET_CHAT_ID, TOPIC_ID);

  // 4. Send to Individual Users (Personalized Alert)
  try {
    const usersToNotify = await prisma.userSettings.findMany({
      where: {
        telegramEnabled: true,
        telegramChatId: { not: null },
        whaleThreshold: { lte: usdValue }
      }
    });

    if (usersToNotify.length > 0) {
      console.log(`   [Worker] Sending personal alerts to ${usersToNotify.length} users...`);
      for (const user of usersToNotify) {
        if (user.telegramChatId) {
          await sendTelegram(
            ` <b>Personal Whale Alert!</b>\n\n${msg}`, 
            user.telegramChatId, 
            user.telegramTopicId ? parseInt(user.telegramTopicId) : null
          );
        }
      }
    }
  } catch (err: any) {
    console.error("   [Worker] Failed to fetch/send personalized alerts:", err.message);
  }

  // 5.  Elite VIGILANTE: WEBHOOKS & ANOMALIES 
  try {
    const activeSubscribers = await (prisma as any).apiSubscription.findMany({
      where: { status: 'active', webhookUrl: { not: null } }
    });

    if (activeSubscribers.length > 0) {
      console.log(`   [Worker] Dispatching webhooks to ${activeSubscribers.length} Elite partners...`);
      
      // Real-time Anomaly Detection (Elite Only)
      // We check if this specific whale event triggered a Z-Score spike
      const anomalies = await WacAnalyticsService.getAnomalyAlerts(asset);
      const isAnomaly = anomalies.some(a => a.transactionHash === hash);

      for (const sub of activeSubscribers) {
        // Basic Whale Event Dispatch
        await WebhookDispatcher.dispatch(sub.id, {
          ...job.data,
          isAnomaly,
          timestamp: new Date().toISOString()
        });

        // If Anomaly and subscriber is Elite, send specialized alert
        if (isAnomaly && sub.tier.toLowerCase() === 'Elite') {
          await WebhookDispatcher.dispatch(sub.id, {
            event_type: 'CRITICAL_ANOMALY_DETECTION',
            severity: 'HIGH',
            txid: hash,
            token: asset,
            volume: usdValue,
            zScore: anomalies.find(a => a.transactionHash === hash)?.anomalyScore || 2.5
          });
        }
      }
    }
  } catch (webhookErr: any) {
    console.error("   [Worker] Failed to dispatch Elite webhooks:", webhookErr.message);
  }

}, {
  connection: redisClient,
  concurrency: 5, // Process up to 5 alerts in parallel
});

worker.on('completed', (job) => {
  console.log(` [Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(` [Worker] Job ${job?.id} failed:`, err.message);
});

console.log(" [Telegram Worker] Listening for whale alerts from Redis Queue...");
