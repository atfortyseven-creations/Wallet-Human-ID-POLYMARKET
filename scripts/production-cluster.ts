import { spawn } from 'child_process';
import path from 'path';

/**
 * PRODUCTION CLUSTER - TOTAL PERSISTENCE ENGINE
 * --------------------------------------------
 * This script unifies the Web UI (Next.js) and the Data Indexer (Whale Worker)
 * into a single high-availability process for Railway.
 */

console.log("\n=================================================");
console.log("️  TOTAL PERSISTENCE CLUSTER - INITIALIZING");
console.log("=================================================");

function startProcess(name: string, command: string, args: string[]) {
    const proc = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' }
    });

    proc.on('close', (code) => {
        console.error(` [${name}] Process exited with code ${code}. Restarting in 5s...`);
        setTimeout(() => startProcess(name, command, args), 5000);
    });

    return proc;
}

// 1. Start the Next.js Production Server (UI & API)
console.log(" [Web] Starting Next.js Production Engine...");
startProcess('WEB-UI', 'node', ['--max-old-space-size=512', '--import', 'tsx', 'server.ts']);

// 2. Start the Whale Worker (Blockchain Indexer)
console.log(" [Worker] Starting Whale Tracking Indexer...");
startProcess('INDEXER', 'node', ['--max-old-space-size=512', '--import', 'tsx', 'scripts/whale-worker.ts']);

// 3. Start the Scheduled Sync Manager (Whale Vault - Every 24h)
console.log(" [Sync] Whale Vault Scheduler Active.");
setInterval(async () => {
    console.log(" [Sync] Triggering Whale Vault Garbage Collection...");
    const payloadTypes = ['security_events', 'intel_items'];
    
    for (const payload_type of payloadTypes) {
        try {
            console.log(` [Sync] Moving ${payload_type} to local vault...`);
            // We trigger the internal API to move old data to the local vault
            const res = await fetch('http://localhost:3000/api/vault/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload_type })
            });
            const data = await res.json();
            console.log(` [Sync] ${payload_type} GC Result: ${data.message || 'Complete'}`);
        } catch (err: any) {
            console.warn(`️ [Sync] ${payload_type} sync failed: ${err.message}`);
        }
    }
}, 1000 * 60 * 60 * 24); // 24 hours

console.log("-------------------------------------------------");
console.log(" SYSTEM ONLINE: Total Persistence Activated.\n");
