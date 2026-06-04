import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import Redis from 'ioredis';
import { createSubClient } from '../redis/client';

//  STRICT RUNTIME GUARD 
// In production, Redis is NON-OPTIONAL.
// A system without Redis cannot guarantee cache coherence nor multi-instance Pub/Sub.
if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    console.error('');
    console.error('');
    console.error('   FATAL: REDIS_URL is not set in production environment!  ');
    console.error('  Real-time events and intelligent caching require Redis.     ');
    console.error('   Add REDIS_URL to your Railway/environment variables.     ');
    console.error('');
    console.error('');
    // process.exit(1); // Hard fail  disabled for maximum stability in fallback mode
    console.warn('️ [WebSocket] [SAFETY] Continuing in degraded mode as requested.');
}

//  TYPES 
interface TransactionEvent {
    hash: string;
    from: string;
    to: string;
    value: string;
    direction: 'IN' | 'OUT';
    status: 'pending' | 'confirmed';
    timestamp: string;
    method?: string;
    watchedAddress?: string;
}

interface WhaleAlertEvent {
    type: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
}

//  SINGLETON 
let io: Server | null = null;
let redisSubscriber: Redis | null = null;

//  REDIS FACTORY 
function createRedisSubscriber(url: string): Redis {
    return createSubClient('WS-Subscriber');
}

//  INITIALIZER 
export function initializeWebSocket(httpServer: HttpServer): Server {
    if (io) return io;

    io = new Server(httpServer, {
        path: '/api/socket/io',
        addTrailingSlash: false,
        pingTimeout: 60_000,
        pingInterval: 25_000,
        connectTimeout: 45_000,
        cors: {
            origin: '*', // [CELESTIAL RESILIENCE] Broaden origin to ensure connectivity across all Railway subdomains
            methods: ['GET', 'POST'],
        },
    });

    console.log(' [WebSocket Server] Initialized with Redis Pub/Sub support');

    //  REDIS PUB/SUB 
    if (process.env.REDIS_URL) {
        redisSubscriber = createRedisSubscriber(process.env.REDIS_URL);

        // Subscribe to:
        //  vitals.tx.*    per-address transaction events (e.g. vitals.tx.0xabc...)
        //  whale-alerts   global whale detection events
        //  vitals.tx.new  global broadcast for any UI listening
        redisSubscriber.psubscribe('vitals.*', 'whale-alerts', (err) => {
            if (err) {
                console.error(' [Redis SUB] Subscribe failed:', err.message);
            } else {
                console.log(' [Redis SUB] Subscribed to: vitals.*, whale-alerts');
            }
        });

        redisSubscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
            if (!io) return;

            try {
                const data = JSON.parse(message) as TransactionEvent | WhaleAlertEvent;

                if (channel === 'whale-alerts') {
                    // Broadcast to all connected clients (whale alerts are global)
                    io.emit('new-whale-alert', data);
                } else if (channel === 'vitals.tx.new') {
                    // Global broadcast  every client gets it and filters client-side
                    io.emit('vitals.tx.new', data);
                } else if (channel.startsWith('vitals.tx.0x')) {
                    // Address-specific channel: route ONLY to that user's socket rooms
                    const targetAddress = channel.replace('vitals.tx.', '').toLowerCase();
                    io.to(`address:${targetAddress}`).emit('vitals.tx.new', data);
                }
            } catch (e) {
                console.error(' [WebSocket] Message parse error:', e);
            }
        });
    } else {
        // Non-production: warn but continue
        console.warn('️ [WebSocket] Redis not configured. Pub/Sub disabled in this instance.');
    }

    //  NATIVE MEMPOOL TELEMETRY (REAL WEBSOCKET, NO POLLING) 
    if (process.env.ALCHEMY_WEB3_WSS) {
        try {
            const { WebSocketProvider } = require('ethers');
            const wsProvider = new WebSocketProvider(process.env.ALCHEMY_WEB3_WSS, 1);
            wsProvider.on('error', (err: any) => console.error('Mempool WS error:', err.message || err));
            console.log(' [Mempool WS] Connected directly to Alchemy PendingTransactions');
            
            // Ultra-fast global stream (throttle or sample for UI rendering)
            let tickCount = 0;
            wsProvider.on('pending', (txHash: string) => {
                if (!io) return;
                tickCount++;
                if (tickCount % 5 === 0) { // Throttle for frontend performance
                    io.emit('mempool.heartbeat', { hash: txHash, _t: Date.now() });
                }
            });
        } catch (err) {
            console.error(' [Mempool WS] Failed to listen to native mempool:', err);
        }
    }

    //  SOCKET CONNECTION HANDLING 
    io.on('connection', async (socket) => {
        // Track active clients for CU Optimization (Sleep Mode)
        try {
            const redis = createSubClient('WS-Presence');
            await redis.incr('WHALE_MONITOR_CLIENTS');
            await redis.expire('WHALE_MONITOR_CLIENTS', 3600); // 1-hour relative expiry
            await redis.quit();
        } catch (e) {
            console.error('️ [WebSocket] Failed to increment presence counter:', e);
        }

        // Client registers its address to receive personalized tx events
        socket.on('subscribe-address', (address: string) => {
            if (!address || typeof address !== 'string') return;
            const room = `address:${address.toLowerCase()}`;
            socket.join(room);
            console.log(`[WebSocket] Socket ${socket.id} joined room ${room}`);
        });

        socket.on('unsubscribe-address', (address: string) => {
            if (!address) return;
            socket.leave(`address:${address.toLowerCase()}`);
        });

        // Legacy room support
        socket.on('join-room', (room: string) => socket.join(room));
        socket.on('leave-room', (room: string) => socket.leave(room));

        socket.on('disconnect', async () => {
            console.log(`[WebSocket] Socket ${socket.id} disconnected`);
            try {
                const redis = createSubClient('WS-Absence');
                const count = await redis.decr('WHALE_MONITOR_CLIENTS');
                if (count < 0) await redis.set('WHALE_MONITOR_CLIENTS', '0');
                await redis.quit();
            } catch (e) {
                console.error('️ [WebSocket] Failed to decrement presence counter:', e);
            }
        });
    });

    return io;
}

export function getIO(): Server | null {
    return io;
}

/**
 * Graceful shutdown  used in process.on('SIGTERM') handlers
 */
export async function shutdownWebSocket(): Promise<void> {
    if (redisSubscriber) {
        await redisSubscriber.quit();
        redisSubscriber = null;
    }
    if (io) {
        io.close();
        io = null;
    }
}

