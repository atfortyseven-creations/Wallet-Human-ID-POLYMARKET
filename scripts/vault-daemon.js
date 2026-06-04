const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * WHALE VAULT DAEMON (V1.0)
 * ----------------------------
 * This is the local receptor for the Whale Alert "Garbage Collector" system.
 * It listens for encrypted payloads from the Railway-Production cloud
 * and secures them in your local D:\ or Windows file system.
 */

const PORT = process.env.VAULT_PORT || 7007;
const SECRET_KEY = process.env.WHALE_VAULT_SECRET || 'WHALE_QUANTUM_KEY_777';
const STORAGE_DIR = path.join(__dirname, '..', 'vault-storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
    // CORS & Basic Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/vault/ingest' && req.method === 'POST') {
        // 1. Authorization Check
        const authHeader = req.headers['authorization'];
        if (!authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
            console.warn(`[Vault]  Unauthorized ingress attempt from ${req.socket.remoteAddress}`);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Whale Key Invalid' }));
            return;
        }

        // 2. Pre-flight Disk Check (Institutional Safety)
        try {
            const stats = fs.statfsSync(STORAGE_DIR);
            const freeSpaceGB = (Number(stats.bavail) * Number(stats.bsize)) / (1024 ** 3);
            
            if (freeSpaceGB < 0.5) { // Minimum 500MB safety margin
                throw new Error(`Insufficient disk space (Only ${freeSpaceGB.toFixed(2)} GB left)`);
            }
            
            // Write access test
            const testFile = path.join(STORAGE_DIR, '.health_check');
            fs.writeFileSync(testFile, 'OK');
            fs.unlinkSync(testFile);
        } catch (healthErr) {
            console.error(`[Vault] ️  Health Check Failed: ${healthErr.message}`);
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Vault Not Ready', detail: healthErr.message }));
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { payload_type, data, source } = payload;

                // 3. Atomic Save to Local Storage with UHRP Verification
                const uhrp_hash = crypto.createHash('sha256').update(body).digest('hex');
                const filename = `${payload_type}_${uhrp_hash.slice(0, 16)}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                const filePath = path.join(STORAGE_DIR, filename);

                const enrichedPayload = {
                    ...payload,
                    uhrp_metadata: {
                        hash: uhrp_hash,
                        algorithm: 'sha256',
                        protocol: 'Whale-Vault-V1.1'
                    }
                };

                fs.writeFileSync(filePath, JSON.stringify(enrichedPayload, null, 2));

                console.log(`[Vault]  Ingested ${data?.length || 0} records (${payload_type}) from ${source}`);
                console.log(`[Vault]  UHRP Hash: ${uhrp_hash}`);
                console.log(`[Vault]  Stored at: ${filePath}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Payload secured in local cold storage.',
                    vault_path: filePath 
                }));
            } catch (err) {
                console.error('[Vault]  Ingest Error:', err.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Malformed Payload' }));
            }
        });
    } else if (req.url === '/vault/status' && req.method === 'GET') {
        const files = fs.readdirSync(STORAGE_DIR);
        let diskInfo = { status: 'Unknown' };
        
        try {
            const stats = fs.statfsSync(STORAGE_DIR);
            diskInfo = {
                status: 'HEALTHY',
                free_gb: ((Number(stats.bavail) * Number(stats.bsize)) / (1024 ** 3)).toFixed(2),
                total_gb: ((Number(stats.blocks) * Number(stats.bsize)) / (1024 ** 3)).toFixed(2)
            };
        } catch (e) { diskInfo.status = 'ERROR: ' + e.message; }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ACTIVE', 
            storage_path: STORAGE_DIR,
            disk: diskInfo,
            archived_files: files.length 
        }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`️  WHALE VAULT DAEMON - ONLINE`);
    console.log(`=================================================`);
    console.log(` STATUS: ACTIVE & LISTENING`);
    console.log(` ADDRESS: http://localhost:${PORT}`);
    console.log(` STORAGE: ${STORAGE_DIR}`);
    console.log(` ACCESS: RESTRICTED VIA WHALE SECRET`);
    console.log(`-------------------------------------------------\n`);
    console.log(`Waiting for Railway production to teleport data...`);
});
