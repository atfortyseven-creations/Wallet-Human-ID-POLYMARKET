
import redis from '../redis';
import { OmnichannelAlertEvent } from '../types/alerts';
import { sendTelegramMessage } from './bots/telegram';
import { sendDiscordWebhook } from './bots/discord';
import pLimit from 'p-limit';

const STREAM_KEY = 'global_crypto_alerts';
const CONSUMER_GROUP = 'dispatch_squad';
// Institutional Stability: use replica ID to prevent consumer name bloat on restarts
const CONSUMER_NAME = process.env.RAILWAY_REPLICA_ID 
    ? `replica_${process.env.RAILWAY_REPLICA_ID}` 
    : `worker_${process.pid}`;


export class MegalodonDispatcher {
    private isRunning = false;
    // Limit concurrent outgoing HTTP requests to prevent rate-limits from Discord/Telegram
    private limit = pLimit(20); 

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log(` MEGALODON DISPATCHER ONLINE [${CONSUMER_NAME}] `);

        // Ensure the stream group exists before reading
        try {
            await redis.xgroup('CREATE', STREAM_KEY, CONSUMER_GROUP, '0', 'MKSTREAM');
        } catch (err: any) {
            if (!err.message.includes('BUSYGROUP')) {
                console.error('Failed to create consumer group:', err);
            }
        }

        this.pollStream();
    }

    stop() {
        this.isRunning = false;
        console.log(` MEGALODON DISPATCHER STOPPED [${CONSUMER_NAME}]`);
    }

    private async pollStream() {
        while (this.isRunning) {
            try {
                // Read up to 50 events from the stream, block for 2 seconds if empty
                const result = await redis.xreadgroup(
                    'GROUP', CONSUMER_GROUP, CONSUMER_NAME,
                    'COUNT', 50,
                    'BLOCK', 2000,
                    'STREAMS', STREAM_KEY, '>' // '>' means strictly new messages
                ) as any;

                if (result && result.length > 0) {
                    const messages = result[0][1];
                    for (const msg of messages) {
                        const messageId = msg[0];
                        const rawData = msg[1][1]; 
                        let eventData: OmnichannelAlertEvent;
                        
                        try {
                            eventData = JSON.parse(rawData);
                        } catch(e: any) {
                            console.error(`Malformed event data ID: ${messageId}`, rawData);
                            await redis.xack(STREAM_KEY, CONSUMER_GROUP, messageId);
                            continue;
                        }

                        // NON-BLOCKING Event Routing
                        this.routeEvent(eventData).catch(err => console.error("Router error:", err));

                        // Acknowledge the message so it doesn't get re-read by this group
                        await redis.xack(STREAM_KEY, CONSUMER_GROUP, messageId);
                    }
                }
            } catch (error) {
                console.error(" Error reading from stream:", error);
                // Backoff on connection error
                await new Promise(res => setTimeout(res, 5000));
            }
        }
    }

    private async routeEvent(event: OmnichannelAlertEvent) {
        const promises = [];
        const formattedMsg = this.formatSavageMessage(event);

        console.log(`[DISPATCH] Routing event ${event.eventId} [${event.type}] to ${event.channels.join(',')}`);

        if (event.channels.includes('TELEGRAM')) {
            promises.push(this.limit(() => sendTelegramMessage(formattedMsg)));
        }
        
        if (event.channels.includes('DISCORD')) {
            promises.push(this.limit(() => sendDiscordWebhook(formattedMsg)));
        }

        if (event.channels.includes('UI_INAPP')) {
             // In Phase 4, we'll store in Prisma or push via SSE
        }

        await Promise.allSettled(promises);
    }

    private formatSavageMessage(event: OmnichannelAlertEvent): string {
        switch (event.type) {
            case 'WHALE_TX':
                const usd = event.payload.amountUsd ? `$${(event.payload.amountUsd / 1e6).toFixed(2)} MILLION` : 'HUGE AMOUNT';
                return ` **ASTRONOMICAL WHALE DETECTED** \nChain: ${event.chain}\nAsset: ${event.payload.asset}\nValue: ${usd}\n[View Deep Dive UI]`;
            case 'LIQUIDATION':
                return ` **REKT ALERT**\nA massive short position on ${event.payload.asset} was just liquidated on ${event.chain}!\nSize: $${event.payload.amountUsd?.toLocaleString()}`;
            default:
                return ` **${event.severity} ${event.type} ALERT** on ${event.chain}`;
        }
    }
}

// Singleton export 
export const dispatcher = new MegalodonDispatcher();

