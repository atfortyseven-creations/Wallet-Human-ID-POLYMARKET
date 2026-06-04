/**
 * TERMINAL-CORE.JS
 * Isolated Web Worker for High-Frequency Crypto Data ingestion.
 * Strictly decoupled from Main React Thread to guarantee 60 FPS under heavy load.
 */

// Connection state
let ws = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Throttle mechanisms to avoid UI flood
let lastDepthSendTime = 0;
const DEPTH_THROTTLE_MS = 100; // 10Hz tick rate

// Internal state accumulators
let currentBids = [];
let currentAsks = [];
let oiBaseline = 48500200; // Mock reference for relative fluctuations
let fundingBaseline = 0.0104; // Baseline 8hr funding

/**
 * Normalizes Order Book data to percentages for direct canvas drawing
 */
function processDepth(bids, asks) {
    if (!bids || !asks) return null;
    
    // Sort logic handled mostly by binance, but let's ensure we get top 5
    // Top 5 highest bids, top 5 lowest asks
    const topBids = bids.slice(0, 5).map(b => ({ price: parseFloat(b[0]), qty: parseFloat(b[1]) }));
    const topAsks = asks.slice(0, 5).map(a => ({ price: parseFloat(a[0]), qty: parseFloat(a[1]) }));

    if (topBids.length === 0 || topAsks.length === 0) return null;

    // Find local max to normalize visual depth bars
    const maxQty = Math.max(
        ...topBids.map(b => b.qty),
        ...topAsks.map(a => a.qty)
    );

    return {
        type: 'DEPTH',
        bids: topBids.map(b => ({ p: b.price, relativeDepth: b.qty / maxQty })),
        asks: topAsks.map(a => ({ p: a.price, relativeDepth: a.qty / maxQty }))
    };
}

/**
 * Evaluates trade flow and simulates institutional metadata
 */
function processTrade(e) {
    const price = parseFloat(e.p);
    const qty = parseFloat(e.q);
    const usdValue = price * qty;
    
    // WHALE FLOW: Filter only > 10K $
    if (usdValue >= 10000) {
        const isBuyerMaker = e.m; // if true, trade was a sell (taker sold to maker)
        const side = isBuyerMaker ? 'SELL' : 'BUY';

        postMessage({
            type: 'WHALE_FLOW',
            id: e.a,
            price: price,
            amountUsd: usdValue,
            side: side,
            timestamp: e.T
        });

        // MARKETS: Correlated Stochastic Fluctuation
        // Whale trades shift OI and funding stochastically
        if (usdValue > 50000) {
            oiBaseline += (isBuyerMaker ? -usdValue : usdValue) * 0.1;
            fundingBaseline += (isBuyerMaker ? -0.0001 : 0.0001);
            
            postMessage({
                type: 'MARKETS',
                oi: oiBaseline,
                funding: fundingBaseline,
                timestamp: e.T
            });
        }
        
        // COPY TRADING: Elite Wallet intent replication simulation on extreme sizes
        if (usdValue > 150000) {
            postMessage({
                type: 'COPY_TRADE',
                action: side === 'BUY' ? 'SWAP USDC -> ETH' : 'SWAP ETH -> USDC',
                size: (usdValue * 0.05).toFixed(0), // user's proportionate size (5%)
                latency: Math.floor(Math.random() * 8 + 2), // 2-10ms
                status: 'EXEC',
                timestamp: e.T
            });
        }
    }
}

/**
 * WebSocket Lifecycle Manager
 */
function connectWebSocket() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    // We use a combined stream: depth 100ms + aggregated trades
    const streamUrl = 'wss://stream.binance.com:9443/ws/btcusdt@depth5@100ms/btcusdt@aggTrade';
    
    try {
        ws = new WebSocket(streamUrl);
    } catch (err) {
        console.error('[Worker] WSS Instantiation failed', err);
        handleReconnect();
        return;
    }

    ws.onopen = () => {
        isConnected = true;
        reconnectAttempts = 0;
        postMessage({ type: 'STATUS', state: 'CONNECTED' });
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const now = Date.now();

        // depth@100ms payload
        if (msg.lastUpdateId && msg.bids && msg.asks) {
            if (now - lastDepthSendTime > DEPTH_THROTTLE_MS) {
                const depthData = processDepth(msg.bids, msg.asks);
                if (depthData) {
                    postMessage(depthData);
                    lastDepthSendTime = now;
                }
            }
        }
        // aggTrade payload
        else if (msg.e === 'aggTrade') {
            processTrade(msg);
        }
    };

    ws.onerror = (error) => {
        postMessage({ type: 'STATUS', state: 'ERROR' });
    };

    ws.onclose = () => {
        isConnected = false;
        postMessage({ type: 'STATUS', state: 'DISCONNECTED' });
        handleReconnect();
    };
}

function handleReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        // Exponential backoff
        const timeout = Math.pow(2, reconnectAttempts) * 1000;
        reconnectAttempts++;
        setTimeout(connectWebSocket, timeout);
    } else {
        postMessage({ type: 'STATUS', state: 'FATAL_DISPATCH' });
    }
}

function disconnectWebSocket() {
    if (ws) {
        ws.onclose = null; // prevent reconnect loop
        ws.close();
        ws = null;
    }
    isConnected = false;
    postMessage({ type: 'STATUS', state: 'DISCONNECTED_CLEAN' });
}

// IPC Interface with Main Thread
self.onmessage = (e) => {
    const { cmd } = e.data;
    if (cmd === 'START') {
        connectWebSocket();
    } else if (cmd === 'STOP') {
        disconnectWebSocket();
    }
};
