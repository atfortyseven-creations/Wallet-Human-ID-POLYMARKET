const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    //  BACKGROUND ENGINE / INDEXER LOGIC 
    // This represents the heuristic engine and indexer running completely independently
    // from the DOM and HTTP request lifecycle.
    
    let simulatedTxs = 0;
    
    // Engine Loop: Emulate ingesting the mempool 
    setInterval(() => {
        const payload = {
            id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            chain: ['ethereum', 'solana', 'bsc', 'arbitrum'][Math.floor(Math.random() * 4)],
            amountUsd: Math.floor(Math.random() * 5000000) + 10000,
            type: ['SWAP', 'TRANSFER', 'MINT', 'BURN'][Math.floor(Math.random() * 4)],
            timestamp: Date.now()
        };

        // Emit 'whale_tx' event down the pipe
        if (payload.amountUsd > 1000000) {
            io.emit('whale_tx', payload);
        }

        // Emit generic mempool tick to stress UI (15-25 TPS simulation)
        io.emit('mempool_tick', payload);
        simulatedTxs++;
    }, 45); // ~22 TPS (Transactions Per Second) push

    // Status broadcasts
    setInterval(() => {
        io.emit('engine_status', {
            tps: 22,
            uptime: process.uptime(),
            processedTxs: simulatedTxs,
            status: 'ONLINE',
            networkLatencies: {
                eth: Math.floor(Math.random() * 10) + 5,
                sol: Math.floor(Math.random() * 400) + 200,
                bsc: Math.floor(Math.random() * 15) + 8
            }
        });
    }, 1000);

    // Socket connections mapping
    io.on('connection', (socket) => {
        console.log(`[DAEMON] Institutional terminal connected: ${socket.id}`);
        
        socket.on('disconnect', () => {
            console.log(`[DAEMON] Terminal disconnected: ${socket.id}`);
        });
    });

    httpServer.once('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    httpServer.listen(port, () => {
        console.log(`> Ready and ingesting mempool on http://${hostname}:${port}`);
    });
});
