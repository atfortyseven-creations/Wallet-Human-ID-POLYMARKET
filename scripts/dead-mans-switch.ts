import { redisClient } from '../lib/redis/client';
import { prisma } from '../lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const DEADMAN_KEY = 'admin:heartbeat:timestamp';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function checkDeadManSwitch() {
    try {
        console.log('[DeadManSwitch] Checking System Recovery Protocol status...');
        const lastHeartbeatStr = await redisClient.get(DEADMAN_KEY);
        
        // If not set yet, we set it now to start the countdown
        if (!lastHeartbeatStr) {
            await redisClient.set(DEADMAN_KEY, Date.now().toString());
            console.log('[DeadManSwitch] Initialized dead man switch timer starting now.');
            return;
        }

        const lastHeartbeat = parseInt(lastHeartbeatStr, 10);
        const now = Date.now();
        
        if (now - lastHeartbeat > THIRTY_DAYS_MS) {
            console.error('[DeadManSwitch]  FATAL: Admin heartbeat absent for 30 days. Initiating protocol NUKE.');
            await executeSystemPurge();
        } else {
            const daysLeft = ((lastHeartbeat + THIRTY_DAYS_MS) - now) / (1000 * 60 * 60 * 24);
            console.log(`[DeadManSwitch] System Nominal. Deadman timer: ${daysLeft.toFixed(2)} days remaining.`);
        }
    } catch (e) {
        console.error('[DeadManSwitch] Execution failed', e);
    }
}

async function executeSystemPurge() {
    console.error('[DeadManSwitch] EXECUTING TIER 1 OBFUSCATION...');
    try {
        // 1. Obfuscate high-tier entities (Zero-Mock but data-protecting)
        await prisma.$executeRaw`UPDATE "CosmicEntity" SET "beneficiaryAddr" = '0x0000000000000000000000000000000000000000', "artMetadata" = '{}' WHERE "tier" = 'ELITE';`;
        console.error('[DeadManSwitch] ELITE data scrubbed.');
        
        // 2. Shut down the main server container if running in production
        if (process.env.RAILWAY_ENVIRONMENT_ID) {
            console.error('[DeadManSwitch] Purging PM2 processes and committing sepuku.');
            await execAsync('pm2 stop all && pm2 delete all');
            process.exit(1);
        }
    } catch (e) {
        console.error('[DeadManSwitch] Purge sequence error:', e);
    }
}

if (require.main === module) {
    checkDeadManSwitch().then(() => process.exit(0));
}
