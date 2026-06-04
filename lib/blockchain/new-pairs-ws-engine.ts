/**
 * GetBlock WebSocket New Pairs Engine  Registry-backed
 * Subscribes to UniswapV3 PoolCreated events in real time.
 * Factory: 0x1F98431c8aD98523631AE4a59f267346ea31F984
 * WSS pool: getblock-registry.ts (GB_ETH_WSS_1/2/3)
 */

import WebSocket from 'ws';
import { getGbAllWss } from './getblock-registry';

// WSS pool desde el registry  obtiene los WSS dinámicamente para respetar el CU Circuit Breaker
const getActiveWssUrls = (): string[] => {
    const gb = getGbAllWss('eth');
    return gb.length > 0 ? gb : ['wss://ethereum-rpc.publicnode.com'];
};

let currentWsIndex = 0;
let backoff = 5000;

// UniswapV3 Factory
const UNISWAP_V3_FACTORY  = '0x1F98431c8aD98523631AE4a59f267346ea31F984'.toLowerCase();
const POOL_CREATED_TOPIC   = '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118';

export interface NewPairEvent {
    pool:        string;
    token0:      string;
    token1:      string;
    fee:         number;       // 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
    blockNumber: number;
    txHash:      string;
    timestamp:   number;
}

type PairListener = (event: NewPairEvent) => void;

class NewPairsWebSocketEngine {
    private ws:       WebSocket | null = null;
    private listeners: Set<PairListener> = new Set();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private isAlive: boolean = true;
    // In-memory buffer of latest new pairs (last 50)
    public  buffer:   NewPairEvent[] = [];

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

        const activeUrls = getActiveWssUrls();
        const currentUrl = activeUrls[currentWsIndex % activeUrls.length];
        const socket = new WebSocket(currentUrl);
        this.ws = socket;

        socket.on('open', () => {
            console.info('[NewPairsEngine] GetBlock WS connected (EP3)');
            this.isAlive = true;
            backoff = 5000; // Reset backoff on success
            this.startHeartbeat();

            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    jsonrpc: '2.0', id: 1,
                    method:  'eth_subscribe',
                    params:  [
                        'logs',
                        {
                            address: UNISWAP_V3_FACTORY,
                            topics:  [POOL_CREATED_TOPIC],
                        }
                    ],
                }));
            }
        });

        socket.on('message', (raw: Buffer) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.method === 'eth_subscription' && msg.params?.result) {
                    this.handleLog(msg.params.result);
                }
            } catch { /* ignore */ }
        });

        socket.on('pong', () => {
            this.isAlive = true;
        });

        socket.on('close', () => {
            console.warn('[NewPairsEngine] WS closed  reconnecting');
            this.stopHeartbeat();
            this.scheduleReconnect();
        });

        socket.on('error', (err) => {
            console.error('[NewPairsEngine] WS error:', err.message);
        });
    }

    private handleLog(log: any) {
        const topics = log.topics || [];
        if (topics.length < 3) return;

        // PoolCreated non-indexed args are ABI-encoded in data:
        // data = fee (uint24, 32 bytes) | tickSpacing (int24, 32 bytes) | pool (address, 32 bytes)
        const data = log.data || '0x';
        const fee        = parseInt(data.slice(2, 66), 16);
        const pool       = '0x' + data.slice(154, 194);    // last 20 bytes of third word

        const token0 = '0x' + topics[1].slice(26);
        const token1 = '0x' + topics[2].slice(26);

        const event: NewPairEvent = {
            pool,
            token0,
            token1,
            fee,
            blockNumber: parseInt(log.blockNumber, 16),
            txHash:      log.transactionHash,
            timestamp:   Date.now(),
        };

        // Push to buffer, cap at 50
        this.buffer = [event, ...this.buffer].slice(0, 50);
        this.listeners.forEach(fn => fn(event));
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.isAlive === false) {
                console.warn('[NewPairsEngine] Heartbeat missed  terminating connection');
                this.ws?.terminate();
                return;
            }
            this.isAlive = false;
            this.ws?.ping();
        }, 30000); // 30s pulse
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        const activeUrls = getActiveWssUrls();
        currentWsIndex = (currentWsIndex + 1) % activeUrls.length;
        this.reconnectTimer = setTimeout(() => {
            backoff = Math.min(backoff * 1.5, 30000); // Max 30s
            this.connect();
        }, backoff);
    }

    subscribe(fn: PairListener) {
        this.listeners.add(fn);
        if (!this.ws || (this.ws.readyState !== WebSocket.OPEN && this.ws.readyState !== WebSocket.CONNECTING)) {
            this.connect();
        }
        return () => this.listeners.delete(fn);
    }

    disconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.stopHeartbeat();
        this.ws?.close();
        this.ws = null;
    }
}

export const newPairsEngine = new NewPairsWebSocketEngine();
