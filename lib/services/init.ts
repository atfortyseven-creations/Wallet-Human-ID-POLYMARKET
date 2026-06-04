import { dispatcher } from '@/lib/services/dispatcher';

// Only run the dispatcher in the main Node process, 
// ensuring we don't start multiple consumers if Next.js hot-reloads 
// or spawns edge runtimes inappropriately.

let isDispatcherStarted = false;

export function initializeBackgroundServices() {
    if (typeof window !== 'undefined') return; // Server-only
    if (process.env.NODE_ENV === 'test') return;
    
    if (!isDispatcherStarted && (global as any).globalRedisClient) {
        // Run asynchronously
        dispatcher.start().catch(err => {
            console.error('Failed to start Megalodon Dispatcher:', err);
        });
        isDispatcherStarted = true;
    }
}

