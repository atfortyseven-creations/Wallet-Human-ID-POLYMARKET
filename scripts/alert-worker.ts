import { DilutionService } from '../lib/services/DilutionService';

/**
 * Elite Alert Worker
 * Periodically checks for upcoming dilution events and triggers global alerts.
 */
async function runAlertIteration() {
    console.log(`[AlertWorker] Execution cycle started: ${new Date().toISOString()}`);
    
    try {
        const unlocks = await DilutionService.getUpcomingUnlocks();
        const now = new Date();
        const alertThreshold = 24 * 60 * 60 * 1000; // 24 hours

        for (const unlock of unlocks) {
            const timeToUnlock = unlock.unlockDate.getTime() - now.getTime();
            
            // Trigger alert if unlock is within the next 24 hours and hasn't passed
            if (timeToUnlock > 0 && timeToUnlock <= alertThreshold) {
                console.log(`[AlertWorker] MISSION CRITICAL: Imminent unlock detected for ${unlock.tokenSymbol}. Triggering alerts...`);
                await DilutionService.triggerGlobalAlerts(unlock);
            }
        }
    } catch (err) {
        console.error('[AlertWorker] Error in execution cycle:', err);
    }
    
    console.log(`[AlertWorker] Cycle complete. Sleeping...`);
}

// Production loop
if (require.main === module) {
    console.log('--- WHALE ALERT WORKER STARTED ---');
    // Run immediately then every hour
    runAlertIteration();
    setInterval(runAlertIteration, 60 * 60 * 1000);
}
