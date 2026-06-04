import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

export default function rateLimit(options?: RateLimitOptions) {
    const tokenCache = new LRUCache({
        max: options?.uniqueTokenPerInterval || 500,
        ttl: options?.interval || 60000,
    });

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const tokenCount = (tokenCache.get(token) as number[]) || [0];
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount);
                }
                tokenCount[0] += 1;

                const currentUsage = tokenCount[0];
                const isRateLimited = currentUsage > limit;

                // Update the token with the new count
                // (LRUCache doesn't strictly need re-set for mutable arrays if kept in memory, 
                // but explicit set is safer for some implementations)
                // tokenCache.set(token, tokenCount); 

                if (isRateLimited) {
                    reject(new Error('Rate limit exceeded'));
                } else {
                    resolve();
                }
            }),
    };
}

