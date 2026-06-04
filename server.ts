import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port: Number(port) });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    // [TITANIUM SERVER] Optimized UI Entry Point
    // Scanners and WebSockets are handled by standalone services (Scanner Cluster & Celestial Gateway).
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    });

    server.listen(port, () => {
        console.log(` [Terminal] Ready on http://${hostname}:${port}`);
        console.log(` [Microservices] Architecture: DECENTRALIZED CORE ACTIVE`);
        console.log(` [Gateway] Standalone Gateway required for WebSocket connectivity.`);
    });
}).catch((err) => {
    console.error(' [Terminal] Fatal initialization error:', err);
    process.exit(1);
});
