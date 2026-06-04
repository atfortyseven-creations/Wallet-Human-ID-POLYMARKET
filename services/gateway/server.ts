import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { createSubClient } from '../../lib/redis/client';

dotenv.config();

const PORT = process.env.GATEWAY_PORT || 3001;
const REDIS_URL = process.env.REDIS_URL;

async function main() {
    console.log(" [Celestial Gateway] Starting Standalone WebSocket Server...");

    const httpServer = createServer();
    const io = new Server(httpServer, {
        path: '/api/socket/io',
        cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    if (REDIS_URL) {
        const redisSubscriber = createSubClient('Gateway-Subscriber');
        redisSubscriber.psubscribe('vitals.*', 'whale-alerts', (err: any) => {
            if (err) console.error(' [Redis SUB] Failed:', err.message);
            else console.log(' [Gateway] Subscribed to Redis Events');
        });

        redisSubscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
            try {
                const data = JSON.parse(message);
                if (channel === 'whale-alerts') {
                    io.emit('new-whale-alert', data);
                } else if (channel === 'vitals.tx.new' || channel.startsWith('vitals.tx.0x')) {
                    io.emit('vitals.tx.new', data);
                }
            } catch (e: any) {}
        });
    }

    io.on('connection', (socket) => {
        console.log(`[Gateway] Client Connected: ${socket.id}`);
        socket.on('subscribe-address', (addr) => socket.join(`address:${addr.toLowerCase()}`));
        socket.on('disconnect', () => console.log(`[Gateway] Client Disconnected: ${socket.id}`));
    });

    httpServer.listen(PORT, () => {
        console.log(` [Gateway] Online on port ${PORT}`);
    });
}

main().catch(console.error);
